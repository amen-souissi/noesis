import numpy as np

from config import Config
from modules.loss import CrossEntropyLoss
from modules.transformer_model import TransformerModel
from optim.adam import Adam


def test_adam_reduces_loss():
    np.random.seed(42)
    config = Config(d_model=8, n_heads=2, n_layers=1, d_ff=32, seq_len=8, vocab_size=5, seed=42)
    model = TransformerModel(config)
    loss_fn = CrossEntropyLoss()
    optimizer = Adam(model.all_modules(), lr=0.01)

    x = np.random.randint(0, 5, (2, 8))
    targets = np.random.randint(0, 5, (2, 8))

    logits = model.forward(x)
    loss_before = loss_fn.forward(logits, targets)
    grad = loss_fn.backward()
    model.backward(grad)
    optimizer.step()
    optimizer.zero_grad()

    logits = model.forward(x)
    loss_after = loss_fn.forward(logits, targets)

    assert loss_after < loss_before, f"Loss should decrease: {loss_before:.4f} -> {loss_after:.4f}"


def test_adam_converges_faster_than_sgd():
    """Adam devrait converger plus vite que SGD sur quelques steps."""
    from optim.sgd import SGD

    np.random.seed(42)
    x = np.random.randint(0, 5, (4, 8))
    targets = np.random.randint(0, 5, (4, 8))

    def train_n_steps(optimizer_cls, lr, n_steps):
        np.random.seed(42)
        config = Config(d_model=8, n_heads=2, n_layers=1, d_ff=32, seq_len=8, vocab_size=5, seed=42)
        model = TransformerModel(config)
        loss_fn = CrossEntropyLoss()
        optimizer = optimizer_cls(model.all_modules(), lr=lr)
        losses = []
        for _ in range(n_steps):
            logits = model.forward(x)
            loss = loss_fn.forward(logits, targets)
            losses.append(loss)
            grad = loss_fn.backward()
            model.backward(grad)
            optimizer.step()
            optimizer.zero_grad()
        return losses

    adam_losses = train_n_steps(Adam, 0.001, 20)
    sgd_losses = train_n_steps(SGD, 0.001, 20)

    # Adam devrait avoir un loss final plus bas
    assert adam_losses[-1] < sgd_losses[-1], (
        f"Adam final loss ({adam_losses[-1]:.4f}) should be < SGD final loss ({sgd_losses[-1]:.4f})"
    )
