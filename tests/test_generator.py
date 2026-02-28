import numpy as np
import pytest

from config import Config
from generation.generator import Generator
from modules.tokenizer import CharTokenizer
from modules.transformer_model import TransformerModel


@pytest.fixture
def setup():
    np.random.seed(42)
    text = "abcdef" * 50
    tokenizer = CharTokenizer(text)
    config = Config(
        d_model=8,
        n_heads=2,
        n_layers=1,
        d_ff=32,
        seq_len=8,
        vocab_size=tokenizer.vocab_size,
        seed=42,
    )
    model = TransformerModel(config)
    gen = Generator(model, tokenizer, config)
    return gen, tokenizer


def test_output_is_string(setup):
    gen, _ = setup
    result = gen.generate("abc", max_tokens=10)
    assert isinstance(result, str)


def test_starts_with_prompt(setup):
    gen, _ = setup
    result = gen.generate("abc", max_tokens=10)
    assert result.startswith("abc")


def test_respects_max_tokens(setup):
    gen, tok = setup
    prompt = "abc"
    max_tokens = 5
    result = gen.generate(prompt, max_tokens=max_tokens)
    # Le résultat devrait avoir au plus len(prompt) + max_tokens caractères
    # (EOS peut arrêter la génération plus tôt)
    assert len(result) <= len(prompt) + max_tokens


def test_low_temperature_deterministic(setup):
    gen, _ = setup
    np.random.seed(0)
    r1 = gen.generate("abc", max_tokens=20, temperature=0.01)
    np.random.seed(0)
    r2 = gen.generate("abc", max_tokens=20, temperature=0.01)
    assert r1 == r2


def test_all_tokens_valid(setup):
    gen, tok = setup
    result = gen.generate("abc", max_tokens=20)
    # Tous les caractères du résultat doivent être dans le vocabulaire
    # (decode filtre BOS/EOS, donc seuls les chars normaux restent)
    for ch in result:
        assert ch in tok.char_to_idx, f"Character '{ch}' not in vocabulary"
