/**
 * Navigation Précédent / Suivant entre les étapes du pipeline.
 *
 * Adapté du pattern de ModuleDetail.tsx pour les pages éducatives.
 *
 * @module components/educational/StepNavigation
 */

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAdjacentSections } from "@/lib/pipelineSteps";

interface StepNavigationProps {
  /** ID de la section courante (ex: "training/tokenization") */
  currentSectionId: string;
}

export default function StepNavigation({
  currentSectionId,
}: StepNavigationProps) {
  const { t } = useTranslation("components");
  const { prev, next } = getAdjacentSections(currentSectionId);

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-800">
      {prev ? (
        <Link
          to={prev.path}
          className="btn-secondary flex items-center gap-3 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <div className="text-left">
            <p className="text-xs text-gray-500">
              {t("educational.stepNavigation.previous")}
            </p>
            <p className="text-sm">{prev.title}</p>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          to={next.path}
          className="btn-primary flex items-center gap-3 group"
        >
          <div className="text-right">
            <p className="text-xs text-white/60">
              {t("educational.stepNavigation.next")}
            </p>
            <p className="text-sm">{next.title}</p>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
