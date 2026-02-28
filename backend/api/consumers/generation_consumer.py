import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from api.services.engine_service import EngineService


class GenerationConsumer(AsyncWebsocketConsumer):
    """WebSocket pour le streaming de génération token par token."""

    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        prompt = data.get("prompt", "")
        max_tokens = int(data.get("max_tokens", 200))
        temperature = float(data.get("temperature", 0.8))

        if not prompt:
            await self.send(text_data=json.dumps({"error": "prompt requis"}))
            return

        engine = EngineService()
        if not engine.is_ready:
            await self.send(text_data=json.dumps({"error": "Aucun modèle chargé"}))
            return

        # Stream tokens
        generated = ""
        try:
            for token in await database_sync_to_async(
                lambda: list(engine.generate_streaming(prompt, max_tokens, temperature))
            )():
                generated += token
                await self.send(
                    text_data=json.dumps(
                        {
                            "type": "token",
                            "token": token,
                            "generated_so_far": generated,
                        }
                    )
                )

            await self.send(
                text_data=json.dumps(
                    {
                        "type": "complete",
                        "prompt": prompt,
                        "generated_text": prompt + generated,
                        "generated_length": len(generated),
                    }
                )
            )
        except Exception as e:
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "error",
                        "message": str(e),
                    }
                )
            )
