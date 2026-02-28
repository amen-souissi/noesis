from abc import ABC, abstractmethod

BOS_TOKEN = "<BOS>"
EOS_TOKEN = "<EOS>"


class BaseTokenizer(ABC):
    """Interface abstraite pour tous les tokenizers.

    Chaque tokenizer doit pouvoir encoder du texte en IDs
    et décoder des IDs en texte.
    """

    @abstractmethod
    def encode(self, text: str) -> list[int]:
        """Convertit un texte en liste d'entiers."""
        ...

    @abstractmethod
    def decode(self, indices: list[int]) -> str:
        """Convertit une liste d'entiers en texte."""
        ...

    @property
    @abstractmethod
    def vocab_size(self) -> int:
        """Taille du vocabulaire (inclut BOS/EOS)."""
        ...

    @property
    def bos_id(self) -> int:
        """ID du token BOS — avant-dernier du vocab."""
        return self.vocab_size - 2

    @property
    def eos_id(self) -> int:
        """ID du token EOS — dernier du vocab."""
        return self.vocab_size - 1

    @property
    def special_ids(self) -> set[int]:
        """IDs des tokens spéciaux (BOS, EOS)."""
        return {self.bos_id, self.eos_id}

    @property
    def name(self) -> str:
        """Nom du tokenizer."""
        return self.__class__.__name__
