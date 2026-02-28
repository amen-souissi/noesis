import numpy as np
import pytest

from modules.layernorm import LayerNorm
from tests.helpers import numerical_gradient_check


@pytest.fixture
def ln():
    np.random.seed(42)
    return LayerNorm(d_model=8)


def test_output_shape(ln):
    x = np.random.randn(2, 5, 8)
    out = ln.forward(x)
    assert out.shape == x.shape


def test_output_mean_near_zero(ln):
    x = np.random.randn(4, 10, 8) * 100 + 50  # large values
    out = ln.forward(x)
    means = out.mean(axis=-1)
    np.testing.assert_array_almost_equal(means, 0.0, decimal=5)


def test_output_std_near_one(ln):
    x = np.random.randn(4, 10, 8) * 100 + 50
    out = ln.forward(x)
    stds = out.std(axis=-1)
    # LayerNorm uses population variance, so std should be ~1.0
    np.testing.assert_array_almost_equal(stds, 1.0, decimal=4)


def test_backward_shapes(ln):
    x = np.random.randn(2, 3, 8)
    ln.forward(x)
    grad = np.random.randn(2, 3, 8)
    dx = ln.backward(grad)
    assert dx.shape == (2, 3, 8)
    assert ln.gradients["gamma"].shape == (8,)
    assert ln.gradients["beta"].shape == (8,)


def test_numerical_gradient_gamma():
    np.random.seed(0)
    ln = LayerNorm(d_model=6)
    x = np.random.randn(2, 3, 6)

    def loss_fn():
        return np.sum(ln.forward(x) ** 2)

    ln.forward(x)
    grad = 2 * ln.forward(x)
    # Need a fresh forward to get correct cache
    ln.forward(x)
    out = ln.forward(x)
    grad = 2 * out
    ln.backward(grad)

    err = numerical_gradient_check(ln.gamma, ln.gradients["gamma"], loss_fn)
    assert err < 1e-5, f"gamma gradient error: {err}"


def test_numerical_gradient_beta():
    np.random.seed(0)
    ln = LayerNorm(d_model=6)
    x = np.random.randn(2, 3, 6)

    def loss_fn():
        return np.sum(ln.forward(x) ** 2)

    out = ln.forward(x)
    grad = 2 * out
    ln.backward(grad)

    err = numerical_gradient_check(ln.beta, ln.gradients["beta"], loss_fn)
    assert err < 1e-5, f"beta gradient error: {err}"


def test_numerical_gradient_input():
    """Vérifie le gradient par rapport à l'input (pas un paramètre)."""
    np.random.seed(0)
    ln = LayerNorm(d_model=6)
    x = np.random.randn(2, 3, 6)

    out = ln.forward(x)
    grad = 2 * out
    dx = ln.backward(grad)

    # Numerical check on input
    numerical_dx = np.zeros_like(x)
    eps = 1e-5
    it = np.nditer(x, flags=["multi_index"])
    while not it.finished:
        idx = it.multi_index
        old = x[idx]
        x[idx] = old + eps
        lp = np.sum(ln.forward(x) ** 2)
        x[idx] = old - eps
        lm = np.sum(ln.forward(x) ** 2)
        x[idx] = old
        numerical_dx[idx] = (lp - lm) / (2 * eps)
        it.iternext()

    # Restore cache
    ln.forward(x)

    denom = np.maximum(np.abs(dx) + np.abs(numerical_dx), 1e-8)
    err = float(np.max(np.abs(dx - numerical_dx) / denom))
    assert err < 1e-4, f"Input gradient error: {err}"
