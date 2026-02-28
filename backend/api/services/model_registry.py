"""Registre des modèles actifs en mémoire.

Gère plusieurs instances EngineService + TrainingService,
identifiées par config_id (UUID de ModelConfig).
"""

import logging
import os
import threading

from api.services.engine_service import EngineService
from api.services.training_service import TrainingService

logger = logging.getLogger(__name__)


class ModelRegistry:
    """Singleton qui gère plusieurs modèles en mémoire.

    Chaque modèle est un couple (EngineService, TrainingService)
    identifié par le config_id de la configuration utilisée.
    """

    MAX_MODELS = 5

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self._engines: dict[str, EngineService] = {}
        self._training_services: dict[str, TrainingService] = {}
        self._active_config_id: str | None = None
        self._dict_lock = threading.Lock()

    def get_engine(self, config_id: str) -> EngineService:
        """Retourne l'engine pour un config_id, en le créant si nécessaire.

        Si un modèle sauvegardé existe pour cette config, il est
        automatiquement rechargé en mémoire.
        """
        config_id = str(config_id)
        with self._dict_lock:
            if config_id not in self._engines:
                if len(self._engines) >= self.MAX_MODELS:
                    raise ValueError(
                        f"Nombre maximum de modèles atteint ({self.MAX_MODELS}). "
                        "Déchargez un modèle avant d'en charger un nouveau."
                    )
                engine = EngineService()
                self._engines[config_id] = engine
                self._training_services[config_id] = TrainingService(config_id)
                # Try to auto-load the most recent saved weights
                self._try_auto_load(config_id, engine)
            self._active_config_id = config_id
            return self._engines[config_id]

    # Mapping config tokenizer_type → serialized vocab type
    _TOK_TYPE_MAP = {"character": "character", "gpt4": "tiktoken", "claude": "tiktoken"}

    def _try_auto_load(self, config_id: str, engine: EngineService) -> None:
        """Try to load saved weights for this config (best-effort).

        Skips auto-load if the saved tokenizer type doesn't match the
        current config (e.g., user switched from character to BPE).
        """
        try:
            from api.models import ModelConfig, TrainedModel

            saved = TrainedModel.objects.filter(config_id=config_id).order_by("-created_at").first()
            if saved and os.path.exists(saved.weights_path):
                config_obj = ModelConfig.objects.get(pk=config_id)
                config = config_obj.to_engine_config()

                # Check if saved tokenizer type matches current config
                saved_tok_type = saved.vocab_json.get("type", "character")
                expected_tok_type = self._TOK_TYPE_MAP.get(
                    config.tokenizer_type, config.tokenizer_type
                )
                if expected_tok_type != saved_tok_type:
                    logger.info(
                        "Skipping auto-load for config %s: tokenizer changed (%s → %s)",
                        config_id,
                        saved_tok_type,
                        config.tokenizer_type,
                    )
                    return

                engine.load_weights(saved.weights_path, saved.vocab_json, config)
                logger.info("Auto-loaded model for config %s", config_id)
        except Exception as e:
            logger.debug("No saved model to auto-load for config %s: %s", config_id, e)

    def get_training_service(self, config_id: str) -> TrainingService:
        """Retourne le TrainingService pour un config_id."""
        config_id = str(config_id)
        with self._dict_lock:
            if config_id not in self._training_services:
                self._training_services[config_id] = TrainingService(config_id)
            return self._training_services[config_id]

    def get_active_engine(self) -> EngineService | None:
        """Retourne le dernier engine utilisé, ou le premier prêt."""
        with self._dict_lock:
            if self._active_config_id and self._active_config_id in self._engines:
                return self._engines[self._active_config_id]
            for engine in self._engines.values():
                if engine.is_ready:
                    return engine
            return None

    def get_active_training_service(self) -> TrainingService | None:
        """Retourne le TrainingService du modèle actif."""
        with self._dict_lock:
            if self._active_config_id and self._active_config_id in self._training_services:
                return self._training_services[self._active_config_id]
            return None

    @property
    def active_config_id(self) -> str | None:
        return self._active_config_id

    def has_engine(self, config_id: str) -> bool:
        config_id = str(config_id)
        return config_id in self._engines

    def remove(self, config_id: str) -> None:
        """Décharge un modèle de la mémoire."""
        config_id = str(config_id)
        with self._dict_lock:
            if config_id in self._training_services:
                svc = self._training_services[config_id]
                if svc.is_running:
                    svc.stop()
                del self._training_services[config_id]
            if config_id in self._engines:
                del self._engines[config_id]
            if self._active_config_id == config_id:
                self._active_config_id = None

    def list_active(self) -> list[dict]:
        """Liste les modèles actifs avec leur état."""
        with self._dict_lock:
            result = []
            for cid, engine in self._engines.items():
                svc = self._training_services.get(cid)
                status = "idle"
                if svc and svc.is_running:
                    status = "paused" if svc.is_paused else "training"
                elif engine.is_ready:
                    status = "ready"

                result.append(
                    {
                        "config_id": cid,
                        "is_ready": engine.is_ready,
                        "status": status,
                        "is_active": cid == self._active_config_id,
                        "total_parameters": (
                            engine.model.count_parameters() if engine.model else 0
                        ),
                        "last_loss": (svc.loss_history[-1] if svc and svc.loss_history else None),
                    }
                )
            return result

    def clear(self) -> None:
        """Décharge tous les modèles (pour les tests)."""
        with self._dict_lock:
            for svc in self._training_services.values():
                if svc.is_running:
                    svc.stop()
            self._engines.clear()
            self._training_services.clear()
            self._active_config_id = None
