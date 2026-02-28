/**
 * Types pour le système de termes vulgarisés.
 *
 * Chaque terme technique du LLM est associé à un terme accessible (vulgarisé),
 * un terme scientifique, une définition courte, et optionnellement un lien
 * vers la documentation détaillée du module correspondant.
 *
 * @module types/glossary
 */

export type GlossaryCategory =
  | "architecture"
  | "training"
  | "generation"
  | "data";

export interface GlossaryEntry {
  /** Terme accessible affiché à l'utilisateur (ex: "Vitesse d'apprentissage") */
  vulgarized: string;
  /** Terme scientifique anglais (ex: "Learning Rate") */
  scientific: string;
  /** Terme technique français (ex: "taux d'apprentissage") */
  technicalFr: string;
  /** Définition courte et accessible */
  definition: string;
  /** Slug du module dans /docs/:slug (ex: "optimizer") */
  docSlug?: string;
  /** Catégorie pour coloration / filtrage */
  category: GlossaryCategory;
}

/** Clés valides du glossaire — utilisées comme props de VulgarizedTerm */
export type GlossaryKey = string;
