import numpy as np

from config import Config
from modules.loss import CrossEntropyLoss
from modules.tokenizer import CharTokenizer
from modules.transformer_model import TransformerModel
from optim.adam import Adam
from training.data_loader import DataLoader
from training.trainer import Trainer


def test_training_reduces_loss():
    np.random.seed(42)
    text = "abcabcabcabc" * 20
    tokenizer = CharTokenizer(text)

    config = Config(
        d_model=16,
        n_heads=2,
        n_layers=1,
        d_ff=64,
        seq_len=8,
        vocab_size=tokenizer.vocab_size,
        batch_size=4,
        seed=42,
        log_every=100,
    )

    data = np.array(tokenizer.encode(text), dtype=np.int64)
    model = TransformerModel(config)
    loss_fn = CrossEntropyLoss()
    optimizer = Adam(model.all_modules(), lr=0.01)
    data_loader = DataLoader(data, config.seq_len, config.batch_size)

    trainer = Trainer(model, loss_fn, optimizer, data_loader, config)
    losses = trainer.train(num_epochs=20)

    assert losses[-1] < losses[0], f"Loss should decrease: {losses[0]:.4f} -> {losses[-1]:.4f}"


def test_loss_history_length():
    np.random.seed(42)
    text = "hello world " * 50
    tokenizer = CharTokenizer(text)

    config = Config(
        d_model=8,
        n_heads=2,
        n_layers=1,
        d_ff=32,
        seq_len=8,
        vocab_size=tokenizer.vocab_size,
        batch_size=2,
        seed=42,
        log_every=100,
    )

    data = np.array(tokenizer.encode(text), dtype=np.int64)
    model = TransformerModel(config)
    loss_fn = CrossEntropyLoss()
    optimizer = Adam(model.all_modules(), lr=0.01)
    data_loader = DataLoader(data, config.seq_len, config.batch_size)

    trainer = Trainer(model, loss_fn, optimizer, data_loader, config)
    losses = trainer.train(num_epochs=5)

    assert len(losses) == 5
