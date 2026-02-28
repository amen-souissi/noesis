from rest_framework.decorators import api_view
from rest_framework.response import Response

MODULES_DOC = [
    {
        "slug": "tokenizer",
        "name": "Tokenizer",
        "source_file": "modules/tokenizers/",
        "category": "input",
        "order": 0,
        "short_description": "Convertit le texte brut en séquence de nombres entiers",
        "purpose": "Le modèle ne comprend pas les lettres, seulement les nombres. Le tokenizer crée un dictionnaire qui associe chaque token unique à un ID entier. C'est le pont entre le monde humain (texte) et le monde du modèle (nombres). Trois tokenizers sont disponibles : caractère par caractère, BPE style GPT-4 et BPE style Claude.",
        "class_interface": {
            "class_name": "BaseTokenizer (ABC)",
            "parent_class": None,
            "constructor": [],
            "methods": [
                {
                    "name": "encode",
                    "signature": "encode(text: str) -> list[int]",
                    "description": "Convertit une chaîne en liste d'IDs entiers",
                    "returns": "list[int]",
                },
                {
                    "name": "decode",
                    "signature": "decode(indices: list[int]) -> str",
                    "description": "Convertit une liste d'IDs en texte",
                    "returns": "str",
                },
            ],
            "properties": [
                {
                    "name": "vocab_size",
                    "type": "int",
                    "description": "Nombre de tokens uniques dans le vocabulaire",
                },
                {"name": "name", "type": "str", "description": "Nom du tokenizer"},
            ],
            "implementations": [
                {
                    "name": "CharTokenizer",
                    "description": "Découpe caractère par caractère. Vocabulaire = caractères uniques du corpus.",
                },
                {
                    "name": "TiktokenTokenizer (gpt4)",
                    "description": "Utilise la stratégie de découpe BPE de GPT-4 (cl100k_base) mais construit le vocabulaire à partir du corpus.",
                },
                {
                    "name": "TiktokenTokenizer (claude)",
                    "description": "Utilise la stratégie de découpe BPE de GPT-4o (o200k_base) mais construit le vocabulaire à partir du corpus.",
                },
            ],
        },
        "math_formulas": [],
        "key_shapes": {
            "input": "str (texte brut)",
            "output": "list[int] (séquence d'IDs)",
        },
        "data_flow": {
            "previous": None,
            "next": "embedding",
            "receives_from": "Texte brut d'entraînement ou prompt utilisateur",
            "sends_to": "Séquence d'entiers vers l'Embedding",
        },
        "code_example": 'from modules.tokenizers.factory import create_tokenizer\ntok = create_tokenizer("character", "le chat mange")\ntok.encode("le chat")  # → [0, 1, 2, 3, 4, 5, 6]\n\n# BPE style GPT-4\ntok_bpe = create_tokenizer("gpt4", "le chat mange")\ntok_bpe.encode("le chat")  # → [0, 1, 2]  (sous-mots)',
        "educational_notes": "Le tokenizer par caractère est le plus simple : 1 caractère = 1 token. Les tokenizers BPE (GPT-4, Claude) découpent le texte en sous-mots plus intelligemment, ce qui réduit la longueur des séquences. Ici, les tokenizers BPE utilisent la stratégie de découpe de tiktoken mais construisent leur vocabulaire à partir du corpus d'entraînement.",
        "related_lessons": [
            {
                "title": "Tokenisation — Du texte aux nombres",
                "path": "/training/tokenization",
                "phase": "training",
                "step": 1,
            },
            {
                "title": "Tokenisation du prompt",
                "path": "/generation/prompt",
                "phase": "generation",
                "step": 1,
            },
        ],
    },
    {
        "slug": "embedding",
        "name": "Embedding",
        "source_file": "modules/embedding.py",
        "category": "input",
        "order": 1,
        "short_description": "Transforme chaque token ID en un vecteur dense",
        "purpose": "Chaque token a un vecteur de dimension d_model dans une table de lookup. Au début les vecteurs sont aléatoires, puis ajustés pendant l'entraînement pour capturer le 'sens' de chaque token.",
        "class_interface": {
            "class_name": "Embedding",
            "parent_class": "BaseModule",
            "constructor": [
                {
                    "name": "vocab_size",
                    "type": "int",
                    "description": "Taille du vocabulaire (nombre de tokens)",
                },
                {
                    "name": "d_model",
                    "type": "int",
                    "description": "Dimension des vecteurs d'embedding",
                },
            ],
            "methods": [
                {
                    "name": "forward",
                    "signature": "forward(x: np.ndarray) -> np.ndarray",
                    "description": "Lookup : retourne les vecteurs des tokens demandés",
                    "returns": "(batch_size, seq_len, d_model)",
                },
                {
                    "name": "backward",
                    "signature": "backward(grad_output: np.ndarray) -> np.ndarray",
                    "description": "Accumule les gradients sur les lignes utilisées via np.add.at",
                    "returns": "None",
                },
            ],
            "properties": [
                {
                    "name": "W",
                    "type": "np.ndarray",
                    "description": "Matrice de poids (vocab_size, d_model), initialisée N(0, 0.02)",
                },
                {
                    "name": "parameters",
                    "type": "dict[str, np.ndarray]",
                    "description": "Retourne {'W': self.W}",
                },
                {
                    "name": "gradients",
                    "type": "dict[str, np.ndarray]",
                    "description": "Retourne {'W': self._dW}",
                },
            ],
        },
        "math_formulas": [
            {
                "name": "Lookup",
                "latex": "\\mathbf{e}_i = \\mathbf{W}_{emb}[i]",
                "explanation": "Simple indexation dans la matrice de poids",
            },
            {
                "name": "Backward",
                "latex": "\\nabla W_{emb}[i] \\mathrel{+}= \\nabla \\mathbf{e}_i",
                "explanation": "Le gradient s'accumule aux lignes utilisées (np.add.at)",
            },
        ],
        "key_shapes": {
            "input": "(batch_size, seq_len) int64",
            "output": "(batch_size, seq_len, d_model) float64",
            "parameters": "W: (vocab_size, d_model)",
        },
        "data_flow": {
            "previous": "tokenizer",
            "next": "positional_encoding",
            "receives_from": "Token IDs entiers du Tokenizer",
            "sends_to": "Vecteurs denses vers le Positional Encoding",
        },
        "code_example": "emb = Embedding(vocab_size=50, d_model=64)\nx = np.array([[0, 1, 2]])  # (1, 3)\nout = emb.forward(x)       # (1, 3, 64)",
        "educational_notes": "Le forward est un simple lookup (pas de multiplication matricielle). Le backward utilise np.add.at car un même token peut apparaître plusieurs fois dans le batch.",
        "related_lessons": [
            {
                "title": "Embedding — Des nombres aux vecteurs",
                "path": "/training/embedding",
                "phase": "training",
                "step": 2,
            },
        ],
    },
    {
        "slug": "positional_encoding",
        "name": "Positional Encoding",
        "source_file": "modules/positional_encoding.py",
        "category": "input",
        "order": 2,
        "short_description": "Ajoute l'information de position à chaque embedding",
        "purpose": "Le Transformer traite tous les tokens en parallèle — il ne sait pas naturellement l'ordre. L'encodage positionnel ajoute un signal unique à chaque position via des fonctions sin/cos.",
        "class_interface": {
            "class_name": "PositionalEncoding",
            "parent_class": "BaseModule",
            "constructor": [
                {"name": "seq_len", "type": "int", "description": "Longueur maximale de séquence"},
                {"name": "d_model", "type": "int", "description": "Dimension du modèle"},
            ],
            "methods": [
                {
                    "name": "forward",
                    "signature": "forward(x: np.ndarray) -> np.ndarray",
                    "description": "Ajoute l'encodage positionnel aux embeddings : x + PE[:seq_len]",
                    "returns": "(batch_size, seq_len, d_model)",
                },
                {
                    "name": "backward",
                    "signature": "backward(grad_output: np.ndarray) -> np.ndarray",
                    "description": "Passe le gradient tel quel (PE est constant)",
                    "returns": "grad_output inchangé",
                },
            ],
            "properties": [
                {
                    "name": "pe",
                    "type": "np.ndarray",
                    "description": "Matrice d'encodage positionnel précalculée (seq_len, d_model)",
                },
            ],
        },
        "math_formulas": [
            {
                "name": "Position paire",
                "latex": "PE(pos, 2i) = \\sin\\left(\\frac{pos}{10000^{2i/d_{model}}}\\right)",
                "explanation": "Sinus pour les dimensions paires",
            },
            {
                "name": "Position impaire",
                "latex": "PE(pos, 2i+1) = \\cos\\left(\\frac{pos}{10000^{2i/d_{model}}}\\right)",
                "explanation": "Cosinus pour les dimensions impaires",
            },
        ],
        "key_shapes": {
            "input": "(batch_size, seq_len, d_model)",
            "output": "(batch_size, seq_len, d_model) — même shape",
            "parameters": "Aucun (constante)",
        },
        "data_flow": {
            "previous": "embedding",
            "next": "transformer_block",
            "receives_from": "Vecteurs d'embedding",
            "sends_to": "Embedding + position vers le premier Transformer Block",
        },
        "code_example": "pe = PositionalEncoding(seq_len=64, d_model=64)\nx = np.zeros((1, 5, 64))\nout = pe.forward(x)  # == PE[:5, :] car x est zéro",
        "educational_notes": "Les fréquences variées permettent au modèle de distinguer des positions proches ET éloignées. Pas de paramètres entraînables : c'est une constante calculée une fois.",
        "related_lessons": [
            {
                "title": "Encodage positionnel — L'ordre des mots",
                "path": "/training/positional-encoding",
                "phase": "training",
                "step": 3,
            },
        ],
    },
    {
        "slug": "layernorm",
        "name": "Layer Normalization",
        "source_file": "modules/layernorm.py",
        "category": "core",
        "order": 3,
        "short_description": "Normalise les activations pour stabiliser l'entraînement",
        "purpose": "Sans normalisation, les valeurs peuvent exploser ou disparaître au fil des couches. LayerNorm recentre chaque vecteur autour de 0 avec un écart-type de 1.",
        "class_interface": {
            "class_name": "LayerNorm",
            "parent_class": "BaseModule",
            "constructor": [
                {
                    "name": "d_model",
                    "type": "int",
                    "description": "Dimension des features à normaliser",
                },
                {
                    "name": "eps",
                    "type": "float",
                    "description": "Constante de stabilité numérique",
                    "default": "1e-5",
                },
            ],
            "methods": [
                {
                    "name": "forward",
                    "signature": "forward(x: np.ndarray) -> np.ndarray",
                    "description": "Normalise les activations : gamma * (x - μ) / √(σ² + ε) + beta",
                    "returns": "(..., d_model)",
                },
                {
                    "name": "backward",
                    "signature": "backward(grad_output: np.ndarray) -> np.ndarray",
                    "description": "Calcule les gradients de gamma, beta et propage vers l'entrée",
                    "returns": "(..., d_model)",
                },
            ],
            "properties": [
                {
                    "name": "gamma",
                    "type": "np.ndarray",
                    "description": "Paramètre d'échelle (d_model,), initialisé à 1",
                },
                {
                    "name": "beta",
                    "type": "np.ndarray",
                    "description": "Paramètre de décalage (d_model,), initialisé à 0",
                },
                {
                    "name": "parameters",
                    "type": "dict",
                    "description": "Retourne {'gamma': ..., 'beta': ...}",
                },
                {
                    "name": "gradients",
                    "type": "dict",
                    "description": "Retourne {'gamma': ..., 'beta': ...}",
                },
            ],
        },
        "math_formulas": [
            {
                "name": "Normalisation",
                "latex": "\\hat{x} = \\frac{x - \\mu}{\\sqrt{\\sigma^2 + \\epsilon}}",
                "explanation": "Centre et réduit",
            },
            {
                "name": "Affine",
                "latex": "y = \\gamma \\hat{x} + \\beta",
                "explanation": "gamma et beta sont des paramètres appris",
            },
        ],
        "key_shapes": {
            "input": "(batch_size, seq_len, d_model)",
            "output": "(batch_size, seq_len, d_model)",
            "parameters": "gamma: (d_model,), beta: (d_model,)",
        },
        "data_flow": {
            "previous": "Utilisé dans chaque TransformerBlock",
            "next": "Précède Attention ou FeedForward",
            "receives_from": "Activations de la couche précédente",
            "sends_to": "Activations normalisées vers Attention ou FFN",
        },
        "code_example": "ln = LayerNorm(d_model=64)\nx = np.random.randn(1, 5, 64) * 100\nout = ln.forward(x)  # mean≈0, std≈1",
        "educational_notes": "En Pre-Norm (GPT-2), LayerNorm est appliqué AVANT attention et FFN, pas après. Le backward utilise une formule simplifiée pour la stabilité numérique.",
        "related_lessons": [
            {
                "title": "Attention — Comprendre le contexte",
                "path": "/training/attention",
                "phase": "training",
                "step": 4,
                "note": "LayerNorm est mentionné dans les étapes Attention et Feed-Forward",
            },
            {
                "title": "Feed-Forward — Traiter l'information",
                "path": "/training/feedforward",
                "phase": "training",
                "step": 5,
            },
        ],
    },
    {
        "slug": "attention",
        "name": "Multi-Head Self-Attention",
        "source_file": "modules/attention.py",
        "category": "core",
        "order": 4,
        "short_description": "Le cœur du Transformer : chaque token 'regarde' les autres",
        "purpose": "Pour chaque token, l'attention calcule à quel point il doit 'regarder' les autres tokens. C'est comme lire une phrase et chercher les mots importants pour comprendre chaque mot. Multi-head = faire ça plusieurs fois en parallèle, chaque tête cherchant un type de relation différent.",
        "class_interface": {
            "class_name": "MultiHeadAttention",
            "parent_class": "BaseModule",
            "constructor": [
                {
                    "name": "d_model",
                    "type": "int",
                    "description": "Dimension du modèle (doit être divisible par n_heads)",
                },
                {"name": "n_heads", "type": "int", "description": "Nombre de têtes d'attention"},
                {
                    "name": "max_seq_len",
                    "type": "int",
                    "description": "Longueur max pour le masque causal",
                    "default": "512",
                },
            ],
            "methods": [
                {
                    "name": "forward",
                    "signature": "forward(x: np.ndarray) -> np.ndarray",
                    "description": "Calcul complet : projections Q/K/V → scores → softmax → pondération → concaténation → projection W_O",
                    "returns": "(batch_size, seq_len, d_model)",
                },
                {
                    "name": "backward",
                    "signature": "backward(grad_output: np.ndarray) -> np.ndarray",
                    "description": "Rétropropagation à travers les 8 étapes de l'attention en ordre inverse",
                    "returns": "(batch_size, seq_len, d_model)",
                },
                {
                    "name": "get_attention_weights",
                    "signature": "get_attention_weights() -> np.ndarray",
                    "description": "Retourne les poids d'attention pour la visualisation",
                    "returns": "(batch_size, n_heads, seq_len, seq_len)",
                },
            ],
            "properties": [
                {
                    "name": "W_q",
                    "type": "Linear",
                    "description": "Projection Query : (d_model, d_model)",
                },
                {
                    "name": "W_k",
                    "type": "Linear",
                    "description": "Projection Key : (d_model, d_model)",
                },
                {
                    "name": "W_v",
                    "type": "Linear",
                    "description": "Projection Value : (d_model, d_model)",
                },
                {
                    "name": "W_o",
                    "type": "Linear",
                    "description": "Projection Output : (d_model, d_model)",
                },
                {
                    "name": "d_k",
                    "type": "int",
                    "description": "Dimension par tête = d_model // n_heads",
                },
            ],
        },
        "math_formulas": [
            {
                "name": "Attention",
                "latex": "\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V",
                "explanation": "Q=queries, K=keys, V=values",
            },
            {
                "name": "Projections",
                "latex": "Q = XW_Q,\\quad K = XW_K,\\quad V = XW_V",
                "explanation": "Chaque token crée 3 vecteurs via des projections linéaires",
            },
            {
                "name": "Masque causal",
                "latex": "\\text{score}_{ij} = -\\infty \\text{ si } j > i",
                "explanation": "Empêche de voir le futur",
            },
        ],
        "key_shapes": {
            "input": "(batch_size, seq_len, d_model)",
            "output": "(batch_size, seq_len, d_model)",
            "parameters": "W_q, W_k, W_v, W_o: chacun (d_model, d_model)",
            "attention_weights": "(batch_size, n_heads, seq_len, seq_len)",
        },
        "data_flow": {
            "previous": "layernorm",
            "next": "Connexion résiduelle puis LayerNorm",
            "receives_from": "Activations normalisées",
            "sends_to": "Mélange pondéré des informations entre tokens",
        },
        "code_example": "attn = MultiHeadAttention(d_model=64, n_heads=4)\nx = np.random.randn(1, 10, 64)\nout = attn.forward(x)  # (1, 10, 64)\nweights = attn.get_attention_weights()  # (1, 4, 10, 10)",
        "educational_notes": "C'est le module le plus complexe. Le masque causal est crucial : il empêche le modèle de 'tricher' en regardant les tokens futurs pendant l'entraînement. Le backward traverse 8 étapes en ordre inverse.",
        "related_lessons": [
            {
                "title": "Attention — Comprendre le contexte",
                "path": "/training/attention",
                "phase": "training",
                "step": 4,
            },
            {
                "title": "Passage dans le modèle",
                "path": "/generation/forward-pass",
                "phase": "generation",
                "step": 2,
            },
        ],
    },
    {
        "slug": "feedforward",
        "name": "Feed-Forward Network",
        "source_file": "modules/feedforward.py",
        "category": "core",
        "order": 5,
        "short_description": "Réseau à 2 couches qui traite chaque token individuellement",
        "purpose": "Après l'attention (qui mélange l'info entre tokens), le FFN traite chaque token séparément. Il projette dans un espace plus grand (d_ff), applique ReLU, puis reprojette. C'est là que le modèle 'digère' l'information.",
        "class_interface": {
            "class_name": "FeedForward",
            "parent_class": "BaseModule",
            "constructor": [
                {
                    "name": "d_model",
                    "type": "int",
                    "description": "Dimension d'entrée et de sortie",
                },
                {
                    "name": "d_ff",
                    "type": "int",
                    "description": "Dimension cachée (typiquement 4 × d_model)",
                },
            ],
            "methods": [
                {
                    "name": "forward",
                    "signature": "forward(x: np.ndarray) -> np.ndarray",
                    "description": "ReLU(x @ W₁ + b₁) @ W₂ + b₂ — expansion puis compression",
                    "returns": "(batch_size, seq_len, d_model)",
                },
                {
                    "name": "backward",
                    "signature": "backward(grad_output: np.ndarray) -> np.ndarray",
                    "description": "Rétropropagation à travers ReLU et les deux couches linéaires",
                    "returns": "(batch_size, seq_len, d_model)",
                },
            ],
            "properties": [
                {
                    "name": "linear1",
                    "type": "Linear",
                    "description": "Couche d'expansion : (d_model, d_ff)",
                },
                {
                    "name": "linear2",
                    "type": "Linear",
                    "description": "Couche de compression : (d_ff, d_model)",
                },
                {
                    "name": "parameters",
                    "type": "dict",
                    "description": "Paramètres des deux couches linéaires",
                },
                {
                    "name": "gradients",
                    "type": "dict",
                    "description": "Gradients des deux couches linéaires",
                },
            ],
        },
        "math_formulas": [
            {
                "name": "FFN",
                "latex": "\\text{FFN}(x) = \\text{ReLU}(xW_1 + b_1)W_2 + b_2",
                "explanation": "Deux couches linéaires avec ReLU au milieu",
            },
            {
                "name": "ReLU",
                "latex": "\\text{ReLU}(x) = \\max(0, x)",
                "explanation": "La non-linéarité la plus simple",
            },
        ],
        "key_shapes": {
            "input": "(batch_size, seq_len, d_model)",
            "output": "(batch_size, seq_len, d_model)",
            "parameters": "W1: (d_model, d_ff), b1: (d_ff,), W2: (d_ff, d_model), b2: (d_model,)",
        },
        "data_flow": {
            "previous": "layernorm",
            "next": "Connexion résiduelle",
            "receives_from": "Activations normalisées (après attention)",
            "sends_to": "Activations transformées ajoutées au résiduel",
        },
        "code_example": "ffn = FeedForward(d_model=64, d_ff=256)\nx = np.random.randn(1, 10, 64)\nout = ffn.forward(x)  # (1, 10, 64)",
        "educational_notes": "Sans la non-linéarité ReLU, empiler des couches linéaires serait équivalent à une seule couche. La convention est d_ff = 4 × d_model.",
        "related_lessons": [
            {
                "title": "Feed-Forward — Traiter l'information",
                "path": "/training/feedforward",
                "phase": "training",
                "step": 5,
            },
            {
                "title": "Passage dans le modèle",
                "path": "/generation/forward-pass",
                "phase": "generation",
                "step": 2,
            },
        ],
    },
    {
        "slug": "transformer_block",
        "name": "Transformer Block",
        "source_file": "modules/transformer_block.py",
        "category": "core",
        "order": 6,
        "short_description": "Assemble Attention + FFN + LayerNorm + connexions résiduelles",
        "purpose": "Un bloc Transformer = une 'couche de réflexion'. D'abord le modèle consulte les autres tokens (attention), puis réfléchit individuellement (FFN). Les connexions résiduelles permettent au gradient de 'sauter' des couches.",
        "class_interface": {
            "class_name": "TransformerBlock",
            "parent_class": "BaseModule",
            "constructor": [
                {"name": "d_model", "type": "int", "description": "Dimension du modèle"},
                {"name": "n_heads", "type": "int", "description": "Nombre de têtes d'attention"},
                {"name": "d_ff", "type": "int", "description": "Dimension cachée du FFN"},
                {
                    "name": "max_seq_len",
                    "type": "int",
                    "description": "Longueur max de séquence",
                    "default": "512",
                },
            ],
            "methods": [
                {
                    "name": "forward",
                    "signature": "forward(x: np.ndarray) -> np.ndarray",
                    "description": "x → LN₁ → Attention + résiduel → LN₂ → FFN + résiduel",
                    "returns": "(batch_size, seq_len, d_model)",
                },
                {
                    "name": "backward",
                    "signature": "backward(grad_output: np.ndarray) -> np.ndarray",
                    "description": "Rétropropagation à travers le bloc complet (FFN → LN₂ → Attention → LN₁)",
                    "returns": "(batch_size, seq_len, d_model)",
                },
                {
                    "name": "get_sub_modules",
                    "signature": "get_sub_modules() -> list",
                    "description": "Retourne [ln1, attention, ln2, ffn]",
                    "returns": "list[BaseModule]",
                },
            ],
            "properties": [
                {"name": "ln1", "type": "LayerNorm", "description": "Normalisation pré-attention"},
                {
                    "name": "attention",
                    "type": "MultiHeadAttention",
                    "description": "Module d'attention multi-têtes",
                },
                {"name": "ln2", "type": "LayerNorm", "description": "Normalisation pré-FFN"},
                {"name": "ffn", "type": "FeedForward", "description": "Réseau feed-forward"},
            ],
        },
        "math_formulas": [
            {
                "name": "Pre-Norm Block",
                "latex": "x = x + \\text{Attn}(\\text{LN}(x))\\\\x = x + \\text{FFN}(\\text{LN}(x))",
                "explanation": "Style GPT-2 : LayerNorm avant chaque sous-couche",
            },
        ],
        "key_shapes": {
            "input": "(batch_size, seq_len, d_model)",
            "output": "(batch_size, seq_len, d_model)",
        },
        "data_flow": {
            "previous": "positional_encoding (premier bloc) ou bloc précédent",
            "next": "Bloc suivant ou LayerNorm final",
            "receives_from": "Représentations des tokens",
            "sends_to": "Représentations enrichies",
        },
        "code_example": "block = TransformerBlock(d_model=64, n_heads=4, d_ff=256)\nx = np.random.randn(1, 10, 64)\nout = block.forward(x)  # (1, 10, 64)",
        "educational_notes": "Le modèle empile N blocs identiques (mais avec des poids différents). Plus de blocs = compréhension plus profonde mais risque d'instabilité. Le résiduel d(x + f(x))/dx = 1 + f'(x) aide le gradient à ne pas disparaître.",
        "related_lessons": [
            {
                "title": "Attention — Comprendre le contexte",
                "path": "/training/attention",
                "phase": "training",
                "step": 4,
            },
            {
                "title": "Feed-Forward — Traiter l'information",
                "path": "/training/feedforward",
                "phase": "training",
                "step": 5,
            },
            {
                "title": "Rétropropagation — Corriger les erreurs",
                "path": "/training/backpropagation",
                "phase": "training",
                "step": 7,
                "note": "Rôle des connexions résiduelles dans le gradient",
            },
            {
                "title": "Passage dans le modèle",
                "path": "/generation/forward-pass",
                "phase": "generation",
                "step": 2,
            },
        ],
    },
    {
        "slug": "loss",
        "name": "Cross-Entropy Loss",
        "source_file": "modules/loss.py",
        "category": "training",
        "order": 7,
        "short_description": "Mesure l'erreur entre prédictions et réalité",
        "purpose": "Le loss mesure 'à quel point le modèle se trompe'. Plus il est bas, mieux le modèle prédit le prochain token. On utilise la cross-entropy fusionnée avec softmax pour la stabilité numérique.",
        "class_interface": {
            "class_name": "CrossEntropyLoss",
            "parent_class": None,
            "constructor": [],
            "methods": [
                {
                    "name": "forward",
                    "signature": "forward(logits: np.ndarray, targets: np.ndarray) -> float",
                    "description": "Calcule la cross-entropy avec le trick log-sum-exp pour la stabilité",
                    "returns": "float (loss scalaire)",
                },
                {
                    "name": "backward",
                    "signature": "backward() -> np.ndarray",
                    "description": "Retourne le gradient (softmax - one_hot) / N — point de départ de la rétropropagation",
                    "returns": "(batch_size, seq_len, vocab_size)",
                },
            ],
            "properties": [
                {
                    "name": "_cache_probs",
                    "type": "np.ndarray",
                    "description": "Probabilités softmax mises en cache pour le backward",
                },
                {
                    "name": "_cache_targets",
                    "type": "np.ndarray",
                    "description": "Targets mis en cache pour le backward",
                },
            ],
        },
        "math_formulas": [
            {
                "name": "Cross-Entropy",
                "latex": "\\mathcal{L} = -\\frac{1}{N}\\sum \\log p_{\\text{correct}}",
                "explanation": "Moyenne du log négatif de la probabilité du bon token",
            },
            {
                "name": "Gradient",
                "latex": "\\nabla_{logits} = \\frac{\\text{softmax}(logits) - \\text{one\\_hot}(target)}{N}",
                "explanation": "Le gradient élégant de la cross-entropy fusionnée",
            },
        ],
        "key_shapes": {
            "input": "logits: (B, T, V), targets: (B, T)",
            "output": "scalaire (float)",
        },
        "data_flow": {
            "previous": "transformer_model (logits)",
            "next": "backpropagation",
            "receives_from": "Logits du modèle et tokens cibles",
            "sends_to": "Gradient initial pour la backpropagation",
        },
        "code_example": "loss_fn = CrossEntropyLoss()\nloss = loss_fn.forward(logits, targets)\ngrad = loss_fn.backward()  # (B, T, V)",
        "educational_notes": "Le trick log-sum-exp évite les overflow numériques. Le gradient simplifié (softmax - one_hot) / N est un des plus beaux résultats du deep learning.",
        "related_lessons": [
            {
                "title": "Calcul de l'erreur — Mesurer les progrès",
                "path": "/training/loss",
                "phase": "training",
                "step": 6,
            },
            {
                "title": "Rétropropagation — Corriger les erreurs",
                "path": "/training/backpropagation",
                "phase": "training",
                "step": 7,
                "note": "Le gradient du loss est le point de départ de la rétropropagation",
            },
        ],
    },
    {
        "slug": "optimizer",
        "name": "Adam Optimizer",
        "source_file": "optim/adam.py",
        "category": "training",
        "order": 8,
        "short_description": "Met à jour les paramètres pour réduire l'erreur",
        "purpose": "Après le calcul des gradients, l'optimizer ajuste tous les paramètres dans la direction qui réduit l'erreur. Adam maintient des moyennes mobiles du gradient pour un apprentissage plus stable que le simple SGD.",
        "class_interface": {
            "class_name": "Adam",
            "parent_class": None,
            "constructor": [
                {
                    "name": "modules",
                    "type": "list",
                    "description": "Liste des modules avec .parameters et .gradients",
                },
                {
                    "name": "lr",
                    "type": "float",
                    "description": "Vitesse d'apprentissage (learning rate)",
                    "default": "1e-3",
                },
                {
                    "name": "beta1",
                    "type": "float",
                    "description": "Décroissance exponentielle du 1er moment",
                    "default": "0.9",
                },
                {
                    "name": "beta2",
                    "type": "float",
                    "description": "Décroissance exponentielle du 2e moment",
                    "default": "0.999",
                },
                {
                    "name": "eps",
                    "type": "float",
                    "description": "Stabilité numérique",
                    "default": "1e-8",
                },
            ],
            "methods": [
                {
                    "name": "step",
                    "signature": "step() -> None",
                    "description": "Met à jour tous les paramètres selon la règle Adam avec correction de biais",
                    "returns": "None",
                },
                {
                    "name": "zero_grad",
                    "signature": "zero_grad() -> None",
                    "description": "Remet tous les gradients à zéro",
                    "returns": "None",
                },
            ],
            "properties": [
                {
                    "name": "t",
                    "type": "int",
                    "description": "Compteur de pas (incrémenté à chaque step)",
                },
                {
                    "name": "m",
                    "type": "dict",
                    "description": "Moyennes mobiles du gradient (1er moment), par (module, param)",
                },
                {
                    "name": "v",
                    "type": "dict",
                    "description": "Moyennes mobiles du gradient² (2e moment), par (module, param)",
                },
            ],
        },
        "math_formulas": [
            {
                "name": "Adam update",
                "latex": "m = \\beta_1 m + (1-\\beta_1)g\\\\v = \\beta_2 v + (1-\\beta_2)g^2\\\\\\theta = \\theta - \\alpha \\frac{\\hat{m}}{\\sqrt{\\hat{v}} + \\epsilon}",
                "explanation": "m = premier moment, v = second moment, bias corrected",
            },
        ],
        "key_shapes": {},
        "data_flow": {
            "previous": "backpropagation (gradients)",
            "next": "Paramètres mis à jour → prochain forward",
            "receives_from": "Gradients de tous les paramètres",
            "sends_to": "Paramètres modifiés in-place",
        },
        "code_example": "optimizer = Adam(model.all_modules(), lr=1e-3)\noptimizer.step()      # Met à jour les poids\noptimizer.zero_grad() # Remet les gradients à zéro",
        "educational_notes": "Le compteur t est incrémenté AVANT la correction du biais pour éviter la division par zéro. Adam converge généralement plus vite que SGD grâce aux moments adaptatifs.",
        "related_lessons": [
            {
                "title": "Optimiseur — Mettre à jour les poids",
                "path": "/training/optimizer",
                "phase": "training",
                "step": 8,
            },
        ],
    },
    {
        "slug": "generator",
        "name": "Generator",
        "source_file": "generation/generator.py",
        "category": "generation",
        "order": 9,
        "short_description": "Génère du texte token par token (autorégressif)",
        "purpose": "La génération est autorégressive : on donne un prompt, le modèle prédit le prochain token, on l'ajoute, et on recommence. Quatre stratégies d'échantillonnage sont disponibles : glouton (greedy), température, top-k et top-p (nucleus).",
        "class_interface": {
            "class_name": "Generator",
            "parent_class": None,
            "constructor": [
                {"name": "model", "type": "TransformerModel", "description": "Le modèle entraîné"},
                {
                    "name": "tokenizer",
                    "type": "BaseTokenizer",
                    "description": "Tokenizer pour encode/decode",
                },
                {
                    "name": "config",
                    "type": "Config",
                    "description": "Configuration (seq_len, temperature, max_gen_len, sampling_strategy, top_k, top_p)",
                },
            ],
            "methods": [
                {
                    "name": "generate",
                    "signature": "generate(prompt: str, max_tokens: int, temperature: float, sampling_strategy: str, top_k: int, top_p: float) -> str",
                    "description": "Génère du texte : encode prompt → forward → échantillonnage → decode, en boucle",
                    "returns": "str (prompt + texte généré)",
                },
            ],
            "properties": [
                {
                    "name": "model",
                    "type": "TransformerModel",
                    "description": "Référence vers le modèle",
                },
                {
                    "name": "tokenizer",
                    "type": "BaseTokenizer",
                    "description": "Référence vers le tokenizer",
                },
            ],
            "sampling_strategies": [
                {
                    "name": "greedy",
                    "description": "Choisit toujours le token le plus probable (argmax). Déterministe.",
                },
                {
                    "name": "temperature",
                    "description": "Divise les logits par T avant softmax. T < 1 → plus conservateur, T > 1 → plus créatif.",
                },
                {
                    "name": "top_k",
                    "description": "Ne considère que les K tokens les plus probables, puis échantillonne parmi eux.",
                },
                {
                    "name": "top_p",
                    "description": "Échantillonnage nucleus : garde les tokens dont la probabilité cumulée atteint P.",
                },
            ],
        },
        "math_formulas": [
            {
                "name": "Température",
                "latex": "p_i = \\text{softmax}\\left(\\frac{logit_i}{T}\\right)",
                "explanation": "T < 1 rend la distribution plus pointue, T > 1 plus plate",
            },
            {
                "name": "Greedy",
                "latex": "\\hat{y} = \\arg\\max_i \\text{logit}_i",
                "explanation": "Choisit toujours le token le plus probable",
            },
            {
                "name": "Top-K",
                "latex": "\\text{Filtrer les } K \\text{ logits les plus élevés, puis softmax + sample}",
                "explanation": "Réduit le risque de choisir des tokens très improbables",
            },
            {
                "name": "Top-P (Nucleus)",
                "latex": "\\text{Garder les tokens jusqu'à } \\sum p_i \\geq P",
                "explanation": "Adapte dynamiquement le nombre de candidats",
            },
        ],
        "key_shapes": {
            "input": "str (prompt)",
            "output": "str (texte complet)",
        },
        "data_flow": {
            "previous": "Modèle entraîné",
            "next": "Texte généré vers l'utilisateur",
            "receives_from": "Prompt texte",
            "sends_to": "Texte généré token par token",
        },
        "code_example": 'from generation.sampling import sample_token\n# Greedy\nnext_token = sample_token(logits, strategy="greedy")\n# Temperature\nnext_token = sample_token(logits, strategy="temperature", temperature=0.8)\n# Top-K\nnext_token = sample_token(logits, strategy="top_k", top_k=10, temperature=0.8)\n# Top-P\nnext_token = sample_token(logits, strategy="top_p", top_p=0.9, temperature=0.8)',
        "educational_notes": "La fenêtre de contexte est limitée à seq_len tokens. Le modèle ne 'voit' que les derniers seq_len tokens à chaque pas de génération. Le choix de la stratégie d'échantillonnage influence fortement la qualité du texte : greedy est déterministe mais peut boucler, top-k et top-p offrent un bon équilibre.",
        "related_lessons": [
            {
                "title": "Passage dans le modèle",
                "path": "/generation/forward-pass",
                "phase": "generation",
                "step": 2,
            },
            {
                "title": "Probabilités et Température",
                "path": "/generation/softmax",
                "phase": "generation",
                "step": 3,
            },
            {
                "title": "Échantillonnage",
                "path": "/generation/sampling",
                "phase": "generation",
                "step": 4,
            },
            {
                "title": "Boucle autorégressive",
                "path": "/generation/autoregressive",
                "phase": "generation",
                "step": 5,
            },
        ],
    },
]

