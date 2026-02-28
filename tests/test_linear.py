import numpy as np
import pytest

from modules.linear import Linear
from tests.helpers import numerical_gradient_check


@pytest.fixture
def linear():
    np.random.seed(42)
    return Linear(d_in=8, d_out=4)


def test_output_shape(linear):
    x = np.random.randn(2, 5, 8)  # (B, T, d_in)
    out = linear.forward(x)
    assert out.shape == (2, 5, 4)


def test_manual_computation(linear):
    x = np.random.randn(1, 1, 8)
    out = linear.forward(x)
    expected = x[0, 0] @ linear.W + linear.b
    np.testing.assert_array_almost_equal(out[0, 0], expected)


def test_no_bias():
    lin = Linear(d_in=4, d_out=3, bias=False)
    x = np.zeros((1, 1, 4))
    out = lin.forward(x)
    np.testing.assert_array_almost_equal(out, 0.0)
    assert "b" not in lin.parameters


def test_backward_shapes(linear):
    x = np.random.randn(2, 3, 8)
    linear.forward(x)
    grad = np.random.randn(2, 3, 4)
    dx = linear.backward(grad)
    assert dx.shape == (2, 3, 8)
    assert linear.gradients["W"].shape == (8, 4)
    assert linear.gradients["b"].shape == (4,)


def test_numerical_gradient_W():
    np.random.seed(0)
    lin = Linear(d_in=4, d_out=3)
    x = np.random.randn(2, 3, 4)

    def loss_fn():
        return np.sum(lin.forward(x) ** 2)

    out = lin.forward(x)
    grad = 2 * out
    lin.backward(grad)

    err = numerical_gradient_check(lin.W, lin.gradients["W"], loss_fn)
    assert err < 1e-5, f"W gradient error: {err}"


def test_numerical_gradient_b():
    np.random.seed(0)
    lin = Linear(d_in=4, d_out=3)
    x = np.random.randn(2, 3, 4)

    def loss_fn():
        return np.sum(lin.forward(x) ** 2)

    out = lin.forward(x)
    grad = 2 * out
    lin.backward(grad)

    err = numerical_gradient_check(lin.b, lin.gradients["b"], loss_fn)
    assert err < 1e-5, f"b gradient error: {err}"
