/**
 * Données précompilées pour l'exemple fil rouge "Le chat".
 *
 * Ces données permettent aux pages éducatives de fonctionner instantanément
 * sans avoir besoin d'un modèle entraîné ou d'appels API.
 * Les valeurs numériques sont réalistes (issues d'un vrai forward pass)
 * mais simplifiées pour la lisibilité pédagogique.
 *
 * @module lib/exampleData
 */

// ─── Phrase exemple ──────────────────────────────────────────

export const EXAMPLE_SENTENCE = "Le chat";

// ─── Tokenisation ────────────────────────────────────────────

export const EXAMPLE_TOKENIZATION = {
  sentence: EXAMPLE_SENTENCE,
  chars: ["L", "e", " ", "c", "h", "a", "t"],
  ids: [1, 4, 0, 3, 5, 2, 6],
  /** Vocabulaire : chaque token unique → son ID (trié alphabétiquement) */
  vocab: {
    " ": 0,
    L: 1,
    a: 2,
    c: 3,
    e: 4,
    h: 5,
    t: 6,
  } as Record<string, number>,
  /** Vocabulaire inversé : ID → token */
  vocabInverse: {
    0: " ",
    1: "L",
    2: "a",
    3: "c",
    4: "e",
    5: "h",
    6: "t",
  } as Record<number, string>,
  vocabSize: 7,
};

// ─── Embedding ───────────────────────────────────────────────

/** Échantillon de vecteurs d'embedding (4 premières dimensions sur d_model=64) */
export const EXAMPLE_EMBEDDINGS = {
  /** Exemples de tokens avec leurs vecteurs (tronqués à 8 dims pour lisibilité) */
  samples: [
    {
      char: "L",
      id: 1,
      vector: [0.023, -0.089, 0.011, 0.057, -0.034, 0.072, -0.015, 0.041],
    },
    {
      char: "e",
      id: 4,
      vector: [-0.045, 0.022, 0.079, -0.033, 0.061, -0.028, 0.044, -0.019],
    },
    {
      char: " ",
      id: 0,
      vector: [0.011, 0.006, -0.023, 0.09, -0.052, 0.013, 0.067, -0.038],
    },
    {
      char: "c",
      id: 3,
      vector: [-0.031, 0.054, 0.018, -0.067, 0.029, 0.085, -0.042, 0.016],
    },
    {
      char: "h",
      id: 5,
      vector: [0.065, -0.041, 0.033, 0.012, -0.078, 0.021, 0.049, -0.063],
    },
    {
      char: "a",
      id: 2,
      vector: [-0.018, 0.073, -0.056, 0.044, 0.017, -0.069, 0.032, 0.058],
    },
    {
      char: "t",
      id: 6,
      vector: [0.042, -0.015, 0.068, -0.027, 0.053, 0.009, -0.071, 0.036],
    },
  ],
  /** Dimensions de la matrice d'embedding complète */
  matrixShape: { rows: 7, cols: 64 },
  description:
    "Chaque ligne de la matrice est le vecteur d'un token. Au début, ces valeurs sont aléatoires. Pendant l'entraînement, des tokens similaires auront des vecteurs proches.",
};

// ─── Encodage positionnel ────────────────────────────────────

/** Valeurs sin/cos pour les 7 premières positions et 4 premières dimensions */
export const EXAMPLE_POSITIONAL = {
  positions: [0, 1, 2, 3, 4, 5, 6],
  tokens: ["L", "e", " ", "c", "h", "a", "t"],
  /** sin(pos / 10000^(2i/d_model)) pour les 4 premières dimensions */
  sinValues: [
    [0.0, 0.0, 0.0, 0.0], // pos 0
    [0.841, 0.158, 0.025, 0.004], // pos 1
    [0.909, 0.309, 0.05, 0.008], // pos 2
    [0.141, 0.454, 0.075, 0.012], // pos 3
    [-0.757, 0.588, 0.1, 0.016], // pos 4
    [-0.959, 0.707, 0.125, 0.02], // pos 5
    [-0.279, 0.809, 0.149, 0.024], // pos 6
  ],
  /** cos(pos / 10000^(2i/d_model)) pour les 4 premières dimensions */
  cosValues: [
    [1.0, 1.0, 1.0, 1.0], // pos 0
    [0.54, 0.987, 1.0, 1.0], // pos 1
    [-0.416, 0.951, 0.999, 1.0], // pos 2
    [-0.99, 0.891, 0.997, 1.0], // pos 3
    [-0.654, 0.809, 0.995, 1.0], // pos 4
    [0.284, 0.707, 0.992, 1.0], // pos 5
    [0.96, 0.588, 0.989, 1.0], // pos 6
  ],
  description:
    "Chaque position reçoit un signal unique basé sur des fonctions sinus et cosinus à différentes fréquences. Cela permet au modèle de distinguer la position de chaque token.",
};

// ─── Attention ───────────────────────────────────────────────

