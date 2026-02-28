from django.test import TestCase
from rest_framework.test import APIClient


class TestDocsAPI(TestCase):
    """Tests d'intégration pour les endpoints de documentation."""

    def setUp(self):
        self.client = APIClient()

    def test_module_list(self):
        resp = self.client.get("/api/docs/modules/")
        self.assertEqual(resp.status_code, 200)
        self.assertIsInstance(resp.data, list)
        self.assertGreater(len(resp.data), 0)
        for m in resp.data:
            self.assertIn("slug", m)
            self.assertIn("name", m)
            self.assertIn("category", m)

    def test_module_detail_tokenizer(self):
        resp = self.client.get("/api/docs/modules/tokenizer/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["slug"], "tokenizer")
        self.assertIn("math_formulas", resp.data)
        self.assertIn("key_shapes", resp.data)
        self.assertIn("data_flow", resp.data)
        self.assertIn("educational_notes", resp.data)

    def test_module_detail_attention(self):
        resp = self.client.get("/api/docs/modules/attention/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["slug"], "attention")
        self.assertGreater(len(resp.data["math_formulas"]), 0)

    def test_module_detail_not_found(self):
        resp = self.client.get("/api/docs/modules/nonexistent/")
        self.assertEqual(resp.status_code, 404)

    def test_data_flow(self):
        resp = self.client.get("/api/docs/flow/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("nodes", resp.data)
        self.assertIn("edges", resp.data)
        self.assertGreater(len(resp.data["nodes"]), 0)
        self.assertGreater(len(resp.data["edges"]), 0)

    def test_all_modules_accessible(self):
        """Chaque module listé est accessible en détail."""
        resp = self.client.get("/api/docs/modules/")
        for m in resp.data:
            detail_resp = self.client.get(f"/api/docs/modules/{m['slug']}/")
            self.assertEqual(detail_resp.status_code, 200, f"Module {m['slug']} inaccessible")
            self.assertEqual(detail_resp.data["slug"], m["slug"])

    def test_modules_have_required_fields(self):
        """Chaque module a tous les champs requis."""
        resp = self.client.get("/api/docs/modules/")
        for m in resp.data:
            detail = self.client.get(f"/api/docs/modules/{m['slug']}/").data
            required = [
                "slug",
                "name",
                "purpose",
                "math_formulas",
                "key_shapes",
                "data_flow",
                "educational_notes",
            ]
            for field in required:
                self.assertIn(field, detail, f"Module {m['slug']} manque le champ {field}")

    def test_data_flow_edges_reference_valid_nodes(self):
        """Les edges du data flow référencent des nœuds existants."""
        resp = self.client.get("/api/docs/flow/")
        node_ids = {n["id"] for n in resp.data["nodes"]}
        for edge in resp.data["edges"]:
            self.assertIn(
                edge["from"], node_ids, f"Edge from '{edge['from']}' non trouvé dans les nœuds"
            )
            self.assertIn(edge["to"], node_ids, f"Edge to '{edge['to']}' non trouvé dans les nœuds")
