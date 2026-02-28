import numpy as np

from modules.base_module import BaseModule


class Embedding(BaseModule):
    """Table d'embedding : transforme des token IDs en vecteurs denses.

    Chaque token a un vecteur de dimension d_model, stocké dans une
    matrice W de shape (vocab_size, d_model). Le forward est un simple
    lookup par index.
    """

    def __init__(self, vocab_size: int, d_model: int):
        self.W = np.random.randn(vocab_size, d_model) * 0.02
        self._dW = np.zeros_like(self.W)
        self._cache_indices = None

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Args:
            x: (batch_size, seq_len) entiers
        Returns:
            (batch_size, seq_len, d_model)
        """
        self._cache_indices = x
        return self.W[x]

    def backward(self, grad_output: np.ndarray) -> np.ndarray:
        """Accumule les gradients pour chaque ligne d'embedding utilisée.

        Utilise np.add.at (et non +=) pour gérer correctement les
        indices dupliqués dans un même batch.
        """
        self._dW = np.zeros_like(self.W)
        np.add.at(self._dW, self._cache_indices, grad_output)
        return None  # pas de gradient en dessous de l'embedding

    @property
    def parameters(self) -> dict[str, np.ndarray]:
        return {"W": self.W}

    @property
    def gradients(self) -> dict[str, np.ndarray]:
        return {"W": self._dW}
