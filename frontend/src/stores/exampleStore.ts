/**
 * Store Zustand pour l'état partagé de l'exemple fil rouge.
 *
 * Permet à l'utilisateur de changer la phrase d'exemple dans le Playground
 * et de voir les calculs se mettre à jour dans toutes les pages.
 * Par défaut : "Le chat".
 *
 * @module stores/exampleStore
 */

import { create } from "zustand";
import { EXAMPLE_SENTENCE } from "@/lib/exampleData";

interface ExampleState {
  /** Phrase exemple actuellement utilisée */
  sentence: string;
  /** Modifie la phrase exemple */
  setSentence: (sentence: string) => void;
  /** Réinitialise à la phrase par défaut */
  reset: () => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  sentence: EXAMPLE_SENTENCE,
  setSentence: (sentence: string) => set({ sentence }),
  reset: () => set({ sentence: EXAMPLE_SENTENCE }),
}));
