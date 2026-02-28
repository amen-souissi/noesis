class SGD:
    """Stochastic Gradient Descent.

    La règle la plus simple : param -= lr * grad
    """

    def __init__(self, modules: list, lr: float = 1e-3):
        self.modules = modules
        self.lr = lr

    def step(self):
        """Met à jour tous les paramètres."""
        for module in self.modules:
            params = module.parameters
            grads = module.gradients
            for name in params:
                params[name] -= self.lr * grads[name]

    def zero_grad(self):
        """Remet tous les gradients à zéro."""
        for module in self.modules:
            for name in module.gradients:
                module.gradients[name] *= 0
