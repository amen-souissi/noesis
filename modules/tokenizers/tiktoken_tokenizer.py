import tiktoken

from modules.tokenizers.base import BaseTokenizer


class TiktokenTokenizer(BaseTokenizer):
    """Tokenizer utilisant le découpage BPE de tiktoken.

    Utilise la stratégie de segmentation (BPE) de tiktoken pour découper le texte
    en sous-mots, mais construit un vocabulaire local à partir du corpus
    d'entraînement. Ainsi le vocab_size est proportionnel au corpus,
    pas aux ~100k tokens du vocabulaire GPT-4.

    Encodings supportés :
    - cl100k_base : découpage BPE style GPT-4 / ChatGPT
    - o200k_base : découpage BPE style GPT-4o / modèles récents
    """

    SUPPORTED_ENCODINGS = {"cl100k_base", "o200k_base"}

    def __init__(self, encoding_name: str = "cl100k_base", corpus: str = ""):
        if encoding_name not in self.SUPPORTED_ENCODINGS:
            raise ValueError(
                f"Encoding '{encoding_name}' non supporté. "
                f"Choix possibles : {self.SUPPORTED_ENCODINGS}"
            )
        self.encoding_name = encoding_name
        self.enc = tiktoken.get_encoding(encoding_name)

        # Découper le corpus en sous-mots via tiktoken
        # puis construire un vocabulaire local (trié pour déterminisme)
        if corpus:
            token_ids = self.enc.encode(corpus)
            subwords = sorted(set(self.enc.decode([tid]) for tid in token_ids))
        else:
            subwords = []

        self._vocab_size = len(subwords)
        self.subword_to_idx = {sw: i for i, sw in enumerate(subwords)}
        self.idx_to_subword = {i: sw for i, sw in enumerate(subwords)}

    def encode(self, text: str) -> list[int]:
        """Découpe le texte via tiktoken puis mappe vers les IDs locaux.

        Les sous-mots absents du vocabulaire local (OOV) sont ignorés.
        """
        token_ids = self.enc.encode(text)
        result = []
        for tid in token_ids:
            subword = self.enc.decode([tid])
            idx = self.subword_to_idx.get(subword)
            if idx is not None:
                result.append(idx)
        return result

    def decode(self, indices: list[int]) -> str:
        """Convertit une liste d'IDs locaux en texte (filtre BOS/EOS)."""
        return "".join(self.idx_to_subword[i] for i in indices if i not in self.special_ids)

    @property
    def vocab_size(self) -> int:
        return self._vocab_size + 2

    @property
    def name(self) -> str:
        return f"TiktokenTokenizer({self.encoding_name})"
