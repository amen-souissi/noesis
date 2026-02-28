import numpy as np


def softmax(x: np.ndarray, axis: int = -1) -> np.ndarray:
    """Softmax numériquement stable.

    Soustrait le max avant l'exponentielle pour éviter les overflow.
    """
    x_max = np.max(x, axis=axis, keepdims=True)
    exp_x = np.exp(x - x_max)
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)
