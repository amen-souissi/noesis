"""Tests d'intégration end-to-end.

Scénarios complets : config → données → entraînement → génération.
Couvre les 3 tokenizers et les 4 stratégies d'échantillonnage.
"""

import time

from django.test import TransactionTestCase
from rest_framework.test import APIClient

from api.models import ConfigTrainingData, ModelConfig, TrainingData
from api.services.model_registry import ModelRegistry


class TestIntegrationCharacterTokenizer(TransactionTestCase):
    """Scénario complet avec tokenizer caractère."""

    def setUp(self):
        ModelRegistry._instance = None
        self.client = APIClient()
        self.config = ModelConfig.objects.create(
            name="Integration Char",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
            max_epochs=2,
            tokenizer_type="character",
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
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=True,
        )

    def tearDown(self):
        registry = ModelRegistry()
        registry.clear()
        time.sleep(1)
        ModelRegistry._instance = None

    def test_full_cycle_character_tokenizer(self):
        """Config → entraîner → générer (tokenizer caractère)."""
        # Entraîner
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
        self.assertGreater(resp.data["vocab_size"], 0)
        self.assertGreater(resp.data["total_parameters"], 0)

        # Attendre la fin
        time.sleep(3)

        # Vérifier le statut
        resp = self.client.get(f"/api/training/status/?config_id={self.config.pk}")
        self.assertEqual(resp.status_code, 200)

        # Générer du texte
        resp = self.client.post(
            "/api/generate/",
            {
                "prompt": "Le ",
                "max_tokens": 10,
                "temperature": 0.8,
                "config_id": str(self.config.pk),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("generated_text", resp.data)

    def test_sampling_strategies(self):
        """Test chaque stratégie d'échantillonnage."""
        # Entraîner d'abord
        self.client.post(
            "/api/training/start/",
            {
                "config_id": str(self.config.pk),
                "num_epochs": 2,
            },
            format="json",
        )
        time.sleep(3)

        for strategy in ["greedy", "temperature", "top_k", "top_p"]:
            resp = self.client.post(
                "/api/generate/",
                {
                    "prompt": "Le ",
                    "max_tokens": 5,
                    "sampling_strategy": strategy,
                    "temperature": 0.8,
                    "top_k": 5,
                    "top_p": 0.9,
                    "config_id": str(self.config.pk),
                },
                format="json",
            )
            self.assertEqual(resp.status_code, 200, f"Échec pour stratégie {strategy}")
            self.assertIn("generated_text", resp.data)


class TestIntegrationBPETokenizer(TransactionTestCase):
    """Scénario avec tokenizer BPE (GPT-4 style)."""

    def setUp(self):
        ModelRegistry._instance = None
        self.client = APIClient()
        self.config = ModelConfig.objects.create(
            name="Integration BPE",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
            max_epochs=2,
            tokenizer_type="gpt4",
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
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=True,
        )

    def tearDown(self):
        registry = ModelRegistry()
        registry.clear()
        time.sleep(1)
        ModelRegistry._instance = None

    def test_full_cycle_bpe_tokenizer(self):
        """Config → entraîner → générer (tokenizer BPE GPT-4)."""
        resp = self.client.post(
            "/api/training/start/",
            {
                "config_id": str(self.config.pk),
                "num_epochs": 2,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        # Vocab size should be corpus-proportional, not 100k
        self.assertLess(resp.data["vocab_size"], 1000)

        time.sleep(3)

        # Générer
        resp = self.client.post(
            "/api/generate/",
            {
                "prompt": "Le ",
                "max_tokens": 5,
                "config_id": str(self.config.pk),
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("generated_text", resp.data)


class TestIntegrationMultiModel(TransactionTestCase):
    """Scénario multi-modèle."""

    def setUp(self):
        ModelRegistry._instance = None
        self.client = APIClient()
        self.config1 = ModelConfig.objects.create(
            name="Model A",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
            max_epochs=2,
            tokenizer_type="character",
        )
        self.config2 = ModelConfig.objects.create(
            name="Model B",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
            max_epochs=2,
            tokenizer_type="character",
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
        ConfigTrainingData.objects.create(
            config=self.config1,
            training_data=self.data,
            is_active=True,
        )
        ConfigTrainingData.objects.create(
            config=self.config2,
            training_data=self.data,
            is_active=True,
        )

    def tearDown(self):
        registry = ModelRegistry()
        registry.clear()
        time.sleep(1)
        ModelRegistry._instance = None

    def test_two_models_independent(self):
        """Deux modèles entraînés indépendamment."""
        # Entraîner modèle A
        resp1 = self.client.post(
            "/api/training/start/",
            {
                "config_id": str(self.config1.pk),
                "num_epochs": 2,
            },
            format="json",
        )
        self.assertEqual(resp1.status_code, 200)
        time.sleep(3)

        # Entraîner modèle B
        resp2 = self.client.post(
            "/api/training/start/",
            {
                "config_id": str(self.config2.pk),
                "num_epochs": 2,
            },
            format="json",
        )
        self.assertEqual(resp2.status_code, 200)
        time.sleep(3)

        # Vérifier les modèles actifs
        resp = self.client.get("/api/models/active/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 2)

        # Générer avec chaque modèle
        for config in [self.config1, self.config2]:
            resp = self.client.post(
                "/api/generate/",
                {
                    "prompt": "Le ",
                    "max_tokens": 5,
                    "config_id": str(config.pk),
                },
                format="json",
            )
            self.assertEqual(resp.status_code, 200)

    def test_unload_model(self):
        """Décharger un modèle de la mémoire."""
        # Charger un modèle
        self.client.post(
            "/api/training/start/",
            {
                "config_id": str(self.config1.pk),
                "num_epochs": 2,
            },
            format="json",
        )
        time.sleep(3)

        # Vérifier qu'il est actif
        resp = self.client.get("/api/models/active/")
        self.assertGreaterEqual(len(resp.data), 1)

        # Décharger
        resp = self.client.delete(f"/api/models/active/{self.config1.pk}/")
        self.assertEqual(resp.status_code, 200)

        # Vérifier qu'il n'est plus en mémoire
        resp = self.client.get("/api/models/active/")
        in_memory_ids = [m["config_id"] for m in resp.data if m.get("in_memory")]
        self.assertNotIn(str(self.config1.pk), in_memory_ids)
