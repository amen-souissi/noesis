"""
Tests unitaires et d'intégration pour le weight decay (régularisation L2).

Couvre :
- Champ weight_decay dans Config et ModelConfig
- Application du weight decay dans le training loop
- Sérialisation/désérialisation via l'API
- Validation du champ
"""

import time

import numpy as np
from django.test import TestCase, TransactionTestCase
from rest_framework.test import APIClient

from api.models import ModelConfig
from api.services.engine_service import EngineService
from api.services.training_service import TrainingService
from config import Config

# ─── Tests unitaires : Config dataclass ──────────────────────────────


class TestWeightDecayConfig(TestCase):
    """Le champ weight_decay existe et a la bonne valeur par défaut."""

    def test_default_value(self):
        cfg = Config()
        self.assertEqual(cfg.weight_decay, 0.0)

    def test_custom_value(self):
        cfg = Config(weight_decay=0.1)
        self.assertEqual(cfg.weight_decay, 0.1)


# ─── Tests unitaires : Django model ──────────────────────────────────


class TestWeightDecayModel(TestCase):
    """Le champ weight_decay dans ModelConfig fonctionne correctement."""

    def test_default_value(self):
        config = ModelConfig.objects.create(name="wd_test")
        self.assertEqual(config.weight_decay, 0.0)

    def test_custom_value(self):
        config = ModelConfig.objects.create(name="wd_custom", weight_decay=0.05)
        config.refresh_from_db()
        self.assertAlmostEqual(config.weight_decay, 0.05)

    def test_to_engine_config(self):
        config = ModelConfig.objects.create(
            name="wd_engine",
            weight_decay=0.01,
            d_model=32,
            n_heads=2,
        )
        engine_cfg = config.to_engine_config()
        self.assertEqual(engine_cfg.weight_decay, 0.01)

    def test_validate_negative_weight_decay(self):
        config = ModelConfig(
            name="wd_bad",
            weight_decay=-0.1,
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
        )
        errors = config.validate_config()
        self.assertTrue(any("weight_decay" in e for e in errors))

    def test_validate_zero_weight_decay(self):
        config = ModelConfig(
            name="wd_zero",
            weight_decay=0.0,
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
        )
        errors = config.validate_config()
        self.assertFalse(any("weight_decay" in e for e in errors))


# ─── Tests d'intégration : API ────────────────────────────────────────


class TestWeightDecayAPI(TestCase):
    """L'API expose et accepte le champ weight_decay."""

    def setUp(self):
        self.client = APIClient()
        self.config = ModelConfig.objects.create(
            name="wd_api_test",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
        )

    def test_get_returns_weight_decay(self):
        resp = self.client.get(f"/api/configs/{self.config.pk}/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("weight_decay", resp.data)
        self.assertEqual(resp.data["weight_decay"], 0.0)

    def test_create_with_weight_decay(self):
        resp = self.client.post(
            "/api/configs/",
            {
                "name": "wd_create",
                "d_model": 32,
                "n_heads": 2,
                "weight_decay": 0.05,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["weight_decay"], 0.05)

    def test_update_weight_decay(self):
        resp = self.client.patch(
            f"/api/configs/{self.config.pk}/",
            {
                "weight_decay": 0.1,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.config.refresh_from_db()
        self.assertAlmostEqual(self.config.weight_decay, 0.1)

    def test_validate_negative_weight_decay(self):
        self.config.weight_decay = -0.1
        self.config.save()
        resp = self.client.post(f"/api/configs/{self.config.pk}/validate/")
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data["valid"])

    def test_duplicate_preserves_weight_decay(self):
        self.config.weight_decay = 0.05
        self.config.save()
        resp = self.client.post(f"/api/configs/{self.config.pk}/duplicate/")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["weight_decay"], 0.05)


# ─── Tests d'intégration : Training avec weight decay ─────────────────


class TestWeightDecayTraining(TransactionTestCase):
    """Le weight decay réduit effectivement les poids pendant l'entraînement."""

    def setUp(self):
        self.corpus = "abcabcabcabc " * 20

    def _make_engine(self, weight_decay: float) -> EngineService:
        engine = EngineService()
        config = Config(
            d_model=16,
            n_heads=2,
            n_layers=1,
            d_ff=32,
            seq_len=8,
            batch_size=2,
            max_epochs=5,
            seed=42,
            weight_decay=weight_decay,
        )
        engine.initialize(config, self.corpus)
        return engine

    def test_weight_decay_reduces_weight_norm(self):
        """Avec weight_decay > 0, la norme des poids est plus petite."""
        engine_no_wd = self._make_engine(0.0)
        engine_with_wd = self._make_engine(0.1)

        db_config = ModelConfig.objects.create(
            name="wd_train_test",
            d_model=16,
            n_heads=2,
            n_layers=1,
            d_ff=32,
        )

        # Train without weight decay
        svc1 = TrainingService(config_id=str(db_config.pk))
        run1 = __import__("api.models", fromlist=["TrainingRun"]).TrainingRun.objects.create(
            config=db_config,
            total_epochs=5,
            status="pending",
        )
        svc1.start(engine_no_wd, str(run1.pk), 5)
        time.sleep(15)

        # Train with weight decay
        db_config2 = ModelConfig.objects.create(
            name="wd_train_test2",
            d_model=16,
            n_heads=2,
            n_layers=1,
            d_ff=32,
        )
        svc2 = TrainingService(config_id=str(db_config2.pk))
        run2 = __import__("api.models", fromlist=["TrainingRun"]).TrainingRun.objects.create(
            config=db_config2,
            total_epochs=5,
            status="pending",
        )
        svc2.start(engine_with_wd, str(run2.pk), 5)
        time.sleep(15)

        # Compare weight norms
        def total_weight_norm(engine):
            total = 0.0
            for mod in engine.model.all_modules():
                for p in mod.parameters.values():
                    total += float(np.sum(p**2))
            return total

        norm_no_wd = total_weight_norm(engine_no_wd)
        norm_with_wd = total_weight_norm(engine_with_wd)

        self.assertLess(
            norm_with_wd,
            norm_no_wd,
            f"Weight decay should reduce weight norm: {norm_with_wd:.4f} >= {norm_no_wd:.4f}",
        )

    def test_zero_weight_decay_no_effect(self):
        """Avec weight_decay=0, le training fonctionne normalement."""
        engine = self._make_engine(0.0)
        db_config = ModelConfig.objects.create(
            name="wd_zero_test",
            d_model=16,
            n_heads=2,
            n_layers=1,
            d_ff=32,
        )
        svc = TrainingService(config_id=str(db_config.pk))
        run = __import__("api.models", fromlist=["TrainingRun"]).TrainingRun.objects.create(
            config=db_config,
            total_epochs=3,
            status="pending",
        )
        svc.start(engine, str(run.pk), 3)
        time.sleep(15)
        self.assertGreater(len(svc.loss_history), 0)
