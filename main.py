#!/usr/bin/env python3
"""MiniLLM — Un LLM construit de zéro pour apprendre.

Usage:
    python main.py              # Entraîne et génère du texte
    python main.py --epochs 200 # Changer le nombre d'epochs
"""

import argparse
import os

import numpy as np

from config import Config
from generation.generator import Generator
from modules.loss import CrossEntropyLoss
from modules.tokenizer import CharTokenizer
from modules.transformer_model import TransformerModel
from optim.adam import Adam
from training.data_loader import DataLoader
from training.trainer import Trainer


def main():
    parser = argparse.ArgumentParser(description="MiniLLM — Train & Generate")
    parser.add_argument("--data", default="data/input.txt", help="Fichier texte")
    parser.add_argument("--epochs", type=int, default=None, help="Nombre d'epochs")
    parser.add_argument("--lr", type=float, default=None, help="Learning rate")
    parser.add_argument("--d-model", type=int, default=None, help="Dimension modèle")
    parser.add_argument("--n-layers", type=int, default=None, help="Nombre de couches")
    parser.add_argument("--n-heads", type=int, default=None, help="Nombre de têtes")
    parser.add_argument("--prompt", default="Le chat ", help="Prompt de génération")
    parser.add_argument("--temperature", type=float, default=None, help="Température")
    parser.add_argument("--max-gen", type=int, default=None, help="Tokens max à générer")
    args = parser.parse_args()

    # 1. Charger les données
    data_path = args.data
    if not os.path.isabs(data_path):
        data_path = os.path.join(os.path.dirname(__file__) or ".", data_path)

    with open(data_path, "r", encoding="utf-8") as f:
        text = f.read()
    print(f"Corpus: {len(text)} caractères")

    # 2. Tokenizer
    tokenizer = CharTokenizer(text)
    print(f"Vocabulaire: {tokenizer.vocab_size} caractères uniques")

    # 3. Configuration
    config = Config()
    config.vocab_size = tokenizer.vocab_size
    if args.epochs is not None:
        config.max_epochs = args.epochs
    if args.lr is not None:
        config.learning_rate = args.lr
    if args.d_model is not None:
        config.d_model = args.d_model
    if args.n_layers is not None:
        config.n_layers = args.n_layers
    if args.n_heads is not None:
        config.n_heads = args.n_heads
    if args.temperature is not None:
        config.temperature = args.temperature
    if args.max_gen is not None:
        config.max_gen_len = args.max_gen

    # 4. Encoder le corpus
    data = np.array(tokenizer.encode(text), dtype=np.int64)

    # 5. Construire le modèle
    model = TransformerModel(config)
    total_params = model.count_parameters()
    print(f"Paramètres: {total_params:,}")
    print(
        f"Config: d_model={config.d_model}, n_heads={config.n_heads}, "
        f"n_layers={config.n_layers}, d_ff={config.d_ff}"
    )
    print()

    # 6. Optimizer et data loader
    loss_fn = CrossEntropyLoss()
    optimizer = Adam(model.all_modules(), lr=config.learning_rate)
    data_loader = DataLoader(data, config.seq_len, config.batch_size)

    # 7. Entraînement
    print(f"=== Entraînement ({config.max_epochs} epochs) ===")
    trainer = Trainer(model, loss_fn, optimizer, data_loader, config)
    losses = trainer.train()
    print(f"\nLoss final: {losses[-1]:.4f}")
    print()

    # 8. Génération
    print("=== Génération ===")
    generator = Generator(model, tokenizer, config)
    prompt = args.prompt
    generated = generator.generate(prompt)
    print(f"Prompt: '{prompt}'")
    print(f"Texte généré:\n{generated}")


if __name__ == "__main__":
    main()
