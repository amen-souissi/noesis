import uuid

from django.test import TestCase
from rest_framework.test import APIClient

from api.models import ModelConfig


class TestConfigAPI(TestCase):
    """Tests d'intégration pour les endpoints de configuration."""

    def setUp(self):
        self.client = APIClient()
        self.config = ModelConfig.objects.create(
            name="Test Config",
            description="Config de test",
            d_model=64,
            n_heads=4,
            n_layers=2,
            d_ff=256,
            seq_len=64,
            batch_size=16,
            learning_rate=1e-3,
        )
        self.preset = ModelConfig.objects.create(
            name="Preset Config",
            description="Preset de test",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            is_preset=True,
        )

    def test_list_configs(self):
        resp = self.client.get("/api/configs/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 2)

    def test_create_config(self):
        resp = self.client.post(
            "/api/configs/",
            {
                "name": "New Config",
                "d_model": 128,
                "n_heads": 8,
                "n_layers": 4,
                "d_ff": 512,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["name"], "New Config")
        self.assertEqual(resp.data["d_model"], 128)

    def test_create_config_duplicate_name(self):
        resp = self.client.post(
            "/api/configs/",
            {
                "name": "Test Config",
                "d_model": 64,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_get_config_detail(self):
        resp = self.client.get(f"/api/configs/{self.config.pk}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["name"], "Test Config")
        self.assertEqual(resp.data["d_model"], 64)

    def test_update_config(self):
        resp = self.client.patch(
            f"/api/configs/{self.config.pk}/",
            {
                "d_model": 128,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.config.refresh_from_db()
        self.assertEqual(self.config.d_model, 128)

    def test_delete_config(self):
        resp = self.client.delete(f"/api/configs/{self.config.pk}/")
        self.assertEqual(resp.status_code, 204)
        self.assertFalse(ModelConfig.objects.filter(pk=self.config.pk).exists())

    def test_get_config_not_found(self):
        fake_id = uuid.uuid4()
        resp = self.client.get(f"/api/configs/{fake_id}/")
        self.assertEqual(resp.status_code, 404)

    def test_presets(self):
        resp = self.client.get("/api/configs/presets/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["name"], "Preset Config")

    def test_validate_valid_config(self):
        resp = self.client.post(f"/api/configs/{self.config.pk}/validate/")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["valid"])
        self.assertEqual(resp.data["errors"], [])

    def test_validate_invalid_config(self):
        bad = ModelConfig.objects.create(
            name="Bad Config",
            d_model=65,  # Non divisible par n_heads=4
            n_heads=4,
        )
        resp = self.client.post(f"/api/configs/{bad.pk}/validate/")
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data["valid"])
        self.assertGreater(len(resp.data["errors"]), 0)

    def test_validate_not_found(self):
        fake_id = uuid.uuid4()
        resp = self.client.post(f"/api/configs/{fake_id}/validate/")
        self.assertEqual(resp.status_code, 404)

    def test_duplicate_config(self):
        resp = self.client.post(f"/api/configs/{self.config.pk}/duplicate/")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["name"], "Test Config (copie)")
        self.assertEqual(resp.data["d_model"], 64)
        self.assertFalse(resp.data["is_preset"])

    def test_duplicate_not_found(self):
        fake_id = uuid.uuid4()
        resp = self.client.post(f"/api/configs/{fake_id}/duplicate/")
        self.assertEqual(resp.status_code, 404)
