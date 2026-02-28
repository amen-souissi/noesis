/**
 * Animation pas-à-pas de la génération autorégressive.
 *
 * Montre comment le modèle génère du texte token par token,
 * en ajoutant chaque prédiction au contexte pour l'étape suivante.
 *
 * @module components/visualizations/AutoregressiveLoop
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";

interface GenerationStep {
  input: string;
  predicted: string;
  probability: number;
}

interface AutoregressiveLoopProps {
  prompt: string;
  steps: GenerationStep[];
}

export default function AutoregressiveLoop({
  prompt,
  steps,
}: AutoregressiveLoopProps) {
  const { t } = useTranslation("components");
  const [currentStep, setCurrentStep] = useState(-1); // -1 = pas commencé
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 600);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length]);

  const reset = () => {
    setCurrentStep(-1);
    setIsPlaying(false);
  };

  const stepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Texte généré jusqu'à présent
  const generatedText =
    currentStep >= 0
      ? steps
          .slice(0, currentStep + 1)
          .map((s) => s.predicted)
          .join("")
      : "";

  return (
    <div className="space-y-4">
      {/* Zone de texte */}
      <div className="bg-gray-900 rounded-lg p-4 font-mono text-lg min-h-[3rem] flex items-center flex-wrap">
        <span className="text-gray-400">{prompt}</span>
        {generatedText.split("").map((char, i) => (
          <span
            key={i}
            className={`
              ${
                i === generatedText.length - 1 && currentStep >= 0
                  ? "text-green-400 bg-green-500/20 px-0.5 rounded animate-pulse"
                  : "text-primary-300"
              }
            `}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
        {currentStep < steps.length - 1 && (
          <span className="w-0.5 h-6 bg-primary-500 animate-pulse ml-0.5" />
        )}
      </div>

      {/* Contrôles */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="btn-primary flex items-center gap-2 px-4 py-2"
          disabled={currentStep >= steps.length - 1}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isPlaying
            ? t("visualizations.autoregressiveLoop.pause")
            : currentStep === -1
              ? t("visualizations.autoregressiveLoop.start")
              : t("visualizations.autoregressiveLoop.resume")}
        </button>
        <button
          onClick={stepForward}
          className="btn-secondary flex items-center gap-2 px-3 py-2"
          disabled={currentStep >= steps.length - 1}
        >
          <SkipForward className="w-4 h-4" />
          {t("visualizations.autoregressiveLoop.nextStep")}
        </button>
        <button
          onClick={reset}
          className="btn-secondary flex items-center gap-2 px-3 py-2"
        >
          <RotateCcw className="w-4 h-4" />
          {t("visualizations.autoregressiveLoop.restart")}
        </button>
        <span className="text-sm text-gray-500 ml-auto">
          {t("visualizations.autoregressiveLoop.stepCounter", {
            current: Math.max(0, currentStep + 1),
            total: steps.length,
          })}
        </span>
      </div>

      {/* Détails étape courante */}
      {currentStep >= 0 && (
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">
                {t("visualizations.autoregressiveLoop.contextLabel")}
              </p>
              <p className="font-mono text-gray-300 text-xs mt-1 truncate">
                {steps[currentStep].input}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">
                {t("visualizations.autoregressiveLoop.predictedToken")}
              </p>
              <p className="font-mono text-green-400 text-lg font-bold mt-1">
                {steps[currentStep].predicted === " "
                  ? t("visualizations.autoregressiveLoop.spaceToken")
                  : `"${steps[currentStep].predicted}"`}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">
                {t("visualizations.autoregressiveLoop.confidence")}
              </p>
              <p className="font-mono text-amber-400 text-lg font-bold mt-1">
                {(steps[currentStep].probability * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Barre de progression */}
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div
          className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
