/**
 * Étape 5 : Réseau Feed-Forward — Traiter l'information
 *
 * Page enrichie avec :
 * - Problématique : pourquoi l'attention ne suffit pas (mélanger ≠ comprendre)
 * - D'où viennent les matrices W₁ et W₂ (paramètres appris, comme les autres)
 * - Pourquoi expansion puis compression ne perd pas d'info
 * - La connexion résiduelle : réponse centrale au « perd-on de l'info ? »
 * - Exemples concrets avec nombres à chaque étape
 * - Analogie de la digestion + analogie des notes dans la marge
 *
 * @module pages/training-steps/FeedForwardStep
 */

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import StepExplainer from "@/components/educational/StepExplainer";
import ConcreteCalculation from "@/components/educational/ConcreteCalculation";
import DeepDiveSection from "@/components/educational/DeepDiveSection";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";
import FFNDiagram from "@/components/visualizations/FFNDiagram";
import MatrixDisplay from "@/components/visualizations/MatrixDisplay";
import AnimatedMathOperation from "@/components/visualizations/AnimatedMathOperation";
import {
  EXAMPLE_ATTENTION_DETAILED,
  EXAMPLE_FFN_DETAILED,
} from "@/lib/exampleData";

const D = EXAMPLE_ATTENTION_DETAILED;
const F = EXAMPLE_FFN_DETAILED;

/** Formate un nombre avec signe explicite */
function fmt(v: number): string {
  return v >= 0 ? ` ${v.toFixed(2)}` : `−${Math.abs(v).toFixed(2)}`;
}

/** Formate pour multiplication (parenthèses si négatif) */
function fmtMul(v: number): string {
  return v < 0 ? `(−${Math.abs(v).toFixed(2)})` : v.toFixed(2);
}

/** Cellule numérique à largeur fixe */
const NCELL = "inline-block min-w-[2.5rem] text-right";

/** Index du token focus pour le calcul détaillé */
const FOCUS = 6; // token "t"

