import numpy as np

from config import Config
from modules.loss import CrossEntropyLoss
from modules.transformer_model import TransformerModel
from optim.sgd import SGD


def test_sgd_reduces_loss():
    np.random.seed(42)
    config = Config(d_model=8, n_heads=2, n_layers=1, d_ff=32, seq_len=8, vocab_size=5, seed=42)
    model = TransformerModel(config)
    loss_fn = CrossEntropyLoss()
    optimizer = SGD(model.all_modules(), lr=0.01)

    x = np.random.randint(0, 5, (2, 8))
    targets = np.random.randint(0, 5, (2, 8))

    # Mesurer le loss initial
    logits = model.forward(x)
    loss_before = loss_fn.forward(logits, targets)

    # Un pas d'optimisation
    loss_fn.backward()
    model.backward(loss_fn.backward())

    # Refaire forward+backward proprement
    logits = model.forward(x)
    loss_before = loss_fn.forward(logits, targets)
    grad = loss_fn.backward()
    model.backward(grad)
    optimizer.step()
    optimizer.zero_grad()

    # Mesurer le loss après
    logits = model.forward(x)
    loss_after = loss_fn.forward(logits, targets)

    assert loss_after < loss_before, f"Loss should decrease: {loss_before:.4f} -> {loss_after:.4f}"


def test_zero_grad():
    np.random.seed(42)
    config = Config(d_model=8, n_heads=2, n_layers=1, d_ff=32, seq_len=8, vocab_size=5, seed=42)
    model = TransformerModel(config)
    optimizer = SGD(model.all_modules(), lr=0.01)

    # Faire un backward pour créer des gradients
    x = np.random.randint(0, 5, (1, 4))
    logits = model.forward(x)
    grad = np.ones_like(logits)
    model.backward(grad)

    # Vérifier que des gradients existent
    has_nonzero = False
    for mod in model.all_modules():
        for g in mod.gradients.values():
            if np.any(g != 0):
                has_nonzero = True
    assert has_nonzero

    # Zero grad
    optimizer.zero_grad()

    for mod in model.all_modules():
        for name, g in mod.gradients.items():
            np.testing.assert_array_equal(g, 0, err_msg=f"{name} not zeroed")
