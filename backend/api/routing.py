from django.urls import re_path

from api.consumers.generation_consumer import GenerationConsumer
from api.consumers.training_consumer import TrainingConsumer

websocket_urlpatterns = [
    re_path(r"ws/training/$", TrainingConsumer.as_asgi()),
    re_path(r"ws/generation/$", GenerationConsumer.as_asgi()),
]
