import numpy as np
import pytest

from modules.embedding import Embedding
from tests.helpers import numerical_gradient_check


@pytest.fixture
def emb():
    np.random.seed(42)
    return Embedding(vocab_size=10, d_model=8)


def test_output_shape(emb):
    x = np.array([[0, 1, 2, 3], [4, 5, 6, 7]])  # (2, 4)
    out = emb.forward(x)
    assert out.shape == (2, 4, 8)


def test_same_token_same_embedding(emb):
    x = np.array([[2, 2, 2]])
    out = emb.forward(x)
    np.testing.assert_array_equal(out[0, 0], out[0, 1])
    np.testing.assert_array_equal(out[0, 0], out[0, 2])


def test_different_tokens_different_embeddings(emb):
    x = np.array([[0, 1]])
    out = emb.forward(x)
    assert not np.array_equal(out[0, 0], out[0, 1])


def test_lookup_matches_weight(emb):
    x = np.array([[3, 7]])
    out = emb.forward(x)
    np.testing.assert_array_equal(out[0, 0], emb.W[3])
    np.testing.assert_array_equal(out[0, 1], emb.W[7])


def test_backward_gradient_shape(emb):
    x = np.array([[0, 1, 2]])
    emb.forward(x)
    grad = np.random.randn(1, 3, 8)
    emb.backward(grad)
    assert emb.gradients["W"].shape == emb.W.shape


def test_backward_only_used_rows(emb):
    x = np.array([[0, 2]])
    emb.forward(x)
    grad = np.ones((1, 2, 8))
    emb.backward(grad)
    # Only rows 0 and 2 should have nonzero gradients
    for i in range(10):
        if i in (0, 2):
            assert np.any(emb.gradients["W"][i] != 0)
        else:
            np.testing.assert_array_equal(emb.gradients["W"][i], 0)


def test_backward_duplicate_indices(emb):
    """np.add.at doit accumuler correctement les indices dupliqués."""
    x = np.array([[1, 1, 1]])
    emb.forward(x)
    grad = np.ones((1, 3, 8))
    emb.backward(grad)
    np.testing.assert_array_almost_equal(emb.gradients["W"][1], np.full(8, 3.0))


def test_numerical_gradient(emb):
    np.random.seed(0)
    x = np.array([[0, 1, 2, 3]])

    def loss_fn():
        out = emb.forward(x)
        return np.sum(out**2)

    out = emb.forward(x)
    grad = 2 * out  # d/dx (x^2) = 2x
    emb.backward(grad)

    err = numerical_gradient_check(emb.W, emb.gradients["W"], loss_fn)
    assert err < 1e-5, f"Numerical gradient error: {err}"
