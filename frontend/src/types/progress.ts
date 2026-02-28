/**
 * Types pour le suivi de progression de l'apprentissage.
 *
 * La progression est persistée en localStorage via Zustand persist.
 * Chaque section du cours est identifiée par un ID unique correspondant
 * à sa route (ex: "training/tokenization").
 *
 * @module types/progress
 */

export interface LearningProgress {
  /** Sections visitées (identifiées par leur route) */
  visitedSections: string[];
  /** Section actuellement affichée */
  currentSection: string | null;
  /** Pourcentage global de progression (0-100) */
  progressPercent: number;
}

/** Définition d'une section du parcours pédagogique */
export interface CourseSection {
  /** Identifiant unique (correspond au path de la route) */
  id: string;
  /** Titre affiché dans la sidebar */
  title: string;
  /** Sous-titre court (ex: "Du texte aux nombres") */
  subtitle: string;
  /** Route React Router */
  path: string;
  /** Groupe de la section */
  group:
    | "discover"
    | "math"
    | "training"
    | "generation"
    | "deeper"
    | "practice"
    | "reference";
  /** Numéro d'ordre dans le parcours */
  order: number;
  /** Slug du module backend associé (pour charger la doc) */
  moduleSlug?: string;
}
