import os
import uuid

from django.test import TestCase
from rest_framework.test import APIClient

from api.models import ModelConfig, TrainedModel
from api.services.model_registry import ModelRegistry
from config import Config


class TestModelAPI(TestCase):
    """Tests d'intégration pour les endpoints de modèle."""

    def setUp(self):
        ModelRegistry._instance = None
        self.client = APIClient()
        self.db_config = ModelConfig.objects.create(
            name="Model Config",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
        )
        # Initialize engine via registry
        registry = ModelRegistry()
        engine = registry.get_engine(str(self.db_config.pk))
        corpus = "Le chat mange le poisson. Le chien mange la viande."
        config = Config(
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
            seed=42,
        )
        engine.initialize(config, corpus)

    def tearDown(self):
        registry = ModelRegistry()
        registry.clear()
        ModelRegistry._instance = None

    def test_list_models_empty(self):
        resp = self.client.get("/api/models/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 0)

    def test_save_model(self):
        resp = self.client.post(
            "/api/models/save/",
            {
                "name": "test_model",
                "config_id": str(self.db_config.pk),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["name"], "test_model")
        self.assertGreater(resp.data["total_parameters"], 0)
        # Cleanup
        if resp.data.get("weights_path") and os.path.exists(resp.data["weights_path"]):
            os.unlink(resp.data["weights_path"])

    def test_save_model_no_config(self):
        resp = self.client.post(
            "/api/models/save/",
            {
                "name": "test",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_save_model_config_not_found(self):
        resp = self.client.post(
            "/api/models/save/",
            {
                "name": "test",
                "config_id": str(uuid.uuid4()),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 404)

    def test_save_and_load_model(self):
        # Sauvegarder
        resp = self.client.post(
            "/api/models/save/",
            {
                "name": "load_test",
                "config_id": str(self.db_config.pk),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        model_id = resp.data["id"]

        # Charger
        resp = self.client.post(f"/api/models/{model_id}/load/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("total_parameters", resp.data)
        self.assertIn("vocab_size", resp.data)
        self.assertIn("config_id", resp.data)

        # Cleanup
        model = TrainedModel.objects.get(pk=model_id)
        if os.path.exists(model.weights_path):
            os.unlink(model.weights_path)

    def test_load_model_not_found(self):
        resp = self.client.post(f"/api/models/{uuid.uuid4()}/load/")
        self.assertEqual(resp.status_code, 404)

    def test_current_model_info(self):
        resp = self.client.get(f"/api/models/current/?config_id={self.db_config.pk}")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["loaded"])
        self.assertEqual(resp.data["d_model"], 32)
        self.assertEqual(resp.data["n_heads"], 2)

    def test_current_model_info_no_model(self):
        registry = ModelRegistry()
        registry.clear()
        resp = self.client.get("/api/models/current/")
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data["loaded"])

    def test_active_models(self):
        resp = self.client.get("/api/models/active/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["config_id"], str(self.db_config.pk))
        self.assertTrue(resp.data[0]["is_ready"])

    def test_unload_model(self):
        resp = self.client.delete(f"/api/models/active/{self.db_config.pk}/")
        self.assertEqual(resp.status_code, 200)

        # Vérifier que le modèle est déchargé
        resp = self.client.get("/api/models/active/")
        self.assertEqual(len(resp.data), 0)

    def test_unload_model_not_found(self):
        resp = self.client.delete(f"/api/models/active/{uuid.uuid4()}/")
        self.assertEqual(resp.status_code, 404)

    def test_delete_model(self):
        # Sauvegarder d'abord
        resp = self.client.post(
            "/api/models/save/",
            {
                "name": "delete_test",
                "config_id": str(self.db_config.pk),
            },
            format="json",
        )
        model_id = resp.data["id"]
        weights_path = TrainedModel.objects.get(pk=model_id).weights_path

        resp = self.client.delete(f"/api/models/{model_id}/")
        self.assertEqual(resp.status_code, 204)
        self.assertFalse(TrainedModel.objects.filter(pk=model_id).exists())
        self.assertFalse(os.path.exists(weights_path))
