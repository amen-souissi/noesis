import numpy as np
import pytest

from modules.positional_encoding import PositionalEncoding


@pytest.fixture
def pe():
    return PositionalEncoding(seq_len=32, d_model=16)


def test_output_shape(pe):
    x = np.random.randn(2, 10, 16)
    out = pe.forward(x)
    assert out.shape == x.shape


def test_adds_positional_signal(pe):
    x = np.zeros((1, 5, 16))
    out = pe.forward(x)
    # Output should equal PE since input is zero
    np.testing.assert_array_almost_equal(out[0], pe.pe[:5])


def test_different_positions(pe):
    assert not np.array_equal(pe.pe[0], pe.pe[1])
    assert not np.array_equal(pe.pe[0], pe.pe[5])


def test_deterministic(pe):
    x = np.ones((1, 5, 16))
    out1 = pe.forward(x)
    out2 = pe.forward(x)
    np.testing.assert_array_equal(out1, out2)


def test_values_bounded(pe):
    # sin/cos are in [-1, 1]
    assert np.all(pe.pe >= -1.0)
    assert np.all(pe.pe <= 1.0)


def test_sin_cos_pattern(pe):
    # Position 0: sin(0)=0 for even dims
    np.testing.assert_almost_equal(pe.pe[0, 0], 0.0)
    # Position 0: cos(0)=1 for odd dims
    np.testing.assert_almost_equal(pe.pe[0, 1], 1.0)


def test_backward_passthrough(pe):
    grad = np.random.randn(2, 5, 16)
    out = pe.backward(grad)
    np.testing.assert_array_equal(out, grad)


def test_no_parameters(pe):
    assert pe.parameters == {}
    assert pe.gradients == {}
