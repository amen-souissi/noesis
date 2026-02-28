/**
 * Barre de progression globale du parcours pédagogique.
 *
 * @module components/layout/LearningProgress
 */

import { useTranslation } from "react-i18next";
import { useProgressStore } from "@/stores/progressStore";

export default function LearningProgress() {
  const { t } = useTranslation();
  const percent = useProgressStore((s) => s.getProgressPercent());

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-gray-500">{t("nav.progression")}</span>
        <span className="text-primary-400 font-medium">{percent}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div
          className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
