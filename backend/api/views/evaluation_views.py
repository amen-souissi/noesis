from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.services.model_registry import ModelRegistry


def _get_engine(request):
    """Récupère l'engine depuis config_id ou le modèle actif."""
    config_id = (
        request.data.get("config_id")
        if request.method == "POST"
        else request.query_params.get("config_id")
    )
    registry = ModelRegistry()
    if config_id:
        return registry.get_engine(config_id), config_id
    return registry.get_active_engine(), registry.active_config_id


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


def _validate_tokens(engine, text):
    """Valide que chaque token du texte est dans le vocabulaire."""
    try:
        engine.tokenizer.encode(text)
    except (KeyError, Exception) as e:
        return Response(
            {"error": f"Texte contient des caractères hors vocabulaire: {e}"}, status=400
        )
    return None


@api_view(["POST"])
def eval_attention(request):
    engine, config_id = _get_engine(request)
    err = _check_model_available(engine, config_id)
    if err:
        return err

    text = request.data.get("text", "")
    if not text:
        return Response({"error": "text requis"}, status=400)

    err = _validate_tokens(engine, text)
    if err:
        return err

    results = engine.get_attention_weights(text)
    return Response({"attention": results})


@api_view(["POST"])
def eval_perplexity(request):
    engine, config_id = _get_engine(request)
    err = _check_model_available(engine, config_id)
    if err:
        return err

    text = request.data.get("text", "")
    if not text:
        return Response({"error": "text requis"}, status=400)

    err = _validate_tokens(engine, text)
    if err:
        return err

    loss = engine.compute_loss_on_text(text)
    perplexity = engine.compute_perplexity(text)
    return Response(
        {
            "text": text,
            "loss": loss,
            "perplexity": perplexity,
        }
    )


@api_view(["GET"])
def eval_embeddings(request):
    engine, config_id = _get_engine(request)
    if not engine or not engine.is_ready:
        return Response({"error": "Aucun modèle chargé"}, status=400)

    # Safe during training — reads weight copies
    points = engine.get_embedding_vectors_2d()
    return Response({"embeddings": points})


@api_view(["GET"])
def eval_parameters(request):
    engine, config_id = _get_engine(request)
    if not engine or not engine.is_ready:
        return Response({"error": "Aucun modèle chargé"}, status=400)

    # Safe during training — reads weight copies
    stats = engine.get_parameter_stats()
    return Response(
        {
            "parameters": stats,
            "total": engine.model.count_parameters(),
        }
    )


@api_view(["GET"])
def eval_weight_matrices(request):
    """Retourne les matrices de poids pour visualisation dot-matrix temps réel."""
    engine, config_id = _get_engine(request)
    if not engine or not engine.is_ready:
        return Response({"error": "Aucun modèle chargé"}, status=400)

    # Safe during training — reads weight copies
    matrices = engine.get_weight_matrices()
    return Response({"matrices": matrices})


@api_view(["POST"])
def eval_generation_weights(request):
    """Génère du texte et retourne les poids d'attention pour chaque token."""
    engine, config_id = _get_engine(request)
    err = _check_model_available(engine, config_id)
    if err:
        return err

    prompt = request.data.get("prompt", "")
    if not prompt:
        return Response({"error": "prompt requis"}, status=400)

    err = _validate_tokens(engine, prompt)
    if err:
        return err

    max_tokens = int(request.data.get("max_tokens", 50))
    temperature = float(request.data.get("temperature", 0.8))

    results = engine.get_generation_weights(prompt, max_tokens, temperature)
    return Response(results)


@api_view(["POST"])
def eval_tokenize(request):
    """Tokenise un texte et retourne tokens, IDs et vocabulaire."""
    engine, config_id = _get_engine(request)
    if not engine or not engine.tokenizer:
        return Response({"error": "Aucun modèle chargé"}, status=400)

    text = request.data.get("text", "")
    if not text:
        return Response({"error": "text requis"}, status=400)

    tokenizer = engine.tokenizer
    ids = tokenizer.encode(text)
    chars = [tokenizer.decode([tid]) for tid in ids]

    if hasattr(tokenizer, "char_to_idx"):
        vocab = dict(tokenizer.char_to_idx)
    elif hasattr(tokenizer, "subword_to_idx"):
        vocab = dict(tokenizer.subword_to_idx)
    else:
        vocab = {}

    return Response(
        {
            "chars": chars,
            "ids": ids,
            "vocab": vocab,
            "vocab_size": tokenizer.vocab_size,
            "tokenizer_type": tokenizer.name,
        }
    )