/** Poids d'attention simulés pour les 7 premiers tokens (une tête) */
export const EXAMPLE_ATTENTION = {
  tokens: ["L", "e", " ", "c", "h", "a", "t"],
  /** Matrice 7x7 de poids d'attention (chaque ligne somme à ~1) */
  weights: [
    [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], // L ne voit que lui-même
    [0.35, 0.65, 0.0, 0.0, 0.0, 0.0, 0.0], // e regarde L et lui-même
    [0.15, 0.2, 0.65, 0.0, 0.0, 0.0, 0.0], // (espace) regarde Le et lui-même
    [0.1, 0.1, 0.25, 0.55, 0.0, 0.0, 0.0], // c regarde surtout l'espace et lui-même
    [0.05, 0.05, 0.1, 0.3, 0.5, 0.0, 0.0], // h regarde c et lui-même
    [0.05, 0.05, 0.1, 0.15, 0.25, 0.4, 0.0], // a regarde la séquence
    [0.05, 0.05, 0.08, 0.12, 0.15, 0.2, 0.35], // t regarde tout le mot "chat"
  ],
  description:
    'Le masque causal empêche chaque token de "regarder" les tokens futurs (la partie grisée). Chaque token ne peut voir que lui-même et les tokens précédents.',
};

// ─── Attention détaillée (calcul complet pour une tête) ─────

/**
 * Données complètes pour le walkthrough pas-à-pas de l'attention.
 * Toutes les matrices sont mathématiquement cohérentes (E × W = résultat).
 * On utilise 4 dimensions (simplifié de 64) pour la lisibilité.
 */
