"""Learning rate schedulers for training.

Supports:
- constant: fixed lr throughout training
- cosine: cosine annealing from lr_max to 0
- cosine_restarts: cosine annealing with warm restarts (T_mult=2)
"""

import math


class LRScheduler:
    """Base scheduler — constant learning rate."""

    def __init__(self, base_lr: float, total_steps: int):
        self.base_lr = base_lr
        self.total_steps = total_steps
        self._step = 0

    def get_lr(self) -> float:
        return self.base_lr

    def step(self) -> float:
        lr = self.get_lr()
        self._step += 1
        return lr


class CosineScheduler(LRScheduler):
    """Cosine annealing: lr decays from base_lr to 0 over total_steps."""

    def get_lr(self) -> float:
        if self.total_steps <= 1:
            return self.base_lr
        progress = min(self._step / self.total_steps, 1.0)
        return self.base_lr * 0.5 * (1 + math.cos(math.pi * progress))


class CosineRestartsScheduler(LRScheduler):
    """Cosine annealing with warm restarts (SGDR).

    Cycle lengths double after each restart (T_mult=2):
      Cycle 0: T_0 steps
      Cycle 1: 2*T_0 steps
      Cycle 2: 4*T_0 steps
      ...

    T_0 is computed so that all cycles fit within total_steps.
    With T_mult=2 and n_restarts=3: T_0 = total_steps / (1+2+4) ≈ total_steps/7
    """

    def __init__(self, base_lr: float, total_steps: int, n_restarts: int = 3):
        super().__init__(base_lr, total_steps)
        self.n_restarts = n_restarts
        # Compute T_0 so sum of geometric series = total_steps
        # sum = T_0 * (2^n_restarts - 1) for T_mult=2
        divisor = (1 << n_restarts) - 1  # 2^n - 1
        self.t_0 = max(1, total_steps // divisor)

    def get_lr(self) -> float:
        if self.total_steps <= 1:
            return self.base_lr

        # Find which cycle we're in
        step = self._step
        cycle_len = self.t_0
        while step >= cycle_len and cycle_len > 0:
            step -= cycle_len
            cycle_len *= 2

        # Progress within current cycle: 0 → 1
        progress = step / max(cycle_len, 1)
        return self.base_lr * 0.5 * (1 + math.cos(math.pi * progress))


def create_scheduler(schedule_type: str, base_lr: float, total_steps: int) -> LRScheduler:
    """Factory function to create a scheduler from config."""
    if schedule_type == "cosine":
        return CosineScheduler(base_lr, total_steps)
    elif schedule_type == "cosine_restarts":
        return CosineRestartsScheduler(base_lr, total_steps)
    else:
        return LRScheduler(base_lr, total_steps)
