/**
 * Layout principal pour chaque étape du pipeline éducatif.
 *
 * Structure verticale cohérente :
 * 1. En-tête de phase + badge numéro + titre
 * 2. Bannière exemple "Le chat"
 * 3. Explication vulgarisée
 * 4. Calcul concret
 * 5. Visualisation interactive
 * 6. Section "Approfondir" (KaTeX)
 * 7. Lien documentation
 * 8. Navigation Précédent / Suivant
 *
 * @module components/educational/StepExplainer
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import PhaseHeader from "./PhaseHeader";
import ExampleSentenceBanner from "./ExampleSentenceBanner";
import StepNavigation from "./StepNavigation";
import ModuleDocLink from "./ModuleDocLink";
import { useProgress } from "@/hooks/useProgress";

interface StepExplainerProps {
  /** ID unique de la section (ex: "training/tokenization") */
  sectionId: string;
  /** Phase : entraînement ou génération */
  phase: "training" | "generation";
  /** Numéro de l'étape dans la phase (ex: 1, 2, ...) */
  stepNumber: number;
  /** Nombre total d'étapes dans la phase */
  totalSteps: number;
  /** Titre de l'étape */
  title: string;
  /** Sous-titre court */
  subtitle: string;
  /** Contexte spécifique pour la bannière d'exemple */
  exampleContext?: string;
  /** Explication vulgarisée (contenu React avec VulgarizedTerm) */
  explanation: React.ReactNode;
  /** Section de calcul concret */
  calculation?: React.ReactNode;
  /** Visualisation interactive */
  visualization?: React.ReactNode;
  /** Section "Approfondir" (DeepDiveSection) */
  deepDive?: React.ReactNode;
  /** Slug du module pour le lien documentation */
  docSlug?: string;
}

export default function StepExplainer({
  sectionId,
  phase,
  stepNumber,
  totalSteps,
  title,
  subtitle,
  exampleContext,
  explanation,
  calculation,
  visualization,
  deepDive,
  docSlug,
}: StepExplainerProps) {
  const { t } = useTranslation("components");

  // Marquer la section comme visitée
  useProgress(sectionId);

  // Scroll en haut au changement de step
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sectionId]);

  const phaseColor = phase === "training" ? "green" : "purple";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* En-tête de phase */}
      <PhaseHeader phase={phase} />

      {/* Badge numéro + titre */}
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl bg-${phaseColor}-500/20 flex items-center justify-center`}
        >
          <span className={`text-lg font-bold text-${phaseColor}-400`}>
            {stepNumber}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-gray-400 mt-1">{subtitle}</p>
          <p className="text-xs text-gray-600 mt-1">
            {t("educational.stepExplainer.stepOf", { stepNumber, totalSteps })}
          </p>
        </div>
      </div>

      {/* Bannière exemple */}
      <ExampleSentenceBanner context={exampleContext} />

      {/* Explication vulgarisée */}
      <section className="card">
        <div className="prose-sm text-gray-300 leading-relaxed space-y-3">
          {explanation}
        </div>
      </section>

      {/* Calcul concret */}
      {calculation && calculation}

      {/* Visualisation interactive */}
      {visualization && (
        <section className="card">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">
            {t("educational.stepExplainer.interactiveViz")}
          </h3>
          {visualization}
        </section>
      )}

      {/* Approfondir */}
      {deepDive && deepDive}

      {/* Lien documentation */}
      {docSlug && (
        <div className="flex justify-end">
          <ModuleDocLink slug={docSlug} />
        </div>
      )}

      {/* Navigation */}
      <StepNavigation currentSectionId={sectionId} />
    </div>
  );
}