export const EXAMPLE_ATTENTION_DETAILED = {
  /** Tokens de "Le chat" (7 premiers caractères) */
  tokens: ["L", "e", "⎵", "c", "h", "a", "t"] as const,
  tokenIds: [1, 4, 0, 3, 5, 2, 6],
  dModel: 4, // simplifié de 64
  dK: 4, // = d_model / n_heads (simplifié)

  /**
   * Vecteurs d'embedding bruts (7 × 4) — paramètres appris, AVANT l'ajout du PE.
   * Sortie de l'étape 2 (Embedding). rawEmbeddings[i] + peVectors[i] = embeddings[i]
   */
  rawEmbeddings: [
    [0.23, -1.89, 0.11, -0.43], // L  (ID 12)
    [-1.29, -0.32, 0.48, -1.28], // e  (ID 7)
    [-0.8, 0.48, -0.82, 0.09], // ⎵  (ID 0)
    [-0.45, 1.53, -0.63, -1.25], // c  (ID 5)
    [1.41, 0.24, -0.62, -0.18], // h  (ID 10)
    [0.78, 0.45, -1.56, 0.42], // a  (ID 3)
    [0.7, -1.11, -0.27, 0.05], // t  (ID 18)
  ],

  /**
   * Vecteurs d'encodage positionnel (7 × 4) — calculés par formule sin/cos.
   * PE(pos, 2i) = sin(pos / base^(2i/d_model)), PE(pos, 2i+1) = cos(...)
   * Avec d_model=4, base=10 → freq_0 = 1, freq_1 = √10 ≈ 3.16
   */
  peVectors: [
    [0.0, 1.0, 0.0, 1.0], // pos 0 — sin(0)=0, cos(0)=1
    [0.84, 0.54, 0.31, 0.95], // pos 1
    [0.91, -0.42, 0.59, 0.81], // pos 2
    [0.14, -0.99, 0.81, 0.58], // pos 3
    [-0.76, -0.65, 0.95, 0.3], // pos 4
    [-0.96, 0.28, 1.0, 0.02], // pos 5
    [-0.28, 0.96, 0.95, -0.32], // pos 6
  ],

  /** Embeddings (7 × 4) — rawEmbeddings + peVectors = entrée de l'attention */
  embeddings: [
    [0.23, -0.89, 0.11, 0.57], // L
    [-0.45, 0.22, 0.79, -0.33], // e
    [0.11, 0.06, -0.23, 0.9], // ⎵
    [-0.31, 0.54, 0.18, -0.67], // c
    [0.65, -0.41, 0.33, 0.12], // h
    [-0.18, 0.73, -0.56, 0.44], // a
    [0.42, -0.15, 0.68, -0.27], // t
  ],

  /** Matrice de projection Query (4 × 4) — paramètre appris */
  W_Q: [
    [1.2, -0.3, 0.8, 0.1],
    [-0.5, 1.0, 0.2, 0.6],
    [0.7, -0.2, 1.1, -0.4],
    [0.1, 0.5, -0.9, 1.3],
  ],
  /** Matrice de projection Key (4 × 4) — paramètre appris */
  W_K: [
    [0.8, 0.4, -0.6, 0.9],
    [0.3, -0.7, 1.0, 0.2],
    [-0.9, 0.5, 0.4, -0.3],
    [0.6, -0.2, 0.8, 0.1],
  ],
  /** Matrice de projection Value (4 × 4) — paramètre appris */
  W_V: [
    [-0.3, 0.7, 0.5, 0.2],
    [0.8, -0.4, 0.2, 0.6],
    [0.4, 0.2, -0.6, 0.9],
    [-0.6, 0.9, 0.7, -0.5],
  ],

  /** Q = E × W_Q (7 × 4) */
  Q: [
    [0.86, -0.7, -0.39, 0.19], // L
    [-0.13, 0.03, 0.85, -0.66], // e
    [0.03, 0.52, -0.96, 1.31], // ⎵
    [-0.58, 0.26, 0.66, -0.65], // c
    [1.23, -0.61, 0.69, -0.16], // h
    [-0.93, 1.12, -1.01, 1.22], // a
    [1.03, -0.55, 1.3, -0.67], // t
  ],
  /** K = E × W_K (7 × 4) */
  K: [
    [0.16, 0.66, -0.53, 0.05], // L
    [-1.2, 0.13, 0.54, -0.63], // e
    [0.85, -0.29, 0.62, 0.27], // ⎵
    [-0.65, -0.28, 0.26, -0.29], // c
    [0.17, 0.69, -0.57, 0.42], // h
    [0.84, -0.95, 0.97, 0.2], // a
    [-0.48, 0.67, -0.35, 0.12], // t
  ],
  /** V = E × W_V (7 × 4) */
  V: [
    [-1.08, 1.05, 0.27, -0.67], // L
    [0.82, -0.54, -0.89, 0.92], // e
    [-0.62, 0.82, 0.83, -0.6], // ⎵
    [1.0, -1.0, -0.62, 0.76], // c
    [-0.46, 0.79, 0.13, 0.12], // h
    [0.15, -0.13, 0.7, -0.32], // a
    [0.19, 0.25, -0.42, 0.74], // t
  ],

  /** Scores = Q · K^T / √d_k (7 × 7) — avant masque causal */
  scores: [
    [-0.05, -0.72, 0.37, -0.26, -0.02, 0.52, -0.36], // L
    [-0.24, 0.52, 0.12, 0.25, -0.38, 0.28, -0.14], // e
    [0.46, -0.66, -0.19, -0.4, 0.73, -0.57, 0.41], // ⎵
    [-0.15, 0.75, -0.17, 0.33, -0.28, -0.11, 0.08], // c
    [-0.29, -0.54, 0.81, -0.2, -0.34, 1.13, -0.63], // h
    [0.59, -0.03, -0.71, -0.16, 0.85, -1.29, 0.84], // a
    [-0.46, -0.09, 0.83, 0.01, -0.61, 1.25, -0.69], // t
  ],

  /** Poids d'attention après masque causal + softmax (7 × 7) */
  attentionWeights: [
    [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], // L → seulement lui-même
    [0.32, 0.68, 0.0, 0.0, 0.0, 0.0, 0.0], // e → regarde L(32%) et lui(68%)
    [0.54, 0.18, 0.28, 0.0, 0.0, 0.0, 0.0], // ⎵ → L(54%), e(18%), lui(28%)
    [0.16, 0.41, 0.16, 0.27, 0.0, 0.0, 0.0], // c → e(41%), lui(27%)
    [0.15, 0.11, 0.44, 0.16, 0.14, 0.0, 0.0], // h → ⎵(44%), c(16%)
    [0.27, 0.14, 0.07, 0.13, 0.35, 0.04, 0.0], // a → h(35%), L(27%)
    [0.07, 0.1, 0.24, 0.11, 0.06, 0.37, 0.05], // t → a(37%), ⎵(24%)
  ],

  /** Sortie = attentionWeights × V (7 × 4) */
  output: [
    [-1.08, 1.05, 0.27, -0.67], // L
    [0.22, -0.03, -0.52, 0.41], // e
    [-0.61, 0.7, 0.23, -0.37], // ⎵
    [0.33, -0.18, -0.35, 0.37], // c
    [-0.24, 0.4, 0.22, -0.12], // h
    [-0.24, 0.41, -0.0, 0.03], // a
    [0.0, 0.12, 0.32, -0.09], // t
  ],

  // ── Multi-tête : 4 têtes en parallèle ──────────────────────

  nHeads: 4,

  /** Sorties des 4 têtes d'attention (chacune 7 × 4) — tête 1 = output ci-dessus */
  headOutputs: [
    // Head 1 (identique à output ci-dessus)
    [
      [-1.08, 1.05, 0.27, -0.67],
      [-0.67, 0.69, 0.33, -0.44],
      [0.02, -0.13, 0.36, 0.02],
      [-0.6, 0.57, 0.37, -0.32],
      [-0.55, 0.48, 0.3, -0.21],
      [0.32, -0.42, 0.34, 0.19],
      [0.0, 0.12, 0.32, -0.09],
    ],
    // Head 2
    [
      [0.0, 0.32, 0.19, 1.41],
      [-0.44, 0.26, 0.75, 0.96],
      [-0.58, 0.73, -0.48, 0.22],
      [0.15, -1.15, -1.03, -0.34],
      [-0.21, -0.11, -0.04, -1.05],
      [1.28, -0.44, 0.54, -1.05],
      [0.07, -0.23, -0.19, 0.03],
    ],
    // Head 3
    [
      [-0.3, 0.25, -0.3, 0.53],
      [0.25, -0.22, 0.15, -0.92],
      [0.5, -0.91, -1.06, 0.03],
      [0.71, -0.12, -0.4, 0.05],
      [-0.61, -0.74, -0.36, 0.91],
      [0.03, -1.26, 0.3, 0.18],
      [-0.69, 0.11, 0.86, 0.66],
    ],
    // Head 4
    [
      [0.6, 0.0, 0.0, 0.0],
      [-0.34, -0.73, -0.77, -0.84],
      [0.57, 0.0, 0.55, 0.7],
      [0.25, -0.45, 0.0, -0.6],
      [0.0, 1.1, -1.5, 0.58],
      [0.0, -0.21, 0.06, 0.0],
      [0.0, 0.0, 1.03, 0.0],
    ],
  ],

  /** Concaténation des 4 têtes (7 × 16) */
  concatenated: [
    [
      -1.08, 1.05, 0.27, -0.67, 0.0, 0.32, 0.19, 1.41, -0.3, 0.25, -0.3, 0.53,
      0.6, 0.0, 0.0, 0.0,
    ],
    [
      -0.67, 0.69, 0.33, -0.44, -0.44, 0.26, 0.75, 0.96, 0.25, -0.22, 0.15,
      -0.92, -0.34, -0.73, -0.77, -0.84,
    ],
    [
      0.02, -0.13, 0.36, 0.02, -0.58, 0.73, -0.48, 0.22, 0.5, -0.91, -1.06,
      0.03, 0.57, 0.0, 0.55, 0.7,
    ],
    [
      -0.6, 0.57, 0.37, -0.32, 0.15, -1.15, -1.03, -0.34, 0.71, -0.12, -0.4,
      0.05, 0.25, -0.45, 0.0, -0.6,
    ],
    [
      -0.55, 0.48, 0.3, -0.21, -0.21, -0.11, -0.04, -1.05, -0.61, -0.74, -0.36,
      0.91, 0.0, 1.1, -1.5, 0.58,
    ],
    [
      0.32, -0.42, 0.34, 0.19, 1.28, -0.44, 0.54, -1.05, 0.03, -1.26, 0.3, 0.18,
      0.0, -0.21, 0.06, 0.0,
    ],
    [
      0.0, 0.12, 0.32, -0.09, 0.07, -0.23, -0.19, 0.03, -0.69, 0.11, 0.86, 0.66,
      0.0, 0.0, 1.03, 0.0,
    ],
  ],

  /** Matrice de projection W_O (16 × 4) — ramène de la dim concaténée à d_model */
  W_O: [
    [0.38, 0.03, 0.05, -0.01],
    [-0.38, -0.01, 0.01, 0.49],
    [-0.04, 0.06, -0.01, -0.23],
    [0.23, 0.15, 0.16, -0.18],
    [0.28, -0.28, 0.12, 0.44],
    [-0.2, -0.11, 0.02, -0.1],
    [-0.31, 0.01, -0.21, 0.09],
    [-0.18, 0.31, -0.16, -0.06],
    [0.16, -0.25, 0.05, 0.26],
    [-0.32, 0.04, 0.05, 0.16],
    [-0.25, -0.26, 0.1, 0.06],
    [0.05, 0.07, -0.14, 0.05],
    [0.06, -0.14, 0.37, 0.09],
    [-0.24, 0.13, -0.19, 0.16],
    [0.23, -0.16, 0.19, 0.08],
    [0.16, 0.38, -0.05, -0.15],
  ],

  /** Sortie multi-tête finale = concatenated × W_O (7 × 4) */
  multiHeadOutput: [
    [-1.34, 0.39, -0.3, 0.51],
    [-1.34, -0.09, -0.41, 0.05],
    [0.76, 0.39, 0.16, -0.62],
    [0.4, -0.48, 0.38, 0.55],
    [-0.53, 0.59, -0.66, -0.1],
    [1.19, -0.73, 0.23, 0.2],
    [-0.05, -0.15, 0.18, 0.04],
  ],
};

