import numpy as np


class Backprop:
    """Coordinateur du backward pass.

    Orchestre le forward (model + loss) et le backward
    (loss -> model) en une interface simple.
    """

    def __init__(self, model, loss_fn):
        self.model = model
        self.loss_fn = loss_fn

    def forward(self, x: np.ndarray, targets: np.ndarray):
        """Forward pass complet : model + loss.

        Returns:
            (loss, logits)
        """
        logits = self.model.forward(x)
        loss = self.loss_fn.forward(logits, targets)
        return loss, logits

    def backward(self):
        """Backward pass complet : loss -> model."""
        grad = self.loss_fn.backward()
        self.model.backward(grad)

    def zero_grad(self):
        """Remet tous les gradients à zéro."""
        for module in self.model.all_modules():
            for name in module.gradients:
                module.gradients[name] *= 0
