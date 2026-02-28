from rest_framework import generics, status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from api.models import ConfigTrainingData, ModelConfig, TrainingData
from api.serializers import TrainingDataSerializer
from api.services.file_processor import extract_text, get_file_type


class DataListView(generics.ListAPIView):
    queryset = TrainingData.objects.all()
    serializer_class = TrainingDataSerializer


class DataDetailView(generics.RetrieveDestroyAPIView):
    queryset = TrainingData.objects.all()
    serializer_class = TrainingDataSerializer


@api_view(["POST"])
@parser_classes([MultiPartParser])
def data_upload(request):
    file = request.FILES.get("file")
    if not file:
        return Response({"error": "Aucun fichier fourni"}, status=400)

    try:
        file_type = get_file_type(file.name)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    try:
        text = extract_text(file, file_type)
        file.seek(0)  # Reset pour la sauvegarde
    except Exception as e:
        return Response({"error": f"Erreur d'extraction : {e}"}, status=400)

    data = TrainingData.objects.create(
        name=request.data.get("name", file.name),
        original_filename=file.name,
        file=file,
        file_type=file_type,
        file_size=file.size,
        extracted_text=text,
        char_count=len(text),
    )

    # Auto-link to config if config_id is provided
    config_id = request.data.get("config_id")
    if config_id:
        try:
            config = ModelConfig.objects.get(pk=config_id)
            ConfigTrainingData.objects.get_or_create(
                config=config,
                training_data=data,
                defaults={"is_active": True},
            )
        except ModelConfig.DoesNotExist:
            pass

    return Response(TrainingDataSerializer(data).data, status=201)


@api_view(["PATCH"])
def data_toggle(request, pk):
    try:
        data = TrainingData.objects.get(pk=pk)
    except TrainingData.DoesNotExist:
        return Response({"error": "Fichier non trouvé"}, status=404)
    data.is_active = not data.is_active
    data.save()
    return Response(TrainingDataSerializer(data).data)


@api_view(["POST", "DELETE", "PATCH"])
def config_data_link(request, config_pk, data_pk):
    """Ajoute, retire ou toggle l'activation d'un fichier de données d'une config.

    POST   → Lier le fichier à la config (is_active=True par défaut)
    DELETE → Retirer le fichier de la config
    PATCH  → Toggle is_active (activer/désactiver pour l'entraînement)
    """
    try:
        config = ModelConfig.objects.get(pk=config_pk)
    except ModelConfig.DoesNotExist:
        return Response({"error": "Config non trouvée"}, status=404)
    try:
        data = TrainingData.objects.get(pk=data_pk)
    except TrainingData.DoesNotExist:
        return Response({"error": "Données non trouvées"}, status=404)

    if request.method == "POST":
        link, _ = ConfigTrainingData.objects.get_or_create(
            config=config,
            training_data=data,
            defaults={"is_active": True},
        )
        return Response({"linked": True, "is_active": link.is_active})

    if request.method == "DELETE":
        ConfigTrainingData.objects.filter(config=config, training_data=data).delete()
        return Response({"linked": False})

    # PATCH → toggle is_active
    try:
        link = ConfigTrainingData.objects.get(config=config, training_data=data)
    except ConfigTrainingData.DoesNotExist:
        return Response({"error": "Lien non trouvé"}, status=404)
    link.is_active = not link.is_active
    link.save()
    return Response({"linked": True, "is_active": link.is_active})


SAMPLE_TEXT = (
    "Le chat mange le poisson. Le chien mange la viande. "
    "Le chat dort sur le tapis. Le chien dort dans le jardin. "
    "Le chat aime le lait. Le chien aime les os. "
    "Le chat est petit. Le chien est grand. "
    "Le chat joue avec la balle. Le chien joue dans le parc. "
    "Le chat ronronne doucement. Le chien remue la queue. "
    "Le chat grimpe sur l'arbre. Le chien court dans le champ. "
    "Le chat observe les oiseaux. Le chien protège la maison. "
    "Le chat est curieux. Le chien est fidèle. "
    "Le chat se cache sous le lit. Le chien attend devant la porte."
)


@api_view(["POST"])
def data_sample(request):
    """Crée un fichier d'entraînement avec un texte d'exemple intégré."""
    existing = TrainingData.objects.filter(name="Données d'exemple")
    if existing.exists():
        return Response(
            TrainingDataSerializer(existing.first()).data,
            status=status.HTTP_200_OK,
        )

    data = TrainingData.objects.create(
        name="Données d'exemple",
        original_filename="sample.txt",
        file_type="txt",
        file_size=len(SAMPLE_TEXT.encode("utf-8")),
        extracted_text=SAMPLE_TEXT,
        char_count=len(SAMPLE_TEXT),
    )
    return Response(TrainingDataSerializer(data).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def corpus_view(request):
    """Retourne le corpus fusionné.

    Si config_id est fourni, retourne les données liées à cette config.
    Sinon, retourne les données globalement actives (fallback).
    """
    config_id = request.query_params.get("config_id")
    if config_id:
        try:
            config = ModelConfig.objects.get(pk=config_id)
            # Only include data that is active for this config
            active_links = ConfigTrainingData.objects.filter(
                config=config,
                is_active=True,
            ).values_list("training_data_id", flat=True)
            data_qs = TrainingData.objects.filter(pk__in=active_links)
        except ModelConfig.DoesNotExist:
            data_qs = TrainingData.objects.none()
    else:
        data_qs = TrainingData.objects.filter(is_active=True)

    texts = [d.extracted_text for d in data_qs]
    corpus = "\n".join(texts)
    return Response(
        {
            "text": corpus[:10000],
            "total_chars": len(corpus),
            "unique_chars": len(set(corpus)) if corpus else 0,
            "file_count": data_qs.count(),
            "full_text": corpus,
        }
    )
