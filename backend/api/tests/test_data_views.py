import uuid

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from api.models import TrainingData


class TestDataAPI(TestCase):
    """Tests d'intégration pour les endpoints de données."""

    def setUp(self):
        self.client = APIClient()
        self.data = TrainingData.objects.create(
            name="test.txt",
            original_filename="test.txt",
            file_type="txt",
            file_size=100,
            extracted_text="Le chat mange le poisson.",
            char_count=25,
            is_active=True,
        )

    def test_list_data(self):
        resp = self.client.get("/api/data/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 1)

    def test_upload_txt_file(self):
        content = b"Bonjour le monde. Le chat dort."
        file = SimpleUploadedFile("test2.txt", content, content_type="text/plain")
        resp = self.client.post("/api/data/upload/", {"file": file}, format="multipart")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["file_type"], "txt")
        self.assertIn("Bonjour", resp.data["extracted_text"])
        self.assertEqual(resp.data["char_count"], len(content.decode("utf-8")))

    def test_upload_csv_file(self):
        content = b"col1,col2\nval1,val2"
        file = SimpleUploadedFile("data.csv", content, content_type="text/csv")
        resp = self.client.post("/api/data/upload/", {"file": file}, format="multipart")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["file_type"], "csv")

    def test_upload_no_file(self):
        resp = self.client.post("/api/data/upload/", {}, format="multipart")
        self.assertEqual(resp.status_code, 400)
        self.assertIn("error", resp.data)

    def test_upload_unsupported_format(self):
        file = SimpleUploadedFile("data.xyz", b"data", content_type="application/octet-stream")
        resp = self.client.post("/api/data/upload/", {"file": file}, format="multipart")
        self.assertEqual(resp.status_code, 400)

    def test_toggle_data(self):
        self.assertTrue(self.data.is_active)
        resp = self.client.patch(f"/api/data/{self.data.pk}/toggle/")
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data["is_active"])

        # Toggle back
        resp = self.client.patch(f"/api/data/{self.data.pk}/toggle/")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["is_active"])

    def test_toggle_not_found(self):
        resp = self.client.patch(f"/api/data/{uuid.uuid4()}/toggle/")
        self.assertEqual(resp.status_code, 404)

    def test_corpus_view(self):
        resp = self.client.get("/api/data/corpus/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("text", resp.data)
        self.assertIn("total_chars", resp.data)
        self.assertIn("unique_chars", resp.data)
        self.assertIn("file_count", resp.data)
        self.assertEqual(resp.data["file_count"], 1)

    def test_corpus_excludes_inactive(self):
        self.data.is_active = False
        self.data.save()
        resp = self.client.get("/api/data/corpus/")
        self.assertEqual(resp.data["file_count"], 0)
        self.assertEqual(resp.data["total_chars"], 0)

    def test_delete_data(self):
        resp = self.client.delete(f"/api/data/{self.data.pk}/")
        self.assertEqual(resp.status_code, 204)
        self.assertFalse(TrainingData.objects.filter(pk=self.data.pk).exists())

    def test_get_data_detail(self):
        resp = self.client.get(f"/api/data/{self.data.pk}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["name"], "test.txt")

    def test_sample_data_creates_entry(self):
        resp = self.client.post("/api/data/sample/")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.data["name"], "Données d'exemple")
        self.assertGreater(resp.data["char_count"], 0)
        self.assertTrue(TrainingData.objects.filter(name="Données d'exemple").exists())

    def test_sample_data_idempotent(self):
        resp1 = self.client.post("/api/data/sample/")
        self.assertEqual(resp1.status_code, 201)
        resp2 = self.client.post("/api/data/sample/")
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp1.data["id"], resp2.data["id"])
        self.assertEqual(TrainingData.objects.filter(name="Données d'exemple").count(), 1)
