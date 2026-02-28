import numpy as np


def save_model_weights(model, path: str):
    """Sauvegarde tous les poids du modèle dans un fichier .npz."""
    params = {}
    for idx, module in enumerate(model.all_modules()):
        for name, param in module.parameters.items():
            key = f"module_{idx}_{name}"
            params[key] = param
    np.savez_compressed(path, **params)


def load_model_weights(model, path: str):
    """Charge les poids depuis un .npz dans un modèle existant.

    Le modèle doit avoir la même architecture (même config).
    La copie est in-place pour préserver les références.
    Gère le mismatch de shape (ex: ancien modèle sans BOS/EOS).
    """
    data = np.load(path)
    for idx, module in enumerate(model.all_modules()):
        params = module.parameters
        for name in params:
            key = f"module_{idx}_{name}"
            if key in data:
                saved = data[key]
                current = params[name]
                if saved.shape == current.shape:
                    current[:] = saved
                else:
                    # Shape mismatch (ex: vocab +2 pour BOS/EOS)
                    slices = tuple(slice(0, min(s, c)) for s, c in zip(saved.shape, current.shape))
                    current[slices] = saved[slices]


def save_tokenizer_vocab(tokenizer) -> dict:
    """Exporte le vocabulaire du tokenizer en dict JSON-sérialisable.

    Supporte CharTokenizer (char_to_idx) et TiktokenTokenizer (subword_to_idx).
    """
    if hasattr(tokenizer, "char_to_idx"):
        return {
            "type": "character",
            "vocab": dict(tokenizer.char_to_idx),
            "has_special_tokens": True,
        }
    elif hasattr(tokenizer, "subword_to_idx"):
        return {
            "type": "tiktoken",
            "encoding_name": tokenizer.encoding_name,
            "vocab": dict(tokenizer.subword_to_idx),
            "has_special_tokens": True,
        }
    else:
        raise ValueError(f"Tokenizer type non supporté pour la sérialisation: {type(tokenizer)}")


def reconstruct_tokenizer(vocab_json: dict):
    """Reconstruit un tokenizer depuis un vocab sauvegardé."""
    tok_type = vocab_json.get("type", "character")
    vocab = vocab_json.get("vocab", vocab_json)  # backward compat: old format is flat dict

    if tok_type == "tiktoken":
        from modules.tokenizers.tiktoken_tokenizer import TiktokenTokenizer

        encoding_name = vocab_json.get("encoding_name", "cl100k_base")
        tok = TiktokenTokenizer.__new__(TiktokenTokenizer)
        tok.encoding_name = encoding_name
        import tiktoken

        tok.enc = tiktoken.get_encoding(encoding_name)
        tok.subword_to_idx = {k: int(v) for k, v in vocab.items()}
        tok.idx_to_subword = {int(v): k for k, v in vocab.items()}
        tok._vocab_size = len(vocab)
        return tok
    else:
        from modules.tokenizers.char_tokenizer import CharTokenizer

        tok = CharTokenizer.__new__(CharTokenizer)
        tok.char_to_idx = {k: int(v) for k, v in vocab.items()}
        tok.idx_to_char = {int(v): k for k, v in vocab.items()}
        tok._vocab_size = len(vocab)
        return tok