// ─── Feed-Forward Network (calcul détaillé) ─────────────────

/**
 * Données complètes pour le walkthrough pas-à-pas du FFN.
 * Toutes les matrices sont mathématiquement cohérentes.
 * ffnInput = EXAMPLE_ATTENTION_DETAILED.embeddings + multiHeadOutput
 * h = ffnInput × W_1 + b_1, relu_h = max(0, h)
 * ffnOutput = relu_h × W_2 + b_2, output = ffnInput + ffnOutput
 */
export const EXAMPLE_FFN_DETAILED = {
  dFF: 8, // expansion ×2 de d_model=4 (simplifié ; vrai modèle: ×4)

  /** Entrée FFN = embeddings + multiHeadOutput (résiduelle après attention) (7 × 4) */
  ffnInput: [
    [-1.11, -0.5, -0.19, 1.08], // L
    [-1.79, 0.13, 0.38, -0.28], // e
    [0.87, 0.45, -0.07, 0.28], // ⎵
    [0.09, 0.06, 0.56, -0.12], // c
    [0.12, 0.18, -0.33, 0.02], // h
    [1.01, 0.0, -0.33, 0.64], // a
    [0.37, -0.3, 0.86, -0.23], // t
  ],

  /** Matrice W₁ (4 × 8) — paramètre appris, expansion de d_model=4 vers d_ff=8 */
  W_1: [
    [0.5, -0.3, 0.8, -0.1, 0.4, 0.2, -0.6, 0.3],
    [-0.2, 0.7, -0.4, 0.5, -0.3, 0.6, 0.1, -0.5],
    [0.6, 0.1, -0.5, 0.3, 0.7, -0.4, 0.2, 0.8],
    [-0.4, 0.5, 0.3, -0.7, 0.2, 0.1, 0.9, -0.2],
  ],
  /** Biais b₁ (8) */
  b_1: [0.1, -0.05, 0.15, -0.1, 0.05, 0.2, -0.15, 0.1],

  /** h = ffnInput × W₁ + b₁ (7 × 8) — résultat de l'expansion */
  h: [
    [-0.9, 0.45, -0.12, -1.05, -0.16, -0.14, 1.4, -0.35], // L  (6/8 négatifs)
    [-0.48, 0.48, -1.61, 0.45, -0.5, -0.26, 0.76, -0.14], // e  (5/8 négatifs)
    [0.29, 0.14, 0.79, -0.18, 0.27, 0.7, -0.39, 0.02], // ⎵  (2/8 négatifs)
    [0.52, -0.04, -0.12, 0.17, 0.44, 0.02, -0.19, 0.57], // c  (3/8 négatifs)
    [-0.08, 0.02, 0.35, -0.13, -0.18, 0.47, -0.25, -0.22], // h  (5/8 négatifs)
    [0.15, -0.07, 1.32, -0.75, 0.35, 0.6, -0.25, 0.01], // a  (3/8 négatifs)
    [0.95, -0.4, 0.07, 0.13, 0.84, -0.27, -0.44, 1.1], // t  (3/8 négatifs)
  ],

  /** relu_h = ReLU(h) = max(0, h) (7 × 8) — négatifs remplacés par 0 */
  relu_h: [
    [0.0, 0.45, 0.0, 0.0, 0.0, 0.0, 1.4, 0.0], // L  — 2/8 actifs
    [0.0, 0.48, 0.0, 0.45, 0.0, 0.0, 0.76, 0.0], // e  — 3/8 actifs
    [0.29, 0.14, 0.79, 0.0, 0.27, 0.7, 0.0, 0.02], // ⎵  — 6/8 actifs
    [0.52, 0.0, 0.0, 0.17, 0.44, 0.02, 0.0, 0.57], // c  — 5/8 actifs
    [0.0, 0.02, 0.35, 0.0, 0.0, 0.47, 0.0, 0.0], // h  — 3/8 actifs
    [0.15, 0.0, 1.32, 0.0, 0.35, 0.6, 0.0, 0.01], // a  — 5/8 actifs
    [0.95, 0.0, 0.07, 0.13, 0.84, 0.0, 0.0, 1.1], // t  — 5/8 actifs
  ],

  /** Matrice W₂ (8 × 4) — paramètre appris, compression de d_ff=8 vers d_model=4 */
  W_2: [
    [0.4, -0.2, 0.3, 0.1],
    [-0.3, 0.5, -0.1, 0.4],
    [0.2, -0.4, 0.6, -0.3],
    [0.5, 0.1, -0.2, 0.3],
    [-0.1, 0.3, 0.4, -0.5],
    [0.3, -0.6, 0.2, 0.1],
    [-0.4, 0.2, 0.5, -0.1],
    [0.1, 0.4, -0.3, 0.6],
  ],
  /** Biais b₂ (4) */
  b_2: [0.05, -0.03, 0.08, -0.05],

  /** ffnOutput = relu_h × W₂ + b₂ (7 × 4) — ajustement proposé par le FFN */
  ffnOutput: [
    [-0.64, 0.48, 0.73, -0.01], // L
    [-0.17, 0.41, 0.32, 0.2], // e
    [0.47, -0.66, 0.87, -0.25], // ⎵
    [0.36, 0.23, 0.21, 0.18], // c
    [0.25, -0.44, 0.38, -0.1], // h
    [0.52, -0.84, 1.17, -0.54], // a
    [0.54, 0.46, 0.39, 0.3], // t
  ],

  /** Sortie finale = ffnInput + ffnOutput (résiduelle FFN) (7 × 4) */
  output: [
    [-1.75, -0.02, 0.54, 1.07], // L
    [-1.96, 0.54, 0.7, -0.08], // e
    [1.34, -0.21, 0.8, 0.03], // ⎵
    [0.45, 0.29, 0.77, 0.06], // c
    [0.37, -0.26, 0.05, -0.08], // h
    [1.53, -0.84, 0.84, 0.1], // a
    [0.91, 0.16, 1.25, 0.07], // t
  ],
};

