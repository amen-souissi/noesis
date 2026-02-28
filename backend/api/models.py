import uuid

from django.db import models


class ModelConfig(models.Model):
    """Configuration des hyperparamètres sauvegardée."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default="")

    # Dimensions du modèle
    d_model = models.IntegerField(default=64)
    n_heads = models.IntegerField(default=4)
    n_layers = models.IntegerField(default=2)
    d_ff = models.IntegerField(default=256)
    seq_len = models.IntegerField(default=64)
    vocab_size = models.IntegerField(default=0)

    # Entraînement
    batch_size = models.IntegerField(default=16)
    learning_rate = models.FloatField(default=1e-3)
    max_epochs = models.IntegerField(default=100)
    grad_clip = models.FloatField(default=1.0)

    # Adam
    beta1 = models.FloatField(default=0.9)
    beta2 = models.FloatField(default=0.999)
    epsilon = models.FloatField(default=1e-8)
    weight_decay = models.FloatField(default=0.0)

    # LR Schedule
    LR_SCHEDULE_CHOICES = [
        ("constant", "Constant"),
        ("cosine", "Cosine Annealing"),
        ("cosine_restarts", "Cosine avec redémarrages"),
    ]
    lr_schedule = models.CharField(max_length=20, choices=LR_SCHEDULE_CHOICES, default="constant")

    # Tokenizer
    TOKENIZER_CHOICES = [
        ("character", "Caractère par caractère"),
        ("gpt4", "GPT-4 (tiktoken)"),
        ("claude", "Claude-like (tiktoken)"),
    ]
    tokenizer_type = models.CharField(max_length=20, choices=TOKENIZER_CHOICES, default="character")

    # Génération
    max_gen_len = models.IntegerField(default=200)
    temperature = models.FloatField(default=0.8)
    SAMPLING_CHOICES = [
        ("greedy", "Glouton"),
        ("temperature", "Température"),
        ("top_k", "Top-K"),
        ("top_p", "Top-P (nucleus)"),
    ]
    sampling_strategy = models.CharField(
        max_length=20, choices=SAMPLING_CHOICES, default="temperature"
    )
    top_k = models.IntegerField(default=10)
    top_p = models.FloatField(default=0.9)

    # Reproductibilité
    seed = models.IntegerField(default=42)
    log_every = models.IntegerField(default=10)

    # Données d'entraînement liées à cette instance
    training_data = models.ManyToManyField(
        "TrainingData",
        through="ConfigTrainingData",
        blank=True,
        related_name="configs",
    )

    # Métadonnées
    is_preset = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.name

    def to_engine_config(self):
        from config import Config

        return Config(
            d_model=self.d_model,
            n_heads=self.n_heads,
            n_layers=self.n_layers,
            d_ff=self.d_ff,
            seq_len=self.seq_len,
            vocab_size=self.vocab_size,
            batch_size=self.batch_size,
            learning_rate=self.learning_rate,
            max_epochs=self.max_epochs,
            grad_clip=self.grad_clip,
            beta1=self.beta1,
            beta2=self.beta2,
            epsilon=self.epsilon,
            weight_decay=self.weight_decay,
            lr_schedule=self.lr_schedule,
            tokenizer_type=self.tokenizer_type,
            max_gen_len=self.max_gen_len,
            sampling_strategy=self.sampling_strategy,
            top_k=self.top_k,
            top_p=self.top_p,
            temperature=self.temperature,
            seed=self.seed,
            log_every=self.log_every,
        )

    def validate_config(self):
        errors = []
        if self.d_model <= 0:
            errors.append("d_model doit être positif")
        if self.n_heads <= 0:
            errors.append("n_heads doit être positif")
        if self.d_model % self.n_heads != 0:
            errors.append(
                f"d_model ({self.d_model}) doit être divisible par n_heads ({self.n_heads})"
            )
        if self.n_layers < 1:
            errors.append("n_layers doit être >= 1")
        if self.d_ff <= 0:
            errors.append("d_ff doit être positif")
        if self.seq_len < 1:
            errors.append("seq_len doit être >= 1")
        if self.batch_size < 1:
            errors.append("batch_size doit être >= 1")
        if self.learning_rate <= 0:
            errors.append("learning_rate doit être positif")
        if not (0 < self.beta1 < 1):
            errors.append("beta1 doit être entre 0 et 1")
        if not (0 < self.beta2 < 1):
            errors.append("beta2 doit être entre 0 et 1")
        if self.temperature <= 0:
            errors.append("temperature doit être positive")
        if self.weight_decay < 0:
            errors.append("weight_decay doit être >= 0")
        if self.lr_schedule not in ("constant", "cosine", "cosine_restarts"):
            errors.append("lr_schedule doit être constant, cosine ou cosine_restarts")
        return errors


class TrainingData(models.Model):
    """Fichiers de données d'entraînement uploadés."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    original_filename = models.CharField(max_length=255)
    file = models.FileField(upload_to="uploads/", blank=True, null=True)
    file_type = models.CharField(max_length=20)
    file_size = models.IntegerField()
    extracted_text = models.TextField(blank=True, default="")
    char_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class TrainedModel(models.Model):
    """Modèle entraîné sauvegardé sur disque."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")
    config = models.ForeignKey(ModelConfig, on_delete=models.CASCADE, related_name="trained_models")
    weights_path = models.CharField(max_length=500)
    total_parameters = models.IntegerField(default=0)
    final_loss = models.FloatField(null=True, blank=True)
    epochs_trained = models.IntegerField(default=0)
    training_duration_seconds = models.FloatField(null=True, blank=True)
    vocab_json = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class TrainingRun(models.Model):
    """Historique d'une session d'entraînement."""

    class Status(models.TextChoices):
        PENDING = "pending"
        RUNNING = "running"
        PAUSED = "paused"
        COMPLETED = "completed"
        FAILED = "failed"
        STOPPED = "stopped"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    config = models.ForeignKey(ModelConfig, on_delete=models.CASCADE, related_name="training_runs")
    trained_model = models.ForeignKey(
        TrainedModel, on_delete=models.SET_NULL, null=True, blank=True
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    current_epoch = models.IntegerField(default=0)
    total_epochs = models.IntegerField(default=0)
    loss_history = models.JSONField(default=list)
    error_message = models.TextField(blank=True, default="")
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]


class ChatMessage(models.Model):
    """Messages du chat avec le LLM."""

    class Role(models.TextChoices):
        USER = "user"
        ASSISTANT = "assistant"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.UUIDField(db_index=True)
    config = models.ForeignKey(
        ModelConfig,
        on_delete=models.CASCADE,
        related_name="chat_messages",
        null=True,
        blank=True,
    )
    user = models.ForeignKey(
        "auth.User",
        on_delete=models.CASCADE,
        related_name="chat_messages",
        null=True,
        blank=True,
    )
    role = models.CharField(max_length=10, choices=Role.choices)
    content = models.TextField()
    temperature_used = models.FloatField(null=True, blank=True)
    max_tokens_used = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class ConfigTrainingData(models.Model):
    """Relation entre une config et ses données d'entraînement, avec activation."""

    config = models.ForeignKey(ModelConfig, on_delete=models.CASCADE)
    training_data = models.ForeignKey(TrainingData, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("config", "training_data")
