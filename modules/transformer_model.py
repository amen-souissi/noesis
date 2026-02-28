import numpy as np

from config import Config
from modules.embedding import Embedding
from modules.layernorm import LayerNorm
from modules.linear import Linear
from modules.positional_encoding import PositionalEncoding
from modules.transformer_block import TransformerBlock


class TransformerModel:
    """Modèle Transformer complet (decoder-only, style GPT-2).

    Architecture :
        Token IDs -> Embedding -> + Positional Encoding
        -> N x TransformerBlock
        -> LayerNorm final
        -> Projection linéaire -> Logits

    Les logits sont les scores bruts AVANT softmax,
    de shape (batch_size, seq_len, vocab_size).
    """

    def __init__(self, config: Config):
        self.config = config
        np.random.seed(config.seed)

        self.embedding = Embedding(config.vocab_size, config.d_model)
        self.pos_enc = PositionalEncoding(config.seq_len, config.d_model)

        self.blocks = [
            TransformerBlock(config.d_model, config.n_heads, config.d_ff, config.seq_len)
            for _ in range(config.n_layers)
        ]

        self.final_ln = LayerNorm(config.d_model)
        self.output_head = Linear(config.d_model, config.vocab_size, bias=False)

    def forward(self, token_ids: np.ndarray) -> np.ndarray:
        """
        Args:
            token_ids: (batch_size, seq_len) entiers
        Returns:
            logits: (batch_size, seq_len, vocab_size)
        """
        h = self.embedding.forward(token_ids)  # (B, T, D)
        h = self.pos_enc.forward(h)  # (B, T, D)

        for block in self.blocks:
            h = block.forward(h)  # (B, T, D)

        h = self.final_ln.forward(h)  # (B, T, D)
        logits = self.output_head.forward(h)  # (B, T, V)
        return logits

    def backward(self, grad_logits: np.ndarray) -> None:
        """Propage les gradients en sens inverse à travers tout le modèle."""
        grad = self.output_head.backward(grad_logits)
        grad = self.final_ln.backward(grad)

        for block in reversed(self.blocks):
            grad = block.backward(grad)

        grad = self.pos_enc.backward(grad)
        self.embedding.backward(grad)

    def all_modules(self):
        """Retourne la liste plate de tous les modules avec paramètres.

        Utilisé par l'optimizer pour itérer sur tous les paramètres.
        """
        modules = [self.embedding]
        for block in self.blocks:
            modules.extend(block.get_sub_modules())
        modules.append(self.final_ln)
        modules.append(self.output_head)
        return modules

    def count_parameters(self) -> int:
        """Nombre total de paramètres entraînables."""
        total = 0
        for mod in self.all_modules():
            for p in mod.parameters.values():
                total += p.size
        return total
