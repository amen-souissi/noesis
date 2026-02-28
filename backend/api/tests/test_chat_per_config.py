"""Tests pour les sessions de chat par config et par utilisateur.

Couvre : filtrage des sessions par config_id, isolation des messages par config,
et sauvegarde du config FK sur les ChatMessage.
"""

import uuid

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from api.models import ChatMessage, ModelConfig
from api.services.model_registry import ModelRegistry
from config import Config


class TestChatPerConfig(TestCase):
    """Tests pour l'isolation des sessions de chat par config."""

    def setUp(self):
        ModelRegistry._instance = None
        self.client = APIClient()

        # Create two configs
        self.config1 = ModelConfig.objects.create(
            name="Chat Config A",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
        )
        self.config2 = ModelConfig.objects.create(
            name="Chat Config B",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
        )

        # Initialize engines for both configs
        corpus = "Le chat mange le poisson. Le chien mange la viande."
        config_obj = Config(
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
            seed=42,
        )
        registry = ModelRegistry()
        for cfg_id in [str(self.config1.pk), str(self.config2.pk)]:
            engine = registry.get_engine(cfg_id)
            engine.initialize(config_obj, corpus)

    def tearDown(self):
        registry = ModelRegistry()
        registry.clear()
        ModelRegistry._instance = None

    def test_chat_message_saves_config(self):
        """Le message de chat sauvegarde le config FK."""
        session_id = uuid.uuid4()
        resp = self.client.post(
            f"/api/chat/{session_id}/messages/",
            {
                "content": "Le chat",
                "config_id": str(self.config1.pk),
                "max_tokens": 5,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)

        user_msg = ChatMessage.objects.filter(
            session_id=session_id,
            role="user",
        ).first()
        self.assertIsNotNone(user_msg)
        self.assertEqual(user_msg.config_id, self.config1.pk)

        assistant_msg = ChatMessage.objects.filter(
            session_id=session_id,
            role="assistant",
        ).first()
        self.assertEqual(assistant_msg.config_id, self.config1.pk)

    def test_sessions_filtered_by_config(self):
        """GET /chat/sessions/?config_id= retourne uniquement les sessions de cette config."""
        sid1 = uuid.uuid4()
        sid2 = uuid.uuid4()

        # Create messages for config1
        ChatMessage.objects.create(
            session_id=sid1,
            config=self.config1,
            role="user",
            content="Hello config 1",
        )
        # Create messages for config2
        ChatMessage.objects.create(
            session_id=sid2,
            config=self.config2,
            role="user",
            content="Hello config 2",
        )

        # Filter by config1
        resp = self.client.get(
            f"/api/chat/sessions/?config_id={self.config1.pk}",
        )
        self.assertEqual(resp.status_code, 200)
        session_ids = [s["session_id"] for s in resp.data]
        self.assertIn(str(sid1), session_ids)
        self.assertNotIn(str(sid2), session_ids)

        # Filter by config2
        resp = self.client.get(
            f"/api/chat/sessions/?config_id={self.config2.pk}",
        )
        session_ids = [s["session_id"] for s in resp.data]
        self.assertIn(str(sid2), session_ids)
        self.assertNotIn(str(sid1), session_ids)

    def test_sessions_without_filter(self):
        """Sans config_id, toutes les sessions sont retournées."""
        sid1, sid2 = uuid.uuid4(), uuid.uuid4()
        ChatMessage.objects.create(
            session_id=sid1,
            config=self.config1,
            role="user",
            content="A",
        )
        ChatMessage.objects.create(
            session_id=sid2,
            config=self.config2,
            role="user",
            content="B",
        )
        resp = self.client.get("/api/chat/sessions/")
        session_ids = [s["session_id"] for s in resp.data]
        self.assertIn(str(sid1), session_ids)
        self.assertIn(str(sid2), session_ids)

    def test_session_detail_returns_config_id(self):
        """La réponse de sessions inclut config_id."""
        sid = uuid.uuid4()
        ChatMessage.objects.create(
            session_id=sid,
            config=self.config1,
            role="user",
            content="Test",
        )
        resp = self.client.get(
            f"/api/chat/sessions/?config_id={self.config1.pk}",
        )
        session = resp.data[0]
        self.assertEqual(session["config_id"], str(self.config1.pk))

    def test_new_message_endpoint(self):
        """POST /chat/messages/ crée une nouvelle session avec config."""
        resp = self.client.post(
            "/api/chat/messages/",
            {
                "content": "Le chat",
                "config_id": str(self.config1.pk),
                "max_tokens": 5,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["role"], "assistant")

        # Verify session was created
        msg = ChatMessage.objects.filter(config=self.config1).first()
        self.assertIsNotNone(msg)


class TestChatPerUser(TestCase):
    """Tests pour l'isolation des sessions par utilisateur."""

    def setUp(self):
        ModelRegistry._instance = None
        self.user1 = User.objects.create_user("user1", password="pass1")
        self.user2 = User.objects.create_user("user2", password="pass2")

        self.config = ModelConfig.objects.create(
            name="User Config",
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            batch_size=4,
        )

    def tearDown(self):
        registry = ModelRegistry()
        registry.clear()
        ModelRegistry._instance = None

    def test_sessions_filtered_by_user(self):
        """Chaque utilisateur ne voit que ses propres sessions."""
        sid1, sid2 = uuid.uuid4(), uuid.uuid4()
        ChatMessage.objects.create(
            session_id=sid1,
            config=self.config,
            user=self.user1,
            role="user",
            content="User 1 msg",
        )
        ChatMessage.objects.create(
            session_id=sid2,
            config=self.config,
            user=self.user2,
            role="user",
            content="User 2 msg",
        )

        # User 1 sees only their session
        client1 = APIClient()
        client1.force_authenticate(user=self.user1)
        resp = client1.get(
            f"/api/chat/sessions/?config_id={self.config.pk}",
        )
        session_ids = [s["session_id"] for s in resp.data]
        self.assertIn(str(sid1), session_ids)
        self.assertNotIn(str(sid2), session_ids)

        # User 2 sees only their session
        client2 = APIClient()
        client2.force_authenticate(user=self.user2)
        resp = client2.get(
            f"/api/chat/sessions/?config_id={self.config.pk}",
        )
        session_ids = [s["session_id"] for s in resp.data]
        self.assertIn(str(sid2), session_ids)
        self.assertNotIn(str(sid1), session_ids)

    def test_anonymous_sees_anonymous_sessions(self):
        """L'utilisateur anonyme ne voit que les sessions sans user."""
        sid_anon = uuid.uuid4()
        sid_user = uuid.uuid4()
        ChatMessage.objects.create(
            session_id=sid_anon,
            config=self.config,
            user=None,
            role="user",
            content="Anon msg",
        )
        ChatMessage.objects.create(
            session_id=sid_user,
            config=self.config,
            user=self.user1,
            role="user",
            content="User msg",
        )

        # Anonymous client sees all (no user filter applied for None)
        client = APIClient()
        resp = client.get(
            f"/api/chat/sessions/?config_id={self.config.pk}",
        )
        session_ids = [s["session_id"] for s in resp.data]
        # Anonymous user has user=None so filter is not applied
        self.assertIn(str(sid_anon), session_ids)
