/**
 * Étape Génération 1 : Tokenisation du prompt
 *
 * Page enrichie avec :
 * - Problématique : le modèle ne comprend que des nombres
 * - Différence entre entraînement et génération
 * - Exemple concret "Le" → IDs
 * - Limitation du vocabulaire
 *
 * @module pages/generation-steps/PromptTokenizationStep
 */

import { useTranslation } from "react-i18next";
import StepExplainer from "@/components/educational/StepExplainer";
import ConcreteCalculation from "@/components/educational/ConcreteCalculation";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";
import TokenGrid from "@/components/visualizations/TokenGrid";
import { EXAMPLE_TOKENIZATION } from "@/lib/exampleData";

export default function PromptTokenizationStep() {
  const { t } = useTranslation("pages");
  const promptChars = "Le".split("");
  const promptIds = promptChars.map((c) => EXAMPLE_TOKENIZATION.vocab[c] ?? 0);

  return (
    <StepExplainer
      sectionId="generation/prompt"
      phase="generation"
      stepNumber={1}
      totalSteps={5}
      title={t("generation.prompt.title")}
      subtitle={t("generation.prompt.subtitle")}
      exampleContext={t("generation.prompt.exampleContext")}
      docSlug="tokenizer"
      explanation={
        <>
          {/* ─── Le problème ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("generation.prompt.problem.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("generation.prompt.problem.description")}
            </p>
          </div>

          {/* ─── Entraînement vs Génération ─── */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-blue-300 font-semibold text-sm">
              {t("generation.prompt.trainingVsGeneration.title")}
            </h4>
            <div className="space-y-2 mt-1">
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-mono text-xs whitespace-nowrap mt-0.5">
                  {t("generation.prompt.trainingVsGeneration.trainingLabel")}
                </span>
                <p className="text-sm text-gray-400">
                  {t("generation.prompt.trainingVsGeneration.training")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 font-mono text-xs whitespace-nowrap mt-0.5">
                  {t("generation.prompt.trainingVsGeneration.generationLabel")}
                </span>
                <p className="text-sm text-gray-300">
                  {t("generation.prompt.trainingVsGeneration.generation")}
                </p>
              </div>
            </div>
          </div>

          <p>
            {t("generation.prompt.sameVocab").split("tokenizer")[0]}
            <VulgarizedTerm termKey="tokenizer" />
            {t("generation.prompt.sameVocab").split("tokenizer")[1]}
          </p>

          {/* ─── Token BOS automatique ─── */}
          <div className="bg-purple-900/15 border border-purple-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-purple-300 font-semibold text-sm">
              {t("generation.prompt.bosToken.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("generation.prompt.bosToken.description").split("<BOS>")[0]}
              <VulgarizedTerm termKey="bos_token">
                <code className="text-purple-300">&lt;BOS&gt;</code>
              </VulgarizedTerm>
              {t("generation.prompt.bosToken.description").split("<BOS>")[1]}
            </p>
            <div className="bg-gray-900 rounded p-3 font-mono text-xs text-center">
              <p>
                <span className="text-purple-400">&lt;BOS&gt;</span> L e
              </p>
              <p className="text-gray-500 mt-1">
                {t("generation.prompt.code.bosSequence")}
              </p>
            </div>
            <p className="text-gray-500 text-xs">
              {t("generation.prompt.bosToken.eosNote").split("<EOS>")[0]}
              <VulgarizedTerm termKey="eos_token">
                <code className="text-purple-300">&lt;EOS&gt;</code>
              </VulgarizedTerm>
              {t("generation.prompt.bosToken.eosNote").split("<EOS>")[1]}
            </p>
          </div>

          {/* ─── Limitation du vocabulaire ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-2">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("generation.prompt.unknownTokens.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("generation.prompt.unknownTokens.description")}
            </p>
            <p className="text-gray-500 text-xs">
              {t("generation.prompt.unknownTokens.note")}
            </p>
          </div>
        </>
      }
      calculation={
        <div className="space-y-8">
          <ConcreteCalculation
            title={t("generation.prompt.calculation.title")}
            description={t("generation.prompt.calculation.description")}
          >
            <div className="space-y-4">
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <div className="text-sm text-gray-400 space-y-2">
                  <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                    <p>
                      <span className="text-gray-500">
                        {t("generation.prompt.code.promptLabel")}
                      </span>{" "}
                      « <span className="text-primary-400">Le</span> »
                    </p>
                    <p className="mt-1">
                      <span className="text-gray-500">
                        {t("generation.prompt.code.idsLabel")}
                      </span>{" "}
                      L→
                      <span className="text-amber-300">
                        {EXAMPLE_TOKENIZATION.vocab["L"]}
                      </span>
                      , e→
                      <span className="text-amber-300">
                        {EXAMPLE_TOKENIZATION.vocab["e"]}
                      </span>
                    </p>
                    <p className="mt-1 text-gray-500">
                      {t("generation.prompt.code.sequenceResult", {
                        id1: EXAMPLE_TOKENIZATION.vocab["L"],
                        id2: EXAMPLE_TOKENIZATION.vocab["e"],
                      })}
                    </p>
                  </div>
                  <p className="text-green-300 text-xs font-medium">
                    {t("generation.prompt.calculation.result")}
                  </p>
                </div>
              </div>

              <TokenGrid
                chars={promptChars}
                ids={promptIds}
                vocab={EXAMPLE_TOKENIZATION.vocab}
              />
            </div>
          </ConcreteCalculation>

          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-2">
            <h4 className="text-green-300 font-semibold text-sm">
              {t("generation.prompt.summary.title")}
            </h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>
                <strong>1.</strong> {t("generation.prompt.summary.step1")}
              </p>
              <p>
                <strong>2.</strong> {t("generation.prompt.summary.step2")}
              </p>
              <p>
                <strong>3.</strong> {t("generation.prompt.summary.step3")}
              </p>
              <div className="bg-gray-900 rounded p-3 font-mono text-xs text-center mt-2">
                « <span className="text-primary-300">Le</span> » → [
                <span className="text-amber-300">
                  {EXAMPLE_TOKENIZATION.vocab["L"]},{" "}
                  {EXAMPLE_TOKENIZATION.vocab["e"]}
                </span>
                ] → {t("generation.prompt.code.toModel")}
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}