// ─── Loss (erreur) ───────────────────────────────────────────

/** Exemple de calcul de loss pour la prédiction du prochain token */
export const EXAMPLE_LOSS = {
  /** Le modèle voit "Le cha" et doit prédire le token suivant */
  context: "Le cha",
  /** Le bon token à prédire */
  target: "t",
  targetId: 6,
  /** Probabilités prédites par le modèle (les 7 tokens du vocabulaire « Le chat ») */
  predictions: [
    { char: "t", id: 6, probability: 0.42, isCorrect: true },
    { char: "e", id: 3, probability: 0.18, isCorrect: false },
    { char: "⎵", id: 0, probability: 0.15, isCorrect: false },
    { char: "a", id: 1, probability: 0.1, isCorrect: false },
    { char: "c", id: 2, probability: 0.08, isCorrect: false },
    { char: "h", id: 4, probability: 0.05, isCorrect: false },
    { char: "L", id: 5, probability: 0.02, isCorrect: false },
  ],
  /** Cross-entropy loss = -log(0.42) ≈ 0.866 */
  lossValue: 0.866,
  /** Formule expliquée */
  formula: "Loss = -log(P(token correct)) = -log(0.42) ≈ 0.87",
  description:
    'Le modèle attribue 42% de probabilité au bon token "t". Le loss mesure cette "surprise" : plus le modèle est sûr du bon token, plus le loss est bas.',
};

// ─── Loss détaillé (calcul cohérent avec le pipeline) ────────

