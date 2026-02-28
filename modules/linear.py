import numpy as np

from modules.base_module import BaseModule


class Linear(BaseModule):
    """Couche linéaire (dense) : Y = X @ W + b.

    Initialisation Xavier pour les poids, zéros pour les biais.
    """

    def __init__(self, d_in: int, d_out: int, bias: bool = True):
        scale = np.sqrt(2.0 / (d_in + d_out))
        self.W = np.random.randn(d_in, d_out) * scale
        self._dW = np.zeros_like(self.W)

        self.use_bias = bias
        if bias:
            self.b = np.zeros(d_out)
            self._db = np.zeros_like(self.b)

        self._cache_input = None

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Args:
            x: (..., d_in) — supporte n'importe quel nombre de dimensions batch
        Returns:
            (..., d_out)
        """
        self._cache_input = x
        out = x @ self.W
        if self.use_bias:
            out = out + self.b
        return out

    def backward(self, grad_output: np.ndarray) -> np.ndarray:
        """
        Args:
            grad_output: (..., d_out)
        Returns:
            grad_input: (..., d_in)
        """
        x = self._cache_input
        # Aplatir les dimensions batch pour le calcul de dW
        d_in = x.shape[-1]
        d_out = grad_output.shape[-1]

        x_flat = x.reshape(-1, d_in)  # (N, d_in)
        grad_flat = grad_output.reshape(-1, d_out)  # (N, d_out)

        self._dW = x_flat.T @ grad_flat  # (d_in, d_out)
        if self.use_bias:
            self._db = grad_flat.sum(axis=0)  # (d_out,)

        grad_input = grad_output @ self.W.T  # (..., d_in)
        return grad_input

    @property
    def parameters(self) -> dict[str, np.ndarray]:
        params = {"W": self.W}
        if self.use_bias:
            params["b"] = self.b
        return params

    @property
    def gradients(self) -> dict[str, np.ndarray]:
        grads = {"W": self._dW}
        if self.use_bias:
            grads["b"] = self._db
        return grads
