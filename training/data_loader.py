import numpy as np


class DataLoader:
    """Prépare des batches (input, target) pour le next-token prediction.

    Pour chaque séquence, target = input décalé de 1 position :
        input:  [l, e, _, c, h, a]
        target: [e, _, c, h, a, t]

    Utilise du random sampling : chaque batch pioche des fenêtres
    aléatoires dans le corpus pour une meilleure couverture des données,
    surtout sur les petits corpus.
    """

    def __init__(self, data: np.ndarray, seq_len: int, batch_size: int):
        """
        Args:
            data: tableau 1D d'entiers (le corpus entier tokenisé)
            seq_len: longueur de chaque séquence
            batch_size: nombre de séquences par batch
        """
        self.data = data
        self.seq_len = seq_len
        self.batch_size = batch_size

    def next_batch(self) -> tuple[np.ndarray, np.ndarray]:
        """Retourne un batch (x, y) de shape (batch_size, seq_len).

        Chaque séquence commence à une position aléatoire dans le corpus.
        Cela garantit une couverture uniforme des données, même pour
        les petits corpus.
        """
        B, T = self.batch_size, self.seq_len
        x = np.zeros((B, T), dtype=np.int64)
        y = np.zeros((B, T), dtype=np.int64)

        n = len(self.data)
        if n < T + 1:
            # Corpus plus petit qu'une séquence — utiliser ce qu'on a
            usable = n - 1
            for i in range(B):
                x[i, :usable] = self.data[:usable]
                y[i, :usable] = self.data[1:n]
            return x, y

        for i in range(B):
            pos = np.random.randint(0, n - T)
            x[i] = self.data[pos : pos + T]
            y[i] = self.data[pos + 1 : pos + T + 1]

        return x, y

    def reset(self):
        """Appelé au début de chaque epoch (no-op avec random sampling)."""
        pass

    @property
    def num_batches(self) -> int:
        """Nombre de batches par epoch (approximatif)."""
        total_tokens = len(self.data) - 1  # -1 car target est décalé
        tokens_per_batch = self.batch_size * self.seq_len
        return max(1, total_tokens // tokens_per_batch)
