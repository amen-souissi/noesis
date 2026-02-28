"""Tests pour TokenizerFactory — création de tokenizers par nom."""

import pytest

from modules.tokenizers.char_tokenizer import CharTokenizer
from modules.tokenizers.factory import TOKENIZER_REGISTRY, create_tokenizer
from modules.tokenizers.tiktoken_tokenizer import TiktokenTokenizer

SAMPLE_CORPUS = "Le chat mange du poisson."


class TestTokenizerFactory:
    def test_create_character_tokenizer(self):
        tok = create_tokenizer("character", corpus=SAMPLE_CORPUS)
        assert isinstance(tok, CharTokenizer)
        assert tok.vocab_size > 0

    def test_create_gpt4_tokenizer(self):
        tok = create_tokenizer("gpt4", corpus=SAMPLE_CORPUS)
        assert isinstance(tok, TiktokenTokenizer)
        assert "cl100k_base" in tok.name

    def test_create_claude_tokenizer(self):
        tok = create_tokenizer("claude", corpus=SAMPLE_CORPUS)
        assert isinstance(tok, TiktokenTokenizer)
        assert "o200k_base" in tok.name

    def test_requires_corpus(self):
        """Tous les tokenizers nécessitent un corpus."""
        with pytest.raises(ValueError, match="corpus non vide"):
            create_tokenizer("character", corpus="")
        with pytest.raises(ValueError, match="corpus non vide"):
            create_tokenizer("gpt4", corpus="")

    def test_unknown_name_raises(self):
        with pytest.raises(ValueError, match="inconnu"):
            create_tokenizer("nonexistent", corpus=SAMPLE_CORPUS)

    def test_registry_has_all_types(self):
        assert "character" in TOKENIZER_REGISTRY
        assert "gpt4" in TOKENIZER_REGISTRY
        assert "claude" in TOKENIZER_REGISTRY

    def test_all_tokenizers_roundtrip(self):
        """Chaque type de tokenizer encode/décode correctement."""
        for name in TOKENIZER_REGISTRY:
            tok = create_tokenizer(name, corpus=SAMPLE_CORPUS)
            encoded = tok.encode("Le chat")
            decoded = tok.decode(encoded)
            assert decoded == "Le chat", f"Roundtrip failed for {name}"

    def test_vocab_sizes_differ(self):
        """BPE a un vocab plus petit que caractère pour le même corpus."""
        char_tok = create_tokenizer("character", corpus=SAMPLE_CORPUS)
        bpe_tok = create_tokenizer("gpt4", corpus=SAMPLE_CORPUS)
        # BPE regroupe les caractères en sous-mots => moins d'entrées vocab
        assert bpe_tok.vocab_size <= char_tok.vocab_size
