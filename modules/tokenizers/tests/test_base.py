"""Tests pour BaseTokenizer — vérification de l'interface abstraite."""

import pytest

from modules.tokenizers.base import BaseTokenizer


def test_cannot_instantiate_base():
    """BaseTokenizer ne peut pas être instancié directement."""
    with pytest.raises(TypeError):
        BaseTokenizer()


def test_subclass_must_implement_all_methods():
    """Une sous-classe incomplète lève TypeError."""

    class IncompleteTokenizer(BaseTokenizer):
        def encode(self, text):
            return []

    with pytest.raises(TypeError):
        IncompleteTokenizer()


def test_complete_subclass_works():
    """Une sous-classe complète peut être instanciée."""

    class DummyTokenizer(BaseTokenizer):
        def encode(self, text):
            return [ord(c) for c in text]

        def decode(self, indices):
            return "".join(chr(i) for i in indices)

        @property
        def vocab_size(self):
            return 256

    tok = DummyTokenizer()
    assert tok.vocab_size == 256
    assert tok.name == "DummyTokenizer"
    assert tok.encode("ab") == [97, 98]
    assert tok.decode([97, 98]) == "ab"
