from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.models import ModelConfig
from api.serializers import ModelConfigSerializer


class ConfigListCreateView(generics.ListCreateAPIView):
    queryset = ModelConfig.objects.all()
    serializer_class = ModelConfigSerializer


class ConfigDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ModelConfig.objects.all()
    serializer_class = ModelConfigSerializer


@api_view(["GET"])
def config_presets(request):
    presets = ModelConfig.objects.filter(is_preset=True)
    serializer = ModelConfigSerializer(presets, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def config_validate(request, pk):
    try:
        config = ModelConfig.objects.get(pk=pk)
    except ModelConfig.DoesNotExist:
        return Response({"error": "Config non trouvée"}, status=404)
    errors = config.validate_config()
    if errors:
        return Response({"valid": False, "errors": errors})
    return Response({"valid": True, "errors": []})


@api_view(["POST"])
def config_duplicate(request, pk):
    try:
        config = ModelConfig.objects.get(pk=pk)
    except ModelConfig.DoesNotExist:
        return Response({"error": "Config non trouvée"}, status=404)
    config.pk = None
    config.name = f"{config.name} (copie)"
    config.is_preset = False
    config.save()
    return Response(ModelConfigSerializer(config).data, status=201)
