import os
import tempfile

import numpy as np
from django.test import TestCase

from api.services.serialization import (
    load_model_weights,
    reconstruct_tokenizer,
    save_model_weights,
    save_tokenizer_vocab,
)
from config import Config
from modules.tokenizer import CharTokenizer
from modules.transformer_model import TransformerModel


class TestSerialization(TestCase):
    """Tests unitaires pour la sérialisation des poids et du vocabulaire."""

    def setUp(self):
        self.corpus = "Le chat mange le poisson."
        self.tokenizer = CharTokenizer(self.corpus)
        self.config = Config(
            d_model=32,
            n_heads=2,
            n_layers=1,
            d_ff=64,
            seq_len=16,
            vocab_size=self.tokenizer.vocab_size,
        )
        np.random.seed(42)
        self.model = TransformerModel(self.config)

    def test_save_and_load_weights(self):
        """Les poids sauvegardés puis chargés doivent être identiques."""
        with tempfile.NamedTemporaryFile(suffix=".npz", delete=False) as f:
            path = f.name

        try:
            # Sauvegarde
            save_model_weights(self.model, path)
            self.assertTrue(os.path.exists(path))

            # Copier les poids originaux
            original_params = {}
            for idx, mod in enumerate(self.model.all_modules()):
                for name, param in mod.parameters.items():
                    original_params[f"{idx}_{name}"] = param.copy()

            # Créer un nouveau modèle et modifier ses poids
            np.random.seed(99)
            new_model = TransformerModel(self.config)
            # Forcer des poids différents
            for mod in new_model.all_modules():
                for name in mod.parameters:
                    mod.parameters[name][:] = np.ones_like(mod.parameters[name]) * 999.0

            # Vérifier que les poids sont différents
            first_mod = list(new_model.all_modules())[0]
            first_param_name = list(first_mod.parameters.keys())[0]
            self.assertFalse(
                np.array_equal(
                    first_mod.parameters[first_param_name], original_params[f"0_{first_param_name}"]
                )
            )

            # Charger les poids sauvegardés
            load_model_weights(new_model, path)

            # Vérifier que les poids sont maintenant identiques
            for idx, mod in enumerate(new_model.all_modules()):
                for name, param in mod.parameters.items():
                    key = f"{idx}_{name}"
                    np.testing.assert_array_almost_equal(
                        param,
                        original_params[key],
                        err_msg=f"Mismatch pour {key}",
                    )
        finally:
            os.unlink(path)

    def test_save_tokenizer_vocab(self):
        """Le vocab exporté contient tous les caractères (sans BOS/EOS)."""
        vocab_data = save_tokenizer_vocab(self.tokenizer)
        self.assertIsInstance(vocab_data, dict)
        self.assertEqual(vocab_data["type"], "character")
        self.assertTrue(vocab_data.get("has_special_tokens"))
        vocab = vocab_data["vocab"]
        # Le vocab dict ne contient que les tokens réguliers (sans BOS/EOS)
        self.assertEqual(len(vocab), self.tokenizer.vocab_size - 2)
        # Chaque caractère unique du corpus doit être dans le vocab
        for ch in set(self.corpus):
            self.assertIn(ch, vocab)

    def test_reconstruct_tokenizer(self):
        """Le tokenizer reconstruit encode/decode comme l'original."""
        vocab = save_tokenizer_vocab(self.tokenizer)
        reconstructed = reconstruct_tokenizer(vocab)

        self.assertEqual(reconstructed.vocab_size, self.tokenizer.vocab_size)

        # Test encode
        original_encoded = self.tokenizer.encode(self.corpus)
        reconstructed_encoded = reconstructed.encode(self.corpus)
        self.assertEqual(original_encoded, reconstructed_encoded)

        # Test decode
        original_decoded = self.tokenizer.decode(original_encoded)
        reconstructed_decoded = reconstructed.decode(reconstructed_encoded)
        self.assertEqual(original_decoded, reconstructed_decoded)

    def test_roundtrip_tokenizer(self):
        """Sauvegarde → reconstruction → encode/decode identique."""
        vocab = save_tokenizer_vocab(self.tokenizer)
        tok2 = reconstruct_tokenizer(vocab)
        text = "chat poisson"
        self.assertEqual(
            self.tokenizer.decode(self.tokenizer.encode(text)),
            tok2.decode(tok2.encode(text)),
        )

    def test_load_weights_shape_mismatch(self):
        """Charger des poids d'un ancien modèle (vocab plus petit) ne crash pas."""
        with tempfile.NamedTemporaryFile(suffix=".npz", delete=False) as f:
            path = f.name
        try:
            # Sauvegarder avec le modèle actuel
            save_model_weights(self.model, path)

            # Créer un modèle avec un vocab plus grand (+4)
            bigger_config = Config(
                d_model=32,
                n_heads=2,
                n_layers=1,
                d_ff=64,
                seq_len=16,
                vocab_size=self.tokenizer.vocab_size + 4,
            )
            np.random.seed(99)
            bigger_model = TransformerModel(bigger_config)

            # Charger les poids du petit modèle dans le gros → pas de crash
            load_model_weights(bigger_model, path)

            # Les premières lignes de l'embedding doivent correspondre
            orig_emb = list(self.model.all_modules())[0].parameters["W"]
            new_emb = list(bigger_model.all_modules())[0].parameters["W"]
            np.testing.assert_array_almost_equal(
                new_emb[: orig_emb.shape[0], : orig_emb.shape[1]],
                orig_emb,
            )
        finally:
            os.unlink(path)
