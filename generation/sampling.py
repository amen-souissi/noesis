"""Stratégies d'échantillonnage pour la génération de texte.

Quatre stratégies disponibles :
- greedy : prend le token le plus probable (déterministe)
- temperature : ajuste la distribution puis échantillonne
- top_k : ne considère que les K tokens les plus probables
- top_p : ne considère que les tokens couvrant P% de la probabilité cumulée
"""

import numpy as np

from modules.softmax import softmax


def greedy(logits: np.ndarray) -> int:
    """Sélectionne le token avec le score le plus élevé (déterministe)."""
    return int(np.argmax(logits))


def temperature_sample(logits: np.ndarray, temperature: float = 1.0) -> int:
    """Échantillonnage avec ajustement de température.

    temperature < 1 : plus conservateur (pics plus marqués)
    temperature > 1 : plus créatif (distribution plus uniforme)
    """
    scaled = logits / max(temperature, 1e-8)
    probs = softmax(scaled)
    return int(np.random.choice(len(probs), p=probs))


def top_k_sample(logits: np.ndarray, k: int = 10, temperature: float = 1.0) -> int:
    """Ne considère que les K tokens les plus probables.

    Filtre les tokens improbables avant d'échantillonner,
    réduisant le risque de générer des incohérences.
    """
    k = min(k, len(logits))
    top_k_idx = np.argsort(logits)[-k:]
    top_k_logits = logits[top_k_idx] / max(temperature, 1e-8)
    probs = softmax(top_k_logits)
    chosen = np.random.choice(len(probs), p=probs)
    return int(top_k_idx[chosen])


def top_p_sample(logits: np.ndarray, p: float = 0.9, temperature: float = 1.0) -> int:
    """Échantillonnage nucleus — garde les tokens couvrant P% de probabilité.

    Plus adaptatif que top_k : garde peu de tokens quand un domine,
    et plus de tokens quand la distribution est plate.
    """
    scaled = logits / max(temperature, 1e-8)
    probs = softmax(scaled)
    sorted_idx = np.argsort(probs)[::-1]
    cumsum = np.cumsum(probs[sorted_idx])
    cutoff = int(np.searchsorted(cumsum, p)) + 1
    top_idx = sorted_idx[:cutoff]
    top_probs = probs[top_idx]
    top_probs = top_probs / top_probs.sum()
    return int(np.random.choice(top_idx, p=top_probs))


def sample_token(
    logits: np.ndarray,
    strategy: str = "temperature",
    temperature: float = 1.0,
    top_k: int = 10,
    top_p: float = 0.9,
) -> int:
    """Point d'entrée unifié pour l'échantillonnage.

    Args:
        logits: scores bruts du modèle (V,)
        strategy: 'greedy', 'temperature', 'top_k', 'top_p'
        temperature: température pour temperature/top_k/top_p
        top_k: nombre de tokens pour top_k
        top_p: seuil de probabilité cumulée pour top_p

    Returns:
        Index du token sélectionné
    """
    if strategy == "greedy":
        return greedy(logits)
    elif strategy == "temperature":
        return temperature_sample(logits, temperature)
    elif strategy == "top_k":
        return top_k_sample(logits, k=top_k, temperature=temperature)
    elif strategy == "top_p":
        return top_p_sample(logits, p=top_p, temperature=temperature)
    else:
        raise ValueError(
            f"Stratégie '{strategy}' inconnue. Choix : greedy, temperature, top_k, top_p"
        )