export default function FeedForwardStep() {
  const { t } = useTranslation("pages");
  return (
    <StepExplainer
      sectionId="training/feedforward"
      phase="training"
      stepNumber={5}
      totalSteps={8}
      title={t("training.feedforward.title")}
      subtitle={t("training.feedforward.subtitle")}
      exampleContext={t("training.feedforward.exampleContext")}
      docSlug="feedforward"
      explanation={
        <>
          {/* ─── Le problème ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("training.feedforward.problem.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.feedforward.problem.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
              <p className="text-gray-500 font-mono">
                {t("training.feedforward.problem.analogyLabel")} :
              </p>
              <p className="text-gray-300">
                {t("training.feedforward.problem.analogy")}
              </p>
              <p className="text-gray-300">
                {t("training.feedforward.problem.analogyContinued")}
              </p>
            </div>
            <p className="text-gray-400 text-xs">
              {t("training.feedforward.problem.summary")}
            </p>
          </div>

          {/* ─── La solution : 2 couches ─── */}
          <p>{t("training.feedforward.solution")}</p>

          {/* ─── Le principe expansion/compression ─── */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-blue-300 font-semibold text-sm">
              {t("training.feedforward.principle.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.feedforward.principle.description")}
            </p>
            <div className="flex items-center justify-center gap-3 py-3 flex-wrap">
              <div className="text-center">
                <div className="bg-gray-800 rounded-lg px-4 py-2">
                  <p className="text-sm font-mono text-blue-400">
                    {D.dModel} dim
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("training.feedforward.principle.labels.input")}
                  </p>
                </div>
              </div>
              <div className="text-xl text-gray-600">→</div>
              <div className="text-center">
                <div className="bg-gray-800 rounded-lg px-5 py-2 border border-amber-800/30">
                  <p className="text-sm font-mono text-amber-400">
                    {F.dFF} dim
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("training.feedforward.principle.labels.expansion")} ×
                    {F.dFF / D.dModel}
                  </p>
                </div>
              </div>
              <div className="text-xl text-gray-600">→</div>
              <div className="text-center">
                <div className="bg-gray-800 rounded-lg px-3 py-1">
                  <p className="text-xs font-mono text-green-400">ReLU</p>
                </div>
              </div>
              <div className="text-xl text-gray-600">→</div>
              <div className="text-center">
                <div className="bg-gray-800 rounded-lg px-4 py-2">
                  <p className="text-sm font-mono text-blue-400">
                    {D.dModel} dim
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("training.feedforward.principle.labels.output")}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-xs">
              {t("training.feedforward.principle.sameSize")}
            </p>
            <p className="text-gray-500 text-[10px] mt-1">
              {t("training.feedforward.principle.realModelNote", {
                ratio: F.dFF / D.dModel,
                dModel: D.dModel,
                dFF: F.dFF,
              })}
            </p>
          </div>

          {/* ─── D'où viennent les matrices ? ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.feedforward.matricesOrigin.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("training.feedforward.matricesOrigin.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
              <p className="text-gray-500 font-mono">
                {t("training.feedforward.matricesOrigin.samePrinciple")}
              </p>
              <p className="text-gray-300">
                {t("training.feedforward.matricesOrigin.atStart")}
              </p>
              <p className="text-gray-300">
                {t("training.feedforward.matricesOrigin.duringTraining")}
              </p>
              <p className="text-gray-300">
                {t("training.feedforward.matricesOrigin.afterTraining")}
              </p>
            </div>
            <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-1 mt-2">
              <p className="text-gray-500">
                {t("training.feedforward.matricesOrigin.paramSizeComment")}
              </p>
              <p>
                W₁ : <span className="text-blue-400">{D.dModel}</span> ×{" "}
                <span className="text-amber-400">{F.dFF}</span> ={" "}
                <strong className="text-white">{D.dModel * F.dFF}</strong>{" "}
                {t("training.feedforward.matricesOrigin.params")}
              </p>
              <p>
                <span className="text-cyan-400">b₁</span> :{" "}
                <span className="text-amber-400">{F.dFF}</span>{" "}
                {t("training.feedforward.matricesOrigin.values")}{" "}
                <span className="text-gray-600">
                  {t("training.feedforward.matricesOrigin.biasNote1")}
                </span>
              </p>
              <p>
                W₂ : <span className="text-amber-400">{F.dFF}</span> ×{" "}
                <span className="text-blue-400">{D.dModel}</span> ={" "}
                <strong className="text-white">{F.dFF * D.dModel}</strong>{" "}
                {t("training.feedforward.matricesOrigin.params")}
              </p>
              <p>
                <span className="text-cyan-400">b₂</span> :{" "}
                <span className="text-blue-400">{D.dModel}</span>{" "}
                {t("training.feedforward.matricesOrigin.values")}{" "}
                <span className="text-gray-600">
                  {t("training.feedforward.matricesOrigin.biasNote2")}
                </span>
              </p>
              <p className="text-gray-600 mt-1">
                Total : {D.dModel * F.dFF} + {F.dFF} + {F.dFF * D.dModel} +{" "}
                {D.dModel} ={" "}
                <strong className="text-white">
                  {D.dModel * F.dFF + F.dFF + F.dFF * D.dModel + D.dModel}
                </strong>{" "}
                {t("training.feedforward.matricesOrigin.params")}
              </p>
              <p className="text-gray-600 mt-1">
                {t("training.feedforward.matricesOrigin.realModelParams")}
              </p>
            </div>
          </div>

          {/* ─── Pourquoi l'expansion ? ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("training.feedforward.whyExpansion.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.feedforward.whyExpansion.question", {
                dModel: D.dModel,
                dFF: F.dFF,
                ratio: F.dFF / D.dModel,
              })}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
              <p className="text-gray-500 font-mono">
                {t("training.feedforward.whyExpansion.analogyLabel")}
              </p>
              <p className="text-gray-300">
                {t("training.feedforward.whyExpansion.analogy")}
              </p>
              <p className="text-gray-300">
                {t("training.feedforward.whyExpansion.analogySynthesis")}
              </p>
              <p className="text-gray-300">
                {t("training.feedforward.whyExpansion.workingSpace")}
              </p>
            </div>
          </div>

          {/* ─── ReLU : pourquoi ? ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.feedforward.relu.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("training.feedforward.relu.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-1">
              <p>
                ReLU(<span className="text-blue-300">+2.5</span>) ={" "}
                <strong className="text-white">2.5</strong>{" "}
                <span className="text-gray-600">
                  ← {t("training.feedforward.relu.positiveLabel")}
                </span>
              </p>
              <p>
                ReLU(<span className="text-red-300">−1.3</span>) ={" "}
                <strong className="text-white">0.0</strong>{" "}
                <span className="text-gray-600">
                  ← {t("training.feedforward.relu.negativeLabel")}
                </span>
              </p>
              <p>
                ReLU(<span className="text-blue-300">+0.7</span>) ={" "}
                <strong className="text-white">0.7</strong>{" "}
                <span className="text-gray-600">
                  ← {t("training.feedforward.relu.positiveLabel")}
                </span>
              </p>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {t("training.feedforward.relu.twoRoles")}
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-400 space-y-1 ml-2">
              <li>{t("training.feedforward.relu.role1")}</li>
              <li>{t("training.feedforward.relu.role2")}</li>
            </ol>
          </div>

          {/* ─── LA QUESTION CLÉ : perd-on de l'info ? ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("training.feedforward.infoLossQuestion.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.feedforward.infoLossQuestion.description")}
            </p>
            <p className="text-gray-300 text-sm">
              {t("training.feedforward.infoLossQuestion.answer")}
            </p>
          </div>

          {/* ─── Connexion résiduelle ─── */}
          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-green-300 font-semibold text-sm">
              {t("training.feedforward.residualConnection.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.feedforward.residualConnection.description")}
            </p>
            <div className="bg-gray-900 rounded p-4 font-mono text-sm text-center space-y-2">
              <p>{t("training.feedforward.residualConnection.formula")}</p>
            </div>
            <p className="text-gray-300 text-sm">
              {t("training.feedforward.residualConnection.explanation")}
            </p>

            <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
              <p className="text-gray-500 font-mono">
                {t("training.feedforward.residualConnection.analogyLabel")}
              </p>
              <p className="text-gray-300">
                {t("training.feedforward.residualConnection.analogy")}
              </p>
              <div className="ml-2 space-y-1 mt-1">
                <p className="text-gray-400">
                  {t("training.feedforward.residualConnection.attentionAdds")}
                </p>
                <p className="text-gray-400">
                  {t("training.feedforward.residualConnection.ffnAdds")}
                </p>
                <p className="text-gray-400">
                  {t("training.feedforward.residualConnection.eachLayerAdds")}
                </p>
              </div>
              <p className="text-green-300 mt-2">
                {t("training.feedforward.residualConnection.conclusion")}
              </p>
            </div>
          </div>

          {/* ─── Récap du flux dans une couche ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.feedforward.fullFlow.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("training.feedforward.fullFlow.descriptionBefore")}{" "}
              <VulgarizedTerm termKey="n_layers">
                {t("training.feedforward.fullFlow.layerLabel")}
              </VulgarizedTerm>{" "}
              {t("training.feedforward.fullFlow.descriptionAfter")}
            </p>
            <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-1">
              <p>
                <span className="text-gray-500">1.</span> x₁ = x +{" "}
                <span className="text-blue-300">Attention</span>(x)
                <span className="text-gray-600 ml-2">
                  ← {t("training.feedforward.fullFlow.step1Comment")}
                </span>
              </p>
              <p>
                <span className="text-gray-500">2.</span> x₂ = x₁ +{" "}
                <span className="text-amber-300">FFN</span>(x₁)
                <span className="text-gray-600 ml-2">
                  ← {t("training.feedforward.fullFlow.step2Comment")}
                </span>
              </p>
              <p className="text-gray-500 mt-1">
                {t("training.feedforward.fullFlow.nextLayerComment")}
              </p>
            </div>
            <p className="text-gray-500 text-xs">
              {t("training.feedforward.fullFlow.note")}
            </p>
          </div>
        </>
      }
      calculation={
        <div className="space-y-8">
          {/* ─── Exemple concret complet ─── */}
          <ConcreteCalculation
            title={t("training.feedforward.calculation.title")}
            description={t("training.feedforward.calculation.description")}
          >
            <div className="space-y-6">
              {/* Étape 0 : Résiduelle après attention */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.feedforward.calculation.step0Title")}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.feedforward.calculation.step0Description")}
                </p>
                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation
                    totalSteps={D.tokens.length}
                    delay={1000}
                  >
                    {(step) => (
                      <div className="space-y-1.5 font-mono text-xs">
                        <div className="grid grid-cols-[56px_repeat(4,1fr)] gap-1 text-center text-[10px] text-gray-600 mb-1">
                          <span />
                          <span>dim 0</span>
                          <span>dim 1</span>
                          <span>dim 2</span>
                          <span>dim 3</span>
                        </div>
                        {D.tokens.map((char, ti) => {
                          const visible = step === -1 || step >= ti;
                          const active = step === ti;
                          const emb = D.embeddings[ti];
                          const mho = D.multiHeadOutput[ti];
                          const res = F.ffnInput[ti];

                          return (
                            <div
                              key={ti}
                              className={`transition-all duration-300 ${!visible ? "opacity-0 h-0 overflow-hidden" : ""}`}
                            >
                              <div
                                className={`grid grid-cols-[56px_repeat(4,1fr)] gap-1 text-center items-center rounded py-0.5 transition-all duration-300 ${
                                  active
                                    ? "ring-2 ring-green-500/40 bg-green-500/10"
                                    : ""
                                }`}
                              >
                                <span className="text-left text-[10px]">
                                  <span
                                    className={
                                      active
                                        ? "text-primary-300 font-bold"
                                        : "text-primary-400/70"
                                    }
                                  >
                                    {char}
                                  </span>
                                  <span className="text-gray-600 ml-0.5">
                                    p{ti}
                                  </span>
                                </span>
                                {res.map((v, d) => (
                                  <span
                                    key={d}
                                    className={`transition-all duration-300 font-semibold ${
                                      active
                                        ? "text-green-300"
                                        : visible
                                          ? "text-green-400/60"
                                          : "text-gray-700"
                                    }`}
                                  >
                                    {fmt(v)}
                                  </span>
                                ))}
                              </div>
                              {active && (
                                <div className="ml-[56px] mt-1 mb-2 space-y-0.5">
                                  <div className="grid grid-cols-[40px_repeat(4,1fr)] gap-1 text-center items-center text-[10px]">
                                    <span className="text-left text-blue-400">
                                      emb
                                    </span>
                                    {emb.map((v, d) => (
                                      <span
                                        key={d}
                                        className="text-blue-300 ring-1 ring-blue-500/30 bg-blue-500/5 rounded px-0.5"
                                      >
                                        {fmt(v)}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="grid grid-cols-[40px_repeat(4,1fr)] gap-1 text-center items-center text-[10px]">
                                    <span className="text-left text-amber-400">
                                      +attn
                                    </span>
                                    {mho.map((v, d) => (
                                      <span
                                        key={d}
                                        className="text-amber-300 ring-1 ring-amber-500/30 bg-amber-500/5 rounded px-0.5"
                                      >
                                        {fmt(v)}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="grid grid-cols-[40px_repeat(4,1fr)] gap-1 text-center items-center text-[10px]">
                                    <span className="text-left text-green-400">
                                      =
                                    </span>
                                    {res.map((v, d) => (
                                      <span key={d} className="text-green-300">
                                        {fmt(v)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {(step >= D.tokens.length - 1 || step === -1) && (
                          <div className="border-t border-gray-800 pt-2 mt-2">
                            <p className="text-green-300 text-xs font-medium">
                              {t(
                                "training.feedforward.calculation.step0Result",
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </AnimatedMathOperation>
                </div>
              </div>

              {/* Étape 1 : Expansion via W₁ — focus token "t" */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.feedforward.calculation.step1Title")}{" "}
                  <Link
                    to="/math/matrix-product"
                    className="text-primary-400 hover:underline text-xs font-normal"
                  >
                    {t("training.feedforward.calculation.matrixRecallLink")}
                  </Link>
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.feedforward.calculation.step1Description")}
                </p>

                <AnimatedMathOperation totalSteps={F.dFF} delay={800}>
                  {(step) => {
                    const x = F.ffnInput[FOCUS];
                    const hRow = F.h[FOCUS];
                    return (
                      <div className="space-y-3">
                        {/* W₁ matrix with dynamic highlighting */}
                        <MatrixDisplay
                          data={F.W_1}
                          title={t("training.feedforward.calculation.w1Title")}
                          shape={`(${D.dModel} × ${F.dFF})`}
                          rowLabels={["d₀", "d₁", "d₂", "d₃"]}
                          colLabels={Array.from(
                            { length: F.dFF },
                            (_, i) => `h${i}`,
                          )}
                          compact
                          highlightCols={step >= 0 ? [step] : undefined}
                          cellColor={(_, _r, c) =>
                            step === -1
                              ? ""
                              : c === step
                                ? "text-amber-300"
                                : c < step
                                  ? "text-gray-500"
                                  : "text-gray-700"
                          }
                        />

                        {/* Input vector */}
                        <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                          <p className="text-gray-500 mb-1">
                            {t(
                              "training.feedforward.calculation.inputVectorLabel",
                            )}
                          </p>
                          <div className="flex items-center gap-1">
                            [
                            {x.map((v, i) => (
                              <span key={i}>
                                <span
                                  className={`${NCELL} ${
                                    step >= 0
                                      ? "text-blue-400 ring-1 ring-blue-500/30 bg-blue-500/5 rounded px-0.5"
                                      : "text-blue-400"
                                  }`}
                                >
                                  {fmt(v)}
                                </span>
                                {i < x.length - 1 && ", "}
                              </span>
                            ))}
                            ]
                          </div>
                        </div>

                        {/* Progressive result */}
                        <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                          <p className="text-gray-500 mb-1">
                            h = x × W₁ + b₁ :
                          </p>
                          <div className="flex items-center gap-1 flex-wrap">
                            [
                            {hRow.map((v, i) => {
                              const vis = step === -1 || step >= i;
                              const act = step === i;
                              return (
                                <span key={i}>
                                  <span
                                    className={`${NCELL} transition-all duration-300 ${
                                      act
                                        ? "text-amber-300 font-bold ring-2 ring-amber-500/40 bg-amber-500/10 rounded px-0.5"
                                        : vis
                                          ? v < 0
                                            ? "text-red-300"
                                            : "text-blue-300"
                                          : "text-gray-700"
                                    }`}
                                  >
                                    {vis ? fmt(v) : "____"}
                                  </span>
                                  {i < hRow.length - 1 && ", "}
                                </span>
                              );
                            })}
                            ]
                          </div>
                        </div>

                        {/* Detailed calculation for active step */}
                        {step >= 0 && (
                          <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                            <p className="text-gray-500">
                              h[{step}] = Σ(x[k] × W₁[k][{step}]) + b₁[{step}] :
                            </p>
                            <div className="flex items-center gap-1 flex-wrap text-[11px]">
                              {x.map((xv, k) => (
                                <span key={k}>
                                  {k > 0 && (
                                    <span className="text-gray-600 mx-0.5">
                                      +
                                    </span>
                                  )}
                                  <span className="text-blue-400">
                                    {fmtMul(xv)}
                                  </span>
                                  <span className="text-gray-600">×</span>
                                  <span className="text-amber-400">
                                    {fmtMul(F.W_1[k][step])}
                                  </span>
                                </span>
                              ))}
                              <span className="text-gray-600 mx-0.5">+</span>
                              <span className="text-cyan-400">
                                {fmt(F.b_1[step])}
                              </span>
                              <span className="text-gray-600 mx-1">=</span>
                              <span className="text-white font-bold">
                                {fmt(hRow[step])}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }}
                </AnimatedMathOperation>
              </div>

              {/* Étape 2 : ReLU */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.feedforward.calculation.step2Title")}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.feedforward.calculation.step2Description")}
                </p>
                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation totalSteps={F.dFF} delay={500}>
                    {(step) => {
                      const hRow = F.h[FOCUS];
                      const reluRow = F.relu_h[FOCUS];
                      const nZeros = reluRow.filter((v) => v === 0).length;
                      return (
                        <div className="font-mono text-xs space-y-2">
                          <p className="text-gray-500 mb-1">
                            {t("training.feedforward.calculation.beforeRelu")} :
                          </p>
                          <div className="flex items-center gap-1 flex-wrap">
                            [
                            {hRow.map((v, i) => {
                              const active = step === i;
                              const neg = v < 0;
                              return (
                                <span key={i}>
                                  <span
                                    className={`${NCELL} transition-all duration-300 ${
                                      active
                                        ? neg
                                          ? "text-red-400 ring-2 ring-red-500/40 bg-red-500/10 rounded px-0.5 line-through"
                                          : "text-blue-300 ring-2 ring-blue-500/40 bg-blue-500/10 rounded px-0.5"
                                        : neg
                                          ? "text-red-300"
                                          : "text-blue-300"
                                    }`}
                                  >
                                    {fmt(v)}
                                  </span>
                                  {i < hRow.length - 1 && ", "}
                                </span>
                              );
                            })}
                            ]
                          </div>
                          <p className="text-gray-500 mt-2 mb-1">
                            {t("training.feedforward.calculation.afterRelu")} :
                          </p>
                          <div className="flex items-center gap-1 flex-wrap">
                            [
                            {reluRow.map((v, i) => {
                              const vis = step === -1 || step >= i;
                              const active = step === i;
                              return (
                                <span key={i}>
                                  <span
                                    className={`${NCELL} transition-all duration-300 ${
                                      !vis
                                        ? "text-gray-700"
                                        : active
                                          ? v === 0
                                            ? "text-red-400 font-bold"
                                            : "text-green-300 font-bold ring-2 ring-green-500/40 bg-green-500/10 rounded px-0.5"
                                          : v === 0
                                            ? "text-red-400/60"
                                            : "text-green-300/80"
                                    }`}
                                  >
                                    {vis
                                      ? v === 0
                                        ? " 0.00"
                                        : fmt(v)
                                      : "____"}
                                  </span>
                                  {i < reluRow.length - 1 && ", "}
                                </span>
                              );
                            })}
                            ]
                          </div>
                          {(step >= F.dFF - 1 || step === -1) && (
                            <p className="text-gray-400 text-xs mt-2 border-t border-gray-800 pt-2">
                              <strong className="text-red-400">
                                {nZeros}/{F.dFF}{" "}
                                {t(
                                  "training.feedforward.calculation.step2ResultNeurons",
                                )}
                              </strong>{" "}
                              —{" "}
                              <strong className="text-green-300">
                                {F.dFF - nZeros}{" "}
                                {t(
                                  "training.feedforward.calculation.step2ResultActive",
                                )}
                              </strong>{" "}
                              {t(
                                "training.feedforward.calculation.step2ResultNote",
                              )}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  </AnimatedMathOperation>
                </div>
              </div>

              {/* Étape 3 : Compression via W₂ */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.feedforward.calculation.step3Title")}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.feedforward.calculation.step3Description")}
                </p>

                <AnimatedMathOperation totalSteps={D.dModel} delay={1000}>
                  {(step) => {
                    const rh = F.relu_h[FOCUS];
                    const ffnOut = F.ffnOutput[FOCUS];
                    return (
                      <div className="space-y-3">
                        {/* W₂ matrix */}
                        <MatrixDisplay
                          data={F.W_2}
                          title={t("training.feedforward.calculation.w2Title")}
                          shape={`(${F.dFF} × ${D.dModel})`}
                          rowLabels={Array.from(
                            { length: F.dFF },
                            (_, i) => `h${i}`,
                          )}
                          colLabels={["d₀", "d₁", "d₂", "d₃"]}
                          compact
                          highlightCols={step >= 0 ? [step] : undefined}
                          cellColor={(_, r, c) => {
                            if (step === -1) return "";
                            // Dim neurons that are zeroed by ReLU
                            if (rh[r] === 0) return "text-gray-700";
                            return c === step
                              ? "text-amber-300"
                              : c < step
                                ? "text-gray-500"
                                : "text-gray-700";
                          }}
                        />

                        {/* ReLU(h) vector — grayed-out zeros */}
                        <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                          <p className="text-gray-500 mb-1">
                            {t(
                              "training.feedforward.calculation.reluVectorLabel",
                            )}
                          </p>
                          <div className="flex items-center gap-1 flex-wrap">
                            [
                            {rh.map((v, i) => (
                              <span key={i}>
                                <span
                                  className={`${NCELL} ${v === 0 ? "text-gray-700" : "text-green-300"}`}
                                >
                                  {v === 0 ? " 0.00" : fmt(v)}
                                </span>
                                {i < rh.length - 1 && ", "}
                              </span>
                            ))}
                            ]
                          </div>
                        </div>

                        {/* Progressive result */}
                        <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                          <p className="text-gray-500 mb-1">
                            FFN(x) = ReLU(h) × W₂ + b₂ :
                          </p>
                          <div className="flex items-center gap-1">
                            [
                            {ffnOut.map((v, i) => {
                              const vis = step === -1 || step >= i;
                              const act = step === i;
                              return (
                                <span key={i}>
                                  <span
                                    className={`${NCELL} transition-all duration-300 ${
                                      act
                                        ? "text-amber-300 font-bold ring-2 ring-amber-500/40 bg-amber-500/10 rounded px-0.5"
                                        : vis
                                          ? "text-amber-400"
                                          : "text-gray-700"
                                    }`}
                                  >
                                    {vis ? fmt(v) : "____"}
                                  </span>
                                  {i < ffnOut.length - 1 && ", "}
                                </span>
                              );
                            })}
                            ]
                          </div>
                        </div>

                        {/* Detailed calculation */}
                        {step >= 0 && (
                          <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                            <p className="text-gray-500">
                              FFN(x)[{step}] = Σ(ReLU(h)[k] × W₂[k][{step}]) +
                              b₂[{step}] :
                            </p>
                            <div className="flex items-center gap-1 flex-wrap text-[11px]">
                              {rh.map((rv, k) => {
                                if (rv === 0) return null;
                                return (
                                  <span key={k}>
                                    {k > 0 &&
                                      rh.slice(0, k).some((v) => v !== 0) && (
                                        <span className="text-gray-600 mx-0.5">
                                          +
                                        </span>
                                      )}
                                    <span className="text-green-400">
                                      {fmtMul(rv)}
                                    </span>
                                    <span className="text-gray-600">×</span>
                                    <span className="text-amber-400">
                                      {fmtMul(F.W_2[k][step])}
                                    </span>
                                  </span>
                                );
                              })}
                              <span className="text-gray-600 mx-0.5">+</span>
                              <span className="text-cyan-400">
                                {fmt(F.b_2[step])}
                              </span>
                              <span className="text-gray-600 mx-1">=</span>
                              <span className="text-white font-bold">
                                {fmt(ffnOut[step])}
                              </span>
                            </div>
                            <p className="text-gray-600 text-[10px] mt-1">
                              {t(
                                "training.feedforward.calculation.step3DetailNote",
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }}
                </AnimatedMathOperation>
              </div>

              {/* Étape 4 : Résiduelle FFN — tous les 7 tokens */}
              <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-green-300">
                  {t("training.feedforward.calculation.step4Title")}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.feedforward.calculation.step4Description")}
                </p>
                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation
                    totalSteps={D.tokens.length}
                    delay={1000}
                  >
                    {(step) => (
                      <div className="space-y-1.5 font-mono text-xs">
                        <div className="grid grid-cols-[56px_repeat(4,1fr)] gap-1 text-center text-[10px] text-gray-600 mb-1">
                          <span />
                          <span>dim 0</span>
                          <span>dim 1</span>
                          <span>dim 2</span>
                          <span>dim 3</span>
                        </div>
                        {D.tokens.map((char, ti) => {
                          const visible = step === -1 || step >= ti;
                          const active = step === ti;
                          const input = F.ffnInput[ti];
                          const ffnOut = F.ffnOutput[ti];
                          const out = F.output[ti];

                          return (
                            <div
                              key={ti}
                              className={`transition-all duration-300 ${!visible ? "opacity-0 h-0 overflow-hidden" : ""}`}
                            >
                              <div
                                className={`grid grid-cols-[56px_repeat(4,1fr)] gap-1 text-center items-center rounded py-0.5 transition-all duration-300 ${
                                  active
                                    ? "ring-2 ring-green-500/40 bg-green-500/10"
                                    : ""
                                }`}
                              >
                                <span className="text-left text-[10px]">
                                  <span
                                    className={
                                      active
                                        ? "text-primary-300 font-bold"
                                        : "text-primary-400/70"
                                    }
                                  >
                                    {char}
                                  </span>
                                </span>
                                {out.map((v, d) => (
                                  <span
                                    key={d}
                                    className={`transition-all duration-300 font-semibold ${
                                      active
                                        ? "text-green-300"
                                        : visible
                                          ? "text-green-400/60"
                                          : "text-gray-700"
                                    }`}
                                  >
                                    {fmt(v)}
                                  </span>
                                ))}
                              </div>
                              {active && (
                                <div className="ml-[56px] mt-1 mb-2 space-y-0.5">
                                  <div className="grid grid-cols-[40px_repeat(4,1fr)] gap-1 text-center items-center text-[10px]">
                                    <span className="text-left text-blue-400">
                                      x
                                    </span>
                                    {input.map((v, d) => (
                                      <span
                                        key={d}
                                        className="text-blue-300 ring-1 ring-blue-500/30 bg-blue-500/5 rounded px-0.5"
                                      >
                                        {fmt(v)}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="grid grid-cols-[40px_repeat(4,1fr)] gap-1 text-center items-center text-[10px]">
                                    <span className="text-left text-amber-400">
                                      +FFN
                                    </span>
                                    {ffnOut.map((v, d) => (
                                      <span
                                        key={d}
                                        className="text-amber-300 ring-1 ring-amber-500/30 bg-amber-500/5 rounded px-0.5"
                                      >
                                        {fmt(v)}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="grid grid-cols-[40px_repeat(4,1fr)] gap-1 text-center items-center text-[10px]">
                                    <span className="text-left text-green-400">
                                      =
                                    </span>
                                    {out.map((v, d) => (
                                      <span key={d} className="text-green-300">
                                        {fmt(v)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {(step >= D.tokens.length - 1 || step === -1) && (
                          <div className="border-t border-gray-800 pt-2 mt-2">
                            <p className="text-green-300 text-xs font-medium">
                              {t(
                                "training.feedforward.calculation.step4Result",
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </AnimatedMathOperation>
                </div>
              </div>
            </div>
          </ConcreteCalculation>

          {/* ─── Diagramme ─── */}
          <ConcreteCalculation
            title={t("training.feedforward.calculation.diagramTitle")}
            description={t(
              "training.feedforward.calculation.diagramDescription",
            )}
          >
            <FFNDiagram dModel={D.dModel} dFF={F.dFF} />
          </ConcreteCalculation>

          {/* ─── En résumé ─── */}
          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-green-300 font-semibold text-sm">
              {t("training.feedforward.summary.title")}
            </h4>

            {/* ENTRÉE */}
            <div className="bg-blue-900/20 border border-blue-800/30 rounded p-3">
              <p className="text-blue-300 font-semibold text-[10px] uppercase tracking-wide mb-2">
                ▸ {t("training.feedforward.summary.inputLabel")}
              </p>
              <div className="font-mono text-xs space-y-1">
                <p>
                  {t("training.feedforward.summary.tokenLabel")}{" "}
                  <span className="text-primary-300">t</span>{" "}
                  {t("training.feedforward.summary.tokenLabelEnd")} → x = [
                  {F.ffnInput[FOCUS].map((v) => fmt(v)).join(", ")}]
                </p>
                <p className="text-gray-500 text-[10px]">
                  {t("training.feedforward.summary.inputDescription")}
                </p>
              </div>
            </div>

            <div className="text-center text-gray-600">↓</div>

            {/* OPÉRATION */}
            <div className="bg-gray-800/50 border border-gray-700 rounded p-3 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-gray-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸ {t("training.feedforward.summary.operationLabel")}
                </p>
                <span className="text-amber-400 text-[10px] bg-amber-900/30 px-1.5 py-0.5 rounded">
                  {t("training.feedforward.summary.learnedBadge")}
                </span>
              </div>

              <div className="font-mono text-xs space-y-2">
                <div className="bg-gray-900 rounded p-2 space-y-1">
                  <p className="text-gray-500">
                    ① {t("training.feedforward.summary.step1Label")} :
                  </p>
                  <p>
                    h = [
                    {F.h[FOCUS].map((v, i) => (
                      <span
                        key={i}
                        className={v < 0 ? "text-red-300" : "text-blue-300"}
                      >
                        {fmt(v)}
                      </span>
                    )).reduce(
                      (a: React.ReactNode[], b, i) =>
                        i === 0 ? [b] : [...a, ", ", b],
                      [],
                    )}
                    ]
                  </p>
                </div>
                <div className="bg-gray-900 rounded p-2 space-y-1">
                  <p className="text-gray-500">
                    ② {t("training.feedforward.summary.step2Label")} :
                  </p>
                  <p>
                    [
                    {F.relu_h[FOCUS].map((v, i) => (
                      <span
                        key={i}
                        className={v === 0 ? "text-red-400" : "text-green-300"}
                      >
                        {v === 0 ? "0" : v.toFixed(2)}
                      </span>
                    )).reduce(
                      (a: React.ReactNode[], b, i) =>
                        i === 0 ? [b] : [...a, ", ", b],
                      [],
                    )}
                    ]{" "}
                    <span className="text-gray-600">
                      ← {F.relu_h[FOCUS].filter((v) => v === 0).length}/{F.dFF}{" "}
                      {t("training.feedforward.summary.extinguished")}
                    </span>
                  </p>
                </div>
                <div className="bg-gray-900 rounded p-2 space-y-1">
                  <p className="text-gray-500">
                    ③ {t("training.feedforward.summary.step3Label")} :
                  </p>
                  <p>
                    FFN(x) = [
                    <span className="text-amber-300">
                      {F.ffnOutput[FOCUS].map((v) => fmt(v)).join(", ")}
                    </span>
                    ]
                  </p>
                </div>
                <div className="bg-green-900/30 rounded p-2 space-y-1">
                  <p className="text-gray-500">
                    ④ {t("training.feedforward.summary.step4Label")} :
                  </p>
                  <p>
                    {t("training.feedforward.summary.outputFormula")} ={" "}
                    <span className="text-blue-300">x</span> +{" "}
                    <span className="text-amber-300">FFN(x)</span> = [
                    {F.ffnInput[FOCUS].map((v, d) => (
                      <span key={d}>
                        {d > 0 && ", "}
                        {fmt(v)}+{fmt(F.ffnOutput[FOCUS][d])}
                      </span>
                    ))}
                    ]
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-gray-600">↓</div>

            {/* SORTIE */}
            <div className="bg-green-900/20 border border-green-800/30 rounded p-3">
              <p className="text-green-300 font-semibold text-[10px] uppercase tracking-wide mb-2">
                ▸ {t("training.feedforward.summary.outputLabel")}
              </p>
              <div className="font-mono text-xs space-y-1">
                <p>
                  {t("training.feedforward.summary.tokenLabel")}{" "}
                  <span className="text-primary-300">t</span>{" "}
                  {t("training.feedforward.summary.tokenLabelEnd")} → [
                  <strong className="text-white">
                    {F.output[FOCUS].map((v) => fmt(v)).join(", ")}
                  </strong>
                  ]{" "}
                  <span className="text-gray-600">
                    ← {t("training.feedforward.summary.outputNote")}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-gray-900 rounded p-3 font-mono text-xs text-center mt-1">
              {t("training.feedforward.summary.outputFormula")} ={" "}
              <span className="text-blue-300">x</span> + ReLU(
              <span className="text-blue-300">x</span> ×{" "}
              <span className="text-amber-300">W₁</span> +{" "}
              <span className="text-amber-300">b₁</span>) ×{" "}
              <span className="text-amber-300">W₂</span> +{" "}
              <span className="text-amber-300">b₂</span>
            </div>
            <p className="text-gray-500 text-xs">
              W₁ ({D.dModel}×{F.dFF}), W₂ ({F.dFF}×{D.dModel}), b₁ ({F.dFF}), b₂
              ({D.dModel}) —{" "}
              <span className="text-amber-400">
                {t("training.feedforward.summary.allLearned")}
              </span>{" "}
              ({D.dModel * F.dFF + F.dFF + F.dFF * D.dModel + D.dModel}{" "}
              {t("training.feedforward.matricesOrigin.params")}).
              {t("training.feedforward.summary.formulaNote")}
            </p>
          </div>
        </div>
      }
      deepDive={
        <DeepDiveSection
          title={t("training.feedforward.deepDive.title")}
          docSlug="feedforward"
          formulas={[
            {
              name: t("training.feedforward.deepDive.ffn.name"),
              latex: "\\text{FFN}(x) = \\text{ReLU}(xW_1 + b_1)W_2 + b_2",
              explanation: t("training.feedforward.deepDive.ffn.explanation"),
            },
            {
              name: t("training.feedforward.deepDive.residual.name"),
              latex: "x_{out} = x + \\text{FFN}(\\text{LayerNorm}(x))",
              explanation: t(
                "training.feedforward.deepDive.residual.explanation",
              ),
            },
            {
              name: t("training.feedforward.deepDive.reluFormula.name"),
              latex: "\\text{ReLU}(x) = \\max(0, x)",
              explanation: t(
                "training.feedforward.deepDive.reluFormula.explanation",
              ),
            },
            {
              name: t("training.feedforward.deepDive.transformerBlock.name"),
              latex:
                "x_2 = x_1 + \\text{FFN}(\\text{LN}(x_1)), \\quad x_1 = x + \\text{Attn}(\\text{LN}(x))",
              explanation: t(
                "training.feedforward.deepDive.transformerBlock.explanation",
              ),
            },
          ]}
        />
      }
    />
  );
}
