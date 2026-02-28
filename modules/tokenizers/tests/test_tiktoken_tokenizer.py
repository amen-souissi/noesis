"""Tests pour TiktokenTokenizer — découpage BPE avec vocabulaire local."""

import pytest

from modules.tokenizers.base import BaseTokenizer
from modules.tokenizers.tiktoken_tokenizer import TiktokenTokenizer

SAMPLE_CORPUS = "Le chat mange du poisson. Le chien dort dans le jardin."


class TestTiktokenTokenizer:
    def test_inherits_base(self):
        tok = TiktokenTokenizer("cl100k_base", SAMPLE_CORPUS)
        assert isinstance(tok, BaseTokenizer)

    def test_vocab_size_from_corpus(self):
        """Le vocab_size est proportionnel au corpus, pas 100k+ (inclut +2 BOS/EOS)."""
        tok = TiktokenTokenizer("cl100k_base", SAMPLE_CORPUS)
        assert tok.vocab_size > 2  # au moins BOS/EOS + quelques tokens
        assert tok.vocab_size < 102  # petit corpus = petit vocab (+2)

    def test_vocab_size_o200k(self):
        """Les deux encodings construisent un vocab local."""
        tok = TiktokenTokenizer("o200k_base", SAMPLE_CORPUS)
        assert tok.vocab_size > 2
        assert tok.vocab_size < 102

    def test_encode_decode_roundtrip(self):
        tok = TiktokenTokenizer("cl100k_base", SAMPLE_CORPUS)
        text = "Le chat mange du poisson."
        encoded = tok.encode(text)
        decoded = tok.decode(encoded)
        assert decoded == text

    def test_encode_returns_list_of_ints(self):
        tok = TiktokenTokenizer("cl100k_base", SAMPLE_CORPUS)
        encoded = tok.encode("Le chat")
        assert isinstance(encoded, list)
        assert all(isinstance(x, int) for x in encoded)

    def test_subword_tokenization(self):
        """Le découpage BPE produit moins de tokens que le nombre de caractères."""
        tok = TiktokenTokenizer("cl100k_base", SAMPLE_CORPUS)
        text = "Le chat mange du poisson."
        tokens = tok.encode(text)
        assert len(tokens) < len(text)

    def test_unsupported_encoding_raises(self):
        with pytest.raises(ValueError, match="non supporté"):
            TiktokenTokenizer("nonexistent_encoding")

    def test_name_property(self):
        tok = TiktokenTokenizer("cl100k_base", SAMPLE_CORPUS)
        assert "cl100k_base" in tok.name

    def test_empty_corpus(self):
        tok = TiktokenTokenizer("cl100k_base", "")
        assert tok.vocab_size == 2  # only BOS/EOS

    def test_unknown_token_ignored(self):
        """Encoder un sous-mot absent du corpus est ignoré (OOV)."""
        tok = TiktokenTokenizer("cl100k_base", "abc")
        # OOV tokens are skipped, not raising KeyError
        result = tok.encode("xyz")
        assert result == []

    def test_deterministic_encoding(self):
        """Deux instances avec le même corpus donnent les mêmes IDs."""
        tok1 = TiktokenTokenizer("cl100k_base", SAMPLE_CORPUS)
        tok2 = TiktokenTokenizer("cl100k_base", SAMPLE_CORPUS)
        text = "Le chat mange"
        assert tok1.encode(text) == tok2.encode(text)

    def test_different_encodings_may_differ(self):
        """cl100k et o200k peuvent découper différemment."""
        tok1 = TiktokenTokenizer("cl100k_base", SAMPLE_CORPUS)
        tok2 = TiktokenTokenizer("o200k_base", SAMPLE_CORPUS)
        text = "Le chat mange du poisson."
        # Les deux doivent pouvoir encoder/décoder, mais les IDs peuvent différer
        assert tok1.decode(tok1.encode(text)) == text
        assert tok2.decode(tok2.encode(text)) == text
