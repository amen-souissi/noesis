import numpy as np

from autograd.backprop import Backprop
from config import Config
from training.data_loader import DataLoader
from training.lr_scheduler import create_scheduler


class Trainer:
    """Boucle d'entraînement complète.

    Pour chaque epoch :
        Pour chaque batch :
            1. forward (model + loss)
            2. backward (gradients)
            3. gradient clipping (optionnel)
            4. optimizer step
            5. zero grad
    """

    def __init__(self, model, loss_fn, optimizer, data_loader: DataLoader, config: Config):
        self.backprop = Backprop(model, loss_fn)
        self.optimizer = optimizer
        self.data_loader = data_loader
        self.config = config
        self.loss_history = []

    def train(self, num_epochs: int = None) -> list[float]:
        """Lance l'entraînement.

        Args:
            num_epochs: nombre d'epochs (défaut: config.max_epochs)
        Returns:
            liste des loss moyens par epoch
        """
        if num_epochs is None:
            num_epochs = self.config.max_epochs

        steps_per_epoch = self.data_loader.num_batches
        total_steps = num_epochs * steps_per_epoch
        scheduler = create_scheduler(
            self.config.lr_schedule, self.config.learning_rate, total_steps
        )

        for epoch in range(num_epochs):
            self.data_loader.reset()
            epoch_loss = 0.0

            for step in range(steps_per_epoch):
                x, y = self.data_loader.next_batch()

                # Get current LR from scheduler
                current_lr = scheduler.step()

                loss, _ = self.backprop.forward(x, y)
                self.backprop.backward()

                if self.config.grad_clip > 0:
                    self._clip_gradients()

                # Update optimizer LR and step
                self.optimizer.lr = current_lr
                self.optimizer.step()

                # Decoupled weight decay (AdamW style)
                if self.config.weight_decay > 0:
                    decay_factor = 1.0 - self.config.weight_decay * current_lr
                    for module in self.backprop.model.all_modules():
                        for name, param in module.parameters.items():
                            param *= decay_factor

                self.backprop.zero_grad()

                epoch_loss += loss

            avg_loss = epoch_loss / steps_per_epoch
            self.loss_history.append(avg_loss)

            if (epoch + 1) % self.config.log_every == 0 or epoch == 0:
                print(f"Epoch {epoch + 1:4d}/{num_epochs} | Loss: {avg_loss:.4f}")

        return self.loss_history

    def _clip_gradients(self):
        """Clip les gradients par norme globale."""
        all_grads = []
        for module in self.backprop.model.all_modules():
            for g in module.gradients.values():
                all_grads.append(g.ravel())

        if not all_grads:
            return

        total_norm = np.sqrt(sum(np.sum(g**2) for g in all_grads))
        if total_norm > self.config.grad_clip:
            scale = self.config.grad_clip / (total_norm + 1e-8)
            for module in self.backprop.model.all_modules():
                for name in module.gradients:
                    module.gradients[name] *= scale
