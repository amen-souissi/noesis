import time

from django.test import TransactionTestCase

from api.models import ModelConfig, TrainingRun
from api.services.engine_service import EngineService
from api.services.training_service import TrainingService
from config import Config


class TestTrainingService(TransactionTestCase):
    """Tests unitaires pour TrainingService."""

    def setUp(self):
        self.engine = EngineService()
        self.training_svc = TrainingService(config_id="test")
        self.corpus = "Le chat mange le poisson. Le chien mange la viande. " * 5
        self.config = Config(
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
            max_epochs=3,
            seed=42,
        )
        self.engine.initialize(self.config, self.corpus)

        self.db_config = ModelConfig.objects.create(
            name="test_config",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
            max_epochs=3,
        )

    def tearDown(self):
        if self.training_svc.is_running:
            self.training_svc.stop()
            time.sleep(2)

    def test_independent_instances(self):
        """Chaque instance est indépendante."""
        s1 = TrainingService(config_id="a")
        s2 = TrainingService(config_id="b")
        self.assertIsNot(s1, s2)

    def test_not_running_initially(self):
        """Le service n'est pas en cours initialement."""
        self.assertFalse(self.training_svc.is_running)
        self.assertFalse(self.training_svc.is_paused)

    def test_start_and_pause_training(self):
        """L'entraînement démarre et peut être mis en pause."""
        run = TrainingRun.objects.create(
            config=self.db_config,
            total_epochs=1000,
            status="pending",
        )
        self.training_svc.start(self.engine, str(run.pk), 1000)
        # Pause immédiatement pour garder le thread vivant
        time.sleep(0.1)
        self.training_svc.pause()
        time.sleep(0.5)
        self.assertTrue(self.training_svc.is_running)
        self.assertTrue(self.training_svc.is_paused)

    def test_stop_training(self):
        """L'entraînement s'arrête proprement."""
        run = TrainingRun.objects.create(
            config=self.db_config,
            total_epochs=1000,
            status="pending",
        )
        self.training_svc.start(self.engine, str(run.pk), 1000)
        time.sleep(0.1)
        self.training_svc.pause()
        time.sleep(0.5)
        self.assertTrue(self.training_svc.is_running)
        self.training_svc.stop()
        time.sleep(2)
        self.assertFalse(self.training_svc.is_running)

    def test_pause_resume(self):
        """L'entraînement se met en pause et reprend."""
        run = TrainingRun.objects.create(
            config=self.db_config,
            total_epochs=1000,
            status="pending",
        )
        self.training_svc.start(self.engine, str(run.pk), 1000)
        time.sleep(0.1)

        self.training_svc.pause()
        time.sleep(0.5)
        self.assertTrue(self.training_svc.is_paused)

        self.training_svc.resume()
        self.assertFalse(self.training_svc.is_paused)

    def test_loss_history_populated(self):
        """La loss history est peuplée pendant l'entraînement."""
        run = TrainingRun.objects.create(
            config=self.db_config,
            total_epochs=3,
            status="pending",
        )
        self.training_svc.start(self.engine, str(run.pk), 3)
        # Attendre la fin
        time.sleep(15)
        self.assertGreater(len(self.training_svc.loss_history), 0)
        for loss in self.training_svc.loss_history:
            self.assertIsInstance(loss, float)
            self.assertGreater(loss, 0)

    def test_training_completes(self):
        """L'entraînement se termine et met à jour le status DB."""
        run = TrainingRun.objects.create(
            config=self.db_config,
            total_epochs=2,
            status="pending",
        )
        self.training_svc.start(self.engine, str(run.pk), 2)
        time.sleep(15)
        run.refresh_from_db()
        self.assertIn(run.status, ["completed", "stopped"])

    def test_cannot_start_twice(self):
        """On ne peut pas lancer deux entraînements simultanés sur le même service."""
        run1 = TrainingRun.objects.create(
            config=self.db_config,
            total_epochs=1000,
            status="pending",
        )
        self.training_svc.start(self.engine, str(run1.pk), 1000)
        time.sleep(0.1)
        self.training_svc.pause()
        time.sleep(0.5)

        run2 = TrainingRun.objects.create(
            config=self.db_config,
            total_epochs=5,
            status="pending",
        )
        with self.assertRaises(RuntimeError):
            self.training_svc.start(self.engine, str(run2.pk), 5)
