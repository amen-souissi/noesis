import numpy as np

from modules.base_module import BaseModule


class PositionalEncoding(BaseModule):
    """Encodage positionnel sinusoïdal (constante, non entraînable).

    Ajoute un signal de position à chaque embedding pour que le modèle
    sache l'ordre des tokens. Utilise sin pour les dimensions paires
    et cos pour les dimensions impaires, à différentes fréquences.

    PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
    PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
    """

    def __init__(self, seq_len: int, d_model: int):
        self.pe = np.zeros((seq_len, d_model))
        pos = np.arange(seq_len)[:, np.newaxis]  # (seq_len, 1)
        div = np.exp(np.arange(0, d_model, 2) * -(np.log(10000.0) / d_model))  # (d_model/2,)
        self.pe[:, 0::2] = np.sin(pos * div)
        self.pe[:, 1::2] = np.cos(pos * div)

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Args:
            x: (batch_size, seq_len, d_model)
        Returns:
            x + PE, même shape
        """
        T = x.shape[1]
        return x + self.pe[:T, :]

    def backward(self, grad_output: np.ndarray) -> np.ndarray:
        """PE est une constante, le gradient passe tel quel."""
        return grad_output
