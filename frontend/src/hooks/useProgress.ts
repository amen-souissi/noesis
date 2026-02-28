/**
 * Hook qui marque automatiquement une section comme visitée au mount.
 *
 * À utiliser dans chaque page éducative pour tracker la progression
 * sans que l'utilisateur ait besoin de cliquer un bouton.
 *
 * @example
 * ```tsx
 * function TokenizationStep() {
 *   useProgress('training/tokenization')
 *   return <div>...</div>
 * }
 * ```
 *
 * @module hooks/useProgress
 */

import { useEffect } from "react";
import { useProgressStore } from "@/stores/progressStore";

export function useProgress(sectionId: string) {
  const { markVisited, setCurrentSection } = useProgressStore();

  useEffect(() => {
    setCurrentSection(sectionId);
    markVisited(sectionId);

    return () => {
      setCurrentSection(null);
    };
  }, [sectionId, markVisited, setCurrentSection]);
}
