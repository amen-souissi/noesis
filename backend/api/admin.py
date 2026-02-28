from django.contrib import admin

from api.models import ChatMessage, ModelConfig, TrainedModel, TrainingData, TrainingRun

admin.site.register(ModelConfig)
admin.site.register(TrainingData)
admin.site.register(TrainedModel)
admin.site.register(TrainingRun)
admin.site.register(ChatMessage)
