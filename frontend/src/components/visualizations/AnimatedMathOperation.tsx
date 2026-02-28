/**
 * Wrapper pour les opérations mathématiques animées pas-à-pas.
 *
 * Fournit des contrôles Play/Pause/Step/Reset compacts
 * et une barre de progression. Le contenu est rendu via un render prop
 * qui reçoit le step courant (-1 = pas commencé).
 *
 * @module components/visualizations/AnimatedMathOperation
 */

import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useStepAnimation } from "@/hooks/useStepAnimation";

interface Props {
  totalSteps: number;
  delay?: number;
  children: (step: number) => React.ReactNode;
}

export default function AnimatedMathOperation({
  totalSteps,
  delay = 600,
  children,
}: Props) {
  const { t } = useTranslation("components");
  const { step, isPlaying, isFinished, toggle, stepForward, stepBack, reset } =
    useStepAnimation(totalSteps, delay);

  return (
    <div className="space-y-3">
      {/* Contenu animé */}
      {children(step)}

      {/* Contrôles centrés en bas */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={stepBack}
          disabled={step <= -1}
          title={t("visualizations.animatedMathOperation.previousStep")}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <SkipBack className="w-3 h-3" />
        </button>
        <button
          onClick={toggle}
          disabled={isFinished}
          title={
            isPlaying
              ? t("visualizations.animatedMathOperation.pause")
              : step === -1
                ? t("visualizations.animatedMathOperation.animate")
                : t("visualizations.animatedMathOperation.resume")
          }
          className="flex items-center justify-center w-7 h-7 rounded-md bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </button>
        <button
          onClick={stepForward}
          disabled={isFinished}
          title={t("visualizations.animatedMathOperation.nextStep")}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <SkipForward className="w-3 h-3" />
        </button>
        <button
          onClick={reset}
          title={t("visualizations.animatedMathOperation.restart")}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        <span className="text-xs text-gray-600">
          {step === -1 ? "0" : step + 1} / {totalSteps}
        </span>
      </div>
    </div>
  );
}
