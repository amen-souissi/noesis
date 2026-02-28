import pytest

from modules.tokenizer import CharTokenizer


@pytest.fixture
def tok():
    return CharTokenizer("le chat mange")


def test_vocab_contains_all_chars(tok):
    expected = sorted(set("le chat mange"))
    assert tok.vocab_size == len(expected) + 2  # +2 for BOS/EOS
    for ch in expected:
        assert ch in tok.char_to_idx


def test_encode_decode_roundtrip(tok):
    text = "le chat mange"
    assert tok.decode(tok.encode(text)) == text


def test_encode_returns_integers(tok):
    ids = tok.encode("le")
    assert all(isinstance(i, int) for i in ids)


def test_vocab_size(tok):
    assert tok.vocab_size == len(set("le chat mange")) + 2  # +2 for BOS/EOS


def test_deterministic():
    t1 = CharTokenizer("abc")
    t2 = CharTokenizer("abc")
    assert t1.encode("abc") == t2.encode("abc")


def test_single_char():
    tok = CharTokenizer("a")
    assert tok.vocab_size == 3  # 1 char + BOS + EOS
    assert tok.encode("a") == [0]
    assert tok.decode([0]) == "a"


def test_empty_encode(tok):
    assert tok.encode("") == []
    assert tok.decode([]) == ""
