import numpy as np

from modules.attention import MultiHeadAttention
from modules.base_module import BaseModule
from modules.feedforward import FeedForward
from modules.layernorm import LayerNorm


class TransformerBlock(BaseModule):
    """Bloc Transformer Pre-Norm (style GPT-2).

    Architecture :
        x -> LayerNorm1 -> Attention -> + résiduel
          -> LayerNorm2 -> FeedForward -> + résiduel -> output

    Les connexions résiduelles permettent au gradient de
    "sauter" les sous-couches, stabilisant l'entraînement.
    """

    def __init__(self, d_model: int, n_heads: int, d_ff: int, max_seq_len: int = 512):
        self.ln1 = LayerNorm(d_model)
        self.attention = MultiHeadAttention(d_model, n_heads, max_seq_len)
        self.ln2 = LayerNorm(d_model)
        self.ffn = FeedForward(d_model, d_ff)

        self._cache_residual1 = None
        self._cache_residual2 = None

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Args:
            x: (batch_size, seq_len, d_model)
        Returns:
            (batch_size, seq_len, d_model)
        """
        # Sub-block 1: Attention + residual
        residual = x
        x_norm = self.ln1.forward(x)
        attn_out = self.attention.forward(x_norm)
        x = residual + attn_out

        # Sub-block 2: FFN + residual
        residual = x
        x_norm = self.ln2.forward(x)
        ffn_out = self.ffn.forward(x_norm)
        x = residual + ffn_out

        return x

    def backward(self, grad_output: np.ndarray) -> np.ndarray:
        """Backward à travers le bloc.

        Le gradient se divise à chaque connexion résiduelle :
        d(x + f(x))/dx = 1 + f'(x), donc on additionne
        le gradient direct et le gradient de la sous-couche.
        """
        # Sub-block 2 backward (FFN)
        grad_ffn = self.ffn.backward(grad_output)
        grad_ffn = self.ln2.backward(grad_ffn)
        grad_output = grad_output + grad_ffn  # résiduel

        # Sub-block 1 backward (Attention)
        grad_attn = self.attention.backward(grad_output)
        grad_attn = self.ln1.backward(grad_attn)
        grad_output = grad_output + grad_attn  # résiduel

        return grad_output

    def get_sub_modules(self):
        """Retourne la liste des sous-modules pour itération."""
        return [self.ln1, self.attention, self.ln2, self.ffn]

    @property
    def parameters(self) -> dict[str, np.ndarray]:
        params = {}
        for prefix, mod in [
            ("ln1", self.ln1),
            ("attn", self.attention),
            ("ln2", self.ln2),
            ("ffn", self.ffn),
        ]:
            for name, p in mod.parameters.items():
                params[f"{prefix}.{name}"] = p
        return params

    @property
    def gradients(self) -> dict[str, np.ndarray]:
        grads = {}
        for prefix, mod in [
            ("ln1", self.ln1),
            ("attn", self.attention),
            ("ln2", self.ln2),
            ("ffn", self.ffn),
        ]:
            for name, g in mod.gradients.items():
                grads[f"{prefix}.{name}"] = g
        return grads
