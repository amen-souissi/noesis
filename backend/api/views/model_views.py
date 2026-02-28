import os
import uuid

from django.conf import settings
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.models import ModelConfig, TrainedModel
from api.serializers import TrainedModelSerializer
from api.services.model_registry import ModelRegistry


class ModelListView(generics.ListAPIView):
    queryset = TrainedModel.objects.all()
    serializer_class = TrainedModelSerializer


class ModelDeleteView(generics.DestroyAPIView):
    queryset = TrainedModel.objects.all()
    serializer_class = TrainedModelSerializer

    def perform_destroy(self, instance):
        if os.path.exists(instance.weights_path):
            os.remove(instance.weights_path)
        instance.delete()


@api_view(["POST"])
def model_save(request):
    config_id = request.data.get("config_id")
    if not config_id:
        return Response({"error": "config_id requis"}, status=400)

    try:
        config_obj = ModelConfig.objects.get(pk=config_id)
    except ModelConfig.DoesNotExist:
        return Response({"error": "Config non trouvée"}, status=404)

    registry = ModelRegistry()
    if not registry.has_engine(config_id):
        return Response({"error": "Aucun modèle chargé pour cette config"}, status=400)
    engine = registry.get_engine(config_id)
    if not engine.is_ready:
        return Response({"error": "Aucun modèle chargé"}, status=400)

    name = request.data.get("name", f"model_{uuid.uuid4().hex[:8]}")
    description = request.data.get("description", "")

    # Sauvegarder les poids
    filename = f"{uuid.uuid4().hex}.npz"
    path = os.path.join(settings.MODEL_WEIGHTS_DIR, filename)
    vocab_json = engine.save_weights(path)

    svc = registry.get_training_service(config_id)

    model = TrainedModel.objects.create(
        name=name,
        description=description,
        config=config_obj,
        weights_path=path,
        total_parameters=engine.model.count_parameters(),
        final_loss=svc.loss_history[-1] if svc.loss_history else None,
        epochs_trained=len(svc.loss_history),
        vocab_json=vocab_json,
    )
    return Response(TrainedModelSerializer(model).data, status=201)


@api_view(["POST"])
def model_load(request, pk):
    try:
        saved = TrainedModel.objects.get(pk=pk)
    except TrainedModel.DoesNotExist:
        return Response({"error": "Modèle non trouvé"}, status=404)

    if not os.path.exists(saved.weights_path):
        return Response({"error": "Fichier de poids introuvable"}, status=404)

    config_id = str(saved.config.pk)
    registry = ModelRegistry()
    engine = registry.get_engine(config_id)
    config = saved.config.to_engine_config()
    engine.load_weights(saved.weights_path, saved.vocab_json, config)

    return Response(
        {
            "message": "Modèle chargé",
            "config_id": config_id,
            "total_parameters": engine.model.count_parameters(),
            "vocab_size": engine.tokenizer.vocab_size,
        }
    )


@api_view(["GET"])
def current_model_info(request):
    config_id = request.query_params.get("config_id")
    registry = ModelRegistry()

    if config_id:
        engine = registry.get_engine(config_id)
    else:
        engine = registry.get_active_engine()

    if not engine or not engine.is_ready:
        return Response({"loaded": False})

    return Response(
        {
            "loaded": True,
            "total_parameters": engine.model.count_parameters(),
            "vocab_size": engine.tokenizer.vocab_size,
            "d_model": engine.config.d_model,
            "n_heads": engine.config.n_heads,
            "n_layers": engine.config.n_layers,
            "d_ff": engine.config.d_ff,
            "seq_len": engine.config.seq_len,
        }
    )


@api_view(["GET"])
def active_models(request):
    """Liste les modèles actifs en mémoire + ceux sauvegardés sur disque."""
    registry = ModelRegistry()
    result = registry.list_active()
    for m in result:
        m["in_memory"] = True
    in_memory_ids = {m["config_id"] for m in result}

    # Ajouter les configs ayant un modèle sauvegardé mais pas encore chargé
    saved_qs = TrainedModel.objects.order_by("-created_at")
    seen = set()
    for s in saved_qs:
        cid = str(s.config_id)
        if cid in seen or cid in in_memory_ids:
            continue
        seen.add(cid)
        result.append(
            {
                "config_id": cid,
                "is_ready": True,
                "status": "ready",
                "is_active": False,
                "in_memory": False,
                "total_parameters": s.total_parameters,
                "last_loss": s.final_loss,
            }
        )

    return Response(result)


@api_view(["DELETE"])
def unload_model(request, config_id):
    """Décharge un modèle de la mémoire."""
    registry = ModelRegistry()
    if not registry.has_engine(config_id):
        return Response({"error": "Modèle non trouvé en mémoire"}, status=404)
    registry.remove(config_id)
    return Response({"status": "unloaded", "config_id": config_id})
