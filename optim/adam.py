import numpy as np


class Adam:
    """Adam optimizer avec correction du biais.

    Maintient des moyennes mobiles exponentielles du gradient (m)
    et du gradient au carré (v), avec correction du biais
    pour les premiers pas.
    """

    def __init__(
        self,
        modules: list,
        lr: float = 1e-3,
        beta1: float = 0.9,
        beta2: float = 0.999,
        eps: float = 1e-8,
        weight_decay: float = 0.0,
    ):
        self.modules = modules
        self.lr = lr
        self.beta1 = beta1
        self.beta2 = beta2
        self.eps = eps
        self.weight_decay = weight_decay
        self.t = 0  # compteur de pas

        # Initialiser les moments à zéro
        self.m = {}  # premier moment
        self.v = {}  # second moment
        for module in modules:
            for name, param in module.parameters.items():
                key = (id(module), name)
                self.m[key] = np.zeros_like(param)
                self.v[key] = np.zeros_like(param)

    def step(self):
        """Met à jour tous les paramètres avec Adam."""
        self.t += 1  # incrémenter AVANT la correction

        for module in self.modules:
            params = module.parameters
            grads = module.gradients
            for name in params:
                key = (id(module), name)
                g = grads[name]

                # Mise à jour des moments
                self.m[key] = self.beta1 * self.m[key] + (1 - self.beta1) * g
                self.v[key] = self.beta2 * self.v[key] + (1 - self.beta2) * g**2

                # Correction du biais
                m_hat = self.m[key] / (1 - self.beta1**self.t)
                v_hat = self.v[key] / (1 - self.beta2**self.t)

                # Weight decay découplé (AdamW)
                if self.weight_decay > 0:
                    params[name] -= self.lr * self.weight_decay * params[name]

                # Mise à jour du paramètre
                params[name] -= self.lr * m_hat / (np.sqrt(v_hat) + self.eps)

    def zero_grad(self):
        """Remet tous les gradients à zéro."""
        for module in self.modules:
            for name in module.gradients:
                module.gradients[name] *= 0
