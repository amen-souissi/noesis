import threading
import time
import traceback

import numpy as np
from django.utils import timezone

from autograd.backprop import Backprop
from training.lr_scheduler import create_scheduler


class TrainingService:
    """Gère l'entraînement en background thread avec updates WebSocket.

    Une instance par modèle (associée via ModelRegistry).
    """

    def __init__(self, config_id: str = ""):
        self.config_id = config_id
        self._stop_flag = threading.Event()
        self._pause_flag = threading.Event()
        self._pause_flag.set()  # running par défaut
        self._thread = None
        self._current_run_id = None
        self._loss_history = []

    @property
    def is_running(self) -> bool:
        return self._thread is not None and self._thread.is_alive()

    @property
    def is_paused(self) -> bool:
        return not self._pause_flag.is_set()

    @property
    def loss_history(self) -> list:
        return list(self._loss_history)

    def start(self, engine, run_id: str, num_epochs: int):
        """Démarre l'entraînement dans un thread background."""
        if self.is_running:
            raise RuntimeError("Un entraînement est déjà en cours")

        self._stop_flag.clear()
        self._pause_flag.set()
        self._current_run_id = run_id
        self._loss_history = []

        self._thread = threading.Thread(
            target=self._train_loop,
            args=(engine, run_id, num_epochs),
            daemon=True,
        )
        self._thread.start()

    def stop(self):
        """Arrête l'entraînement."""
        self._stop_flag.set()
        self._pause_flag.set()  # débloquer si en pause

    def pause(self):
        """Met l'entraînement en pause."""
        self._pause_flag.clear()

    def resume(self):
        """Reprend l'entraînement."""
        self._pause_flag.set()

    def _train_loop(self, engine, run_id: str, num_epochs: int):
        from api.models import TrainingRun

        engine._is_training = True
        backprop = Backprop(engine.model, engine.loss_fn)
        optimizer = engine.optimizer
        data_loader = engine.data_loader
        config = engine.config
        model_lock = engine.model_lock

        # LR scheduler
        steps_per_epoch = data_loader.num_batches
        total_steps = num_epochs * steps_per_epoch
        scheduler = create_scheduler(config.lr_schedule, config.learning_rate, total_steps)

        start_time = time.time()

        try:
            # Update DB status
            TrainingRun.objects.filter(pk=run_id).update(
                status="running", started_at=timezone.now()
            )
            self._broadcast({"type": "training.status_change", "status": "running"})

            for epoch in range(num_epochs):
                if self._stop_flag.is_set():
                    TrainingRun.objects.filter(pk=run_id).update(status="stopped")
                    self._broadcast({"type": "training.status_change", "status": "stopped"})
                    break

                self._pause_flag.wait()
                if self._stop_flag.is_set():
                    break

                data_loader.reset()
                epoch_loss = 0.0
                steps_per_epoch = data_loader.num_batches

                for step in range(steps_per_epoch):
                    if self._stop_flag.is_set():
                        break
                    self._pause_flag.wait()
                    if self._stop_flag.is_set():
                        break

                    x, y = data_loader.next_batch()

                    # Lock model during forward+backward to prevent
                    # concurrent API calls from corrupting cached values
                    # Get current LR from scheduler
                    current_lr = scheduler.step()

                    with model_lock:
                        loss, _ = backprop.forward(x, y)
                        backprop.backward()

                        if config.grad_clip > 0:
                            self._clip_gradients(engine.model, config.grad_clip)

                        # Update optimizer LR and step
                        optimizer.lr = current_lr
                        optimizer.step()

                        # Decoupled weight decay (AdamW style)
                        if config.weight_decay > 0:
                            self._apply_weight_decay(engine.model, config.weight_decay, current_lr)

                        backprop.zero_grad()

                    epoch_loss += loss

                    # Broadcast toutes les 10 batches (pas chaque batch)
                    if step % 10 == 0 or step == steps_per_epoch - 1:
                        self._broadcast(
                            {
                                "type": "training.batch_complete",
                                "epoch": epoch + 1,
                                "batch": step + 1,
                                "total_batches": steps_per_epoch,
                                "batch_loss": float(loss),
                            }
                        )

                if self._stop_flag.is_set():
                    break

                avg_loss = epoch_loss / max(steps_per_epoch, 1)
                self._loss_history.append(avg_loss)

                # Snapshot des poids pour visualisation temps réel
                weight_snapshot = None
                if (epoch + 1) % 5 == 0 or epoch == 0 or epoch == num_epochs - 1:
                    weight_snapshot = self._get_weight_snapshot(engine.model)

                epoch_msg = {
                    "type": "training.epoch_complete",
                    "epoch": epoch + 1,
                    "total_epochs": num_epochs,
                    "loss": float(avg_loss),
                    "loss_history": [float(l) for l in self._loss_history],
                    "elapsed_seconds": time.time() - start_time,
                }
                if weight_snapshot:
                    epoch_msg["weight_snapshot"] = weight_snapshot
                self._broadcast(epoch_msg)

                TrainingRun.objects.filter(pk=run_id).update(
                    current_epoch=epoch + 1,
                    loss_history=[float(l) for l in self._loss_history],
                )

            if not self._stop_flag.is_set():
                TrainingRun.objects.filter(pk=run_id).update(
                    status="completed", completed_at=timezone.now()
                )
                self._broadcast({"type": "training.status_change", "status": "completed"})
                # Auto-save model weights so they survive restarts
                self._auto_save(engine, run_id)

        except Exception as e:
            error_msg = f"{e}\n{traceback.format_exc()}"
            TrainingRun.objects.filter(pk=run_id).update(status="failed", error_message=str(e))
            self._broadcast(
                {
                    "type": "training.status_change",
                    "status": "failed",
                    "message": str(e),
                }
            )
            import logging

            logging.getLogger(__name__).error("Training failed for run %s:\n%s", run_id, error_msg)
        finally:
            engine._is_training = False

    def _auto_save(self, engine, run_id: str):
        """Auto-save model weights after training completes."""
        try:
            import os
            import uuid as _uuid

            from django.conf import settings

            from api.models import ModelConfig, TrainedModel

            config_obj = ModelConfig.objects.get(pk=self.config_id)
            filename = f"{_uuid.uuid4().hex}.npz"
            path = os.path.join(settings.MODEL_WEIGHTS_DIR, filename)
            vocab_json = engine.save_weights(path)

            # Delete previous auto-saves for this config to avoid accumulation
            TrainedModel.objects.filter(config=config_obj, description="auto-save").delete()

            TrainedModel.objects.create(
                name=f"{config_obj.name} (auto)",
                description="auto-save",
                config=config_obj,
                weights_path=path,
                total_parameters=engine.model.count_parameters(),
                final_loss=self._loss_history[-1] if self._loss_history else None,
                epochs_trained=len(self._loss_history),
                vocab_json=vocab_json,
            )
            import logging

            logging.getLogger(__name__).info("Auto-saved model for config %s", self.config_id)
        except Exception as e:
            import logging

            logging.getLogger(__name__).warning("Auto-save failed: %s", e)

    def _apply_weight_decay(self, model, weight_decay: float, lr: float):
        """Decoupled weight decay (AdamW): w *= (1 - wd * lr)."""
        decay_factor = 1.0 - weight_decay * lr
        for module in model.all_modules():
            for name, param in module.parameters.items():
                param *= decay_factor

    def _clip_gradients(self, model, max_norm):
        all_grads = []
        for module in model.all_modules():
            for g in module.gradients.values():
                all_grads.append(g.ravel())
        if not all_grads:
            return
        total_norm = np.sqrt(sum(np.sum(g**2) for g in all_grads))
        if total_norm > max_norm:
            scale = max_norm / (total_norm + 1e-8)
            for module in model.all_modules():
                for name in module.gradients:
                    module.gradients[name] *= scale

    def _get_weight_snapshot(self, model) -> list[dict]:
        """Snapshot compact des poids pour visualisation dot-matrix temps réel."""
        MAX_DIM = 32
        snapshot = []
        module_names = ["embedding"]
        for i in range(len(model.blocks)):
            module_names.extend(
                [
                    f"block{i}.attention",
                    f"block{i}.ffn",
                ]
            )
        module_names.append("output_head")

        modules = [model.embedding]
        for block in model.blocks:
            modules.extend([block.attention, block.ffn])
        modules.append(model.output_head)

        for name, mod in zip(module_names, modules):
            for pname, param in mod.parameters.items():
                if param.ndim < 2:
                    continue
                w = param.copy()  # copy for thread safety
                if w.ndim > 2:
                    w = w.reshape(-1, w.shape[-1])
                rows, cols = w.shape
                row_step = max(1, rows // MAX_DIM)
                col_step = max(1, cols // MAX_DIM)
                sampled = w[::row_step, ::col_step][:MAX_DIM, :MAX_DIM]
                snapshot.append(
                    {
                        "module": name,
                        "param": pname,
                        "rows": sampled.shape[0],
                        "cols": sampled.shape[1],
                        "values": sampled.tolist(),
                        "min": float(np.min(sampled)),
                        "max": float(np.max(sampled)),
                    }
                )
        return snapshot

    def _broadcast(self, message):
        """Envoie un message au groupe WebSocket 'training' (non-bloquant).

        Inclut config_id pour permettre au frontend de filtrer par modèle.
        """
        message["config_id"] = self.config_id

        def _send():
            try:
                from asgiref.sync import async_to_sync
                from channels.layers import get_channel_layer

                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        "training",
                        {"type": "training.message", "message": message},
                    )
            except Exception:
                pass

        threading.Thread(target=_send, daemon=True).start()
