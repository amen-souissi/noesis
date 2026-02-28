import uuid

from django.test import TestCase
from rest_framework.test import APIClient

from api.models import ChatMessage
from api.services.model_registry import ModelRegistry
from config import Config


class TestGenerationAPI(TestCase):
    """Tests d'intégration pour les endpoints de génération et chat."""

    def setUp(self):
        ModelRegistry._instance = None
        self.client = APIClient()
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
        registry = ModelRegistry()
        engine = registry.get_engine("test-config")
        engine.initialize(config, corpus)
        self.session_id = uuid.uuid4()

    def tearDown(self):
        registry = ModelRegistry()
        registry.clear()
        ModelRegistry._instance = None

    def test_generate_text(self):
        resp = self.client.post(
            "/api/generate/",
            {
                "prompt": "Le ",
                "max_tokens": 10,
                "temperature": 0.8,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("generated_text", resp.data)
        self.assertIn("generated_length", resp.data)
        self.assertEqual(resp.data["prompt"], "Le ")
        self.assertLessEqual(resp.data["generated_length"], 10)

    def test_generate_text_no_prompt(self):
        resp = self.client.post("/api/generate/", {}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_generate_no_model(self):
        registry = ModelRegistry()
        registry.clear()
        resp = self.client.post(
            "/api/generate/",
            {
                "prompt": "Le ",
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_chat_sessions_empty(self):
        resp = self.client.get("/api/chat/sessions/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 0)

    def test_chat_message(self):
        resp = self.client.post(
            f"/api/chat/{self.session_id}/messages/",
            {
                "content": "Le chat",
                "temperature": 0.8,
                "max_tokens": 10,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["role"], "assistant")
        self.assertIn("content", resp.data)

        # Vérifier que les messages sont sauvegardés
        messages = ChatMessage.objects.filter(session_id=self.session_id)
        self.assertEqual(messages.count(), 2)  # user + assistant

    def test_chat_message_no_content(self):
        resp = self.client.post(f"/api/chat/{self.session_id}/messages/", {}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_chat_sessions_list(self):
        # Clear existing messages first
        ChatMessage.objects.all().delete()
        sid = uuid.uuid4()
        ChatMessage.objects.create(session_id=sid, role="user", content="Hello")
        ChatMessage.objects.create(session_id=sid, role="assistant", content="World")
        resp = self.client.get("/api/chat/sessions/")
        self.assertEqual(resp.status_code, 200)
        sessions = [s for s in resp.data if s["session_id"] == str(sid)]
        self.assertEqual(len(sessions), 1)
        self.assertEqual(sessions[0]["message_count"], 2)

    def test_chat_session_detail(self):
        ChatMessage.objects.create(session_id=self.session_id, role="user", content="Bonjour")
        resp = self.client.get(f"/api/chat/{self.session_id}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["content"], "Bonjour")

    def test_chat_session_delete(self):
        ChatMessage.objects.create(session_id=self.session_id, role="user", content="A supprimer")
        resp = self.client.delete(f"/api/chat/{self.session_id}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(ChatMessage.objects.filter(session_id=self.session_id).count(), 0)
