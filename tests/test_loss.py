import numpy as np
import pytest

from modules.loss import CrossEntropyLoss


@pytest.fixture
def loss_fn():
    return CrossEntropyLoss()


def test_loss_non_negative(loss_fn):
    logits = np.random.randn(2, 4, 10)
    targets = np.random.randint(0, 10, (2, 4))
    loss = loss_fn.forward(logits, targets)
    assert loss >= 0


def test_perfect_prediction_low_loss(loss_fn):
    # Logits très forts pour les bons tokens
    logits = np.full((1, 3, 5), -10.0)
    targets = np.array([[0, 2, 4]])
    for t in range(3):
        logits[0, t, targets[0, t]] = 10.0
    loss = loss_fn.forward(logits, targets)
    assert loss < 0.01


def test_uniform_prediction_loss(loss_fn):
    V = 10
    logits = np.zeros((1, 1, V))  # uniforme
    targets = np.array([[0]])
    loss = loss_fn.forward(logits, targets)
    expected = np.log(V)
    np.testing.assert_almost_equal(loss, expected, decimal=5)


def test_gradient_shape(loss_fn):
    logits = np.random.randn(2, 4, 10)
    targets = np.random.randint(0, 10, (2, 4))
    loss_fn.forward(logits, targets)
    grad = loss_fn.backward()
    assert grad.shape == (2, 4, 10)


def test_gradient_sums_near_zero(loss_fn):
    """La somme du gradient sur l'axe vocab devrait être ~0."""
    logits = np.random.randn(2, 4, 10)
    targets = np.random.randint(0, 10, (2, 4))
    loss_fn.forward(logits, targets)
    grad = loss_fn.backward()
    sums = grad.sum(axis=-1)
    np.testing.assert_array_almost_equal(sums, 0.0, decimal=10)


def test_numerical_gradient():
    np.random.seed(0)
    loss_fn = CrossEntropyLoss()
    logits = np.random.randn(2, 3, 8)
    targets = np.random.randint(0, 8, (2, 3))

    loss_fn.forward(logits, targets)
    analytical = loss_fn.backward()

    # Finite differences
    numerical = np.zeros_like(logits)
    eps = 1e-5
    it = np.nditer(logits, flags=["multi_index"])
    while not it.finished:
        idx = it.multi_index
        old = logits[idx]
        logits[idx] = old + eps
        lp = loss_fn.forward(logits, targets)
        logits[idx] = old - eps
        lm = loss_fn.forward(logits, targets)
        logits[idx] = old
        numerical[idx] = (lp - lm) / (2 * eps)
        it.iternext()

    denom = np.maximum(np.abs(analytical) + np.abs(numerical), 1e-8)
    err = float(np.max(np.abs(analytical - numerical) / denom))
    assert err < 1e-5, f"Numerical gradient error: {err}"


def test_numerical_stability(loss_fn):
    """Pas de NaN même avec de très grands logits."""
    logits = np.random.randn(1, 2, 5) * 1000
    targets = np.array([[0, 1]])
    loss = loss_fn.forward(logits, targets)
    assert np.isfinite(loss)
    grad = loss_fn.backward()
    assert np.all(np.isfinite(grad))
