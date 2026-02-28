from modules.tokenizers.base import BaseTokenizer
from modules.tokenizers.char_tokenizer import CharTokenizer
from modules.tokenizers.tiktoken_tokenizer import TiktokenTokenizer

TOKENIZER_REGISTRY: dict[str, str] = {
    "character": "Caractère par caractère",
    "gpt4": "GPT-4 (BPE cl100k_base)",
    "claude": "Claude-like (BPE o200k_base)",
}


def create_tokenizer(name: str, corpus: str = "") -> BaseTokenizer:
    """Crée un tokenizer par nom.

    Tous les tokenizers construisent leur vocabulaire à partir du corpus.
    La différence est la stratégie de découpage :
    - 'character' : un token = un caractère
    - 'gpt4' : découpage BPE style GPT-4 (cl100k_base)
    - 'claude' : découpage BPE style GPT-4o/Claude (o200k_base)

    Args:
        name: Clé du tokenizer ('character', 'gpt4', 'claude')
        corpus: Texte d'entraînement (requis)

    Returns:
        Instance de BaseTokenizer

    Raises:
        ValueError: Si le nom est inconnu ou si le corpus est vide
    """
    if not corpus:
        raise ValueError("Un corpus non vide est requis pour créer un tokenizer.")

    if name == "character":
        return CharTokenizer(corpus)
    elif name == "gpt4":
        return TiktokenTokenizer("cl100k_base", corpus)
    elif name == "claude":
        return TiktokenTokenizer("o200k_base", corpus)
    else:
        raise ValueError(
            f"Tokenizer '{name}' inconnu. Choix possibles : {list(TOKENIZER_REGISTRY.keys())}"
        )
