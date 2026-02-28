/**
 * Étape 2 : Embedding — Des nombres aux vecteurs
 *
 * Page enrichie avec :
 * - Problématique : pourquoi un simple numéro ne suffit pas
 * - Analogie de la fiche d'identité
 * - Exemple concret avec lookup table pour "Le chat"
 * - Notion de similarité entre vecteurs
 *
 * @module pages/training-steps/EmbeddingStep
 */

import { useTranslation } from "react-i18next";
import StepExplainer from "@/components/educational/StepExplainer";
import ConcreteCalculation from "@/components/educational/ConcreteCalculation";
import DeepDiveSection from "@/components/educational/DeepDiveSection";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";
import EmbeddingMatrix from "@/components/visualizations/EmbeddingMatrix";
import AnimatedMathOperation from "@/components/visualizations/AnimatedMathOperation";
import {
  EXAMPLE_ATTENTION_DETAILED,
  EXAMPLE_TOKENIZATION,
} from "@/lib/exampleData";

const D = EXAMPLE_ATTENTION_DETAILED;

/** Cellule numérique à largeur fixe */
const NCELL = "inline-block min-w-[2.8rem] text-right";

/** Samples pour EmbeddingMatrix (format attendu par le composant) */
const EMB_SAMPLES = D.tokens.map((char, i) => ({
  char: char === "⎵" ? " " : String(char),
  id: D.tokenIds[i],
  vector: D.rawEmbeddings[i],
}));

