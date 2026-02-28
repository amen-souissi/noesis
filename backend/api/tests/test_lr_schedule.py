"""
Tests unitaires et d'intégration pour le LR scheduling.

Couvre :
- LRScheduler, CosineScheduler, CosineRestartsScheduler
- Champ lr_schedule dans Config et ModelConfig
- Intégration dans le training loop (training_service)
- Sérialisation/désérialisation via l'API
- Validation du champ
"""

import time

from django.test import TestCase, TransactionTestCase
from rest_framework.test import APIClient

from api.models import ModelConfig
from api.services.engine_service import EngineService
from api.services.training_service import TrainingService
from config import Config
from training.lr_scheduler import (
    CosineRestartsScheduler,
    CosineScheduler,
    LRScheduler,
    create_scheduler,
)

# ─── Tests unitaires : Schedulers ──────────────────────────────────


class TestLRSchedulerConstant(TestCase):
    """Le scheduler constant retourne toujours le même LR."""

    def test_constant_lr(self):
        sched = LRScheduler(base_lr=0.001, total_steps=100)
        for _ in range(100):
            lr = sched.step()
            self.assertAlmostEqual(lr, 0.001)

    def test_step_increments(self):
        sched = LRScheduler(base_lr=0.01, total_steps=50)
        sched.step()
        sched.step()
        self.assertEqual(sched._step, 2)


class TestCosineScheduler(TestCase):
    """Cosine annealing : LR descend de base_lr à ~0."""

    def test_starts_at_base_lr(self):
        sched = CosineScheduler(base_lr=0.001, total_steps=100)
        lr = sched.step()
        self.assertAlmostEqual(lr, 0.001, places=5)

    def test_ends_near_zero(self):
        sched = CosineScheduler(base_lr=0.001, total_steps=100)
        lr = 0.0
        for _ in range(100):
            lr = sched.step()
        self.assertAlmostEqual(lr, 0.0, places=5)

    def test_midpoint_is_half(self):
        """À mi-chemin, LR ≈ base_lr / 2."""
        sched = CosineScheduler(base_lr=0.002, total_steps=100)
        for _ in range(50):
            lr = sched.step()
        self.assertAlmostEqual(lr, 0.001, places=4)

    def test_monotonically_decreasing(self):
        sched = CosineScheduler(base_lr=0.001, total_steps=100)
        prev_lr = float("inf")
        for _ in range(100):
            lr = sched.step()
            self.assertLessEqual(lr, prev_lr + 1e-10)
            prev_lr = lr

    def test_single_step(self):
        sched = CosineScheduler(base_lr=0.001, total_steps=1)
        lr = sched.step()
        self.assertAlmostEqual(lr, 0.001)


class TestCosineRestartsScheduler(TestCase):
    """Cosine annealing avec warm restarts : LR cyclique."""

    def test_starts_at_base_lr(self):
        sched = CosineRestartsScheduler(base_lr=0.001, total_steps=700)
        lr = sched.step()
        self.assertAlmostEqual(lr, 0.001, places=5)

    def test_has_restarts(self):
        """Le LR remonte après un cycle (warm restart)."""
        sched = CosineRestartsScheduler(base_lr=0.001, total_steps=700, n_restarts=3)
        lrs = [sched.step() for _ in range(700)]
        # Find local maxima (restarts): LR should go back up
        restarts = 0
        for i in range(2, len(lrs)):
            if lrs[i] > lrs[i - 1] and lrs[i - 1] < lrs[i - 2]:
                restarts += 1
        self.assertGreaterEqual(restarts, 1, "Should have at least 1 restart")

    def test_lr_stays_in_range(self):
        sched = CosineRestartsScheduler(base_lr=0.001, total_steps=1000)
        for _ in range(1000):
            lr = sched.step()
            self.assertGreaterEqual(lr, 0.0)
            self.assertLessEqual(lr, 0.001 + 1e-10)

    def test_first_cycle_length(self):
        """T_0 = total_steps / (2^n - 1). For n=3: T_0 = 1000/7 ≈ 142."""
        sched = CosineRestartsScheduler(base_lr=0.001, total_steps=700, n_restarts=3)
        # T_0 = 700 / 7 = 100
        self.assertEqual(sched.t_0, 100)


class TestCreateScheduler(TestCase):
    """Factory function crée le bon type de scheduler."""

    def test_constant(self):
        sched = create_scheduler("constant", 0.001, 100)
        self.assertIsInstance(sched, LRScheduler)
        self.assertNotIsInstance(sched, CosineScheduler)

    def test_cosine(self):
        sched = create_scheduler("cosine", 0.001, 100)
        self.assertIsInstance(sched, CosineScheduler)

    def test_cosine_restarts(self):
        sched = create_scheduler("cosine_restarts", 0.001, 100)
        self.assertIsInstance(sched, CosineRestartsScheduler)

    def test_unknown_falls_back_to_constant(self):
        sched = create_scheduler("unknown", 0.001, 100)
        self.assertIsInstance(sched, LRScheduler)
        self.assertNotIsInstance(sched, CosineScheduler)


# ─── Tests unitaires : Config dataclass ──────────────────────────────


