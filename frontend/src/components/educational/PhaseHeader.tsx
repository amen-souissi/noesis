/**
 * En-tête de phase (Entraînement / Génération) affiché au-dessus des steps.
 *
 * @module components/educational/PhaseHeader
 */

import { BookOpen, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PhaseHeaderProps {
  phase: "training" | "generation";
}

const PHASES = {
  training: {
    icon: BookOpen,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
  generation: {
    icon: Sparkles,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
};

export default function PhaseHeader({ phase }: PhaseHeaderProps) {
  const { t } = useTranslation("components");
  const config = PHASES[phase];
  const Icon = config.icon;

  const title =
    phase === "training"
      ? t("educational.phaseHeader.trainingTitle")
      : t("educational.phaseHeader.generationTitle");
  const description =
    phase === "training"
      ? t("educational.phaseHeader.trainingDesc")
      : t("educational.phaseHeader.generationDesc");

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${config.bgColor} border ${config.borderColor}`}
    >
      <Icon className={`w-5 h-5 ${config.color}`} />
      <div>
        <h2 className={`text-sm font-semibold ${config.color}`}>{title}</h2>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </div>
  );
}
