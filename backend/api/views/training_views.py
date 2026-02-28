from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.models import ConfigTrainingData, ModelConfig, TrainingData, TrainingRun
from api.serializers import TrainingRunSerializer
from api.services.model_registry import ModelRegistry


def _build_corpus(config_obj, active_only=True):
    """Build the training corpus from data linked to a config.

    If active_only=True (default), only uses data where the link is_active=True.
    If active_only=False, uses all linked data regardless of is_active status.
    """
    filter_kwargs = {"config": config_obj}
    if active_only:
        filter_kwargs["is_active"] = True

    linked_ids = ConfigTrainingData.objects.filter(
        **filter_kwargs,
    ).values_list("training_data_id", flat=True)
    data_qs = TrainingData.objects.filter(pk__in=linked_ids)

    if data_qs.exists():
        return "\n".join(d.extracted_text for d in data_qs)

    return ""


@api_view(["POST"])
def model_initialize(request):
    """Initialize a model in memory (random weights) without starting training.

    This lets the user explore the model's initial state (weights, tokenizer,
    generation) before any training has occurred.
    """
    config_id = request.data.get("config_id")
    if not config_id:
        return Response({"error": "config_id requis"}, status=400)

    try:
        config_obj = ModelConfig.objects.get(pk=config_id)
    except ModelConfig.DoesNotExist:
        return Response({"error": "Config non trouvée"}, status=404)

    registry = ModelRegistry()
    engine = registry.get_engine(config_id)

    # If the model is already ready, check if the actual loaded state
    # matches the current config — if not, force re-initialization
    if engine.is_ready:
        new_config = config_obj.to_engine_config()

        # Check actual tokenizer class vs what config wants
        from modules.tokenizers.char_tokenizer import CharTokenizer

        actual_is_char = isinstance(engine.tokenizer, CharTokenizer)
        wants_char = new_config.tokenizer_type == "character"
        tokenizer_mismatch = actual_is_char != wants_char

        config_changed = (
            tokenizer_mismatch
            or engine.config.d_model != new_config.d_model
            or engine.config.n_heads != new_config.n_heads
            or engine.config.n_layers != new_config.n_layers
            or engine.config.d_ff != new_config.d_ff
            or engine.config.seq_len != new_config.seq_len
        )
        if not config_changed:
            return Response(
                {
                    "status": "already_ready",
                    "vocab_size": engine.tokenizer.vocab_size,
                    "total_parameters": engine.model.count_parameters(),
                }
            )
        # Config changed → fall through to re-initialize

    # For initialization, use ALL linked data (even inactive) to build the
    # vocabulary.  This lets users explore presets before activating data.
    corpus = _build_corpus(config_obj, active_only=False)
    if len(corpus) < 10:
        return Response(
            {"error": "Corpus trop petit (< 10 caractères). Ajoutez des données à cette instance."},
            status=400,
        )

    config = config_obj.to_engine_config()
    engine.initialize(config, corpus)

    # Update vocab_size in DB
    config_obj.vocab_size = engine.tokenizer.vocab_size
    config_obj.save()

    return Response(
        {
            "status": "initialized",
            "vocab_size": engine.tokenizer.vocab_size,
            "total_parameters": engine.model.count_parameters(),
        }
    )


