import numpy as np
import pytest

from modules.feedforward import FeedForward
from tests.helpers import numerical_gradient_check


@pytest.fixture
def ffn():
    np.random.seed(42)
    return FeedForward(d_model=8, d_ff=32)


def test_output_shape(ffn):
    x = np.random.randn(2, 5, 8)
    out = ffn.forward(x)
    assert out.shape == (2, 5, 8)


def test_relu_no_negative_intermediate(ffn):
    x = np.random.randn(2, 5, 8)
    ffn.forward(x)
    # After ReLU, the mask should have both True and False
    assert ffn._relu_mask.any()
    assert not ffn._relu_mask.all()


def test_backward_shape(ffn):
    x = np.random.randn(2, 3, 8)
    ffn.forward(x)
    grad = np.random.randn(2, 3, 8)
    dx = ffn.backward(grad)
    assert dx.shape == (2, 3, 8)


def test_parameter_count(ffn):
    total = sum(p.size for p in ffn.parameters.values())
    # W1: 8*32=256, b1: 32, W2: 32*8=256, b2: 8 = 552
    assert total == 8 * 32 + 32 + 32 * 8 + 8


def test_numerical_gradient_linear1_W():
    np.random.seed(0)
    ffn = FeedForward(d_model=4, d_ff=8)
    x = np.random.randn(2, 3, 4)

    def loss_fn():
        return np.sum(ffn.forward(x) ** 2)

    out = ffn.forward(x)
    grad = 2 * out
    ffn.backward(grad)

    err = numerical_gradient_check(ffn.linear1.W, ffn.linear1.gradients["W"], loss_fn)
    assert err < 1e-5, f"linear1.W gradient error: {err}"


def test_numerical_gradient_linear2_W():
    np.random.seed(0)
    ffn = FeedForward(d_model=4, d_ff=8)
    x = np.random.randn(2, 3, 4)

    def loss_fn():
        return np.sum(ffn.forward(x) ** 2)

    out = ffn.forward(x)
    grad = 2 * out
    ffn.backward(grad)

    err = numerical_gradient_check(ffn.linear2.W, ffn.linear2.gradients["W"], loss_fn)
    assert err < 1e-5, f"linear2.W gradient error: {err}"
