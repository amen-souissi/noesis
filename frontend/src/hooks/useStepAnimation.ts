/**
 * Hook réutilisable pour les animations pas-à-pas.
 *
 * Extrait du pattern AutoregressiveLoop — gère Play/Pause/Step/Reset
 * avec un timer configurable entre chaque étape.
 *
 * @module hooks/useStepAnimation
 */

import { useState, useEffect, useCallback } from "react";

interface StepAnimationResult {
  step: number;
  isPlaying: boolean;
  isFinished: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stepForward: () => void;
  stepBack: () => void;
  reset: () => void;
}

export function useStepAnimation(
  totalSteps: number,
  delayMs = 600,
): StepAnimationResult {
  const [step, setStep] = useState(-1); // -1 = pas commencé
  const [isPlaying, setIsPlaying] = useState(false);

  const isFinished = step >= totalSteps - 1;

  useEffect(() => {
    if (!isPlaying) return;
    if (step >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setStep((prev) => prev + 1);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [isPlaying, step, totalSteps, delayMs]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(() => setIsPlaying((prev) => !prev), []);

  const stepForward = useCallback(() => {
    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
    }
  }, [step, totalSteps]);

  const stepBack = useCallback(() => {
    setIsPlaying(false);
    setStep((prev) => (prev > -1 ? prev - 1 : -1));
  }, []);

  const reset = useCallback(() => {
    setStep(-1);
    setIsPlaying(false);
  }, []);

  return {
    step,
    isPlaying,
    isFinished,
    play,
    pause,
    toggle,
    stepForward,
    stepBack,
    reset,
  };
}