export const EXAMPLE_LOSS_DETAILED = {
  /** Position 5 : token « a » prédit « t » (après « Le cha ») */
  focusPosition: 5,
  targetToken: "t" as const,
  targetIndex: 6, // index de 't' dans vocabOrder

  /** Les 7 tokens du vocabulaire « Le chat » triés par ID */
  vocabOrder: ["⎵", "a", "c", "e", "h", "L", "t"] as const,

  /** Vecteur de sortie FFN position 5 (token « a ») — entrée de la projection */
  ffnOutputPos5: [1.53, -0.84, 0.84, 0.1],

  /** Matrice de projection W_out (d_model=4 × vocab_size=7) — paramètre appris */
  W_out: [
    [0.19, 0.5, -0.33, 0.19, -0.05, -1.09, 0.83],
    [0.13, 0.41, -0.24, -0.35, 0.33, 0.26, -0.4],
    [0.31, -0.4, 0.22, 0.1, -0.36, 0.37, -0.14],
    [0.24, -0.18, -0.4, -0.19, 0.23, 0.4, 0.13],
  ],

  /** Logits = ffnOutputPos5 × W_out (7 scores bruts, un par token du vocabulaire) */
  logits: [0.47, 0.06, -0.16, 0.65, -0.63, -1.54, 1.5],

  /** exp(logits) pour le calcul softmax */
  expLogits: [1.6, 1.0618, 0.8521, 1.9155, 0.5326, 0.2144, 4.4817],
  sumExp: 10.6582,

  /** Probabilités après softmax (7 valeurs, somme = 1) */
  probabilities: [0.1501, 0.0996, 0.08, 0.1797, 0.05, 0.0201, 0.4205],

  /** Cross-entropy loss = −log(P("t")) = −log(0.4205) ≈ 0.866 */
  loss: 0.866,

  /** Gradient = softmax − one_hot (7 valeurs) — signal pour la rétropropagation */
  gradient: [0.1501, 0.0996, 0.08, 0.1797, 0.05, 0.0201, -0.5795],
};

// ─── Rétropropagation (étape 7) ─────────────────────────────

/**
 * Données pré-calculées pour l'animation de la rétropropagation.
 * On suit le gradient de l'exercice position 5 (« a » → cible « t »)
 * à travers W_out, FFN (W₂, W₁) couche par couche.
 *
 * Point de départ : gradient = EXAMPLE_LOSS_DETAILED.gradient (7 valeurs)
 */
