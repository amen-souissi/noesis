from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from api.views.auth_views import me, register
from api.views.config_views import (
    ConfigDetailView,
    ConfigListCreateView,
    config_duplicate,
    config_presets,
    config_validate,
)
from api.views.data_views import (
    DataDetailView,
    DataListView,
    config_data_link,
    corpus_view,
    data_sample,
    data_toggle,
    data_upload,
)
from api.views.docs_views import data_flow, module_detail, module_list
from api.views.evaluation_views import (
    eval_attention,
    eval_embeddings,
    eval_generation_weights,
    eval_parameters,
    eval_perplexity,
    eval_tokenize,
    eval_weight_matrices,
)
from api.views.generation_views import (
    chat_message,
    chat_new_message,
    chat_session_detail,
    chat_sessions,
    generate_text,
)
from api.views.model_views import (
    ModelDeleteView,
    ModelListView,
    active_models,
    current_model_info,
    model_load,
    model_save,
    unload_model,
)
from api.views.training_views import (
    TrainingHistoryView,
    TrainingRunDetailView,
    model_initialize,
    training_pause,
    training_resume,
    training_start,
    training_status,
    training_stop,
)

urlpatterns = [
    # Auth
    path("auth/login/", TokenObtainPairView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/register/", register, name="auth-register"),
    path("auth/me/", me, name="auth-me"),
    # Configs
    path("configs/", ConfigListCreateView.as_view(), name="config-list"),
    path("configs/presets/", config_presets, name="config-presets"),
    path("configs/<uuid:pk>/", ConfigDetailView.as_view(), name="config-detail"),
    path("configs/<uuid:pk>/validate/", config_validate, name="config-validate"),
    path("configs/<uuid:pk>/duplicate/", config_duplicate, name="config-duplicate"),
    path(
        "configs/<uuid:config_pk>/data/<uuid:data_pk>/", config_data_link, name="config-data-link"
    ),
    # Data
    path("data/", DataListView.as_view(), name="data-list"),
    path("data/upload/", data_upload, name="data-upload"),
    path("data/sample/", data_sample, name="data-sample"),
    path("data/corpus/", corpus_view, name="data-corpus"),
    path("data/<uuid:pk>/", DataDetailView.as_view(), name="data-detail"),
    path("data/<uuid:pk>/toggle/", data_toggle, name="data-toggle"),
    # Training
    path("training/initialize/", model_initialize, name="model-initialize"),
    path("training/start/", training_start, name="training-start"),
    path("training/stop/", training_stop, name="training-stop"),
    path("training/pause/", training_pause, name="training-pause"),
    path("training/resume/", training_resume, name="training-resume"),
    path("training/status/", training_status, name="training-status"),
    path("training/history/", TrainingHistoryView.as_view(), name="training-history"),
    path(
        "training/history/<uuid:pk>/", TrainingRunDetailView.as_view(), name="training-run-detail"
    ),
    # Models
    path("models/", ModelListView.as_view(), name="model-list"),
    path("models/save/", model_save, name="model-save"),
    path("models/current/", current_model_info, name="model-current"),
    path("models/<uuid:pk>/", ModelDeleteView.as_view(), name="model-delete"),
    path("models/<uuid:pk>/load/", model_load, name="model-load"),
    path("models/active/", active_models, name="models-active"),
    path("models/active/<uuid:config_id>/", unload_model, name="model-unload"),
    # Generation / Chat
    path("generate/", generate_text, name="generate"),
    path("chat/sessions/", chat_sessions, name="chat-sessions"),
    path("chat/messages/", chat_new_message, name="chat-new-message"),
    path("chat/<uuid:session_id>/", chat_session_detail, name="chat-session-detail"),
    path("chat/<uuid:session_id>/messages/", chat_message, name="chat-message"),
    # Evaluation
    path("eval/attention/", eval_attention, name="eval-attention"),
    path("eval/perplexity/", eval_perplexity, name="eval-perplexity"),
    path("eval/embeddings/", eval_embeddings, name="eval-embeddings"),
    path("eval/parameters/", eval_parameters, name="eval-parameters"),
    path("eval/weights/", eval_weight_matrices, name="eval-weights"),
    path("eval/generation-weights/", eval_generation_weights, name="eval-generation-weights"),
    path("eval/tokenize/", eval_tokenize, name="eval-tokenize"),
    # Documentation
    path("docs/modules/", module_list, name="docs-modules"),
    path("docs/modules/<slug:slug>/", module_detail, name="docs-module-detail"),
    path("docs/flow/", data_flow, name="docs-flow"),
]
