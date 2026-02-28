from rest_framework import serializers

from api.models import (
    ChatMessage,
    ConfigTrainingData,
    ModelConfig,
    TrainedModel,
    TrainingData,
    TrainingRun,
)


class ConfigTrainingDataField(serializers.Field):
    """Sérialise les données liées avec leur état d'activation."""

    def get_attribute(self, instance):
        return instance

    def to_representation(self, config):
        links = ConfigTrainingData.objects.filter(config=config).select_related("training_data")
        return [
            {
                "id": str(link.training_data_id),
                "is_active": link.is_active,
            }
            for link in links
        ]


class ModelConfigSerializer(serializers.ModelSerializer):
    training_data_ids = serializers.PrimaryKeyRelatedField(
        source="training_data",
        many=True,
        read_only=True,
    )
    training_data_links = ConfigTrainingDataField(read_only=True)

    class Meta:
        model = ModelConfig
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class TrainingDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingData
        fields = "__all__"
        read_only_fields = ["id", "extracted_text", "char_count", "created_at"]


class TrainedModelSerializer(serializers.ModelSerializer):
    config_name = serializers.CharField(source="config.name", read_only=True)

    class Meta:
        model = TrainedModel
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class TrainingRunSerializer(serializers.ModelSerializer):
    config_name = serializers.CharField(source="config.name", read_only=True)

    class Meta:
        model = TrainingRun
        fields = "__all__"
        read_only_fields = ["id"]


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
