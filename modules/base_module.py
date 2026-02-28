from abc import ABC, abstractmethod

import numpy as np


class BaseModule(ABC):
    """Classe abstraite pour tous les modules du réseau.

    Chaque module implémente :
    - forward()  : passe avant, cache les entrées pour backward
    - backward() : passe arrière, calcule les gradients
    - parameters : dict {nom: np.ndarray} des poids entraînables
    - gradients  : dict {nom: np.ndarray} des gradients correspondants

    Les propriétés parameters/gradients retournent des REFERENCES
    aux arrays internes (pas des copies), pour que l'optimizer
    puisse les modifier in-place.
    """

    @abstractmethod
    def forward(self, x: np.ndarray, **kwargs) -> np.ndarray:
        pass

    @abstractmethod
    def backward(self, grad_output: np.ndarray) -> np.ndarray:
        pass

    @property
    def parameters(self) -> dict[str, np.ndarray]:
        return {}

    @property
    def gradients(self) -> dict[str, np.ndarray]:
        return {}
