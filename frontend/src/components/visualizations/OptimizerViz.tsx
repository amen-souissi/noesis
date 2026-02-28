/**
 * Visualisation simplifiée de la mise à jour de poids par l'optimiseur.
 *
 * Montre un poids avant/après avec les étapes Adam (gradient, moments, update).
 *
 * @module components/visualizations/OptimizerViz
 */

import { ArrowDown, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OptimizerVizProps {
  /** Nom du paramètre */
  paramName?: string;
}

export default function OptimizerViz({
  paramName = "W[3,7]",
}: OptimizerVizProps) {
  const { t } = useTranslation("components");

  // Valeurs simulées pour l'exemple
  const steps = [
    {
      label: t("visualizations.optimizerViz.steps.currentWeight"),
      value: 0.234,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: t("visualizations.optimizerViz.steps.gradient"),
      value: -0.052,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: t("visualizations.optimizerViz.steps.momentum"),
      value: -0.041,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: t("visualizations.optimizerViz.steps.adaptiveSpeed"),
      value: 0.0027,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: t("visualizations.optimizerViz.steps.correction"),
      value: 0.0079,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: t("visualizations.optimizerViz.steps.newWeight"),
      value: 0.2419,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 font-mono">
        {t("visualizations.optimizerViz.paramLabel", { paramName })}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`px-3 py-2 rounded-lg ${step.bg} border border-gray-800`}
            >
              <p className="text-[10px] text-gray-500">{step.label}</p>
              <p className={`text-lg font-mono font-bold ${step.color}`}>
                {step.value >= 0 ? "+" : ""}
                {step.value.toFixed(4)}
              </p>
            </div>
            {i < steps.length - 1 &&
              (i === 0 ? (
                <ArrowDown className="w-4 h-4 text-gray-600 rotate-0 hidden sm:block" />
              ) : (
                <ArrowRight className="w-4 h-4 text-gray-600 hidden sm:block" />
              ))}
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-400 bg-gray-900 rounded-lg p-3 font-mono text-xs">
        <p>{t("visualizations.optimizerViz.formula")}</p>
        <p className="text-gray-600 mt-1">
          0.2419 = 0.234 - 0.001 × (-0.041/0.1) / (√(0.0027/0.001) + 1e-8)
        </p>
      </div>
    </div>
  );
}
