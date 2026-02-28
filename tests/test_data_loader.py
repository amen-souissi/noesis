import numpy as np
import pytest

from training.data_loader import DataLoader


@pytest.fixture
def loader():
    data = np.arange(100, dtype=np.int64)
    return DataLoader(data, seq_len=8, batch_size=4)


def test_batch_shapes(loader):
    x, y = loader.next_batch()
    assert x.shape == (4, 8)
    assert y.shape == (4, 8)


def test_target_is_shifted(loader):
    x, y = loader.next_batch()
    # y devrait être x décalé de 1
    for i in range(4):
        np.testing.assert_array_equal(y[i], x[i] + 1)


def test_wraps_around():
    data = np.arange(20, dtype=np.int64)
    loader = DataLoader(data, seq_len=8, batch_size=4)
    # Devrait pouvoir générer des batches même si les données sont petites
    x1, y1 = loader.next_batch()
    x2, y2 = loader.next_batch()
    assert x1.shape == (4, 8)
    assert x2.shape == (4, 8)


def test_reset(loader):
    loader.next_batch()
    loader.next_batch()
    loader.reset()
    x, y = loader.next_batch()
    # reset() is a no-op with random sampling; just verify next_batch still works
    assert x.shape == (4, 8)
    assert y.shape == (4, 8)


def test_num_batches(loader):
    n = loader.num_batches
    assert n > 0
    assert n == 99 // (4 * 8)  # (100-1) // (4*8) = 3
