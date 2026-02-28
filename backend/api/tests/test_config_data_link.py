"""Tests pour le lien données ↔ config (ConfigTrainingData through model).

Couvre : POST/DELETE/PATCH sur /configs/<pk>/data/<pk>/,
le corpus par config, et l'upload avec auto-link.
"""

import uuid

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from api.models import ConfigTrainingData, ModelConfig, TrainingData


class TestConfigDataLink(TestCase):
    """Tests d'intégration pour le lien config ↔ données."""

    def setUp(self):
        self.client = APIClient()
        self.config = ModelConfig.objects.create(
            name="Link Config",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
        )
        self.data = TrainingData.objects.create(
            name="link_data.txt",
            original_filename="link_data.txt",
            file_type="txt",
            file_size=100,
            extracted_text="Le chat mange le poisson.",
            char_count=25,
        )

    # ── POST : lier ──────────────────────────────────────

    def test_link_data_to_config(self):
        """POST crée un lien actif par défaut."""
        resp = self.client.post(
            f"/api/configs/{self.config.pk}/data/{self.data.pk}/",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["linked"])
        self.assertTrue(resp.data["is_active"])

        link = ConfigTrainingData.objects.get(
            config=self.config,
            training_data=self.data,
        )
        self.assertTrue(link.is_active)

    def test_link_idempotent(self):
        """POST deux fois ne crée qu'un seul lien."""
        self.client.post(f"/api/configs/{self.config.pk}/data/{self.data.pk}/")
        self.client.post(f"/api/configs/{self.config.pk}/data/{self.data.pk}/")
        self.assertEqual(
            ConfigTrainingData.objects.filter(
                config=self.config,
                training_data=self.data,
            ).count(),
            1,
        )

    def test_link_config_not_found(self):
        resp = self.client.post(
            f"/api/configs/{uuid.uuid4()}/data/{self.data.pk}/",
        )
        self.assertEqual(resp.status_code, 404)

    def test_link_data_not_found(self):
        resp = self.client.post(
            f"/api/configs/{self.config.pk}/data/{uuid.uuid4()}/",
        )
        self.assertEqual(resp.status_code, 404)

    # ── DELETE : retirer ─────────────────────────────────

    def test_unlink_data_from_config(self):
        """DELETE supprime le lien."""
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=True,
        )
        resp = self.client.delete(
            f"/api/configs/{self.config.pk}/data/{self.data.pk}/",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data["linked"])
        self.assertFalse(
            ConfigTrainingData.objects.filter(
                config=self.config,
                training_data=self.data,
            ).exists()
        )

    def test_unlink_nonexistent_link(self):
        """DELETE sur un lien inexistant ne crashe pas."""
        resp = self.client.delete(
            f"/api/configs/{self.config.pk}/data/{self.data.pk}/",
        )
        self.assertEqual(resp.status_code, 200)

    # ── PATCH : toggle is_active ─────────────────────────

    def test_toggle_active(self):
        """PATCH bascule is_active de True à False."""
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=True,
        )
        resp = self.client.patch(
            f"/api/configs/{self.config.pk}/data/{self.data.pk}/",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["linked"])
        self.assertFalse(resp.data["is_active"])

    def test_toggle_inactive_to_active(self):
        """PATCH bascule is_active de False à True."""
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=False,
        )
        resp = self.client.patch(
            f"/api/configs/{self.config.pk}/data/{self.data.pk}/",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["is_active"])

    def test_toggle_double(self):
        """PATCH deux fois revient à l'état initial."""
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=True,
        )
        self.client.patch(f"/api/configs/{self.config.pk}/data/{self.data.pk}/")
        resp = self.client.patch(
            f"/api/configs/{self.config.pk}/data/{self.data.pk}/",
        )
        self.assertTrue(resp.data["is_active"])

    def test_toggle_no_link(self):
        """PATCH sans lien existant → 404."""
        resp = self.client.patch(
            f"/api/configs/{self.config.pk}/data/{self.data.pk}/",
        )
        self.assertEqual(resp.status_code, 404)

    # ── Corpus par config ────────────────────────────────

    def test_corpus_only_active_data(self):
        """Le corpus ne contient que les données actives pour la config."""
        data2 = TrainingData.objects.create(
            name="data2.txt",
            original_filename="data2.txt",
            file_type="txt",
            file_size=20,
            extracted_text="Le chien dort.",
            char_count=14,
        )
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=True,
        )
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=data2,
            is_active=False,
        )

        resp = self.client.get(
            f"/api/data/corpus/?config_id={self.config.pk}",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["file_count"], 1)
        self.assertIn("Le chat", resp.data["text"])
        self.assertNotIn("Le chien dort", resp.data["text"])

    def test_corpus_empty_when_all_inactive(self):
        """Corpus vide si toutes les données sont inactives."""
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=False,
        )
        resp = self.client.get(
            f"/api/data/corpus/?config_id={self.config.pk}",
        )
        self.assertEqual(resp.data["file_count"], 0)
        self.assertEqual(resp.data["total_chars"], 0)

    def test_corpus_per_config_isolation(self):
        """Chaque config a son propre corpus."""
        config2 = ModelConfig.objects.create(
            name="Config 2",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
        )
        data2 = TrainingData.objects.create(
            name="other.txt",
            original_filename="other.txt",
            file_type="txt",
            file_size=20,
            extracted_text="Autre texte.",
            char_count=12,
        )
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=True,
        )
        ConfigTrainingData.objects.create(
            config=config2,
            training_data=data2,
            is_active=True,
        )

        resp1 = self.client.get(f"/api/data/corpus/?config_id={self.config.pk}")
        resp2 = self.client.get(f"/api/data/corpus/?config_id={config2.pk}")
        self.assertIn("Le chat", resp1.data["text"])
        self.assertNotIn("Autre texte", resp1.data["text"])
        self.assertIn("Autre texte", resp2.data["text"])
        self.assertNotIn("Le chat", resp2.data["text"])

    # ── Upload avec auto-link ────────────────────────────

    def test_upload_auto_links_to_config(self):
        """L'upload avec config_id crée automatiquement un lien actif."""
        content = b"Nouveau texte pour la config."
        file = SimpleUploadedFile("new.txt", content, content_type="text/plain")
        resp = self.client.post(
            "/api/data/upload/",
            {
                "file": file,
                "config_id": str(self.config.pk),
            },
            format="multipart",
        )
        self.assertEqual(resp.status_code, 201)

        new_data_id = resp.data["id"]
        link = ConfigTrainingData.objects.get(
            config=self.config,
            training_data_id=new_data_id,
        )
        self.assertTrue(link.is_active)

    # ── Serializer training_data_links ───────────────────

    def test_config_serializer_includes_links(self):
        """Le serializer de config inclut training_data_links."""
        ConfigTrainingData.objects.create(
            config=self.config,
            training_data=self.data,
            is_active=False,
        )
        resp = self.client.get(f"/api/configs/{self.config.pk}/")
        self.assertEqual(resp.status_code, 200)
        links = resp.data["training_data_links"]
        self.assertEqual(len(links), 1)
        self.assertEqual(links[0]["id"], str(self.data.pk))
        self.assertFalse(links[0]["is_active"])

    def test_config_serializer_links_empty(self):
        """Config sans données liées → training_data_links vide."""
        resp = self.client.get(f"/api/configs/{self.config.pk}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["training_data_links"], [])
