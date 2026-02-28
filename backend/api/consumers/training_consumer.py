import json

from channels.generic.websocket import AsyncWebsocketConsumer


class TrainingConsumer(AsyncWebsocketConsumer):
    """WebSocket pour recevoir les updates d'entraînement en temps réel."""

    async def connect(self):
        await self.channel_layer.group_add("training", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("training", self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        # Le client peut envoyer des commandes (start/stop/pause)
        # mais on les gère via REST API pour simplifier
        pass

    async def training_message(self, event):
        """Reçoit un message du channel layer et l'envoie au client."""
        await self.send(text_data=json.dumps(event["message"]))
