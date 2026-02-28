import numpy as np


class CrossEntropyLoss:
    """Cross-entropy loss fusionnée avec softmax (log-sum-exp trick).

    Forward : -mean(log_softmax(logits)[targets])
    Backward : (softmax(logits) - one_hot(targets)) / N

    La fusion softmax + cross-entropy donne un gradient élégant et
    numériquement stable.
    """

    def __init__(self):
        self._cache_probs = None
        self._cache_targets = None
        self._cache_B = 0
        self._cache_T = 0

    def forward(self, logits: np.ndarray, targets: np.ndarray) -> float:
        """
        Args:
            logits: (batch_size, seq_len, vocab_size) — scores bruts
            targets: (batch_size, seq_len) — vrais token IDs
        Returns:
            loss: scalaire
        """
        B, T, V = logits.shape

        # Log-softmax via log-sum-exp trick (stabilité numérique)
        logits_max = np.max(logits, axis=-1, keepdims=True)
        log_sum_exp = logits_max + np.log(
            np.sum(np.exp(logits - logits_max), axis=-1, keepdims=True)
        )
        log_probs = logits - log_sum_exp  # (B, T, V)

        # Negative log likelihood aux positions cibles
        target_log_probs = log_probs[
            np.arange(B)[:, None],
            np.arange(T)[None, :],
            targets,
        ]  # (B, T)

        loss = -np.mean(target_log_probs)

        # Cache pour backward
        self._cache_probs = np.exp(log_probs)  # softmax probas
        self._cache_targets = targets
        self._cache_B = B
        self._cache_T = T

        return float(loss)

    def backward(self) -> np.ndarray:
        """
        Returns:
            grad_logits: (batch_size, seq_len, vocab_size)
            = (softmax - one_hot) / N
        """
        B, T = self._cache_B, self._cache_T
        grad = self._cache_probs.copy()

        # Soustraire 1 aux positions cibles (one-hot)
        grad[
            np.arange(B)[:, None],
            np.arange(T)[None, :],
            self._cache_targets,
        ] -= 1.0

        # Moyenne sur batch et séquence
        grad /= B * T
        return grad
