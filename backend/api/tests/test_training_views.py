import time
import uuid

from django.test import TransactionTestCase
from rest_framework.test import APIClient

from api.models import ConfigTrainingData, ModelConfig, TrainingData, TrainingRun
from api.services.model_registry import ModelRegistry


class TestTrainingAPI(TransactionTestCase):
    """Tests d'intégration pour les endpoints d'entraînement."""

    def setUp(self):
        ModelRegistry._instance = None
        self.client = APIClient()
        self.config = ModelConfig.objects.create(
            name="Train Config",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
            max_epochs=2,
        )
        self.data = TrainingData.objects.create(
            name="train.txt",
            original_filename="train.txt",
            file_type="txt",
            file_size=500,
            extracted_text="Le chat mange le poisson. Le chien mange la viande. " * 10,
            char_count=500,
            is_active=True,
        )
        # Link training data to config (active)
        self.link = ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=True,
        )

    def tearDown(self):
        import time as _time

        registry = ModelRegistry()
        registry.clear()
        _time.sleep(1)  # attendre que les threads d'entraînement s'arrêtent
        ModelRegistry._instance = None

    def test_training_status_idle(self):
        resp = self.client.get("/api/training/status/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["status"], "idle")

    def test_training_start(self):
        resp = self.client.post(
            "/api/training/start/",
            {
                "config_id": str(self.config.pk),
                "num_epochs": 2,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("run_id", resp.data)
        self.assertIn("vocab_size", resp.data)
        self.assertIn("total_parameters", resp.data)
        # Cleanup
        time.sleep(1)

    def test_training_start_no_config(self):
        resp = self.client.post("/api/training/start/", {}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_training_start_config_not_found(self):
        resp = self.client.post(
            "/api/training/start/",
            {
                "config_id": str(uuid.uuid4()),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 404)

    def test_training_start_no_data(self):
        self.link.is_active = False
        self.link.save()
        resp = self.client.post(
            "/api/training/start/",
            {
                "config_id": str(self.config.pk),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Corpus trop petit", resp.data["error"])

    def test_training_stop(self):
        # Start first
        self.client.post(
            "/api/training/start/",
            {
                "config_id": str(self.config.pk),
                "num_epochs": 500,
            },
            format="json",
        )
        time.sleep(0.5)

        resp = self.client.post(
            "/api/training/stop/",
            {
                "config_id": str(self.config.pk),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        time.sleep(1)

    def test_training_stop_not_running(self):
        resp = self.client.post("/api/training/stop/")
        self.assertEqual(resp.status_code, 400)

    def test_training_pause_resume(self):
        self.client.post(
            "/api/training/start/",
            {
                "config_id": str(self.config.pk),
                "num_epochs": 500,
            },
            format="json",
        )
        time.sleep(0.5)

        resp = self.client.post(
            "/api/training/pause/",
            {
                "config_id": str(self.config.pk),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)

        resp = self.client.get(f"/api/training/status/?config_id={self.config.pk}")
        self.assertEqual(resp.data["status"], "paused")

        resp = self.client.post(
            "/api/training/resume/",
            {
                "config_id": str(self.config.pk),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)

        self.client.post(
            "/api/training/stop/",
            {
                "config_id": str(self.config.pk),
            },
            format="json",
        )
        time.sleep(1)

    def test_training_history(self):
        TrainingRun.objects.create(
            config=self.config,
            total_epochs=10,
            status="completed",
        )
        resp = self.client.get("/api/training/history/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 1)

    def test_training_run_detail(self):
        run = TrainingRun.objects.create(
            config=self.config,
            total_epochs=10,
            status="completed",
            loss_history=[3.0, 2.5, 2.0],
        )
        resp = self.client.get(f"/api/training/history/{run.pk}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["status"], "completed")
        self.assertEqual(resp.data["loss_history"], [3.0, 2.5, 2.0])

    def test_training_double_start(self):
        """On ne peut pas lancer deux entraînements sur le même modèle."""
        self.client.post(
            "/api/training/start/",
            {
                "config_id": str(self.config.pk),
                "num_epochs": 500,
            },
            format="json",
        )
        time.sleep(0.5)

        resp = self.client.post(
            "/api/training/start/",
            {
                "config_id": str(self.config.pk),
                "num_epochs": 5,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 409)

        self.client.post(
            "/api/training/stop/",
            {
                "config_id": str(self.config.pk),
            },
            format="json",
        )
        time.sleep(1)
