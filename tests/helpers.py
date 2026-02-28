import numpy as np


def numerical_gradient_check(
    param: np.ndarray, grad: np.ndarray, loss_fn, epsilon: float = 1e-5
) -> float:
    """Vérifie les gradients analytiques vs approximation numérique.

    Args:
        param: le tableau de paramètres à vérifier
        grad: le gradient analytique calculé par backward
        loss_fn: callable sans argument qui retourne le loss scalaire
                 (doit utiliser la valeur courante de param)
        epsilon: perturbation pour les différences finies

    Returns:
        Erreur relative maximale entre gradient analytique et numérique.
    """
    numerical_grad = np.zeros_like(param)

    it = np.nditer(param, flags=["multi_index"])
    while not it.finished:
        idx = it.multi_index
        old_val = param[idx]

        param[idx] = old_val + epsilon
        loss_plus = loss_fn()

        param[idx] = old_val - epsilon
        loss_minus = loss_fn()

        param[idx] = old_val

        numerical_grad[idx] = (loss_plus - loss_minus) / (2 * epsilon)
        it.iternext()

    denom = np.maximum(np.abs(grad) + np.abs(numerical_grad), 1e-8)
    return float(np.max(np.abs(grad - numerical_grad) / denom))
