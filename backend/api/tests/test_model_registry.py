"""Tests pour ModelRegistry — gestion multi-modèle."""

from django.test import TestCase

from api.services.engine_service import EngineService
from api.services.model_registry import ModelRegistry
from api.services.training_service import TrainingService
from config import Config


class TestModelRegistry(TestCase):
    """Tests unitaires pour ModelRegistry."""

    def setUp(self):
        ModelRegistry._instance = None
        self.registry = ModelRegistry()
        self.corpus = "Le chat mange le poisson. Le chien mange la viande."
        self.config = Config(
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
            seed=42,
        )

    def tearDown(self):
        self.registry.clear()
        ModelRegistry._instance = None

    def test_singleton(self):
        """ModelRegistry est un singleton."""
        r1 = ModelRegistry()
        r2 = ModelRegistry()
        self.assertIs(r1, r2)

    def test_get_engine_creates_new(self):
        """get_engine crée un nouvel engine si inexistant."""
        engine = self.registry.get_engine("config-1")
        self.assertIsInstance(engine, EngineService)
        self.assertFalse(engine.is_ready)

    def test_get_engine_returns_same(self):
        """get_engine retourne le même engine pour le même config_id."""
        e1 = self.registry.get_engine("config-1")
        e2 = self.registry.get_engine("config-1")
        self.assertIs(e1, e2)

    def test_get_engine_different_ids(self):
        """Différents config_id donnent différents engines."""
        e1 = self.registry.get_engine("config-1")
        e2 = self.registry.get_engine("config-2")
        self.assertIsNot(e1, e2)

    def test_get_training_service(self):
        """get_training_service retourne un TrainingService."""
        self.registry.get_engine("config-1")
        svc = self.registry.get_training_service("config-1")
        self.assertIsInstance(svc, TrainingService)
        self.assertEqual(svc.config_id, "config-1")

    def test_get_active_engine(self):
        """get_active_engine retourne le dernier engine utilisé."""
        self.registry.get_engine("config-1")
        self.registry.get_engine("config-2")
        active = self.registry.get_active_engine()
        # Le dernier appelé via get_engine est config-2
        e2 = self.registry.get_engine("config-2")
        self.assertIs(active, e2)

    def test_get_active_engine_empty(self):
        """get_active_engine retourne None si aucun engine."""
        self.assertIsNone(self.registry.get_active_engine())

    def test_has_engine(self):
        """has_engine vérifie l'existence."""
        self.assertFalse(self.registry.has_engine("config-1"))
        self.registry.get_engine("config-1")
        self.assertTrue(self.registry.has_engine("config-1"))

    def test_remove(self):
        """remove décharge un modèle."""
        self.registry.get_engine("config-1")
        self.assertTrue(self.registry.has_engine("config-1"))
        self.registry.remove("config-1")
        self.assertFalse(self.registry.has_engine("config-1"))

    def test_remove_clears_active(self):
        """Supprimer le modèle actif réinitialise active_config_id."""
        self.registry.get_engine("config-1")
        self.assertEqual(self.registry.active_config_id, "config-1")
        self.registry.remove("config-1")
        self.assertIsNone(self.registry.active_config_id)

    def test_list_active(self):
        """list_active retourne les modèles avec leur état."""
        e1 = self.registry.get_engine("config-1")
        e1.initialize(self.config, self.corpus)
        self.registry.get_engine("config-2")

        models = self.registry.list_active()
        self.assertEqual(len(models), 2)

        # Trouver config-1 (initialisé)
        m1 = [m for m in models if m["config_id"] == "config-1"][0]
        self.assertTrue(m1["is_ready"])
        self.assertEqual(m1["status"], "ready")
        self.assertGreater(m1["total_parameters"], 0)

        # Trouver config-2 (non initialisé)
        m2 = [m for m in models if m["config_id"] == "config-2"][0]
        self.assertFalse(m2["is_ready"])
        self.assertEqual(m2["status"], "idle")

    def test_max_models_limit(self):
        """Le registre limite le nombre de modèles."""
        for i in range(ModelRegistry.MAX_MODELS):
            self.registry.get_engine(f"config-{i}")

        with self.assertRaises(ValueError):
            self.registry.get_engine("config-overflow")

    def test_clear(self):
        """clear supprime tous les modèles."""
        self.registry.get_engine("config-1")
        self.registry.get_engine("config-2")
        self.registry.clear()
        self.assertEqual(len(self.registry.list_active()), 0)
        self.assertIsNone(self.registry.active_config_id)

    def test_independent_engines(self):
        """Deux engines ont des états indépendants."""
        e1 = self.registry.get_engine("config-1")
        e2 = self.registry.get_engine("config-2")
        e1.initialize(self.config, self.corpus)
        self.assertTrue(e1.is_ready)
        self.assertFalse(e2.is_ready)