DATA_FLOW = {
    "nodes": [
        {"id": "tokenizer", "label": "Tokenizer", "x": 100, "y": 50},
        {"id": "embedding", "label": "Embedding", "x": 100, "y": 150},
        {"id": "positional_encoding", "label": "Pos. Encoding", "x": 100, "y": 250},
        {"id": "transformer_block", "label": "Transformer Block ×N", "x": 100, "y": 400},
        {"id": "layernorm", "label": "LayerNorm", "x": 50, "y": 370},
        {"id": "attention", "label": "Multi-Head Attention", "x": 250, "y": 350},
        {"id": "feedforward", "label": "Feed-Forward", "x": 250, "y": 450},
        {"id": "final_ln", "label": "Final LayerNorm", "x": 100, "y": 550},
        {"id": "output_head", "label": "Linear → Logits", "x": 100, "y": 650},
        {"id": "loss", "label": "Cross-Entropy Loss", "x": 100, "y": 750},
        {"id": "optimizer", "label": "Adam Optimizer", "x": 300, "y": 750},
        {"id": "generator", "label": "Generator (softmax + sample)", "x": 300, "y": 650},
    ],
    "edges": [
        {"from": "tokenizer", "to": "embedding", "label": "(B, T) int"},
        {"from": "embedding", "to": "positional_encoding", "label": "(B, T, D)"},
        {"from": "positional_encoding", "to": "transformer_block", "label": "(B, T, D)"},
        {"from": "transformer_block", "to": "final_ln", "label": "(B, T, D)"},
        {"from": "final_ln", "to": "output_head", "label": "(B, T, D)"},
        {"from": "output_head", "to": "loss", "label": "(B, T, V) logits"},
        {"from": "output_head", "to": "generator", "label": "(B, T, V) logits"},
        {"from": "loss", "to": "optimizer", "label": "gradients"},
    ],
}


@api_view(["GET"])
def module_list(request):
    summary = [
        {
            k: v
            for k, v in m.items()
            if k in ("slug", "name", "category", "order", "short_description", "source_file")
        }
        for m in MODULES_DOC
    ]
    return Response(summary)


@api_view(["GET"])
def module_detail(request, slug):
    for m in MODULES_DOC:
        if m["slug"] == slug:
            return Response(m)
    return Response({"error": "Module non trouvé"}, status=404)


@api_view(["GET"])
def data_flow(request):
    return Response(DATA_FLOW)
