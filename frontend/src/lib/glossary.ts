/**
 * Registre centralisé des termes vulgarisés.
 *
 * Chaque entrée associe un terme technique à sa version accessible.
 * Utilisé par le composant VulgarizedTerm pour afficher les infobulles.
 *
 * Convention : les clés sont en snake_case et correspondent aux noms
 * des paramètres dans la config du modèle quand applicable.
 *
 * @module lib/glossary
 */

import i18n from "@/i18n";
import type { GlossaryEntry } from "@/types/glossary";

/** Static metadata (not translated) */
const GLOSSARY_META: Record<
  string,
  {
    scientific: string;
    docSlug?: string;
    category: GlossaryEntry["category"];
  }
> = {
  // ─── Architecture ───────────────────────────────────────────
  d_model: {
    scientific: "d_model",
    docSlug: "embedding",
    category: "architecture",
  },
  n_heads: {
    scientific: "Attention Heads (n_heads)",
    docSlug: "attention",
    category: "architecture",
  },
  n_layers: {
    scientific: "Layers (n_layers)",
    docSlug: "transformer_block",
    category: "architecture",
  },
  d_ff: {
    scientific: "Feed-Forward Dimension (d_ff)",
    docSlug: "feedforward",
    category: "architecture",
  },
  seq_len: {
    scientific: "Sequence Length (seq_len)",
    docSlug: "tokenizer",
    category: "architecture",
  },
  vocab_size: {
    scientific: "Vocabulary Size (vocab_size)",
    docSlug: "tokenizer",
    category: "architecture",
  },

  // ─── Entraînement ──────────────────────────────────────────
  learning_rate: {
    scientific: "Learning Rate (lr)",
    docSlug: "optimizer",
    category: "training",
  },
  epochs: { scientific: "Epochs", category: "training" },
  batch_size: { scientific: "Batch Size", category: "training" },
  grad_clip: { scientific: "Gradient Clipping", category: "training" },
  loss: {
    scientific: "Loss (Cross-Entropy)",
    docSlug: "loss",
    category: "training",
  },
  backpropagation: { scientific: "Backpropagation", category: "training" },

  // ─── Optimiseur ─────────────────────────────────────────────
  beta1: {
    scientific: "Momentum (β₁)",
    docSlug: "optimizer",
    category: "training",
  },
  beta2: {
    scientific: "RMSprop factor (β₂)",
    docSlug: "optimizer",
    category: "training",
  },
  epsilon: {
    scientific: "Epsilon (ε)",
    docSlug: "optimizer",
    category: "training",
  },
  weight_decay: {
    scientific: "Weight Decay (L2)",
    docSlug: "optimizer",
    category: "training",
  },
  lr_schedule: {
    scientific: "Learning Rate Schedule",
    docSlug: "optimizer",
    category: "training",
  },

  // ─── Génération ─────────────────────────────────────────────
  temperature: { scientific: "Temperature", category: "generation" },
  max_gen_len: { scientific: "Max Generation Length", category: "generation" },
  softmax: { scientific: "Softmax", category: "generation" },
  logits: { scientific: "Logits", category: "generation" },
  sampling: { scientific: "Sampling", category: "generation" },
  autoregressive: {
    scientific: "Autoregressive Generation",
    category: "generation",
  },
  bos_token: {
    scientific: "BOS Token (Beginning of Sentence)",
    category: "generation",
  },
  eos_token: {
    scientific: "EOS Token (End of Sentence)",
    category: "generation",
  },

  // ─── Données ────────────────────────────────────────────────
  tokenizer: {
    scientific: "Tokenizer",
    docSlug: "tokenizer",
    category: "data",
  },
  embedding: {
    scientific: "Embedding",
    docSlug: "embedding",
    category: "data",
  },
  positional_encoding: {
    scientific: "Positional Encoding",
    docSlug: "positional_encoding",
    category: "data",
  },
  attention: {
    scientific: "Multi-Head Attention",
    docSlug: "attention",
    category: "architecture",
  },
  seed: { scientific: "Random Seed", category: "training" },
};

/** All glossary term keys */
export const GLOSSARY_KEYS = Object.keys(GLOSSARY_META);

/** Build a full GlossaryEntry by reading translated strings from i18n */
function buildEntry(key: string): GlossaryEntry | undefined {
  const meta = GLOSSARY_META[key];
  if (!meta) return undefined;
  return {
    vulgarized: i18n.t(`${key}.vulgarized`, { ns: "glossary" }),
    scientific: meta.scientific,
    technicalFr: i18n.t(`${key}.technicalFr`, { ns: "glossary" }),
    definition: i18n.t(`${key}.definition`, { ns: "glossary" }),
    docSlug: meta.docSlug,
    category: meta.category,
  };
}

/** Backwards-compatible GLOSSARY object (dynamic proxy) */
export const GLOSSARY: Record<string, GlossaryEntry> = new Proxy(
  {} as Record<string, GlossaryEntry>,
  {
    get(_target, prop: string) {
      return buildEntry(prop);
    },
    ownKeys() {
      return GLOSSARY_KEYS;
    },
    getOwnPropertyDescriptor(_target, prop: string) {
      if (GLOSSARY_META[prop]) {
        return {
          configurable: true,
          enumerable: true,
          value: buildEntry(prop),
        };
      }
      return undefined;
    },
  },
);

/** Obtient une entrée du glossaire par sa clé. Retourne undefined si non trouvée. */
export function getGlossaryEntry(key: string): GlossaryEntry | undefined {
  return buildEntry(key);
}

/** Liste toutes les entrées d'une catégorie donnée */
export function getEntriesByCategory(
  category: GlossaryEntry["category"],
): [string, GlossaryEntry][] {
  return GLOSSARY_KEYS.filter(
    (key) => GLOSSARY_META[key].category === category,
  ).map((key) => [key, buildEntry(key)!]);
}
