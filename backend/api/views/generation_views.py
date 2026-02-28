import uuid

from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.models import ChatMessage, ModelConfig
from api.serializers import ChatMessageSerializer
from api.services.model_registry import ModelRegistry


def _get_user_or_none(request):
    """Return the authenticated user, or None for anonymous requests."""
    if request.user and request.user.is_authenticated:
        return request.user
    return None


def _check_model_available(engine, config_id=None):
    """Check if model is ready and not in the middle of a training step."""
    if not engine or not engine.is_ready:
        return Response({"error": "Aucun modèle chargé"}, status=400)

    registry = ModelRegistry()
    if config_id:
        svc = registry.get_training_service(config_id)
    else:
        svc = registry.get_active_training_service()

    if svc and svc.is_running and not svc.is_paused:
        return Response(
            {"error": "Entraînement en cours — pause l'entraînement d'abord"},
            status=409,
        )
    return None


@api_view(["POST"])
def generate_text(request):
    config_id = request.data.get("config_id")
    registry = ModelRegistry()

    if config_id:
        engine = registry.get_engine(config_id)
    else:
        engine = registry.get_active_engine()

    err = _check_model_available(engine, config_id)
    if err:
        return err

    prompt = request.data.get("prompt", "")
    max_tokens = int(request.data.get("max_tokens", 200))
    temperature = float(request.data.get("temperature", 0.8))
    sampling_strategy = request.data.get("sampling_strategy", "temperature")
    top_k = int(request.data.get("top_k", 10))
    top_p = float(request.data.get("top_p", 0.9))
    min_new_tokens = int(request.data.get("min_new_tokens", 0))

    if not prompt:
        return Response({"error": "prompt requis"}, status=400)

    text = engine.generate_text(
        prompt,
        max_tokens,
        temperature,
        sampling_strategy=sampling_strategy,
        top_k=top_k,
        top_p=top_p,
        min_new_tokens=min_new_tokens,
    )
    return Response(
        {
            "prompt": prompt,
            "generated_text": text,
            "generated_length": len(text) - len(prompt),
        }
    )


@api_view(["GET"])
def chat_sessions(request):
    config_id = request.query_params.get("config_id")
    user = _get_user_or_none(request)

    qs = ChatMessage.objects.all()
    if config_id:
        qs = qs.filter(config_id=config_id)
    if user:
        qs = qs.filter(user=user)

    # Use set() to deduplicate (SQLite UUIDField + distinct() can return duplicates)
    session_ids = list({str(sid) for sid in qs.values_list("session_id", flat=True)})
    result = []
    for sid in session_ids:
        msgs = qs.filter(session_id=sid)
        first_msg = msgs.first()
        result.append(
            {
                "session_id": sid,
                "config_id": str(first_msg.config_id)
                if first_msg and first_msg.config_id
                else None,
                "first_message": first_msg.content[:100] if first_msg else "",
                "message_count": msgs.count(),
                "created_at": first_msg.created_at.isoformat() if first_msg else None,
            }
        )
    return Response(result)


@api_view(["GET", "DELETE"])
def chat_session_detail(request, session_id):
    user = _get_user_or_none(request)
    qs = ChatMessage.objects.filter(session_id=session_id)
    if user:
        qs = qs.filter(user=user)

    if request.method == "DELETE":
        qs.delete()
        return Response({"status": "deleted"})

    return Response(ChatMessageSerializer(qs, many=True).data)


def _do_chat_message(request, session_id):
    """Shared logic for sending a chat message in an existing or new session."""
    config_id = request.data.get("config_id")
    registry = ModelRegistry()
    user = _get_user_or_none(request)

    if config_id:
        engine = registry.get_engine(config_id)
    else:
        engine = registry.get_active_engine()

    err = _check_model_available(engine, config_id)
    if err:
        return err

    # Resolve config object for FK
    config_obj = None
    if config_id:
        try:
            config_obj = ModelConfig.objects.get(pk=config_id)
        except ModelConfig.DoesNotExist:
            pass

    content = request.data.get("content", "")
    temperature = float(request.data.get("temperature", 0.8))
    max_tokens = int(request.data.get("max_tokens", 200))
    sampling_strategy = request.data.get("sampling_strategy", "temperature")
    top_k = int(request.data.get("top_k", 10))
    top_p = float(request.data.get("top_p", 0.9))
    min_new_tokens = int(request.data.get("min_new_tokens", 0))

    if not content:
        return Response({"error": "content requis"}, status=400)

    # Sauvegarder le message utilisateur
    ChatMessage.objects.create(
        session_id=session_id,
        config=config_obj,
        user=user,
        role="user",
        content=content,
    )

    # Générer la réponse
    generated = engine.generate_text(
        content,
        max_tokens,
        temperature,
        sampling_strategy=sampling_strategy,
        top_k=top_k,
        top_p=top_p,
        min_new_tokens=min_new_tokens,
    )

    # Sauvegarder la réponse
    assistant_msg = ChatMessage.objects.create(
        session_id=session_id,
        config=config_obj,
        user=user,
        role="assistant",
        content=generated,
        temperature_used=temperature,
        max_tokens_used=max_tokens,
    )

    return Response(ChatMessageSerializer(assistant_msg).data)


@api_view(["POST"])
def chat_message(request, session_id):
    return _do_chat_message(request, session_id)


@api_view(["POST"])
def chat_new_message(request):
    """Create a new chat session and send the first message."""
    session_id = uuid.uuid4()
    return _do_chat_message(request, session_id)