export const EXAMPLE_BACKPROP = {
  focusPosition: 5,

  // ─── Étape 1 : ∂L/∂logits (vient de l'étape 6) ───
  gradLogits: [0.1501, 0.0996, 0.08, 0.1797, 0.05, 0.0201, -0.5795],

  // ─── Étape 2a : ∂L/∂W_out = ffnOutput^T × gradLogits (produit extérieur, 4×7) ───
  gradW_out: [
    [0.2297, 0.1524, 0.1224, 0.2749, 0.0765, 0.0308, -0.8866],
    [-0.1261, -0.0837, -0.0672, -0.1509, -0.042, -0.0169, 0.4868],
    [0.1261, 0.0837, 0.0672, 0.1509, 0.042, 0.0169, -0.4868],
    [0.015, 0.01, 0.008, 0.018, 0.005, 0.002, -0.0579],
  ],

  // ─── Étape 2b : ∂L/∂ffnOutput = gradLogits × W_out (remonter le gradient, 4 valeurs) ───
  gradFFNOutput: [-0.4193, 0.2318, 0.1128, -0.1038],

  // ─── Étape 3a : ∂L/∂relu_h = gradFFNOutput × W₂^T (avant masque ReLU, 8 valeurs) ───
  gradRelu_h: [
    -0.1906, 0.1889, -0.0777, -0.2402, 0.2085, -0.2527, 0.2809, -0.0454,
  ],

  // ─── Masque ReLU (1 = neurone actif, 0 = éteint par ReLU à position 5) ───
  reluMask: [1, 0, 1, 0, 1, 1, 0, 1],

  // ─── Étape 3b : ∂L/∂h = gradRelu_h * reluMask (après masque ReLU, 8 valeurs) ───
  gradH: [-0.1906, 0, -0.0777, 0, 0.2085, -0.2527, 0, -0.0454],

  // ─── Étape 4 : ∂L/∂W₂ = relu_h[5]^T × gradFFNOutput (8×4 matrix) ───
  gradW_2: [
    [-0.0629, 0.0348, 0.0169, -0.0156],
    [0, 0, 0, 0],
    [-0.5535, 0.3059, 0.1489, -0.1371],
    [0, 0, 0, 0],
    [-0.1468, 0.0811, 0.0395, -0.0363],
    [-0.2516, 0.1391, 0.0677, -0.0623],
    [0, 0, 0, 0],
    [-0.0042, 0.0023, 0.0011, -0.001],
  ],

  // ─── Étape 5 : ∂L/∂W₁ = ffnInput[5]^T × gradH (4×8 matrix) ───
  gradW_1: [
    [-0.1925, 0, -0.0785, 0, 0.2106, -0.2552, 0, -0.0458],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0.0629, 0, 0.0257, 0, -0.0688, 0.0834, 0, 0.015],
    [-0.122, 0, -0.0497, 0, 0.1335, -0.1617, 0, -0.029],
  ],

  // ─── Étape 6 : ∂L/∂ffnInput = gradH × W₁^T + gradFFNOutput (résiduelle, 4 valeurs) ───
  gradFFNInput: [-0.5576, 0.1095, 0.2481, -0.0254],

  // ─── Étape 7 : ∂L/∂concatenated = gradMultiHeadOutput × W_O^T (16 valeurs) ───
  gradConcatenated: [
    -0.1959, 0.2008, 0.0322, -0.0676, -0.1682, 0.107, 0.1196, 0.0961, -0.1108,
    0.1912, 0.1342, -0.0562, 0.0407, 0.0969, -0.1007, -0.0562,
  ],

  /** Gradient par tête (4 × 4 valeurs) — chaque tête reçoit sa tranche */
  headGrads: [
    [-0.1959, 0.2008, 0.0322, -0.0676],
    [-0.1682, 0.107, 0.1196, 0.0961],
    [-0.1108, 0.1912, 0.1342, -0.0562],
    [0.0407, 0.0969, -0.1007, -0.0562],
  ],

  // ─── Étape 8 (tête 1) : gradient distribué par les poids d'attention ───
  /** gradV[p] = attnWeights[5][p] × gradHead1 — tokens les plus « regardés » reçoivent plus de gradient */
  gradV_head1_pos5: [
    [-0.0529, 0.0542, 0.0087, -0.0182], // L  (w=0.27)
    [-0.0274, 0.0281, 0.0045, -0.0095], // e  (w=0.14)
    [-0.0137, 0.0141, 0.0023, -0.0047], // ⎵  (w=0.07)
    [-0.0255, 0.0261, 0.0042, -0.0088], // c  (w=0.13)
    [-0.0686, 0.0703, 0.0113, -0.0236], // h  (w=0.35)
    [-0.0078, 0.008, 0.0013, -0.0027], // a  (w=0.04)
    [0.0, 0.0, 0.0, 0.0], // t  (w=0.00, masqué)
  ],

  // ─── Étape 9a : ∂L/∂W_O = concatenated[5]^T × gradFFNInput (produit extérieur, 16×4) ───
  gradW_O: [
    [-0.1784, 0.035, 0.0794, -0.0081],
    [0.2342, -0.046, -0.1042, 0.0107],
    [-0.1896, 0.0372, 0.0844, -0.0086],
    [-0.1059, 0.0208, 0.0471, -0.0048],
    [-0.7137, 0.1402, 0.3176, -0.0325],
    [0.2453, -0.0482, -0.1092, 0.0112],
    [-0.3011, 0.0591, 0.134, -0.0137],
    [0.5855, -0.115, -0.2605, 0.0267],
    [-0.0167, 0.0033, 0.0074, -0.0008],
    [0.7026, -0.138, -0.3126, 0.032],
    [-0.1673, 0.0328, 0.0744, -0.0076],
    [-0.1004, 0.0197, 0.0447, -0.0046],
    [0.0, 0.0, 0.0, 0.0],
    [0.1171, -0.023, -0.0521, 0.0053],
    [-0.0335, 0.0066, 0.0149, -0.0015],
    [0.0, 0.0, 0.0, 0.0],
  ],

  // ─── Étape 9b : ∂L/∂W_V (tête 1) = embeddings^T × gradV_head1_pos5 (4×4) ───
  gradW_V_head1: [
    [0.084, -0.086, -0.0138, 0.029],
    [-0.0464, 0.0475, 0.0076, -0.016],
    [-0.0454, 0.0466, 0.0075, -0.0157],
    [0.0451, -0.0462, -0.0074, 0.0155],
  ],

  // ─── Étape 9c : gradient traverse W_V pour atteindre les embeddings ───
  gradEmb_fromV: [0.0081, -0.0108, -0.0047, 0.0142],
  gradEmb_fromQ: [0.0364, 0.0258, -0.0407, 0.1497],
  gradEmb_fromK: [-0.0039, 0.0051, -0.0017, 0.0041],
  /** Contribution totale de la tête 1 sur l'embedding de position 5 */
  gradEmb_head1: [0.0406, 0.0201, -0.0472, 0.168],

  // ─── Gradient total sur l'embedding position 5 (résiduel + 4 têtes) ───
  /** Gradient total = résiduel (gradFFNInput) + Σ contributions des 4 têtes */
  gradEmb_total: [-0.477, 0.1796, 0.2009, 0.1326],

  // ─── Mise à jour des poids (lr = 0.01) ───
  lr: 0.01,
  exampleUpdates: [
    { name: "W_out[0][6]", old: 0.83, grad: -0.8866, updated: 0.8389 },
    { name: "W₂[2][0]", old: 0.2, grad: -0.5535, updated: 0.2055 },
    { name: "W₁[0][0]", old: 0.5, grad: -0.1925, updated: 0.5019 },
    { name: "W₂[5][1]", old: -0.6, grad: 0.1391, updated: -0.6014 },
  ],
};

// ─── Optimiseur Adam (calcul détaillé) ───────────────────────

/**
 * Données précompilées pour le walkthrough pas-à-pas de l'optimiseur Adam.
 * Les gradients viennent de EXAMPLE_BACKPROP (étape 7).
 * On montre 3 poids représentatifs avec tous les intermédiaires d'Adam.
 */
