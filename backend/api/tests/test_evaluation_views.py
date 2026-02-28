from django.test import TestCase
from rest_framework.test import APIClient

from api.services.model_registry import ModelRegistry
from config import Config


class TestEvaluationAPI(TestCase):
    """Tests d'intégration pour les endpoints d'évaluation."""

    def setUp(self):
        ModelRegistry._instance = None
        self.client = APIClient()
        self.corpus = "Le chat mange le poisson. Le chien mange la viande."
        config = Config(
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
            seed=42,
        )
        # Initialiser un engine via le registry
        registry = ModelRegistry()
        engine = registry.get_engine("test-config")
        engine.initialize(config, self.corpus)

    def tearDown(self):
        registry = ModelRegistry()
        registry.clear()
        ModelRegistry._instance = None

    def test_attention(self):
        resp = self.client.post(
            "/api/eval/attention/",
            {
                "text": "Le chat",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("attention", resp.data)
        self.assertGreater(len(resp.data["attention"]), 0)
        for item in resp.data["attention"]:
            self.assertIn("layer", item)
            self.assertIn("head", item)
            self.assertIn("weights", item)
            self.assertIn("tokens", item)

    def test_attention_no_text(self):
        resp = self.client.post("/api/eval/attention/", {}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_attention_unknown_char(self):
        resp = self.client.post(
            "/api/eval/attention/",
            {
                "text": "xyz@#$",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_perplexity(self):
        resp = self.client.post(
            "/api/eval/perplexity/",
            {
                "text": "Le chat mange",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("loss", resp.data)
        self.assertIn("perplexity", resp.data)
        self.assertGreater(resp.data["loss"], 0)
        self.assertGreater(resp.data["perplexity"], 0)

    def test_perplexity_no_text(self):
        resp = self.client.post("/api/eval/perplexity/", {}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_embeddings(self):
        resp = self.client.get("/api/eval/embeddings/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("embeddings", resp.data)
        points = resp.data["embeddings"]
        self.assertGreater(len(points), 0)
        for p in points:
            self.assertIn("token", p)
            self.assertIn("x", p)
            self.assertIn("y", p)

    def test_parameters(self):
        resp = self.client.get("/api/eval/parameters/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("parameters", resp.data)
        self.assertIn("total", resp.data)
        self.assertGreater(resp.data["total"], 0)
        for s in resp.data["parameters"]:
            self.assertIn("module_name", s)
            self.assertIn("param_count", s)

    def test_weight_matrices(self):
        resp = self.client.get("/api/eval/weights/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("matrices", resp.data)
        matrices = resp.data["matrices"]
        self.assertGreater(len(matrices), 0)
        for m in matrices:
            self.assertIn("module", m)
            self.assertIn("param", m)
            self.assertIn("values", m)
            self.assertIn("rows", m)
            self.assertIn("cols", m)
            self.assertLessEqual(m["rows"], 64)
            self.assertLessEqual(m["cols"], 64)

    def test_generation_weights(self):
        resp = self.client.post(
            "/api/eval/generation-weights/",
            {
                "prompt": "Le ",
                "max_tokens": 5,
                "temperature": 0.8,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("prompt", resp.data)
        self.assertIn("generated_tokens", resp.data)
        self.assertIn("attention_snapshots", resp.data)
        self.assertIn("full_text", resp.data)
        self.assertEqual(len(resp.data["generated_tokens"]), 5)

    def test_generation_weights_no_prompt(self):
        resp = self.client.post("/api/eval/generation-weights/", {}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_eval_no_model(self):
        """Tous les endpoints retournent 400 sans modèle chargé."""
        registry = ModelRegistry()
        registry.clear()

        resp = self.client.get("/api/eval/embeddings/")
        self.assertEqual(resp.status_code, 400)

        resp = self.client.get("/api/eval/parameters/")
        self.assertEqual(resp.status_code, 400)

        resp = self.client.get("/api/eval/weights/")
        self.assertEqual(resp.status_code, 400)

        resp = self.client.post("/api/eval/attention/", {"text": "Le"}, format="json")
        self.assertEqual(resp.status_code, 400)
