"""Tests pour les stratégies d'échantillonnage."""

import numpy as np
import pytest

from generation.sampling import (
    greedy,
    sample_token,
    temperature_sample,
    top_k_sample,
    top_p_sample,
)


class TestGreedy:
    def test_selects_max(self):
        logits = np.array([1.0, 3.0, 2.0, 0.5])
        assert greedy(logits) == 1

    def test_deterministic(self):
        logits = np.array([0.1, 0.9, 0.5])
        results = [greedy(logits) for _ in range(10)]
        assert all(r == 1 for r in results)

    def test_negative_logits(self):
        logits = np.array([-1.0, -0.5, -3.0])
        assert greedy(logits) == 1


class TestTemperatureSample:
    def test_low_temperature_converges(self):
        """Très basse température se comporte comme greedy."""
        logits = np.array([1.0, 5.0, 2.0])
        np.random.seed(42)
        results = [temperature_sample(logits, temperature=0.01) for _ in range(20)]
        assert all(r == 1 for r in results)

    def test_returns_valid_index(self):
        logits = np.array([1.0, 2.0, 3.0, 4.0])
        np.random.seed(42)
        for _ in range(50):
            idx = temperature_sample(logits, temperature=1.0)
            assert 0 <= idx < len(logits)


class TestTopKSample:
    def test_respects_k(self):
        """Seuls les top-k tokens sont candidats."""
        logits = np.array([0.0, 0.0, 10.0, 0.0, 9.0])
        np.random.seed(42)
        results = set()
        for _ in range(100):
            results.add(top_k_sample(logits, k=2, temperature=0.5))
        # Seuls les indices 2 et 4 devraient apparaître
        assert results.issubset({2, 4})

    def test_k_larger_than_vocab(self):
        """k > vocab_size ne pose pas de problème."""
        logits = np.array([1.0, 2.0])
        np.random.seed(42)
        idx = top_k_sample(logits, k=100, temperature=1.0)
        assert 0 <= idx < 2

    def test_returns_valid_index(self):
        logits = np.array([1.0, 2.0, 3.0])
        np.random.seed(42)
        for _ in range(50):
            idx = top_k_sample(logits, k=2, temperature=1.0)
            assert 0 <= idx < len(logits)


class TestTopPSample:
    def test_returns_valid_index(self):
        logits = np.array([1.0, 2.0, 3.0, 4.0])
        np.random.seed(42)
        for _ in range(50):
            idx = top_p_sample(logits, p=0.9, temperature=1.0)
            assert 0 <= idx < len(logits)

    def test_low_p_restricts_tokens(self):
        """Un p très bas devrait surtout retourner le token dominant."""
        logits = np.array([0.0, 0.0, 10.0, 0.0])
        np.random.seed(42)
        results = [top_p_sample(logits, p=0.1, temperature=0.5) for _ in range(20)]
        assert all(r == 2 for r in results)


class TestSampleToken:
    def test_dispatch_greedy(self):
        logits = np.array([1.0, 3.0, 2.0])
        assert sample_token(logits, strategy="greedy") == 1

    def test_dispatch_temperature(self):
        logits = np.array([1.0, 3.0, 2.0])
        np.random.seed(42)
        idx = sample_token(logits, strategy="temperature", temperature=1.0)
        assert 0 <= idx < 3

    def test_dispatch_top_k(self):
        logits = np.array([1.0, 3.0, 2.0])
        np.random.seed(42)
        idx = sample_token(logits, strategy="top_k", top_k=2, temperature=1.0)
        assert 0 <= idx < 3

    def test_dispatch_top_p(self):
        logits = np.array([1.0, 3.0, 2.0])
        np.random.seed(42)
        idx = sample_token(logits, strategy="top_p", top_p=0.9, temperature=1.0)
        assert 0 <= idx < 3

    def test_unknown_strategy_raises(self):
        logits = np.array([1.0, 2.0])
        with pytest.raises(ValueError, match="inconnue"):
            sample_token(logits, strategy="nonexistent")
