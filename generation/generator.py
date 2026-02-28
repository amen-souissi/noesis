import numpy as np

from config import Config
from generation.sampling import sample_token
from modules.tokenizers.base import BaseTokenizer


class Generator:
    """Générateur de texte autorégressif.

    À chaque pas :
    1. Forward sur la séquence courante
    2. Prendre les logits du dernier token
    3. Échantillonner le prochain token (stratégie configurable)
    4. Ajouter à la séquence et recommencer
    """

    def __init__(self, model, tokenizer: BaseTokenizer, config: Config):
        self.model = model
        self.tokenizer = tokenizer
        self.config = config

    def generate(
        self,
        prompt: str,
        max_tokens: int = None,
        temperature: float = None,
        sampling_strategy: str = None,
        top_k: int = None,
        top_p: float = None,
    ) -> str:
        """Génère du texte à partir d'un prompt.

        Args:
            prompt: texte de départ
            max_tokens: nombre max de tokens à générer
            temperature: 0.1 (conservateur) à 1.5 (créatif)
            sampling_strategy: 'greedy', 'temperature', 'top_k', 'top_p'
            top_k: nombre de tokens candidats pour top_k
            top_p: seuil de probabilité cumulée pour top_p
        Returns:
            texte complet (prompt + texte généré)
        """
        if max_tokens is None:
            max_tokens = self.config.max_gen_len
        if temperature is None:
            temperature = self.config.temperature
        if sampling_strategy is None:
            sampling_strategy = getattr(self.config, "sampling_strategy", "temperature")
        if top_k is None:
            top_k = getattr(self.config, "top_k", 10)
        if top_p is None:
            top_p = getattr(self.config, "top_p", 0.9)

        tokens = [self.tokenizer.bos_id] + self.tokenizer.encode(prompt)

        for _ in range(max_tokens):
            context = tokens[-self.config.seq_len :]
            x = np.array([context])
            logits = self.model.forward(x)
            next_logits = logits[0, -1, :]

            next_token = sample_token(
                next_logits,
                strategy=sampling_strategy,
                temperature=temperature,
                top_k=top_k,
                top_p=top_p,
            )
            if next_token == self.tokenizer.eos_id:
                break
            tokens.append(next_token)

        return self.tokenizer.decode(tokens)
