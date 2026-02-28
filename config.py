from dataclasses import dataclass


@dataclass
class Config:
    """
    Configuration du modèle MiniLLM.
    Modifier ces valeurs pour expérimenter.

    GUIDE D'EXPERIMENTATION :
    - Augmenter d_model -> capture plus de nuances (mais plus lent)
    - Augmenter n_heads -> plus de "perspectives" d'attention en parallèle
    - Augmenter n_layers -> modèle plus profond (risque d'instabilité)
    - Augmenter seq_len -> plus de contexte visible
    - Modifier learning_rate -> impact direct sur la vitesse d'apprentissage
    """

    # --- Dimensions du modèle ---
    d_model: int = 64  # Dimension des embeddings
    n_heads: int = 4  # Nombre de têtes d'attention (doit diviser d_model)
    n_layers: int = 2  # Nombre de blocs Transformer empilés
    d_ff: int = 256  # Dimension du réseau feedforward (convention: 4 * d_model)
    seq_len: int = 64  # Longueur de séquence (contexte max)
    vocab_size: int = 0  # Auto-calculé par le tokenizer

    # --- Entraînement ---
    batch_size: int = 16
    learning_rate: float = 1e-3
    max_epochs: int = 100
    grad_clip: float = 1.0
    lr_schedule: str = "constant"  # constant | cosine | cosine_restarts

    # --- Adam ---
    beta1: float = 0.9
    beta2: float = 0.999
    epsilon: float = 1e-8
    weight_decay: float = 0.0

    # --- Tokenizer ---
    tokenizer_type: str = "character"  # character | gpt4 | claude

    # --- Génération ---
    max_gen_len: int = 200
    temperature: float = 0.8
    sampling_strategy: str = "temperature"  # greedy | temperature | top_k | top_p
    top_k: int = 10
    top_p: float = 0.9

    # --- Reproductibilité ---
    seed: int = 42

    # --- Logging ---
    log_every: int = 10