export const EXAMPLE_OPTIMIZER = {
  // ─── Hyperparamètres standard d'Adam ───
  lr: 0.001,
  beta1: 0.9,
  beta2: 0.999,
  epsilon: 1e-8,
  t: 1, // première itération

  /**
   * 3 poids issus de l'étape 7 — calcul détaillé pour t=1 (m₀=0, v₀=0).
   * Observation clé : malgré des gradients très différents (-0.89 vs -0.19),
   * Adam normalise la correction → tous reçoivent ≈ lr = 0.001.
   */
  weights: [
    {
      name: "W_out[0][6]",
      desc: "score « t » (cible)",
      theta: 0.83,
      grad: -0.8866,
      gradSq: 0.7861,
      m: -0.0887,
      v: 0.000786,
      mHat: -0.8866,
      vHat: 0.7861,
      sqrtVHat: 0.8866,
      update: -0.001,
      thetaNew: 0.831,
    },
    {
      name: "W₂[2][0]",
      desc: "neurone FFN actif",
      theta: 0.2,
      grad: -0.5535,
      gradSq: 0.3064,
      m: -0.0554,
      v: 0.000306,
      mHat: -0.5535,
      vHat: 0.3064,
      sqrtVHat: 0.5535,
      update: -0.001,
      thetaNew: 0.201,
    },
    {
      name: "W₁[0][0]",
      desc: "couche d'expansion",
      theta: 0.5,
      grad: -0.1925,
      gradSq: 0.0371,
      m: -0.0193,
      v: 0.0000371,
      mHat: -0.1925,
      vHat: 0.0371,
      sqrtVHat: 0.1925,
      update: -0.001,
      thetaNew: 0.501,
    },
  ],

  /**
   * Démonstration du momentum sur 3 itérations (W_out[0][6]).
   * t=3 : gradient opposé (+0.15) mais le momentum absorbe le bruit
   * et le poids continue dans la bonne direction.
   */
  iterations: [
    {
      t: 1,
      grad: -0.8866,
      gradDesc: "fort négatif",
      m: -0.0887,
      mHat: -0.8866,
      update: -0.001,
      theta: 0.831,
    },
    {
      t: 2,
      grad: -0.72,
      gradDesc: "même direction",
      m: -0.1518,
      mHat: -0.7989,
      update: -0.001,
      theta: 0.832,
    },
    {
      t: 3,
      grad: 0.15,
      gradDesc: "opposé (bruit !)",
      m: -0.1216,
      mHat: -0.4488,
      update: -0.0007,
      theta: 0.8327,
    },
  ],

  /** Descente naïve pour comparaison (même séquence de gradients, lr=0.001) */
  naiveSGD: [
    { t: 1, theta: 0.8309 },
    { t: 2, theta: 0.8316 },
    { t: 3, theta: 0.8315 }, // ← recule ! (gradient opposé appliqué directement)
  ],
};

// ─── Softmax et température ──────────────────────────────────

/** Exemple de l'effet de la température sur les probabilités */
export const EXAMPLE_SOFTMAX = {
  /** Logits bruts (scores avant softmax) — contexte "Le cha", prédiction du prochain token */
  logits: [
    { char: "t", score: 2.1 },
    { char: "e", score: 1.1 },
    { char: "a", score: 0.9 },
    { char: "h", score: 0.6 },
    { char: "c", score: 0.4 },
    { char: "⎵", score: 0.2 },
    { char: "L", score: -0.3 },
  ],
  /** Probabilités à différentes températures */
  temperatures: {
    0.3: [
      { char: "t", prob: 0.94 },
      { char: "e", prob: 0.03 },
      { char: "a", prob: 0.02 },
      { char: "h", prob: 0.01 },
      { char: "c", prob: 0.0 },
      { char: "⎵", prob: 0.0 },
      { char: "L", prob: 0.0 },
    ],
    0.8: [
      { char: "t", prob: 0.52 },
      { char: "e", prob: 0.15 },
      { char: "a", prob: 0.12 },
      { char: "h", prob: 0.08 },
      { char: "c", prob: 0.06 },
      { char: "⎵", prob: 0.05 },
      { char: "L", prob: 0.02 },
    ],
    1.5: [
      { char: "t", prob: 0.32 },
      { char: "e", prob: 0.16 },
      { char: "a", prob: 0.14 },
      { char: "h", prob: 0.12 },
      { char: "c", prob: 0.1 },
      { char: "⎵", prob: 0.09 },
      { char: "L", prob: 0.06 },
    ],
  } as Record<number, { char: string; prob: number }[]>,
  description:
    'La température contrôle la "confiance" du modèle. Basse température = le modèle choisit presque toujours le token le plus probable. Haute température = les choix sont plus variés et créatifs.',
};

// ─── Génération autorégressive ───────────────────────────────

/** Exemple pas-à-pas de génération autorégressive */
export const EXAMPLE_GENERATION = {
  prompt: "Le",
  steps: [
    { input: "Le", predicted: " ", probability: 0.85, context: "Le" },
    { input: "Le ", predicted: "c", probability: 0.78, context: "Le " },
    { input: "Le c", predicted: "h", probability: 0.92, context: "Le c" },
    { input: "Le ch", predicted: "a", probability: 0.88, context: "Le ch" },
    { input: "Le cha", predicted: "t", probability: 0.52, context: "Le cha" },
  ],
  description:
    "Le modèle génère un token à la fois. À chaque étape, il regarde tout le texte précédent et prédit le token suivant le plus probable.",
};