@api_view(["POST"])
def training_start(request):
    config_id = request.data.get("config_id")
    num_epochs = request.data.get("num_epochs")

    if not config_id:
        return Response({"error": "config_id requis"}, status=400)

    try:
        config_obj = ModelConfig.objects.get(pk=config_id)
    except ModelConfig.DoesNotExist:
        return Response({"error": "Config non trouvée"}, status=404)

    registry = ModelRegistry()
    engine = registry.get_engine(config_id)
    training_svc = registry.get_training_service(config_id)

    if training_svc.is_running:
        return Response({"error": "Un entraînement est déjà en cours pour ce modèle"}, status=409)

    # Nettoyer les runs zombie (status=running/pending mais pas de thread actif)
    TrainingRun.objects.filter(status__in=["running", "pending"]).update(
        status="failed", error_message="Interrompu (redémarrage serveur)"
    )

    # Construire le corpus à partir des données actives liées à cette config
    corpus = _build_corpus(config_obj)
    if len(corpus) < 10:
        return Response(
            {
                "error": "Corpus trop petit (< 10 caractères). Ajoutez et activez des données pour cette instance."
            },
            status=400,
        )

    config = config_obj.to_engine_config()
    if num_epochs:
        config.max_epochs = int(num_epochs)

    # Mode continu : garder les poids existants si le modèle est déjà chargé
    continue_training = request.data.get("continue_training", False)

    # Si l'architecture/tokenizer a changé, on ne peut pas continuer
    # l'entraînement — forcer une ré-initialisation
    arch_changed = False
    if engine.is_ready and engine.config:
        # Check actual tokenizer class vs what config wants
        from modules.tokenizers.char_tokenizer import CharTokenizer

        actual_is_char = isinstance(engine.tokenizer, CharTokenizer)
        wants_char = config.tokenizer_type == "character"
        tokenizer_mismatch = actual_is_char != wants_char

        arch_changed = (
            tokenizer_mismatch
            or engine.config.d_model != config.d_model
            or engine.config.n_heads != config.n_heads
            or engine.config.n_layers != config.n_layers
            or engine.config.d_ff != config.d_ff
            or engine.config.seq_len != config.seq_len
        )

    if continue_training and engine.is_ready and not arch_changed:
        # Réutiliser le modèle existant, juste mettre à jour le data loader
        engine.update_corpus(corpus, config)
    else:
        # Initialiser un nouveau modèle from scratch
        engine.initialize(config, corpus)

    # Mettre à jour vocab_size dans la config DB
    config_obj.vocab_size = engine.tokenizer.vocab_size
    config_obj.save()

    # Créer le run
    run = TrainingRun.objects.create(
        config=config_obj,
        total_epochs=config.max_epochs,
        status="pending",
    )

    # Lancer l'entraînement
    training_svc.start(engine, str(run.pk), config.max_epochs)

    return Response(
        {
            "run_id": str(run.pk),
            "total_epochs": config.max_epochs,
            "vocab_size": engine.tokenizer.vocab_size,
            "total_parameters": engine.model.count_parameters(),
        }
    )


@api_view(["POST"])
def training_stop(request):
    config_id = request.data.get("config_id")
    registry = ModelRegistry()

    if config_id:
        svc = registry.get_training_service(config_id)
    else:
        svc = registry.get_active_training_service()

    if not svc or not svc.is_running:
        return Response({"error": "Aucun entraînement en cours"}, status=400)
    svc.stop()
    return Response({"status": "stopped"})


@api_view(["POST"])
def training_pause(request):
    config_id = request.data.get("config_id")
    registry = ModelRegistry()

    if config_id:
        svc = registry.get_training_service(config_id)
    else:
        svc = registry.get_active_training_service()

    if not svc or not svc.is_running:
        return Response({"error": "Aucun entraînement en cours"}, status=400)
    svc.pause()
    return Response({"status": "paused"})


@api_view(["POST"])
def training_resume(request):
    config_id = request.data.get("config_id")
    registry = ModelRegistry()

    if config_id:
        svc = registry.get_training_service(config_id)
    else:
        svc = registry.get_active_training_service()

    if not svc or not svc.is_running:
        return Response({"error": "Aucun entraînement en cours"}, status=400)
    svc.resume()
    return Response({"status": "running"})


@api_view(["GET"])
def training_status(request):
    config_id = request.query_params.get("config_id")
    registry = ModelRegistry()

    if config_id:
        engine = registry.get_engine(config_id)
        svc = registry.get_training_service(config_id)
    else:
        engine = registry.get_active_engine()
        svc = registry.get_active_training_service()

    status = "idle"
    if svc and svc.is_running:
        status = "paused" if svc.is_paused else "running"

    return Response(
        {
            "status": status,
            "is_ready": engine.is_ready if engine else False,
            "loss_history": svc.loss_history if svc else [],
            "model_loaded": engine is not None and engine.model is not None,
            "total_parameters": engine.model.count_parameters() if engine and engine.model else 0,
        }
    )


class TrainingHistoryView(generics.ListAPIView):
    serializer_class = TrainingRunSerializer

    def get_queryset(self):
        qs = TrainingRun.objects.all()
        config_id = self.request.query_params.get("config_id")
        if config_id:
            qs = qs.filter(config_id=config_id)
        return qs


class TrainingRunDetailView(generics.RetrieveAPIView):
    queryset = TrainingRun.objects.all()
    serializer_class = TrainingRunSerializer
