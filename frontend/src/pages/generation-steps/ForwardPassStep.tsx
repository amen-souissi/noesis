/**
 * Étape Génération 2 : Passage dans le modèle (forward pass)
 *
 * Page enrichie avec :
 * - Problématique : comment passer des IDs à une prédiction ?
 * - Rappel de toutes les étapes traversées
 * - Exemple concret : "Le" → scores pour chaque token
 * - Pourquoi seul le dernier token compte
 *
 * @module pages/generation-steps/ForwardPassStep
 */

import { useTranslation } from "react-i18next";
import StepExplainer from "@/components/educational/StepExplainer";
import ConcreteCalculation from "@/components/educational/ConcreteCalculation";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";
import ArchitectureDiagram from "@/components/visualizations/ArchitectureDiagram";

export default function ForwardPassStep() {
  const { t } = useTranslation("pages");

  return (
    <StepExplainer
      sectionId="generation/forward-pass"
      phase="generation"
      stepNumber={2}
      totalSteps={5}
      title={t("generation.forwardPass.title")}
      subtitle={t("generation.forwardPass.subtitle")}
      docSlug="transformer_block"
      exampleContext={t("generation.forwardPass.exampleContext")}
      explanation={
        <>
          {/* ─── Le problème ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("generation.forwardPass.problem.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("generation.forwardPass.problem.description1")}
            </p>
            <p className="text-gray-300 text-sm">
              {t("generation.forwardPass.problem.description2")}
            </p>
          </div>

          {/* ─── Le parcours complet ─── */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-blue-300 font-semibold text-sm">
              {t("generation.forwardPass.path.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("generation.forwardPass.path.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono w-4">1.</span>
                <span className="text-gray-300">
                  <VulgarizedTerm termKey="embedding" showIcon={false}>
                    Embedding
                  </VulgarizedTerm>{" "}
                  :{t("generation.forwardPass.code.embeddingDesc")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono w-4">2.</span>
                <span className="text-gray-300">
                  <VulgarizedTerm
                    termKey="positional_encoding"
                    showIcon={false}
                  >
                    {t("generation.forwardPass.code.positionalEncodingTerm")}
                  </VulgarizedTerm>{" "}
                  :{t("generation.forwardPass.code.positionalEncodingDesc")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono w-4">3.</span>
                <span className="text-gray-300">
                  <VulgarizedTerm termKey="attention" showIcon={false}>
                    Attention
                  </VulgarizedTerm>{" "}
                  :{t("generation.forwardPass.code.attentionDesc")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono w-4">4.</span>
                <span className="text-gray-300">
                  {t("generation.forwardPass.code.ffnDesc")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <span className="font-mono w-4">↻</span>
                <span>
                  {t("generation.forwardPass.path.repeat").split("couche")[0]}
                  <VulgarizedTerm termKey="n_layers">couche</VulgarizedTerm>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono w-4">5.</span>
                <span className="text-gray-300">
                  {t("generation.forwardPass.code.outputLayerDesc1")}{" "}
                  <VulgarizedTerm termKey="logits">
                    {t("generation.forwardPass.code.scoresTerm")}
                  </VulgarizedTerm>{" "}
                  {t("generation.forwardPass.code.outputLayerDesc2")}
                </span>
              </div>
            </div>
          </div>

          {/* ─── Pourquoi le dernier token ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("generation.forwardPass.lastToken.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("generation.forwardPass.lastToken.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 font-mono text-xs">
              <p className="text-gray-500">
                {t("generation.forwardPass.code.scoresTitle")}
              </p>
              <p>
                scores = {"{"}
                <span className="text-green-400">⎵: 2.3</span>, e: 0.8, a: 0.5,
                t: 0.3, h: 0.1, c: −0.2, L: −0.9{"}"}
              </p>
              <p className="text-gray-600 mt-1">
                {t("generation.forwardPass.code.scoresExplanation")}
              </p>
            </div>
          </div>
        </>
      }
      calculation={
        <div className="space-y-8">
          <ConcreteCalculation
            title={t("generation.forwardPass.calculation.flowTitle")}
            description={t(
              "generation.forwardPass.calculation.flowDescription",
            )}
          >
            <ArchitectureDiagram />
          </ConcreteCalculation>

          <ConcreteCalculation
            title={t("generation.forwardPass.calculation.exampleTitle")}
            description={t(
              "generation.forwardPass.calculation.exampleDescription",
            )}
          >
            <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
              <div className="text-sm text-gray-400 space-y-2">
                <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-1">
                  <p className="text-gray-500">
                    {t("generation.forwardPass.code.inputComment")}
                  </p>
                  <p className="text-gray-500">
                    {t("generation.forwardPass.code.afterEmbedding")}
                  </p>
                  <p> « L » → [0.023, −0.089, ...] (64 dims)</p>
                  <p> « e » → [−0.045, 0.022, ...] (64 dims)</p>
                  <p className="text-gray-500 mt-1">
                    {t("generation.forwardPass.code.afterPositional")}
                  </p>
                  <p> {t("generation.forwardPass.code.positionSignal")}</p>
                  <p className="text-gray-500 mt-1">
                    {t("generation.forwardPass.code.afterAttention")}
                  </p>
                  <p> {t("generation.forwardPass.code.contextEnriched")}</p>
                  <p className="text-gray-500 mt-1">
                    {t("generation.forwardPass.code.outputLayer")}
                  </p>
                  <p>
                    {" "}
                    scores = [
                    <span className="text-white">
                      <span className="text-green-400">⎵:2.3</span>, L:−0.9,
                      a:0.5, c:−0.2, e:0.8, h:0.1, t:0.3
                    </span>
                    ]
                  </p>
                </div>
                <p className="text-green-300 text-xs font-medium">
                  {t("generation.forwardPass.calculation.result")}
                </p>
              </div>
            </div>
          </ConcreteCalculation>

          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-2">
            <h4 className="text-green-300 font-semibold text-sm">
              {t("generation.forwardPass.summary.title")}
            </h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>
                <strong>1.</strong> {t("generation.forwardPass.summary.step1")}
              </p>
              <p>
                <strong>2.</strong> {t("generation.forwardPass.summary.step2")}
              </p>
              <p>
                <strong>3.</strong> {t("generation.forwardPass.summary.step3")}
              </p>
              <div className="bg-gray-900 rounded p-3 font-mono text-xs text-center mt-2">
                {t("generation.forwardPass.code.summaryDiagram1")}{" "}
                <span className="text-amber-300">scores[7]</span>{" "}
                {t("generation.forwardPass.code.summaryDiagram2")}
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
