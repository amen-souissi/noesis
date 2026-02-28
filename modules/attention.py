import numpy as np

from modules.base_module import BaseModule
from modules.linear import Linear
from modules.softmax import softmax


class MultiHeadAttention(BaseModule):
    """Multi-Head Causal Self-Attention.

    Pour chaque token, calcule :
    1. Q, K, V = projections linéaires de l'input
    2. Scores = (Q @ K^T) / sqrt(d_k) + masque causal
    3. Poids d'attention = softmax(Scores)
    4. Output = Poids @ V, re-projeté par W_O

    Le masque causal empêche de "regarder dans le futur".
    Multi-head = on fait ça n_heads fois en parallèle.
    """

    def __init__(self, d_model: int, n_heads: int, max_seq_len: int = 512):
        assert d_model % n_heads == 0, "d_model doit être divisible par n_heads"
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads

        # Projections linéaires (sans biais pour simplifier)
        self.W_q = Linear(d_model, d_model, bias=False)
        self.W_k = Linear(d_model, d_model, bias=False)
        self.W_v = Linear(d_model, d_model, bias=False)
        self.W_o = Linear(d_model, d_model, bias=False)

        # Masque causal pré-calculé
        self._causal_mask = np.triu(np.full((max_seq_len, max_seq_len), -np.inf), k=1)

        # Cache pour backward
        self._cache = {}

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Args:
            x: (batch_size, seq_len, d_model)
        Returns:
            (batch_size, seq_len, d_model)
        """
        B, T, D = x.shape

        # Projections linéaires
        Q = self.W_q.forward(x)  # (B, T, D)
        K = self.W_k.forward(x)
        V = self.W_v.forward(x)

        # Reshape multi-head : (B, T, D) -> (B, n_heads, T, d_k)
        Q = Q.reshape(B, T, self.n_heads, self.d_k).transpose(0, 2, 1, 3)
        K = K.reshape(B, T, self.n_heads, self.d_k).transpose(0, 2, 1, 3)
        V = V.reshape(B, T, self.n_heads, self.d_k).transpose(0, 2, 1, 3)

        # Scaled dot-product attention
        scores = (Q @ K.transpose(0, 1, 3, 2)) / np.sqrt(self.d_k)  # (B, H, T, T)
        scores = scores + self._causal_mask[:T, :T]  # masque causal

        attn_weights = softmax(scores, axis=-1)  # (B, H, T, T)
        attn_out = attn_weights @ V  # (B, H, T, d_k)

        # Reshape back : (B, H, T, d_k) -> (B, T, D)
        attn_out = attn_out.transpose(0, 2, 1, 3).reshape(B, T, D)

        output = self.W_o.forward(attn_out)  # (B, T, D)

        # Cache pour backward
        self._cache = {
            "Q": Q,
            "K": K,
            "V": V,
            "attn_weights": attn_weights,
            "attn_out": attn_out,
        }
        return output

    def backward(self, grad_output: np.ndarray) -> np.ndarray:
        """Propage les gradients à travers toute l'attention.

        Étapes (en ordre inverse du forward) :
        1. W_O backward
        2. Reverse reshape
        3. attn_weights @ V backward
        4. Softmax backward
        5. Scaling backward
        6. Q @ K^T backward
        7. Reverse multi-head reshape
        8. W_Q, W_K, W_V backward
        """
        B = grad_output.shape[0]
        T = grad_output.shape[1]
        D = self.d_model
        d_k = self.d_k

        Q = self._cache["Q"]
        K = self._cache["K"]
        V = self._cache["V"]
        attn_weights = self._cache["attn_weights"]

        # 1. Through W_O
        d_attn_out = self.W_o.backward(grad_output)  # (B, T, D)

        # 2. Reverse reshape: (B, T, D) -> (B, H, T, d_k)
        d_attn_out = d_attn_out.reshape(B, T, self.n_heads, d_k).transpose(0, 2, 1, 3)

        # 3. Through attn_weights @ V
        # d_attn_weights = d_attn_out @ V^T    (B, H, T, T)
        # dV = attn_weights^T @ d_attn_out      (B, H, T, d_k)
        d_attn_weights = d_attn_out @ V.transpose(0, 1, 3, 2)
        dV = attn_weights.transpose(0, 1, 3, 2) @ d_attn_out

        # 4. Softmax backward: dS = attn * (dA - sum(dA * attn))
        sum_term = np.sum(d_attn_weights * attn_weights, axis=-1, keepdims=True)
        d_scores = attn_weights * (d_attn_weights - sum_term)

        # 5. Scaling backward
        d_scores = d_scores / np.sqrt(d_k)

        # 6. Q @ K^T backward
        dQ = d_scores @ K  # (B, H, T, d_k)
        dK = d_scores.transpose(0, 1, 3, 2) @ Q  # (B, H, T, d_k)

        # 7. Reverse multi-head reshape: (B, H, T, d_k) -> (B, T, D)
        dQ = dQ.transpose(0, 2, 1, 3).reshape(B, T, D)
        dK = dK.transpose(0, 2, 1, 3).reshape(B, T, D)
        dV = dV.transpose(0, 2, 1, 3).reshape(B, T, D)

        # 8. Through projection layers
        dX_q = self.W_q.backward(dQ)
        dX_k = self.W_k.backward(dK)
        dX_v = self.W_v.backward(dV)

        # Q, K, V partagent le même input x -> somme des gradients
        return dX_q + dX_k + dX_v

    def get_attention_weights(self) -> np.ndarray:
        """Retourne les poids d'attention pour visualisation.
        Shape: (batch_size, n_heads, seq_len, seq_len)
        """
        return self._cache.get("attn_weights")

    @property
    def parameters(self) -> dict[str, np.ndarray]:
        params = {}
        for prefix, layer in [
            ("W_q", self.W_q),
            ("W_k", self.W_k),
            ("W_v", self.W_v),
            ("W_o", self.W_o),
        ]:
            for name, p in layer.parameters.items():
                params[f"{prefix}.{name}"] = p
        return params

    @property
    def gradients(self) -> dict[str, np.ndarray]:
        grads = {}
        for prefix, layer in [
            ("W_q", self.W_q),
            ("W_k", self.W_k),
            ("W_v", self.W_v),
            ("W_o", self.W_o),
        ]:
            for name, g in layer.gradients.items():
                grads[f"{prefix}.{name}"] = g
        return grads
