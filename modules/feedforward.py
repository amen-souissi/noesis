import numpy as np

from modules.base_module import BaseModule
from modules.linear import Linear


class FeedForward(BaseModule):
    """Réseau feedforward position-wise à 2 couches + ReLU.

    FFN(x) = Linear2(ReLU(Linear1(x)))
    Linear1 : d_model -> d_ff  (expansion)
    Linear2 : d_ff -> d_model  (compression)
    """

    def __init__(self, d_model: int, d_ff: int):
        self.linear1 = Linear(d_model, d_ff)
        self.linear2 = Linear(d_ff, d_model)
        self._relu_mask = None

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Args:
            x: (batch_size, seq_len, d_model)
        Returns:
            (batch_size, seq_len, d_model)
        """
        h = self.linear1.forward(x)  # (B, T, d_ff)
        self._relu_mask = h > 0
        h = h * self._relu_mask  # ReLU
        return self.linear2.forward(h)  # (B, T, d_model)

    def backward(self, grad_output: np.ndarray) -> np.ndarray:
        grad = self.linear2.backward(grad_output)  # (B, T, d_ff)
        grad = grad * self._relu_mask  # ReLU backward
        grad = self.linear1.backward(grad)  # (B, T, d_model)
        return grad

    @property
    def parameters(self) -> dict[str, np.ndarray]:
        params = {}
        for name, p in self.linear1.parameters.items():
            params[f"linear1.{name}"] = p
        for name, p in self.linear2.parameters.items():
            params[f"linear2.{name}"] = p
        return params

    @property
    def gradients(self) -> dict[str, np.ndarray]:
        grads = {}
        for name, g in self.linear1.gradients.items():
            grads[f"linear1.{name}"] = g
        for name, g in self.linear2.gradients.items():
            grads[f"linear2.{name}"] = g
        return grads
