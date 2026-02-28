import numpy as np
import pytest

from modules.attention import MultiHeadAttention
from tests.helpers import numerical_gradient_check


@pytest.fixture
def attn():
    np.random.seed(42)
    return MultiHeadAttention(d_model=8, n_heads=2)


def test_output_shape(attn):
    x = np.random.randn(2, 5, 8)
    out = attn.forward(x)
    assert out.shape == (2, 5, 8)


def test_causal_mask(attn):
    x = np.random.randn(1, 4, 8)
    attn.forward(x)
    weights = attn.get_attention_weights()  # (1, 2, 4, 4)
    # Future positions should have zero attention weight
    for t in range(4):
        for t2 in range(t + 1, 4):
            np.testing.assert_almost_equal(
                weights[0, :, t, t2],
                0.0,
                err_msg=f"Position {t} should not attend to future position {t2}",
            )


def test_attention_weights_sum_to_one(attn):
    x = np.random.randn(2, 6, 8)
    attn.forward(x)
    weights = attn.get_attention_weights()
    row_sums = weights.sum(axis=-1)
    np.testing.assert_array_almost_equal(row_sums, 1.0)


def test_single_head():
    np.random.seed(42)
    attn = MultiHeadAttention(d_model=8, n_heads=1)
    x = np.random.randn(1, 4, 8)
    out = attn.forward(x)
    assert out.shape == (1, 4, 8)
    weights = attn.get_attention_weights()
    assert weights.shape == (1, 1, 4, 4)


def test_backward_shape(attn):
    x = np.random.randn(2, 4, 8)
    attn.forward(x)
    grad = np.random.randn(2, 4, 8)
    dx = attn.backward(grad)
    assert dx.shape == (2, 4, 8)


def test_numerical_gradient_W_o():
    """Test gradient pour W_o (le plus simple à vérifier)."""
    np.random.seed(0)
    attn = MultiHeadAttention(d_model=8, n_heads=2)
    x = np.random.randn(2, 4, 8)

    def loss_fn():
        return np.sum(attn.forward(x) ** 2)

    out = attn.forward(x)
    grad = 2 * out
    attn.backward(grad)

    err = numerical_gradient_check(attn.W_o.W, attn.W_o.gradients["W"], loss_fn)
    assert err < 1e-5, f"W_o gradient error: {err}"


def test_numerical_gradient_W_q():
    np.random.seed(0)
    attn = MultiHeadAttention(d_model=8, n_heads=2)
    x = np.random.randn(2, 4, 8)

    def loss_fn():
        return np.sum(attn.forward(x) ** 2)

    out = attn.forward(x)
    grad = 2 * out
    attn.backward(grad)

    err = numerical_gradient_check(attn.W_q.W, attn.W_q.gradients["W"], loss_fn)
    assert err < 1e-5, f"W_q gradient error: {err}"


def test_numerical_gradient_W_k():
    np.random.seed(0)
    attn = MultiHeadAttention(d_model=8, n_heads=2)
    x = np.random.randn(2, 4, 8)

    def loss_fn():
        return np.sum(attn.forward(x) ** 2)

    out = attn.forward(x)
    grad = 2 * out
    attn.backward(grad)

    err = numerical_gradient_check(attn.W_k.W, attn.W_k.gradients["W"], loss_fn)
    assert err < 1e-5, f"W_k gradient error: {err}"


def test_numerical_gradient_W_v():
    np.random.seed(0)
    attn = MultiHeadAttention(d_model=8, n_heads=2)
    x = np.random.randn(2, 4, 8)

    def loss_fn():
        return np.sum(attn.forward(x) ** 2)

    out = attn.forward(x)
    grad = 2 * out
    attn.backward(grad)

    err = numerical_gradient_check(attn.W_v.W, attn.W_v.gradients["W"], loss_fn)
    assert err < 1e-5, f"W_v gradient error: {err}"
