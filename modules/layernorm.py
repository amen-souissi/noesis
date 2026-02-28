import numpy as np

from modules.base_module import BaseModule


class LayerNorm(BaseModule):
    """Layer Normalization.

    Normalise les activations sur la dernière dimension (d_model) :
    output = gamma * (x - mu) / sqrt(var + eps) + beta

    gamma et beta sont des paramètres entraînables.
    """

    def __init__(self, d_model: int, eps: float = 1e-5):
        self.eps = eps
        self.gamma = np.ones(d_model)
        self.beta = np.zeros(d_model)
        self._dgamma = np.zeros_like(self.gamma)
        self._dbeta = np.zeros_like(self.beta)
        # Cache pour backward
        self._cache_x_hat = None
        self._cache_std_inv = None

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Args:
            x: (..., d_model)
        Returns:
            même shape, normalisé
        """
        mu = np.mean(x, axis=-1, keepdims=True)
        var = np.var(x, axis=-1, keepdims=True)
        self._cache_std_inv = 1.0 / np.sqrt(var + self.eps)
        self._cache_x_hat = (x - mu) * self._cache_std_inv
        return self.gamma * self._cache_x_hat + self.beta

    def backward(self, grad_output: np.ndarray) -> np.ndarray:
        """Formule simplifiée du gradient de LayerNorm.

        dx = (1/D) * std_inv * (D*dx_hat - sum(dx_hat) - x_hat*sum(dx_hat*x_hat))
        """
        x_hat = self._cache_x_hat
        std_inv = self._cache_std_inv
        D = x_hat.shape[-1]

        # Gradients des paramètres (somme sur toutes les dims batch)
        # Aplatir toutes les dims sauf la dernière
        flat_shape = (-1, D)
        grad_flat = grad_output.reshape(flat_shape)
        x_hat_flat = x_hat.reshape(flat_shape)
        self._dgamma = np.sum(grad_flat * x_hat_flat, axis=0)
        self._dbeta = np.sum(grad_flat, axis=0)

        # Gradient de l'input (formule compacte)
        dx_hat = grad_output * self.gamma
        dx = (
            (1.0 / D)
            * std_inv
            * (
                D * dx_hat
                - np.sum(dx_hat, axis=-1, keepdims=True)
                - x_hat * np.sum(dx_hat * x_hat, axis=-1, keepdims=True)
            )
        )
        return dx

    @property
    def parameters(self) -> dict[str, np.ndarray]:
        return {"gamma": self.gamma, "beta": self.beta}

    @property
    def gradients(self) -> dict[str, np.ndarray]:
        return {"gamma": self._dgamma, "beta": self._dbeta}
