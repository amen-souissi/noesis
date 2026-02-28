import numpy as np

from autograd.backprop import Backprop
from config import Config
from modules.loss import CrossEntropyLoss
from modules.transformer_model import TransformerModel
from optim.adam import Adam


def test_full_pipeline_loss_decreases():
    """Test end-to-end : forward -> loss -> backward -> step -> loss diminue."""
    np.random.seed(42)
    config = Config(d_model=8, n_heads=2, n_layers=1, d_ff=32, seq_len=8, vocab_size=5, seed=42)
    model = TransformerModel(config)
    loss_fn = CrossEntropyLoss()
    bp = Backprop(model, loss_fn)
    optimizer = Adam(model.all_modules(), lr=0.01)

    x = np.random.randint(0, 5, (2, 8))
    targets = np.random.randint(0, 5, (2, 8))

    # Premier pas
    loss1, _ = bp.forward(x, targets)
    bp.backward()
    optimizer.step()
    bp.zero_grad()

    # Deuxième pas
    loss2, _ = bp.forward(x, targets)

    assert loss2 < loss1, f"Loss should decrease: {loss1:.4f} -> {loss2:.4f}"


def test_zero_grad():
    np.random.seed(42)
    config = Config(d_model=8, n_heads=2, n_layers=1, d_ff=32, seq_len=8, vocab_size=5, seed=42)
    model = TransformerModel(config)
    loss_fn = CrossEntropyLoss()
    bp = Backprop(model, loss_fn)

    x = np.random.randint(0, 5, (1, 4))
    targets = np.random.randint(0, 5, (1, 4))

    bp.forward(x, targets)
    bp.backward()
    bp.zero_grad()

    for mod in model.all_modules():
        for name, g in mod.gradients.items():
            np.testing.assert_array_equal(g, 0)


def test_multiple_steps_converge():
    """Entraînement sur 50 steps devrait réduire significativement le loss."""
    np.random.seed(42)
    config = Config(d_model=8, n_heads=2, n_layers=1, d_ff=32, seq_len=8, vocab_size=5, seed=42)
    model = TransformerModel(config)
    loss_fn = CrossEntropyLoss()
    bp = Backprop(model, loss_fn)
    optimizer = Adam(model.all_modules(), lr=0.01)

    x = np.random.randint(0, 5, (4, 8))
    targets = np.random.randint(0, 5, (4, 8))

    losses = []
    for _ in range(50):
        loss, _ = bp.forward(x, targets)
        losses.append(loss)
        bp.backward()
        optimizer.step()
        bp.zero_grad()

    assert losses[-1] < losses[0] * 0.5, f"Loss should halve: {losses[0]:.4f} -> {losses[-1]:.4f}"
