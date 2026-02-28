import threading
from typing import Optional

import numpy as np

from api.services.serialization import (
    load_model_weights,
    reconstruct_tokenizer,
    save_model_weights,
    save_tokenizer_vocab,
)
from config import Config
from modules.loss import CrossEntropyLoss
from modules.softmax import softmax
from modules.tokenizers.base import BaseTokenizer
from modules.tokenizers.factory import create_tokenizer
from modules.transformer_model import TransformerModel
from optim.adam import Adam
from training.data_loader import DataLoader


class EngineService:
    """Moteur MiniLLM — une instance par modèle.

    Thread-safe. Le model_lock empêche les accès concurrents au modèle
    (ex: API request pendant l'entraînement).
    """

    def __init__(self):
        self.config: Optional[Config] = None
        self.tokenizer: Optional[BaseTokenizer] = None
        self.model: Optional[TransformerModel] = None
        self.loss_fn: Optional[CrossEntropyLoss] = None
        self.optimizer: Optional[Adam] = None
        self.data_loader: Optional[DataLoader] = None
        self._corpus_text: str = ""
        self._is_training: bool = False
        self.model_lock = threading.Lock()
        self._init_lock = threading.Lock()

    @property
    def is_ready(self) -> bool:
        return self.model is not None and self.tokenizer is not None

    @property
    def is_training(self) -> bool:
        return self._is_training

    def _encode_corpus_with_special_tokens(self, corpus_text: str) -> np.ndarray:
        """Encode le corpus en encadrant chaque ligne avec BOS/EOS."""
        lines = corpus_text.split("\n")
        data_tokens: list[int] = []
        for line in lines:
            line = line.strip()
            if not line:
                continue
            line_tokens = self.tokenizer.encode(line)
            if line_tokens:
                data_tokens.append(self.tokenizer.bos_id)
                data_tokens.extend(line_tokens)
                data_tokens.append(self.tokenizer.eos_id)
        return np.array(data_tokens, dtype=np.int64)

    def initialize(self, config: Config, corpus_text: str):
        """Initialise le modèle, tokenizer, optimizer et data loader."""
        with self._init_lock:
            self._corpus_text = corpus_text
            self.tokenizer = create_tokenizer(config.tokenizer_type, corpus_text)
            config.vocab_size = self.tokenizer.vocab_size

            self.config = config
            np.random.seed(config.seed)
            self.model = TransformerModel(config)
            self.loss_fn = CrossEntropyLoss()
            self.optimizer = Adam(
                self.model.all_modules(),
                lr=config.learning_rate,
                beta1=config.beta1,
                beta2=config.beta2,
                eps=config.epsilon,
                weight_decay=config.weight_decay,
            )

            data = self._encode_corpus_with_special_tokens(corpus_text)
            self.data_loader = DataLoader(data, config.seq_len, config.batch_size)

    def update_corpus(self, corpus_text: str, config: Config):
        """Met à jour le corpus et le data loader sans toucher au modèle.

        Permet le training continu : on garde les poids existants
        et on relance l'entraînement sur le même (ou nouveau) corpus.
        """
        with self._init_lock:
            self._corpus_text = corpus_text
            # Recréer le data loader avec le corpus actuel
            data = self._encode_corpus_with_special_tokens(corpus_text)
            self.data_loader = DataLoader(data, config.seq_len, config.batch_size)
            # Mettre à jour les epochs dans la config
            if config.max_epochs:
                self.config.max_epochs = config.max_epochs

    def save_weights(self, path: str) -> dict:
        """Sauvegarde les poids et retourne le vocab JSON."""
        save_model_weights(self.model, path)
        return save_tokenizer_vocab(self.tokenizer)

    def load_weights(self, path: str, vocab_json: dict, config: Config):
        """Charge un modèle sauvegardé."""
        with self._init_lock:
            self.tokenizer = reconstruct_tokenizer(vocab_json)
            config.vocab_size = self.tokenizer.vocab_size
            self.config = config
            np.random.seed(config.seed)
            self.model = TransformerModel(config)
            load_model_weights(self.model, path)
            self.loss_fn = CrossEntropyLoss()
            self.optimizer = Adam(
                self.model.all_modules(),
                lr=config.learning_rate,
                beta1=config.beta1,
                beta2=config.beta2,
                eps=config.epsilon,
                weight_decay=config.weight_decay,
            )

    def generate_text(
        self,
        prompt: str,
        max_tokens: int = 200,
        temperature: float = 0.8,
        sampling_strategy: str = "temperature",
        top_k: int = 10,
        top_p: float = 0.9,
        min_new_tokens: int = 0,
    ) -> str:
        """Génération synchrone complète.

        S'arrête sur EOS seulement après min_new_tokens tokens générés.
        Tant que le seuil n'est pas atteint, le logit EOS est masqué (-1e9)
        pour que le modèle continue à prédire des caractères utiles.
        """
        from generation.sampling import sample_token

        with self.model_lock:
            tokens = [self.tokenizer.bos_id] + self.tokenizer.encode(prompt)
            if len(tokens) == 1:
                tokens.append(np.random.randint(0, self.tokenizer.bos_id))
            generated = 0
            for _ in range(max_tokens):
                context = tokens[-self.config.seq_len :]
                x = np.array([context])
                logits = self.model.forward(x)
                next_logits = logits[0, -1, :].copy()
                # Masquer EOS tant qu'on n'a pas atteint min_new_tokens
                if generated < min_new_tokens:
                    next_logits[self.tokenizer.eos_id] = -1e9
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
                generated += 1
            return self.tokenizer.decode(tokens)

    def generate_streaming(
        self,
        prompt: str,
        max_tokens: int = 200,
        temperature: float = 0.8,
        sampling_strategy: str = "temperature",
        top_k: int = 10,
        top_p: float = 0.9,
        min_new_tokens: int = 0,
    ):
        """Yield chaque token généré (pour WebSocket streaming).

        S'arrête sur EOS seulement après min_new_tokens tokens générés.
        """
        from generation.sampling import sample_token

        with self.model_lock:
            tokens = [self.tokenizer.bos_id] + self.tokenizer.encode(prompt)
            if len(tokens) == 1:
                tokens.append(np.random.randint(0, self.tokenizer.bos_id))
            generated = 0
            for _ in range(max_tokens):
                context = tokens[-self.config.seq_len :]
                x = np.array([context])
                logits = self.model.forward(x)
                next_logits = logits[0, -1, :].copy()
                if generated < min_new_tokens:
                    next_logits[self.tokenizer.eos_id] = -1e9
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
                generated += 1
                yield self.tokenizer.decode([next_token])

    def get_attention_weights(self, text: str) -> list[dict]:
        """Exécute un forward pass et retourne les poids d'attention par couche."""
        with self.model_lock:
            tokens = self.tokenizer.encode(text)
            seq_len = min(len(tokens), self.config.seq_len)
            tokens = tokens[:seq_len]
            x = np.array([tokens])
            self.model.forward(x)

            results = []
            chars = [self.tokenizer.decode([t]) for t in tokens]
            for layer_idx, block in enumerate(self.model.blocks):
                weights = block.attention.get_attention_weights()
                if weights is not None:
                    for head_idx in range(weights.shape[1]):
                        results.append(
                            {
                                "layer": layer_idx,
                                "head": head_idx,
                                "weights": weights[0, head_idx, :seq_len, :seq_len].tolist(),
                                "tokens": chars,
                            }
                        )
            return results

    def compute_loss_on_text(self, text: str) -> float:
        """Calcule le loss sur un texte donné."""
        with self.model_lock:
            tokens = self.tokenizer.encode(text)
            seq_len = min(len(tokens) - 1, self.config.seq_len)
            if seq_len < 1:
                return 0.0
            x = np.array([tokens[:seq_len]])
            y = np.array([tokens[1 : seq_len + 1]])
            logits = self.model.forward(x)
            return self.loss_fn.forward(logits, y)

    def compute_perplexity(self, text: str) -> float:
        """Perplexité = exp(loss)."""
        loss = self.compute_loss_on_text(text)
        return float(np.exp(loss))

    def get_embedding_vectors_2d(self) -> list[dict]:
        """Retourne les embeddings projetés en 2D par PCA."""
        W = self.model.embedding.W.copy()  # copy to avoid race
        centered = W - W.mean(axis=0)
        cov = np.cov(centered, rowvar=False)
        eigenvalues, eigenvectors = np.linalg.eigh(cov)
        top2 = eigenvectors[:, -2:][:, ::-1]
        coords = centered @ top2

        results = []
        for i in range(self.tokenizer.vocab_size):
            label = self._token_label(i)
            results.append(
                {
                    "token": label,
                    "token_id": i,
                    "x": float(coords[i, 0]),
                    "y": float(coords[i, 1]),
                }
            )
        return results

    def get_weight_matrices(self) -> list[dict]:
        """Retourne les matrices de poids pour visualisation dot-matrix.

        Safe to call during training — reads weight copies.
        """
        MAX_DIM = 64
        matrices = []

        module_names = ["embedding"]
        for i in range(self.config.n_layers):
            module_names.extend(
                [
                    f"block{i}.ln1",
                    f"block{i}.attention",
                    f"block{i}.ln2",
                    f"block{i}.ffn",
                ]
            )
        module_names.extend(["final_ln", "output_head"])

        for name, mod in zip(module_names, self.model.all_modules()):
            for pname, param in mod.parameters.items():
                if param.ndim < 2:
                    continue
                w = param.copy()  # copy to avoid race with training
                if w.ndim > 2:
                    w = w.reshape(-1, w.shape[-1])

                rows, cols = w.shape
                row_step = max(1, rows // MAX_DIM)
                col_step = max(1, cols // MAX_DIM)
                sampled = w[::row_step, ::col_step][:MAX_DIM, :MAX_DIM]

                matrices.append(
                    {
                        "module": name,
                        "param": pname,
                        "shape": list(param.shape),
                        "rows": sampled.shape[0],
                        "cols": sampled.shape[1],
                        "values": sampled.tolist(),
                        "min": float(np.min(sampled)),
                        "max": float(np.max(sampled)),
                        "mean": float(np.mean(sampled)),
                        "std": float(np.std(sampled)),
                    }
                )
        return matrices

    def _token_label(self, token_id: int) -> str:
        """Label lisible pour un token (gère BOS/EOS)."""
        from modules.tokenizers.base import BOS_TOKEN, EOS_TOKEN

        if token_id == self.tokenizer.bos_id:
            return BOS_TOKEN
        if token_id == self.tokenizer.eos_id:
            return EOS_TOKEN
        return self.tokenizer.decode([token_id])

    def get_generation_weights(
        self,
        prompt: str,
        max_tokens: int = 50,
        temperature: float = 0.8,
        sampling_strategy: str = "temperature",
        top_k: int = 10,
        top_p: float = 0.9,
    ) -> dict:
        """Génère du texte et retourne les poids d'attention à chaque step."""
        from generation.sampling import sample_token

        with self.model_lock:
            tokens = [self.tokenizer.bos_id] + self.tokenizer.encode(prompt)
            generated_tokens = []
            attention_snapshots = []

            for step in range(max_tokens):
                context = tokens[-self.config.seq_len :]
                x = np.array([context])
                logits = self.model.forward(x)

                step_attention = []
                for layer_idx, block in enumerate(self.model.blocks):
                    weights = block.attention.get_attention_weights()
                    if weights is not None:
                        avg_weights = weights[0].mean(axis=0)
                        last_row = avg_weights[-1, : len(context)].tolist()
                        step_attention.append(
                            {
                                "layer": layer_idx,
                                "attention_to_context": last_row,
                            }
                        )

                next_logits = logits[0, -1, :]
                probs = softmax(next_logits / max(temperature, 1e-8))
                next_token = sample_token(
                    logits[0, -1, :],
                    strategy=sampling_strategy,
                    temperature=temperature,
                    top_k=top_k,
                    top_p=top_p,
                )

                if next_token == self.tokenizer.eos_id:
                    generated_tokens.append(
                        {
                            "token": "<EOS>",
                            "token_id": next_token,
                            "probability": float(probs[next_token]),
                            "top_probs": [
                                {"token": self._token_label(i), "prob": float(probs[i])}
                                for i in np.argsort(probs)[-5:][::-1]
                            ],
                            "is_eos": True,
                        }
                    )
                    attention_snapshots.append(step_attention)
                    break

                tokens.append(next_token)
                token_char = self.tokenizer.decode([next_token])
                generated_tokens.append(
                    {
                        "token": token_char,
                        "token_id": next_token,
                        "probability": float(probs[next_token]),
                        "top_probs": [
                            {"token": self._token_label(i), "prob": float(probs[i])}
                            for i in np.argsort(probs)[-5:][::-1]
                        ],
                    }
                )
                attention_snapshots.append(step_attention)

            context_chars = [
                self._token_label(t) for t in tokens[: len(self.tokenizer.encode(prompt)) + 1]
            ]
            return {
                "prompt": prompt,
                "prompt_tokens": context_chars,
                "generated_tokens": generated_tokens,
                "attention_snapshots": attention_snapshots,
                "full_text": self.tokenizer.decode(tokens),
            }

    def get_parameter_stats(self) -> list[dict]:
        """Stats des paramètres par module (safe during training — reads copies)."""
        stats = []
        module_names = ["embedding"]
        for i in range(self.config.n_layers):
            module_names.extend(
                [
                    f"block{i}.ln1",
                    f"block{i}.attention",
                    f"block{i}.ln2",
                    f"block{i}.ffn",
                ]
            )
        module_names.extend(["final_ln", "output_head"])

        for name, mod in zip(module_names, self.model.all_modules()):
            param_count = sum(p.size for p in mod.parameters.values())
            if param_count == 0:
                continue
            all_params = np.concatenate([p.copy().ravel() for p in mod.parameters.values()])
            grad_norm = None
            grads = mod.gradients
            if grads and any(np.any(g != 0) for g in grads.values()):
                all_grads = np.concatenate([g.ravel() for g in grads.values()])
                grad_norm = float(np.linalg.norm(all_grads))

            stats.append(
                {
                    "module_name": name,
                    "param_count": param_count,
                    "weight_norm": float(np.linalg.norm(all_params)),
                    "gradient_norm": grad_norm,
                    "mean": float(np.mean(all_params)),
                    "std": float(np.std(all_params)),
                }
            )
        return stats
