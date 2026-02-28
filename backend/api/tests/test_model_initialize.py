"""Tests pour l'endpoint model_initialize (initialisation sans entraînement)."""

import time
import uuid

from django.test import TransactionTestCase
from rest_framework.test import APIClient

from api.models import ConfigTrainingData, ModelConfig, TrainingData
from api.services.model_registry import ModelRegistry


class TestModelInitialize(TransactionTestCase):
    """Tests d'intégration pour POST /api/training/initialize/."""

    def setUp(self):
        ModelRegistry._instance = None
        self.client = APIClient()
        self.config = ModelConfig.objects.create(
            name="Init Config",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
            max_epochs=2,
        )
        self.data = TrainingData.objects.create(
            name="init_data.txt",
            original_filename="init_data.txt",
            file_type="txt",
            file_size=500,
            extracted_text="Le chat mange le poisson. Le chien mange la viande. " * 10,
            char_count=500,
        )

    def tearDown(self):
        registry = ModelRegistry()
        registry.clear()
        time.sleep(0.5)
        ModelRegistry._instance = None

    def test_initialize_success(self):
        """Initialisation réussie avec données liées (même inactives)."""
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=False,
        )
        resp = self.client.post(
            "/api/training/initialize/",
            {
                "config_id": str(self.config.pk),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["status"], "initialized")
        self.assertGreater(resp.data["vocab_size"], 0)
        self.assertGreater(resp.data["total_parameters"], 0)

    def test_initialize_with_active_data(self):
        """Initialisation fonctionne aussi avec données actives."""
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=True,
        )
        resp = self.client.post(
            "/api/training/initialize/",
            {
                "config_id": str(self.config.pk),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["status"], "initialized")

    def test_initialize_no_config_id(self):
        resp = self.client.post("/api/training/initialize/", {}, format="json")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("config_id requis", resp.data["error"])

    def test_initialize_config_not_found(self):
        resp = self.client.post(
            "/api/training/initialize/",
            {
                "config_id": str(uuid.uuid4()),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 404)

    def test_initialize_no_data(self):
        """Sans données liées, corpus est vide → erreur 400."""
        resp = self.client.post(
            "/api/training/initialize/",
            {
                "config_id": str(self.config.pk),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Corpus trop petit", resp.data["error"])

    def test_initialize_idempotent(self):
        """Appeler initialize deux fois retourne already_ready la 2e fois."""
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=False,
        )
        resp1 = self.client.post(
            "/api/training/initialize/",
            {
                "config_id": str(self.config.pk),
            },
            format="json",
        )
        self.assertEqual(resp1.status_code, 200)
        self.assertEqual(resp1.data["status"], "initialized")

        resp2 = self.client.post(
            "/api/training/initialize/",
            {
                "config_id": str(self.config.pk),
            },
            format="json",
        )
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2.data["status"], "already_ready")

    def test_initialize_updates_vocab_size(self):
        """L'initialisation met à jour vocab_size dans la config DB."""
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=False,
        )
        resp = self.client.post(
            "/api/training/initialize/",
            {
                "config_id": str(self.config.pk),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)

        self.config.refresh_from_db()
        self.assertEqual(self.config.vocab_size, resp.data["vocab_size"])