class TestLRScheduleConfig(TestCase):
    """Le champ lr_schedule existe et a la bonne valeur par défaut."""

    def test_default_value(self):
        cfg = Config()
        self.assertEqual(cfg.lr_schedule, "constant")

    def test_custom_value(self):
        cfg = Config(lr_schedule="cosine_restarts")
        self.assertEqual(cfg.lr_schedule, "cosine_restarts")


# ─── Tests unitaires : Django model ──────────────────────────────────


class TestLRScheduleModel(TestCase):
    """Le champ lr_schedule dans ModelConfig fonctionne correctement."""

    def test_default_value(self):
        config = ModelConfig.objects.create(name="lr_test")
        self.assertEqual(config.lr_schedule, "constant")

    def test_custom_value(self):
        config = ModelConfig.objects.create(name="lr_cosine", lr_schedule="cosine")
        config.refresh_from_db()
        self.assertEqual(config.lr_schedule, "cosine")

    def test_to_engine_config(self):
        config = ModelConfig.objects.create(
            name="lr_engine",
            lr_schedule="cosine_restarts",
            d_model=32,
            n_heads=2,
        )
        engine_cfg = config.to_engine_config()
        self.assertEqual(engine_cfg.lr_schedule, "cosine_restarts")

    def test_validate_invalid_schedule(self):
        config = ModelConfig(
            name="lr_bad",
            lr_schedule="invalid_schedule",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
        )
        errors = config.validate_config()
        self.assertTrue(any("lr_schedule" in e for e in errors))

    def test_validate_valid_schedules(self):
        for schedule in ("constant", "cosine", "cosine_restarts"):
            config = ModelConfig(
                name=f"lr_{schedule}",
                lr_schedule=schedule,
                d_model=32,
                n_heads=2,
                n_layers=1,
                d_ff=64,
            )
            errors = config.validate_config()
            self.assertFalse(any("lr_schedule" in e for e in errors), f"{schedule} should be valid")


# ─── Tests d'intégration : API ────────────────────────────────────────


class TestLRScheduleAPI(TestCase):
    """L'API expose et accepte le champ lr_schedule."""

    def setUp(self):
        self.client = APIClient()
        self.config = ModelConfig.objects.create(
            name="lr_api_test",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
        )

    def test_get_returns_lr_schedule(self):
        resp = self.client.get(f"/api/configs/{self.config.pk}/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("lr_schedule", resp.data)
        self.assertEqual(resp.data["lr_schedule"], "constant")

    def test_create_with_lr_schedule(self):
        resp = self.client.post(
            "/api/configs/",
            {
                "name": "lr_create",
                "d_model": 32,
                "n_heads": 2,
                "lr_schedule": "cosine",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["lr_schedule"], "cosine")

    def test_update_lr_schedule(self):
        resp = self.client.patch(
            f"/api/configs/{self.config.pk}/",
            {
                "lr_schedule": "cosine_restarts",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.config.refresh_from_db()
        self.assertEqual(self.config.lr_schedule, "cosine_restarts")

    def test_validate_invalid_schedule(self):
        self.config.lr_schedule = "invalid"
        self.config.save()
        resp = self.client.post(f"/api/configs/{self.config.pk}/validate/")
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data["valid"])

    def test_duplicate_preserves_lr_schedule(self):
        self.config.lr_schedule = "cosine_restarts"
        self.config.save()
        resp = self.client.post(f"/api/configs/{self.config.pk}/duplicate/")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["lr_schedule"], "cosine_restarts")


# ─── Tests d'intégration : Training avec LR schedule ─────────────────


class TestLRScheduleTraining(TransactionTestCase):
    """Le LR schedule est effectivement appliqué pendant l'entraînement."""

    def setUp(self):
        self.corpus = "abcabcabcabc " * 20

    def _make_engine(self, lr_schedule: str) -> EngineService:
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
            lr_schedule=lr_schedule,
        )
        engine.initialize(config, self.corpus)
        return engine

    def test_cosine_schedule_trains_successfully(self):
        """Le training avec cosine schedule se termine sans erreur."""
        engine = self._make_engine("cosine")
        db_config = ModelConfig.objects.create(
            name="lr_cosine_train",
            d_model=16,
            n_heads=2,
            n_layers=1,
            d_ff=32,
            lr_schedule="cosine",
        )
        svc = TrainingService(config_id=str(db_config.pk))
        from api.models import TrainingRun

        run = TrainingRun.objects.create(
            config=db_config,
            total_epochs=5,
            status="pending",
        )
        svc.start(engine, str(run.pk), 5)
        time.sleep(15)
        self.assertGreater(len(svc.loss_history), 0)

    def test_cosine_restarts_trains_successfully(self):
        """Le training avec cosine_restarts se termine sans erreur."""
        engine = self._make_engine("cosine_restarts")
        db_config = ModelConfig.objects.create(
            name="lr_restarts_train",
            d_model=16,
            n_heads=2,
            n_layers=1,
            d_ff=32,
            lr_schedule="cosine_restarts",
        )
        svc = TrainingService(config_id=str(db_config.pk))
        from api.models import TrainingRun

        run = TrainingRun.objects.create(
            config=db_config,
            total_epochs=5,
            status="pending",
        )
        svc.start(engine, str(run.pk), 5)
        time.sleep(15)
        self.assertGreater(len(svc.loss_history), 0)
