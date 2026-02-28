import numpy as np
import pytest

from modules.transformer_block import TransformerBlock


@pytest.fixture
def block():
    np.random.seed(42)
    return TransformerBlock(d_model=8, n_heads=2, d_ff=32)


def test_output_shape(block):
    x = np.random.randn(2, 4, 8)
    out = block.forward(x)
    assert out.shape == (2, 4, 8)


def test_backward_shape(block):
    x = np.random.randn(2, 4, 8)
    block.forward(x)
    grad = np.random.randn(2, 4, 8)
    dx = block.backward(grad)
    assert dx.shape == (2, 4, 8)


def test_residual_connection(block):
    """Avec un input, la sortie devrait être différente de l'input
    mais la connexion résiduelle garantit qu'elle n'est pas radicalement
    différente pour de petits poids."""
    x = np.random.randn(1, 4, 8) * 10
    out = block.forward(x)
    # La corrélation devrait être forte grâce aux résiduels
    corr = np.corrcoef(x.ravel(), out.ravel())[0, 1]
    assert corr > 0.5, f"Residual correlation too low: {corr}"


def test_stackable():
    np.random.seed(42)
    block1 = TransformerBlock(d_model=8, n_heads=2, d_ff=32)
    block2 = TransformerBlock(d_model=8, n_heads=2, d_ff=32)
    x = np.random.randn(2, 4, 8)
    out = block1.forward(x)
    out = block2.forward(out)
    assert out.shape == (2, 4, 8)


def test_has_parameters(block):
    params = block.parameters
    assert len(params) > 0
    # Should have ln1, attention, ln2, ffn parameters
    assert any("ln1" in k for k in params)
    assert any("attn" in k for k in params)
    assert any("ln2" in k for k in params)
    assert any("ffn" in k for k in params)


def test_gradients_populated_after_backward(block):
    x = np.random.randn(2, 4, 8)
    block.forward(x)
    grad = np.random.randn(2, 4, 8)
    block.backward(grad)
    grads = block.gradients
    assert len(grads) > 0
    for name, g in grads.items():
        assert g is not None, f"Gradient {name} is None"
