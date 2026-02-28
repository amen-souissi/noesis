"""Tests pour CharTokenizer — tokenizer par caractère."""

import pytest

from modules.tokenizers.base import BaseTokenizer
from modules.tokenizers.char_tokenizer import CharTokenizer


class TestCharTokenizer:
    def test_inherits_base(self):
        tok = CharTokenizer("abc")
        assert isinstance(tok, BaseTokenizer)

    def test_vocab_size(self):
        tok = CharTokenizer("hello")
        assert tok.vocab_size == 6  # h, e, l, o (+2 BOS/EOS)

    def test_encode_decode_roundtrip(self):
        text = "Le chat mange du poisson."
        tok = CharTokenizer(text)
        encoded = tok.encode(text)
        decoded = tok.decode(encoded)
        assert decoded == text

    def test_deterministic_encoding(self):
        """Deux instances avec le même texte donnent les mêmes IDs."""
        text = "abcabc"
        tok1 = CharTokenizer(text)
        tok2 = CharTokenizer(text)
        assert tok1.encode("abc") == tok2.encode("abc")

    def test_sorted_vocab(self):
        """Le vocabulaire est trié alphabétiquement."""
        tok = CharTokenizer("cba")
        assert tok.encode("abc") == [0, 1, 2]

    def test_unknown_char_raises(self):
        """Encoder un caractère hors vocabulaire lève KeyError."""
        tok = CharTokenizer("abc")
        with pytest.raises(KeyError):
            tok.encode("d")

    def test_name_property(self):
        tok = CharTokenizer("abc")
        assert tok.name == "CharTokenizer"

    def test_empty_text(self):
        tok = CharTokenizer("")
        assert tok.vocab_size == 2  # only BOS/EOS

    def test_bos_eos_ids(self):
        """BOS/EOS sont les deux derniers IDs du vocabulaire."""
        tok = CharTokenizer("abc")
        assert tok.bos_id == tok.vocab_size - 2
        assert tok.eos_id == tok.vocab_size - 1
        assert tok.bos_id == 3  # 3 chars (a,b,c) → bos=3, eos=4
        assert tok.eos_id == 4

    def test_decode_filters_special_tokens(self):
        """decode() ignore les IDs BOS/EOS."""
        tok = CharTokenizer("abc")
        ids = [tok.bos_id, 0, 1, 2, tok.eos_id]  # BOS a b c EOS
        assert tok.decode(ids) == "abc"
