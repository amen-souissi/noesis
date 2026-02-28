from modules.tokenizers.base import BaseTokenizer


class CharTokenizer(BaseTokenizer):
    """Tokenizer par caractère.

    Chaque caractère unique du texte d'entraînement reçoit un ID entier.
    Le vocabulaire est trié pour garantir un encodage déterministe.
    """

    def __init__(self, text: str):
        chars = sorted(set(text))
        self._vocab_size = len(chars)
        self.char_to_idx = {ch: i for i, ch in enumerate(chars)}
        self.idx_to_char = {i: ch for i, ch in enumerate(chars)}

    def encode(self, text: str) -> list[int]:
        """Convertit un texte en liste d'entiers."""
        return [self.char_to_idx[ch] for ch in text]

    def decode(self, indices: list[int]) -> str:
        """Convertit une liste d'entiers en texte (filtre BOS/EOS)."""
        return "".join(self.idx_to_char[i] for i in indices if i not in self.special_ids)

    @property
    def vocab_size(self) -> int:
        return self._vocab_size + 2
