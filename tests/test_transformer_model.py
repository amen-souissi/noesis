import numpy as np
import pytest

from config import Config
from modules.transformer_model import TransformerModel


@pytest.fixture
def model():
    np.random.seed(42)
    config = Config(d_model=8, n_heads=2, n_layers=2, d_ff=32, seq_len=16, vocab_size=10, seed=42)
    return TransformerModel(config)


def test_forward_shape(model):
    x = np.array([[0, 1, 2, 3, 4]])  # (1, 5)
    logits = model.forward(x)
    assert logits.shape == (1, 5, 10)  # (B, T, vocab_size)


def test_forward_batch(model):
    x = np.array([[0, 1, 2, 3], [4, 5, 6, 7]])  # (2, 4)
    logits = model.forward(x)
    assert logits.shape == (2, 4, 10)


def test_backward_populates_all_gradients(model):
    x = np.array([[0, 1, 2, 3]])
    logits = model.forward(x)
    grad = np.random.randn(*logits.shape)
    model.backward(grad)

    for mod in model.all_modules():
        for name, g in mod.gradients.items():
            assert g is not None, f"Gradient is None for {name}"
            assert not np.all(g == 0), f"Gradient is all zeros for {name}"


def test_parameter_count(model):
    count = model.count_parameters()
    assert count > 0
    # With d_model=8, n_heads=2, d_ff=32, vocab=10, 2 layers:
    # Embedding: 10*8 = 80
    # Per block: 4*(8*8) + 2*(8+8) + 8*32+32+32*8+8 = 256 + 32 + 552 = 840
    # 2 blocks: 1680
    # Final LN: 16
    # Output head: 8*10 = 80
    # Total: ~1856
    assert count > 1000


def test_all_modules_list(model):
    modules = model.all_modules()
    # embedding + (ln1, attn, ln2, ffn) * 2 + final_ln + output_head
    assert len(modules) == 1 + 4 * 2 + 1 + 1  # = 11
