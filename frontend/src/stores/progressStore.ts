/**
 * Store Zustand pour le suivi de progression de l'apprentissage.
 *
 * Persisté en localStorage via le middleware `persist` de Zustand.
 * Chaque section visitée est enregistrée automatiquement (useEffect au mount).
 * La progression est calculée sur les sections non-référence (15 sections).
 *
 * @module stores/progressStore
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOTAL_SECTIONS } from "@/lib/pipelineSteps";

interface ProgressState {
  /** Liste des IDs de sections visitées */
  visitedSections: string[];
  /** Section actuellement affichée */
  currentSection: string | null;

  /** Marque une section comme visitée */
  markVisited: (sectionId: string) => void;
  /** Définit la section courante */
  setCurrentSection: (sectionId: string | null) => void;
  /** Vérifie si une section a été visitée */
  isVisited: (sectionId: string) => boolean;
  /** Calcule le pourcentage de progression (0-100) */
  getProgressPercent: () => number;
  /** Réinitialise toute la progression */
  reset: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      visitedSections: [],
      currentSection: null,

      markVisited: (sectionId: string) => {
        const current = get().visitedSections;
        if (!current.includes(sectionId)) {
          set({ visitedSections: [...current, sectionId] });
        }
      },

      setCurrentSection: (currentSection: string | null) =>
        set({ currentSection }),

      isVisited: (sectionId: string) =>
        get().visitedSections.includes(sectionId),

      getProgressPercent: () => {
        const visited = get().visitedSections.length;
        return Math.round((visited / TOTAL_SECTIONS) * 100);
      },

      reset: () => set({ visitedSections: [], currentSection: null }),
    }),
    {
      name: "noesis-learning-progress",
    },
  ),
);
