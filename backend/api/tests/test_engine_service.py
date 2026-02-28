import numpy as np
from django.test import TestCase

from api.services.engine_service import EngineService
from config import Config


class TestEngineService(TestCase):
    """Tests unitaires pour EngineService."""

    def setUp(self):
        self.engine = EngineService()
        self.corpus = "Le chat mange le poisson. Le chien mange la viande."
        self.config = Config(
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
            max_epochs=2,
            seed=42,
        )

    def test_independent_instances(self):
        """Chaque instance est indépendante."""
        e1 = EngineService()
        e2 = EngineService()
        self.assertIsNot(e1, e2)

    def test_not_ready_initially(self):
        """Le service n'est pas prêt avant initialisation."""
        self.assertFalse(self.engine.is_ready)

    def test_initialize(self):
        """Après initialize(), le service est prêt."""
        self.engine.initialize(self.config, self.corpus)
        self.assertTrue(self.engine.is_ready)
        self.assertIsNotNone(self.engine.model)
        self.assertIsNotNone(self.engine.tokenizer)
        self.assertIsNotNone(self.engine.optimizer)
        self.assertIsNotNone(self.engine.data_loader)

    def test_initialize_sets_vocab_size(self):
        """Initialize() met à jour vocab_size dans la config."""
        self.engine.initialize(self.config, self.corpus)
        self.assertGreater(self.engine.config.vocab_size, 0)
        self.assertEqual(self.engine.config.vocab_size, self.engine.tokenizer.vocab_size)

    def test_generate_text(self):
        """La génération produit du texte."""
        self.engine.initialize(self.config, self.corpus)
        result = self.engine.generate_text("Le ", max_tokens=10, temperature=0.8)
        self.assertIsInstance(result, str)
        self.assertTrue(result.startswith("Le "))
        self.assertGreater(len(result), len("Le "))

    def test_generate_streaming(self):
        """Le streaming génère des tokens un par un."""
        self.engine.initialize(self.config, self.corpus)
        tokens = list(self.engine.generate_streaming("Le ", max_tokens=5, temperature=0.8))
        self.assertEqual(len(tokens), 5)
        for t in tokens:
            self.assertIsInstance(t, str)

    def test_get_attention_weights(self):
        """Retourne les poids d'attention par couche et tête."""
        self.engine.initialize(self.config, self.corpus)
        results = self.engine.get_attention_weights("Le chat")
        self.assertIsInstance(results, list)
        self.assertGreater(len(results), 0)
        for r in results:
            self.assertIn("layer", r)
            self.assertIn("head", r)
            self.assertIn("weights", r)
            self.assertIn("tokens", r)
            # weights doit être une matrice carrée
            w = r["weights"]
            self.assertEqual(len(w), len(w[0]))

    def test_compute_loss_on_text(self):
        """Le loss est un nombre positif."""
        self.engine.initialize(self.config, self.corpus)
        loss = self.engine.compute_loss_on_text("Le chat mange")
        self.assertIsInstance(loss, float)
        self.assertGreater(loss, 0)

    def test_compute_perplexity(self):
        """La perplexité est exp(loss)."""
        self.engine.initialize(self.config, self.corpus)
        loss = self.engine.compute_loss_on_text("Le chat mange")
        perplexity = self.engine.compute_perplexity("Le chat mange")
        self.assertAlmostEqual(perplexity, np.exp(loss), places=3)

    def test_get_embedding_vectors_2d(self):
        """Les embeddings 2D sont retournés pour chaque token du vocab."""
        self.engine.initialize(self.config, self.corpus)
        points = self.engine.get_embedding_vectors_2d()
        self.assertEqual(len(points), self.engine.tokenizer.vocab_size)
        for p in points:
            self.assertIn("token", p)
            self.assertIn("x", p)
            self.assertIn("y", p)
            self.assertIsInstance(p["x"], float)
            self.assertIsInstance(p["y"], float)

    def test_get_parameter_stats(self):
        """Stats des paramètres par module."""
        self.engine.initialize(self.config, self.corpus)
        stats = self.engine.get_parameter_stats()
        self.assertIsInstance(stats, list)
        self.assertGreater(len(stats), 0)
        for s in stats:
            self.assertIn("module_name", s)
            self.assertIn("param_count", s)
            self.assertIn("weight_norm", s)
            self.assertGreater(s["param_count"], 0)

    def test_get_weight_matrices(self):
        """Retourne les matrices de poids pour visualisation."""
        self.engine.initialize(self.config, self.corpus)
        matrices = self.engine.get_weight_matrices()
        self.assertIsInstance(matrices, list)
        self.assertGreater(len(matrices), 0)
        for m in matrices:
            self.assertIn("module", m)
            self.assertIn("param", m)
            self.assertIn("values", m)
            self.assertIn("rows", m)
            self.assertIn("cols", m)
            # Vérifier la taille
            self.assertEqual(len(m["values"]), m["rows"])
            self.assertEqual(len(m["values"][0]), m["cols"])
            self.assertLessEqual(m["rows"], 64)
            self.assertLessEqual(m["cols"], 64)

    def test_get_generation_weights(self):
        """Génère du texte avec les poids d'attention par step."""
        self.engine.initialize(self.config, self.corpus)
        result = self.engine.get_generation_weights("Le ", max_tokens=5, temperature=0.8)
        self.assertIn("prompt", result)
        self.assertIn("generated_tokens", result)
        self.assertIn("attention_snapshots", result)
        self.assertIn("full_text", result)
        self.assertEqual(len(result["generated_tokens"]), 5)
        self.assertEqual(len(result["attention_snapshots"]), 5)
        for tok in result["generated_tokens"]:
            self.assertIn("token", tok)
            self.assertIn("probability", tok)
            self.assertIn("top_probs", tok)