export default function EmbeddingStep() {
  const { t } = useTranslation("pages");
  return (
    <StepExplainer
      sectionId="training/embedding"
      phase="training"
      stepNumber={2}
      totalSteps={8}
      title={t("training.embedding.title")}
      subtitle={t("training.embedding.subtitle")}
      exampleContext={t("training.embedding.exampleContext")}
      docSlug="embedding"
      explanation={
        <>
          {/* ─── Le problème ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("training.embedding.problem.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.embedding.problem.desc1Before", {
                tokL: D.tokenIds[0],
                tokE: D.tokenIds[1],
              })}{" "}
              <strong>{t("training.embedding.problem.desc1Arbitrary")}</strong>
              {t("training.embedding.problem.desc1After", {
                tokL: D.tokenIds[0],
                tokE: D.tokenIds[1],
              })}
            </p>
            <p className="text-gray-300 text-sm">
              {t("training.embedding.problem.desc2Before")}{" "}
              <strong>{t("training.embedding.problem.desc2Vowels")}</strong>
              {t("training.embedding.problem.desc2After")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
              <p className="text-gray-500 font-mono">
                {t("training.embedding.problem.concreteLabel")}
              </p>
              <p className="text-gray-300">
                {t("training.embedding.problem.concreteDesc1Before")}
                <strong className="text-primary-400">_</strong>
                {t("training.embedding.problem.concreteDesc1After")}
              </p>
              <p className="text-gray-300">
                {t("training.embedding.problem.concreteDesc2")}{" "}
                <strong>
                  {t("training.embedding.problem.concreteSubtraction")}
                </strong>
                {t("training.embedding.problem.concreteDesc2After")}
              </p>
              <div className="font-mono space-y-1 ml-2">
                <p>
                  |a({EXAMPLE_TOKENIZATION.vocab["a"]}) − e(
                  {EXAMPLE_TOKENIZATION.vocab["e"]})| ={" "}
                  <span className="text-white">
                    {Math.abs(
                      EXAMPLE_TOKENIZATION.vocab["a"] -
                        EXAMPLE_TOKENIZATION.vocab["e"],
                    )}
                  </span>{" "}
                  <span className="text-gray-600">
                    {t("training.embedding.problem.gapVowels")}
                  </span>
                </p>
                <p>
                  |a({EXAMPLE_TOKENIZATION.vocab["a"]}) − c(
                  {EXAMPLE_TOKENIZATION.vocab["c"]})| ={" "}
                  <span className="text-white">
                    {Math.abs(
                      EXAMPLE_TOKENIZATION.vocab["a"] -
                        EXAMPLE_TOKENIZATION.vocab["c"],
                    )}
                  </span>{" "}
                  <span className="text-gray-600">
                    {t("training.embedding.problem.gapVowelConsonant")}
                  </span>
                </p>
              </div>
              <p className="text-red-400 mt-1">
                {t("training.embedding.problem.conclusion")}
              </p>
              <p className="text-gray-500">
                {t("training.embedding.problem.solution")}
              </p>
            </div>
          </div>

          {/* ─── La solution ─── */}
          <p>
            {t("training.embedding.solution.before")}
            <VulgarizedTerm termKey="embedding" />
            {t("training.embedding.solution.middle")}{" "}
            <strong>{t("training.embedding.solution.vector")}</strong>
            {t("training.embedding.solution.after")}(
            <VulgarizedTerm termKey="d_model">
              {t("training.embedding.solution.dimsSimplified")}
            </VulgarizedTerm>
            {t("training.embedding.solution.dimsReal")}).
          </p>

          {/* ─── Les 64 dimensions : quoi, pourquoi, combien ? ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("training.embedding.dimensions.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.embedding.dimensions.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
              <p className="text-gray-500 font-mono">
                {t("training.embedding.dimensions.gpsAnalogy")}
              </p>
              <p className="text-gray-300">
                {t("training.embedding.dimensions.gpsDescription")}
              </p>
            </div>
            <p className="text-gray-300 text-sm mt-2">
              <strong>{t("training.embedding.dimensions.whyQuestion")}</strong>{" "}
              {t("training.embedding.dimensions.tradeoff")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono space-y-1 mt-1">
              <p>
                <span className="text-red-400">
                  {t("training.embedding.dimensions.dim4")}
                </span>{" "}
                → {t("training.embedding.dimensions.dim4Desc")}
              </p>
              <p>
                <span className="text-green-400">
                  {t("training.embedding.dimensions.dim64")}
                </span>{" "}
                →{" "}
                {t("training.embedding.dimensions.dim64Desc", {
                  vocabSize: EXAMPLE_TOKENIZATION.vocabSize,
                })}
              </p>
              <p>
                <span className="text-amber-400">
                  {t("training.embedding.dimensions.dim10k")}
                </span>{" "}
                → {t("training.embedding.dimensions.dim10kDesc")}
              </p>
              <p className="text-gray-500 mt-1">
                {t("training.embedding.dimensions.gpt3Example")}
              </p>
            </div>
          </div>

          {/* ─── Le tableau de correspondance ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.embedding.lookupTable.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("training.embedding.lookupTable.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono space-y-1">
              <p className="text-gray-500">
                {t("training.embedding.lookupTable.matrixComment", {
                  vocabSize: EXAMPLE_TOKENIZATION.vocabSize,
                  dModel: D.dModel,
                })}
              </p>
              <p className="text-gray-500">
                {t("training.embedding.lookupTable.matrixArrows")}
              </p>
              {D.tokens.map((tok, i) => (
                <p key={i}>
                  <span className="text-gray-500">
                    {t("training.embedding.lookupTable.tokenLabel", {
                      id: D.tokenIds[i],
                    })}
                  </span>{" "}
                  ({tok}) : [
                  {D.rawEmbeddings[i]
                    .map((v) =>
                      v >= 0 ? v.toFixed(2) : `−${Math.abs(v).toFixed(2)}`,
                    )
                    .join(", ")}
                  ]
                </p>
              ))}
            </div>
            <p className="text-gray-400 text-xs">
              {t("training.embedding.lookupTable.note")}
            </p>
          </div>

          {/* ─── Aléatoire puis apprentissage ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.embedding.learning.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("training.embedding.learning.before")}
            </p>
            <p className="text-gray-400 text-sm">
              {t("training.embedding.learning.after")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs space-y-1">
              <p className="text-gray-500 font-mono">
                {t("training.embedding.learning.afterTrainingComment")}
              </p>
              <p className="text-gray-300">
                {t("training.embedding.learning.note")}
              </p>
            </div>
          </div>
        </>
      }
      calculation={
        <div className="space-y-8">
          {/* ─── Exemple concret ─── */}
          <ConcreteCalculation
            title={t("training.tokenization.calculation.concreteTitle")}
            description={t("training.embedding.calculation.lookupDescription")}
          >
            <div className="space-y-6">
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.embedding.calculation.lookupTitle")}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.embedding.calculation.lookupIntro")}
                </p>
                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation
                    totalSteps={D.tokens.length}
                    delay={1000}
                  >
                    {(step) => (
                      <div className="font-mono text-xs space-y-2">
                        {/* Token sequence with highlight */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-3">
                          <span className="text-gray-500 text-[10px]">
                            {t("training.embedding.calculation.tokensLabel")}
                          </span>
                          {D.tokens.map((char, i) => {
                            const active = step === i;
                            const done = step > i || step === -1;
                            return (
                              <span
                                key={i}
                                className={`px-1.5 py-0.5 rounded transition-all duration-300 ${
                                  active
                                    ? "text-primary-300 ring-2 ring-primary-500/40 bg-primary-500/10 font-bold"
                                    : done
                                      ? "text-primary-400"
                                      : "text-gray-700"
                                }`}
                              >
                                {char}
                                <span
                                  className={`text-[10px] ml-0.5 ${active ? "text-gray-400" : "text-gray-600"}`}
                                >
                                  ({D.tokenIds[i]})
                                </span>
                              </span>
                            );
                          })}
                        </div>

                        {/* Per-token lookup lines */}
                        {D.tokens.map((char, i) => {
                          const visible = step === -1 || step >= i;
                          const active = step === i;
                          const vec = D.rawEmbeddings[i];
                          return (
                            <div
                              key={i}
                              className={`transition-all duration-300 ${!visible ? "opacity-0 h-0 overflow-hidden" : ""} ${
                                active
                                  ? "ring-2 ring-amber-500/30 bg-amber-500/5 rounded p-2"
                                  : "px-2"
                              }`}
                            >
                              {/* Main line */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`font-semibold ${active ? "text-primary-300" : "text-gray-500"}`}
                                >
                                  « {char} »
                                </span>
                                <span
                                  className={
                                    active ? "text-gray-400" : "text-gray-600"
                                  }
                                >
                                  ID {D.tokenIds[i]} →{" "}
                                  {t(
                                    "training.embedding.calculation.matrixRow",
                                    { row: D.tokenIds[i] },
                                  )}{" "}
                                  →
                                </span>
                                <span
                                  className={
                                    active ? "text-white" : "text-gray-500"
                                  }
                                >
                                  [
                                  {vec.map((v, d) => (
                                    <span key={d}>
                                      <span
                                        className={`${NCELL} ${
                                          active
                                            ? "ring-2 ring-amber-500/30 bg-amber-500/5 rounded px-0.5"
                                            : ""
                                        }`}
                                      >
                                        {v >= 0 ? "+" : ""}
                                        {v.toFixed(2)}
                                      </span>
                                      {d < vec.length - 1 && ", "}
                                    </span>
                                  ))}
                                  ]
                                </span>
                              </div>
                              {/* Detail when active */}
                              {active && (
                                <p className="text-[10px] text-gray-500 mt-1 ml-2">
                                  {t(
                                    "training.embedding.calculation.rowDetail",
                                    {
                                      row: D.tokenIds[i],
                                      vocabSize: EXAMPLE_TOKENIZATION.vocabSize,
                                      dModel: D.dModel,
                                    },
                                  )}
                                </p>
                              )}
                            </div>
                          );
                        })}

                        {/* Summary */}
                        {(step >= D.tokens.length - 1 || step === -1) && (
                          <div className="border-t border-gray-800 pt-2 mt-2">
                            <p className="text-green-300 text-xs font-medium">
                              {t(
                                "training.embedding.calculation.lookupSummary",
                                { dModel: D.dModel },
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </AnimatedMathOperation>
                </div>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.embedding.calculation.sizeTitle")}
                </h4>
                <div className="bg-gray-900 rounded p-3 text-xs space-y-1">
                  <p className="font-mono">
                    <span className="text-gray-500">
                      {t("training.embedding.calculation.sizeSimplified")}
                    </span>{" "}
                    <span className="text-primary-400">
                      {EXAMPLE_TOKENIZATION.vocabSize}
                    </span>{" "}
                    tokens ×{" "}
                    <span className="text-primary-400">{D.dModel}</span>{" "}
                    {t("training.embedding.calculation.sizeDimensions")}={" "}
                    <strong className="text-white">
                      {EXAMPLE_TOKENIZATION.vocabSize * D.dModel}
                    </strong>{" "}
                    {t("training.embedding.calculation.sizeLearnableParams")}
                  </p>
                  <p className="font-mono mt-1">
                    <span className="text-gray-500">
                      {t("training.embedding.calculation.sizeRealMiniLLM")}
                    </span>{" "}
                    <span className="text-gray-400">
                      {EXAMPLE_TOKENIZATION.vocabSize}
                    </span>{" "}
                    tokens × <span className="text-gray-400">64</span>{" "}
                    {t("training.embedding.calculation.sizeDimensions")}={" "}
                    <strong className="text-gray-300">
                      {EXAMPLE_TOKENIZATION.vocabSize * 64}
                    </strong>{" "}
                    {t("training.embedding.calculation.sizeParams")}
                  </p>
                  <p className="font-mono mt-1">
                    <span className="text-gray-500">GPT-3 :</span>{" "}
                    <span className="text-gray-400">50 257</span> tokens ×{" "}
                    <span className="text-gray-400">12 288</span>{" "}
                    {t("training.embedding.calculation.sizeDimensions")}={" "}
                    <strong className="text-gray-300">
                      {t("training.embedding.calculation.sizeGpt3Params")}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </ConcreteCalculation>

          {/* ─── Matrice interactive ─── */}
          <ConcreteCalculation
            title={t("training.embedding.calculation.interactiveTitle")}
            description={t(
              "training.embedding.calculation.interactiveDescription",
            )}
          >
            <EmbeddingMatrix
              samples={EMB_SAMPLES}
              displayDims={D.dModel}
              matrixShape={{
                rows: EXAMPLE_TOKENIZATION.vocabSize,
                cols: D.dModel,
              }}
            />
          </ConcreteCalculation>

          {/* ─── En résumé ─── */}
          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-green-300 font-semibold text-sm">
              {t("training.embedding.summary.title")}
            </h4>

            {/* ENTRÉE */}
            <div className="bg-blue-900/20 border border-blue-800/30 rounded p-3">
              <p className="text-blue-300 font-semibold text-[10px] uppercase tracking-wide mb-2">
                ▸ {t("training.embedding.summary.inputLabel")}
              </p>
              <div className="font-mono text-xs space-y-1">
                <p>
                  « <span className="text-primary-300">L</span> » →{" "}
                  <strong className="text-white">ID {D.tokenIds[0]}</strong>
                </p>
                <p>
                  « <span className="text-primary-300">t</span> » →{" "}
                  <strong className="text-white">ID {D.tokenIds[6]}</strong>
                </p>
              </div>
            </div>

            <div className="text-center text-gray-600">↓</div>

            {/* OPÉRATION */}
            <div className="bg-gray-800/50 border border-gray-700 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-gray-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸ {t("training.embedding.summary.operationLabel")}
                </p>
                <span className="text-amber-400 text-[10px] bg-amber-900/30 px-1.5 py-0.5 rounded">
                  ⚙ {t("training.embedding.summary.operationTag")}
                </span>
              </div>
              <div className="font-mono text-xs space-y-1">
                <p className="text-gray-400">
                  {t("training.embedding.summary.operationDesc", {
                    vocabSize: EXAMPLE_TOKENIZATION.vocabSize,
                    dModel: D.dModel,
                    totalParams: EXAMPLE_TOKENIZATION.vocabSize * D.dModel,
                  })}
                </p>
                <p>
                  « <span className="text-primary-300">L</span> » →{" "}
                  <span className="text-amber-300">
                    {t("training.embedding.summary.operationMatrixRow", {
                      row: D.tokenIds[0],
                    })}
                  </span>{" "}
                  →{" "}
                  {t("training.embedding.summary.operationVectorOf", {
                    dModel: D.dModel,
                  })}
                </p>
                <p>
                  « <span className="text-primary-300">t</span> » →{" "}
                  <span className="text-amber-300">
                    {t("training.embedding.summary.operationMatrixRow", {
                      row: D.tokenIds[6],
                    })}
                  </span>{" "}
                  →{" "}
                  {t("training.embedding.summary.operationVectorOf", {
                    dModel: D.dModel,
                  })}
                </p>
                <p className="text-gray-500 mt-1 text-[10px]">
                  {t("training.embedding.summary.operationNote")}
                </p>
              </div>
            </div>

            <div className="text-center text-gray-600">↓</div>

            {/* SORTIE */}
            <div className="bg-green-900/20 border border-green-800/30 rounded p-3">
              <p className="text-green-300 font-semibold text-[10px] uppercase tracking-wide mb-2">
                ▸ {t("training.embedding.summary.outputLabel")}
              </p>
              <div className="font-mono text-xs space-y-1">
                <p>
                  « <span className="text-primary-300">L</span> » → [
                  <strong className="text-white">
                    {D.rawEmbeddings[0]
                      .map((v) =>
                        v >= 0 ? v.toFixed(2) : `−${Math.abs(v).toFixed(2)}`,
                      )
                      .join(", ")}
                  </strong>
                  ]{" "}
                  <span className="text-gray-600">
                    {t("training.embedding.summary.outputNNumbers", {
                      dModel: D.dModel,
                    })}
                  </span>
                </p>
                <p>
                  « <span className="text-primary-300">t</span> » → [
                  <strong className="text-white">
                    {D.rawEmbeddings[6]
                      .map((v) =>
                        v >= 0 ? v.toFixed(2) : `−${Math.abs(v).toFixed(2)}`,
                      )
                      .join(", ")}
                  </strong>
                  ]{" "}
                  <span className="text-gray-600">
                    {t("training.embedding.summary.outputNNumbers", {
                      dModel: D.dModel,
                    })}
                  </span>
                </p>
              </div>
            </div>

            <p className="text-gray-500 text-xs">
              {t("training.embedding.summary.note")}
            </p>
          </div>
        </div>
      }
      deepDive={
        <DeepDiveSection
          title={t("training.embedding.deepDive.title")}
          docSlug="embedding"
          formulas={[
            {
              name: t("training.embedding.deepDive.concepts.lookup.name"),
              latex: "e_i = W_{emb}[\\text{token\\_id}]",
              explanation: t(
                "training.embedding.deepDive.concepts.lookup.explanation",
              ),
            },
            {
              name: t("training.embedding.deepDive.concepts.dimensions.name"),
              latex: "W_{emb} \\in \\mathbb{R}^{V \\times d_{model}}",
              explanation: t(
                "training.embedding.deepDive.concepts.dimensions.explanation",
                {
                  vocabSize: EXAMPLE_TOKENIZATION.vocabSize,
                  dModel: D.dModel,
                  totalParams: EXAMPLE_TOKENIZATION.vocabSize * D.dModel,
                },
              ),
            },
            {
              name: t("training.embedding.deepDive.concepts.similarity.name"),
              latex: "\\text{sim}(a, b) = \\frac{a \\cdot b}{\\|a\\| \\|b\\|}",
              explanation: t(
                "training.embedding.deepDive.concepts.similarity.explanation",
              ),
            },
          ]}
        />
      }
    />
  );
}
