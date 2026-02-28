/**
 * Étape 7 : Rétropropagation — Corriger les erreurs
 *
 * Page enrichie avec :
 * - Problématique : comment corriger des millions de poids ?
 * - Analogie de l'enquête à rebours
 * - Exemple concret avec la chaîne de gradients
 * - Le rôle des connexions résiduelles
 *
 * @module pages/training-steps/BackpropagationStep
 */

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import StepExplainer from "@/components/educational/StepExplainer";
import ConcreteCalculation from "@/components/educational/ConcreteCalculation";
import DeepDiveSection from "@/components/educational/DeepDiveSection";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";
import GradientFlow from "@/components/visualizations/GradientFlow";
import AnimatedMathOperation from "@/components/visualizations/AnimatedMathOperation";
import MatrixDisplay from "@/components/visualizations/MatrixDisplay";
import {
  EXAMPLE_BACKPROP as BP,
  EXAMPLE_LOSS_DETAILED as LD,
  EXAMPLE_FFN_DETAILED as FFN,
  EXAMPLE_ATTENTION_DETAILED as ATT,
} from "@/lib/exampleData";

/** Formate un nombre avec signe explicite (2 décimales) */
function fmt(v: number): string {
  return v >= 0 ? `+${v.toFixed(2)}` : `−${Math.abs(v).toFixed(2)}`;
}
/** Formate un nombre pour la multiplication (parenthèses si négatif) */
function fmtMul(v: number): string {
  return v < 0 ? `(−${Math.abs(v).toFixed(2)})` : v.toFixed(2);
}
const NCELL = "inline-block min-w-[2.5rem] text-right";

export default function BackpropagationStep() {
  const { t } = useTranslation("pages");
  return (
    <StepExplainer
      sectionId="training/backpropagation"
      phase="training"
      stepNumber={7}
      totalSteps={8}
      title={t("training.backpropagation.title")}
      subtitle={t("training.backpropagation.subtitle")}
      docSlug="loss"
      exampleContext={t("training.backpropagation.exampleContext")}
      explanation={
        <>
          {/* ─── Le problème ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("training.backpropagation.problem.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.backpropagation.problem.description1")}
            </p>
            <p className="text-gray-300 text-sm">
              {t("training.backpropagation.problem.description2")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono">
              <p className="text-gray-500">
                {t("training.backpropagation.calc.modelWeights.comment")}
              </p>
              <p>
                {t("training.backpropagation.calc.modelWeights.embedding")}{" "}
                <span className="text-white">1 024</span>{" "}
                {t("training.backpropagation.calc.modelWeights.weightsLabel")}
              </p>
              <p>
                {t("training.backpropagation.calc.modelWeights.attention")}{" "}
                <span className="text-white">12 288</span>{" "}
                {t("training.backpropagation.calc.modelWeights.weightsLabel")}
              </p>
              <p>
                {t("training.backpropagation.calc.modelWeights.ffn")}{" "}
                <span className="text-white">32 768</span>{" "}
                {t("training.backpropagation.calc.modelWeights.weightsLabel")}
              </p>
              <p className="text-gray-500 mt-1">
                {t("training.backpropagation.calc.modelWeights.question")}
              </p>
            </div>
          </div>

          {/* ─── L'idée clé ─── */}
          <p>{t("training.backpropagation.idea")}</p>

          {/* ─── Analogie de l'enquête ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("training.backpropagation.investigationAnalogy.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.backpropagation.investigationAnalogy.description")}
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2 ml-2">
              <li>
                {t("training.backpropagation.investigationAnalogy.step1")}
              </li>
              <li>
                {t("training.backpropagation.investigationAnalogy.step2")}
              </li>
              <li>
                {t("training.backpropagation.investigationAnalogy.step3")}
              </li>
              <li>
                {t("training.backpropagation.investigationAnalogy.step4")}
              </li>
              <li>
                {t("training.backpropagation.investigationAnalogy.step5")}
              </li>
            </ol>
            <p className="text-gray-400 text-xs">
              {t("training.backpropagation.investigationAnalogy.note")}
            </p>
          </div>

          {/* ─── Le gradient expliqué (intuitif) ─── */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 space-y-4">
            <h4 className="text-blue-300 font-semibold text-sm">
              {t("training.backpropagation.gradient.title")}
            </h4>

            <p className="text-gray-300 text-sm">
              {t("training.backpropagation.gradient.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-center">
              <p className="text-white text-sm italic">
                {t("training.backpropagation.gradient.question")}
              </p>
            </div>

            <p className="text-gray-300 text-sm">
              {t("training.backpropagation.gradient.slopeAnalogy")}
            </p>

            <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-2">
              <p className="text-gray-500">
                {t("training.backpropagation.calc.gradientExample.comment1")}
              </p>
              <p className="text-gray-500">
                {t("training.backpropagation.calc.gradientExample.comment2")}
              </p>
              <div className="border-l-2 border-gray-600 pl-3 space-y-1 mt-1">
                <p>
                  W = <span className="text-white">0.500</span> → Loss ={" "}
                  <span className="text-white">0.8700</span>
                </p>
                <p>
                  W = <span className="text-white">0.501</span> → Loss ={" "}
                  <span className="text-white">0.8703</span>{" "}
                  <span className="text-gray-600">
                    {t("training.backpropagation.calc.gradientExample.delta")}
                  </span>
                </p>
              </div>
              <p className="text-amber-300 mt-2">
                {t("training.backpropagation.calc.gradientExample.formula")} ={" "}
                <strong>+0.3</strong>
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-red-400">
                  {t(
                    "training.backpropagation.calc.gradientExample.positiveResult",
                  )}
                </p>
                <p className="text-green-400">
                  {t(
                    "training.backpropagation.calc.gradientExample.conclusion",
                  )}
                </p>
              </div>
            </div>

            <div className="bg-purple-900/20 border border-purple-800/30 rounded p-3">
              <p className="text-purple-300 font-semibold text-xs mb-2">
                {t("training.backpropagation.gradient.readingSummary")}
              </p>
              <ul className="text-gray-300 text-xs space-y-1">
                <li>
                  <span className="text-red-400 font-mono">+0.3</span>{" "}
                  {t("training.backpropagation.gradient.positiveGrad")}
                </li>
                <li>
                  <span className="text-green-400 font-mono">−0.3</span>{" "}
                  {t("training.backpropagation.gradient.negativeGrad")}
                </li>
                <li>
                  <span className="text-white font-mono">±1.5</span>{" "}
                  {t("training.backpropagation.gradient.largeGrad")}
                </li>
                <li>
                  <span className="text-gray-500 font-mono">±0.001</span>{" "}
                  {t("training.backpropagation.gradient.smallGrad")}
                </li>
              </ul>
            </div>
          </div>

          {/* ─── Du loss au gradient : la chaîne ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.backpropagation.chainRule.title")}
            </h4>

            <p className="text-gray-400 text-sm">
              {t("training.backpropagation.chainRule.description")}
            </p>

            <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-3">
              <p className="text-gray-500">
                {t("training.backpropagation.calc.chainRuleCode.startingPoint")}
              </p>
              <p>
                <span className="text-red-400">①</span>{" "}
                <span className="text-red-300">
                  ∂Loss/∂
                  {t("training.backpropagation.calc.chainRuleCode.output")}
                </span>{" "}
                ={" "}
                {t(
                  "training.backpropagation.calc.chainRuleCode.predMinusTruth",
                )}{" "}
                = [+0.06, ..., <span className="text-blue-300">−0.58</span>(t),
                ...]
              </p>
              <p className="text-gray-600 ml-4">
                ↑{" "}
                {t(
                  "training.backpropagation.calc.chainRuleCode.firstGradientEasy",
                )}
              </p>

              <p className="text-gray-500 mt-2">
                {t(
                  "training.backpropagation.calc.chainRuleCode.thenLayerByLayer",
                )}
              </p>
              <p>
                <span className="text-amber-400">②</span>{" "}
                <span className="text-amber-300">∂Loss/∂FFN</span> ={" "}
                <span className="text-red-300">
                  ∂Loss/∂
                  {t("training.backpropagation.calc.chainRuleCode.output")}
                </span>{" "}
                × ∂{t("training.backpropagation.calc.chainRuleCode.output")}
                /∂FFN
              </p>
              <p>
                <span className="text-yellow-400">③</span>{" "}
                <span className="text-yellow-300">∂Loss/∂attention</span> ={" "}
                <span className="text-amber-300">∂Loss/∂FFN</span> ×
                ∂FFN/∂attention
              </p>
              <p>
                <span className="text-blue-400">④</span>{" "}
                <span className="text-blue-300">∂Loss/∂embedding</span> ={" "}
                <span className="text-yellow-300">∂Loss/∂attention</span> ×
                ∂attention/∂embedding
              </p>

              <div className="border-t border-gray-800 pt-2 mt-2">
                <p className="text-gray-500">
                  {t(
                    "training.backpropagation.calc.chainRuleCode.eachMultiply",
                  )}
                </p>
                <p className="text-gray-500">
                  {t(
                    "training.backpropagation.calc.chainRuleCode.chainingResult",
                  )}
                </p>
              </div>
            </div>

            <p className="text-gray-400 text-xs">
              {t("training.backpropagation.chainRule.cascade")}
            </p>
          </div>

          {/* ─── Connexions résiduelles ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.backpropagation.vanishingGradient.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("training.backpropagation.vanishingGradient.description")}
            </p>
            <p className="text-gray-400 text-sm">
              {t("training.backpropagation.vanishingGradient.solution")}
            </p>
          </div>
        </>
      }
      calculation={
        <div className="space-y-8">
          {/* ─── 1. Rappel du gradient de départ ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("training.backpropagation.calc.startingPoint.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.backpropagation.calc.startingPoint.exercise")}{" "}
              {t(
                "training.backpropagation.calc.startingPoint.gradientTellsUs1",
              )}{" "}
              <span className="font-mono text-xs">softmax − one_hot</span>{" "}
              {t(
                "training.backpropagation.calc.startingPoint.gradientTellsUs2",
              )}
              <strong>
                {" "}
                {t(
                  "training.backpropagation.calc.startingPoint.gradientTellsUs3",
                )}
              </strong>{" "}
              :
            </p>
            <div className="bg-gray-900 rounded p-3 font-mono text-xs">
              <p className="text-gray-500 mb-1">
                {t(
                  "training.backpropagation.calc.startingPoint.gradLogitsLabel",
                )}
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                [
                {LD.vocabOrder.map((tok, j) => {
                  const v = BP.gradLogits[j];
                  const isTarget = j === LD.targetIndex;
                  return (
                    <span key={j}>
                      <span
                        className={`${NCELL} ${isTarget ? "text-green-400 font-bold" : v > 0 ? "text-red-300" : "text-blue-300"}`}
                      >
                        {fmt(v)}
                      </span>
                      {j < LD.vocabOrder.length - 1 && (
                        <span className="text-gray-700">, </span>
                      )}
                    </span>
                  );
                })}
                ]
              </div>
              <div className="flex items-center gap-1 flex-wrap mt-0.5">
                <span className="text-transparent">[</span>
                {LD.vocabOrder.map((tok, j) => (
                  <span key={j}>
                    <span
                      className={`${NCELL} text-[10px] ${j === LD.targetIndex ? "text-green-400 font-bold" : "text-gray-600"}`}
                    >
                      {tok}
                    </span>
                    {j < LD.vocabOrder.length - 1 && (
                      <span className="text-transparent">,</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-gray-400 text-xs">
              <span className="text-green-400">−0.58</span>{" "}
              {t("training.backpropagation.calc.startingPoint.negativeFor")}{" "}
              {t("training.backpropagation.calc.startingPoint.positiveValues")}{" "}
              {t("training.backpropagation.calc.startingPoint.propagateSignal")}
            </p>
          </div>

          {/* ─── Vue d'ensemble : Flux des gradients ─── */}
          <ConcreteCalculation
            title={t("training.backpropagation.calc.gradientFlow.title")}
            description={t(
              "training.backpropagation.calc.gradientFlow.description",
            )}
          >
            <GradientFlow />
          </ConcreteCalculation>

          {/* ─── Loss global vs local (clarification) ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.backpropagation.calc.lossGlobalLocal.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.backpropagation.calc.lossGlobalLocal.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono space-y-1">
              <p className="text-gray-500">
                {t("training.backpropagation.calc.lossGlobalLocal.codeComment")}
              </p>
              <p className="text-gray-400">
                {" "}
                pos 0 : &quot;L&quot; →{" "}
                {t("training.backpropagation.calc.lossGlobalLocal.target")}{" "}
                &quot;e&quot; → loss₀ = 1.52 → gradient₀
              </p>
              <p className="text-gray-400">
                {" "}
                pos 1 : &quot;Le&quot; →{" "}
                {t("training.backpropagation.calc.lossGlobalLocal.target")}{" "}
                &quot;⎵&quot; → loss₁ = 1.21 → gradient₁
              </p>
              <p className="text-gray-400">
                {" "}
                pos 5 : &quot;Le cha&quot; →{" "}
                {t("training.backpropagation.calc.lossGlobalLocal.target")}{" "}
                &quot;t&quot; → loss₅ = 0.87 → gradient₅{" "}
                <span className="text-amber-400">
                  ←{" "}
                  {t(
                    "training.backpropagation.calc.lossGlobalLocal.ourExample",
                  )}
                </span>
              </p>
              <p className="text-gray-500 mt-1">
                {t(
                  "training.backpropagation.calc.lossGlobalLocal.totalGradient",
                )}
              </p>
              <p className="text-gray-500">
                {t("training.backpropagation.calc.lossGlobalLocal.meanLoss")}
              </p>
            </div>
            <p className="text-gray-400 text-xs">
              {t("training.backpropagation.calc.lossGlobalLocal.explanation")}
            </p>
          </div>

          {/* ─── 2. Couche W_out : gradient → ∂L/∂ffnOutput ─── */}
          <ConcreteCalculation
            title={t("training.backpropagation.calc.outputLayer.title")}
            description={t(
              "training.backpropagation.calc.outputLayer.description",
            )}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                {t("training.backpropagation.calc.outputLayer.forwardRef1")} (
                <Link
                  to="/training/loss"
                  className="text-primary-400 hover:underline"
                >
                  {t("training.backpropagation.calc.outputLayer.step6Link")}
                </Link>
                ),
                {t(
                  "training.backpropagation.calc.outputLayer.forwardRef2",
                )}{" "}
                <span className="font-mono text-xs">
                  logits = FFN_output × W_out
                </span>
                . {t("training.backpropagation.calc.outputLayer.backwardRef")}{" "}
                <span className="font-mono text-xs">
                  ∂L/∂ffnOutput[i] = Σ<sub>j</sub> gradient[j] × W_out[i][j]
                </span>
                .
              </p>

              <div className="bg-gray-900 rounded-lg p-4">
                <AnimatedMathOperation totalSteps={4} delay={800}>
                  {(step) => (
                    <div className="space-y-3">
                      <MatrixDisplay
                        data={LD.W_out}
                        title="W_out"
                        shape={`(${LD.W_out.length} × ${LD.vocabOrder.length})`}
                        rowLabels={["d₀", "d₁", "d₂", "d₃"]}
                        colLabels={[...LD.vocabOrder]}
                        compact
                        highlightRows={step >= 0 ? [step] : undefined}
                        cellColor={(_, r) =>
                          step === -1
                            ? ""
                            : r === step
                              ? "text-amber-300"
                              : r < step
                                ? "text-gray-500"
                                : "text-gray-700"
                        }
                      />

                      <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                        <p className="text-gray-500 mb-1">
                          {t(
                            "training.backpropagation.calc.outputLayer.gradLogitsLabel",
                          )}
                        </p>
                        <div className="flex items-center gap-1 flex-wrap">
                          [
                          {BP.gradLogits.map((v, j) => (
                            <span key={j}>
                              <span
                                className={`${NCELL} ${
                                  step >= 0
                                    ? "text-red-400 ring-1 ring-red-500/30 bg-red-500/5 rounded px-0.5"
                                    : "text-red-400"
                                }`}
                              >
                                {fmt(v)}
                              </span>
                              {j < BP.gradLogits.length - 1 && (
                                <span className="text-gray-700">, </span>
                              )}
                            </span>
                          ))}
                          ]
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                        <p className="text-gray-500 mb-1">
                          {t(
                            "training.backpropagation.calc.outputLayer.gradFFNOutputLabel",
                          )}
                        </p>
                        <div className="flex items-center gap-1 flex-wrap">
                          [
                          {["d₀", "d₁", "d₂", "d₃"].map((label, i) => {
                            const vis = step === -1 || step >= i;
                            const act = step === i;
                            return (
                              <span key={i}>
                                <span
                                  className={`${NCELL} transition-all duration-300 ${
                                    act
                                      ? "text-purple-300 font-bold ring-2 ring-purple-500/40 bg-purple-500/10 rounded px-0.5"
                                      : vis
                                        ? "text-purple-300"
                                        : "text-gray-700"
                                  }`}
                                >
                                  {vis ? fmt(BP.gradFFNOutput[i]) : "____"}
                                </span>
                                {i < 3 && (
                                  <span className="text-gray-700">, </span>
                                )}
                              </span>
                            );
                          })}
                          ]
                        </div>
                        <div className="flex items-center gap-1 flex-wrap mt-0.5">
                          <span className="text-transparent">[</span>
                          {["d₀", "d₁", "d₂", "d₃"].map((label, i) => (
                            <span key={i}>
                              <span
                                className={`${NCELL} text-[10px] text-gray-600`}
                              >
                                {label}
                              </span>
                              {i < 3 && (
                                <span className="text-transparent">,</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      {step >= 0 &&
                        (() => {
                          const row = LD.W_out[step];
                          return (
                            <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                              <p className="text-gray-500">
                                ∂L/∂ffnOutput[
                                <span className="text-purple-300">d{step}</span>
                                ] = Σ(gradient[j] × W_out[{step}][j]) :
                              </p>
                              <div className="flex items-center gap-1 flex-wrap text-[11px]">
                                {BP.gradLogits.map((gv, j) => (
                                  <span key={j}>
                                    {j > 0 && (
                                      <span className="text-gray-600 mx-0.5">
                                        +
                                      </span>
                                    )}
                                    <span className="text-red-400">
                                      {fmtMul(gv)}
                                    </span>
                                    <span className="text-gray-600">×</span>
                                    <span className="text-amber-400">
                                      {fmtMul(row[j])}
                                    </span>
                                  </span>
                                ))}
                                <span className="text-gray-600 mx-1">=</span>
                                <span className="text-purple-300 font-bold">
                                  {fmt(BP.gradFFNOutput[step])}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                    </div>
                  )}
                </AnimatedMathOperation>
              </div>

              {/* Sortie ∂L/∂ffnOutput */}
              <div className="bg-purple-900/10 border border-purple-800/30 rounded p-3 space-y-1">
                <p className="text-purple-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸ {t("training.backpropagation.calc.outputLayer.outputLabel")}
                </p>
                <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                  [
                  {BP.gradFFNOutput.map((v, i) => (
                    <span key={i}>
                      <span
                        className={`inline-block min-w-[3rem] text-center py-0.5 px-1.5 rounded ${
                          v < 0
                            ? "bg-blue-900/30 text-blue-300"
                            : "bg-red-900/30 text-red-300"
                        }`}
                      >
                        {fmt(v)}
                      </span>
                      {i < 3 && <span className="text-gray-700">,</span>}
                    </span>
                  ))}
                  ]
                </div>
                <p className="text-gray-500 text-xs">
                  {t(
                    "training.backpropagation.calc.outputLayer.outputExplanation",
                  )}
                </p>
              </div>

              {/* ∂L/∂W_out (produit extérieur, animé ligne par ligne) */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t(
                    "training.backpropagation.calc.outputLayer.gradWeightsTitle",
                  )}
                </h4>
                <p className="text-sm text-gray-400">
                  {t(
                    "training.backpropagation.calc.outputLayer.gradWeightsDesc",
                  )}
                </p>

                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation totalSteps={4} delay={800}>
                    {(step) => {
                      const fOut = LD.ffnOutputPos5;
                      return (
                        <div className="space-y-3">
                          <MatrixDisplay
                            data={LD.W_out}
                            title={t(
                              "training.backpropagation.calc.outputLayer.wOutCurrentWeights",
                            )}
                            shape={`(${LD.W_out.length} × ${LD.vocabOrder.length})`}
                            rowLabels={["d₀", "d₁", "d₂", "d₃"]}
                            colLabels={[...LD.vocabOrder]}
                            compact
                            highlightRows={step >= 0 ? [step] : undefined}
                            cellColor={(_, r) =>
                              step === -1
                                ? ""
                                : r === step
                                  ? "text-amber-300"
                                  : r < step
                                    ? "text-gray-500"
                                    : "text-gray-700"
                            }
                          />

                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              {t(
                                "training.backpropagation.calc.outputLayer.ffnOutputLabel",
                              )}{" "}
                              (
                              <Link
                                to="/training/feedforward"
                                className="text-primary-400 hover:underline"
                              >
                                {t(
                                  "training.backpropagation.calc.outputLayer.step5Link",
                                )}
                              </Link>
                              ,{" "}
                              {t(
                                "training.backpropagation.calc.outputLayer.position5",
                              )}
                              ) :
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                              [
                              {fOut.map((v, i) => (
                                <span key={i}>
                                  <span
                                    className={`${NCELL} ${
                                      step === i
                                        ? "text-blue-400 ring-1 ring-blue-500/30 bg-blue-500/5 rounded px-0.5 font-bold"
                                        : step === -1 || step > i
                                          ? "text-blue-400"
                                          : "text-gray-700"
                                    }`}
                                  >
                                    {fmt(v)}
                                  </span>
                                  {i < fOut.length - 1 && (
                                    <span className="text-gray-700">, </span>
                                  )}
                                </span>
                              ))}
                              ]
                            </div>
                          </div>

                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              gradient (
                              <Link
                                to="/training/loss"
                                className="text-primary-400 hover:underline"
                              >
                                {t(
                                  "training.backpropagation.calc.outputLayer.step6Link",
                                )}
                              </Link>
                              ) :
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                              [
                              {BP.gradLogits.map((v, j) => (
                                <span key={j}>
                                  <span
                                    className={`${NCELL} ${
                                      step >= 0
                                        ? "text-red-400 ring-1 ring-red-500/30 bg-red-500/5 rounded px-0.5"
                                        : "text-red-400"
                                    }`}
                                  >
                                    {fmt(v)}
                                  </span>
                                  {j < BP.gradLogits.length - 1 && (
                                    <span className="text-gray-700">, </span>
                                  )}
                                </span>
                              ))}
                              ]
                            </div>
                          </div>

                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              {t(
                                "training.backpropagation.calc.outputLayer.gradWOutLabel",
                              )}
                            </p>
                            {["d₀", "d₁", "d₂", "d₃"].map((label, i) => {
                              const vis = step === -1 || step >= i;
                              const act = step === i;
                              return (
                                <div
                                  key={i}
                                  className={`flex items-center gap-1 flex-wrap py-0.5 transition-all duration-300 ${
                                    act
                                      ? "bg-amber-500/5 rounded px-1 -mx-1"
                                      : ""
                                  }`}
                                >
                                  <span
                                    className={`w-5 text-[10px] ${act ? "text-amber-300 font-bold" : "text-gray-600"}`}
                                  >
                                    {label}
                                  </span>
                                  [
                                  {BP.gradW_out[i].map((v, j) => (
                                    <span key={j}>
                                      <span
                                        className={`${NCELL} ${
                                          !vis
                                            ? "text-gray-700"
                                            : act
                                              ? j === LD.targetIndex
                                                ? "text-green-400 font-bold"
                                                : v > 0.05
                                                  ? "text-red-300"
                                                  : v < -0.05
                                                    ? "text-blue-300"
                                                    : "text-gray-600"
                                              : "text-gray-500"
                                        }`}
                                      >
                                        {vis ? fmt(v) : "____"}
                                      </span>
                                      {j < 6 && (
                                        <span className="text-gray-700">
                                          ,{" "}
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                  ]
                                </div>
                              );
                            })}
                          </div>

                          {step >= 0 && (
                            <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                              <p className="text-gray-500">
                                {t(
                                  "training.backpropagation.calc.outputLayer.rowDetail",
                                )}{" "}
                                d{step} : ffnOutput[{step}] ={" "}
                                <span className="text-blue-400">
                                  {fOut[step].toFixed(2)}
                                </span>{" "}
                                ×{" "}
                                {t(
                                  "training.backpropagation.calc.outputLayer.eachGradient",
                                )}{" "}
                                :
                              </p>
                              <div className="flex items-center gap-1 flex-wrap text-[11px]">
                                {BP.gradLogits.map((gv, j) => {
                                  const isTarget = j === LD.targetIndex;
                                  return (
                                    <span key={j}>
                                      {j > 0 && (
                                        <span className="text-gray-700 mx-0.5">
                                          |
                                        </span>
                                      )}
                                      <span className="text-blue-400">
                                        {fOut[step].toFixed(2)}
                                      </span>
                                      <span className="text-gray-600">×</span>
                                      <span className="text-red-400">
                                        {fmtMul(gv)}
                                      </span>
                                      <span className="text-gray-600">=</span>
                                      <span
                                        className={
                                          isTarget
                                            ? "text-green-400 font-bold"
                                            : BP.gradW_out[step][j] > 0
                                              ? "text-red-300"
                                              : "text-blue-300"
                                        }
                                      >
                                        {fmt(BP.gradW_out[step][j])}
                                      </span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {(step >= 3 || step === -1) && (
                            <div className="border-t border-gray-800 pt-3 mt-2">
                              <p className="text-xs text-gray-500">
                                {t(
                                  "training.backpropagation.calc.outputLayer.columnTNote",
                                )}{" "}
                                {t(
                                  "training.backpropagation.calc.outputLayer.rowD1Note",
                                )}{" "}
                                {fOut[1].toFixed(2)} ≈ 0.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </AnimatedMathOperation>
                </div>

                {/* Sortie ∂L/∂W_out + correction animée */}
                <div className="bg-amber-900/10 border border-amber-800/30 rounded p-3 space-y-2">
                  <p className="text-amber-300 font-semibold text-[10px] uppercase tracking-wide">
                    ▸{" "}
                    {t(
                      "training.backpropagation.calc.outputLayer.correctionTitle",
                    )}
                  </p>
                  <div className="bg-gray-800/50 rounded p-2 text-xs text-gray-400">
                    <strong className="text-primary-300">lr</strong> ={" "}
                    <span className="text-white">{BP.lr}</span>{" "}
                    {t(
                      "training.backpropagation.calc.outputLayer.lrExplanation1",
                    )}{" "}
                    <VulgarizedTerm termKey="learning_rate" /> :{" "}
                    {t(
                      "training.backpropagation.calc.outputLayer.lrExplanation2",
                    )}{" "}
                    <Link
                      to="/training/optimizer"
                      className="text-primary-400 hover:underline"
                    >
                      {t("training.backpropagation.calc.outputLayer.adamLink")}
                    </Link>{" "}
                    {t(
                      "training.backpropagation.calc.outputLayer.lrExplanation3",
                    )}
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <AnimatedMathOperation totalSteps={4} delay={900}>
                      {(step) => (
                        <div className="space-y-3">
                          {/* W_out actuel */}
                          <MatrixDisplay
                            data={LD.W_out}
                            title={t(
                              "training.backpropagation.calc.outputLayer.wOutBefore",
                            )}
                            shape={`(${LD.W_out.length} × ${LD.vocabOrder.length})`}
                            rowLabels={["d₀", "d₁", "d₂", "d₃"]}
                            colLabels={[...LD.vocabOrder]}
                            compact
                            highlightRows={step >= 0 ? [step] : undefined}
                            cellColor={(_, r) =>
                              step === -1
                                ? ""
                                : r === step
                                  ? "text-white"
                                  : r < step
                                    ? "text-gray-600"
                                    : "text-gray-700"
                            }
                          />

                          {/* ∂L/∂W_out (gradient) */}
                          <MatrixDisplay
                            data={BP.gradW_out}
                            title="∂L/∂W_out (gradient)"
                            shape="(4 × 7)"
                            rowLabels={["d₀", "d₁", "d₂", "d₃"]}
                            colLabels={[...LD.vocabOrder]}
                            compact
                            highlightRows={step >= 0 ? [step] : undefined}
                            cellColor={(v, r) =>
                              step === -1
                                ? v < -0.1
                                  ? "text-green-400"
                                  : v > 0.1
                                    ? "text-red-400"
                                    : "text-gray-500"
                                : r === step
                                  ? v < -0.1
                                    ? "text-green-400"
                                    : v > 0.1
                                      ? "text-red-400"
                                      : "text-gray-500"
                                  : "text-gray-700"
                            }
                          />

                          {/* Résultat W_out corrigé (se remplit ligne par ligne) */}
                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              {t(
                                "training.backpropagation.calc.outputLayer.wOutCorrectedLabel",
                              )}
                            </p>
                            {["d₀", "d₁", "d₂", "d₃"].map((label, i) => {
                              const vis = step === -1 || step >= i;
                              const act = step === i;
                              return (
                                <div
                                  key={i}
                                  className={`flex items-center gap-1 flex-wrap py-0.5 transition-all duration-300 ${
                                    act
                                      ? "bg-amber-500/5 rounded px-1 -mx-1"
                                      : ""
                                  }`}
                                >
                                  <span
                                    className={`w-5 text-[10px] ${act ? "text-amber-300 font-bold" : "text-gray-600"}`}
                                  >
                                    {label}
                                  </span>
                                  [
                                  {LD.W_out[i].map((w, j) => {
                                    const corrected =
                                      w - BP.lr * BP.gradW_out[i][j];
                                    const diff = Math.abs(
                                      BP.lr * BP.gradW_out[i][j],
                                    );
                                    return (
                                      <span key={j}>
                                        <span
                                          className={`${NCELL} ${
                                            !vis
                                              ? "text-gray-700"
                                              : act
                                                ? diff > 0.005
                                                  ? "text-amber-300 font-bold"
                                                  : "text-gray-500"
                                                : diff > 0.005
                                                  ? "text-amber-300"
                                                  : "text-gray-500"
                                          }`}
                                        >
                                          {vis
                                            ? corrected.toFixed(4)
                                            : "______"}
                                        </span>
                                        {j < 6 && (
                                          <span className="text-gray-700">
                                            ,{" "}
                                          </span>
                                        )}
                                      </span>
                                    );
                                  })}
                                  ]
                                </div>
                              );
                            })}
                          </div>

                          {/* Détail du calcul pour la ligne active */}
                          {step >= 0 && (
                            <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                              <p className="text-gray-500">
                                {t(
                                  "training.backpropagation.calc.outputLayer.rowLabel",
                                )}{" "}
                                <span className="text-amber-300">d{step}</span>{" "}
                                —{" "}
                                {t(
                                  "training.backpropagation.calc.outputLayer.forEachColumn",
                                )}{" "}
                                : W_out[{step}][j] − {BP.lr} × ∂L/∂W_out[{step}
                                ][j]
                              </p>
                              <div className="flex items-center gap-1 flex-wrap text-[11px]">
                                {LD.W_out[step].map((w, j) => {
                                  const g = BP.gradW_out[step][j];
                                  const corrected = w - BP.lr * g;
                                  const isTarget = j === LD.targetIndex;
                                  return (
                                    <span key={j}>
                                      {j > 0 && (
                                        <span className="text-gray-700 mx-0.5">
                                          |
                                        </span>
                                      )}
                                      <span className="text-white">
                                        {w.toFixed(2)}
                                      </span>
                                      <span className="text-gray-600">
                                        {g >= 0 ? "−" : "+"}
                                      </span>
                                      <span
                                        className={
                                          g < 0
                                            ? "text-green-400"
                                            : "text-red-400"
                                        }
                                      >
                                        {Math.abs(BP.lr * g).toFixed(4)}
                                      </span>
                                      <span className="text-gray-600">=</span>
                                      <span
                                        className={
                                          isTarget
                                            ? "text-green-400 font-bold"
                                            : "text-amber-300"
                                        }
                                      >
                                        {corrected.toFixed(4)}
                                      </span>
                                    </span>
                                  );
                                })}
                              </div>
                              {(() => {
                                const gTarget =
                                  BP.gradW_out[step][LD.targetIndex];
                                return gTarget < -0.1 ? (
                                  <p className="text-green-400 text-[10px] mt-1">
                                    {t(
                                      "training.backpropagation.calc.outputLayer.columnTCorrection",
                                    )}
                                  </p>
                                ) : null;
                              })()}
                            </div>
                          )}

                          {(step >= 3 || step === -1) && (
                            <div className="border-t border-gray-800 pt-3 mt-2">
                              <p className="text-xs text-gray-500">
                                {t(
                                  "training.backpropagation.calc.outputLayer.tinyCorrections",
                                )}{" "}
                                (lr = {BP.lr}) —{" "}
                                {t(
                                  "training.backpropagation.calc.outputLayer.tinyCorrectionsNormal",
                                )}{" "}
                                {t(
                                  "training.backpropagation.calc.outputLayer.accumulationNote",
                                )}{" "}
                                <Link
                                  to="/training/optimizer"
                                  className="text-primary-400 hover:underline"
                                >
                                  {t(
                                    "training.backpropagation.calc.outputLayer.adamLink",
                                  )}
                                </Link>{" "}
                                {t(
                                  "training.backpropagation.calc.outputLayer.adamAdjusts",
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
            </div>
          </ConcreteCalculation>

          {/* ─── 3. Couche FFN — W₂ (compression) ─── */}
          <ConcreteCalculation
            title={t("training.backpropagation.calc.ffnW2.title")}
            description={t("training.backpropagation.calc.ffnW2.description")}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                {t("training.backpropagation.calc.ffnW2.forwardRef")} (
                <Link
                  to="/training/feedforward"
                  className="text-primary-400 hover:underline"
                >
                  {t("training.backpropagation.calc.ffnW2.step5Link")}
                </Link>
                ) :
                <span className="font-mono text-xs">
                  {" "}
                  output = ReLU(h) × W₂
                </span>
                . {t("training.backpropagation.calc.ffnW2.backwardRef")}{" "}
                <span className="font-mono text-xs">
                  ∂L/∂relu_h[j] = Σ<sub>i</sub> gradFFNOutput[i] × W₂[j][i]
                </span>
                .
              </p>

              <div className="bg-gray-900 rounded-lg p-4">
                <AnimatedMathOperation totalSteps={8} delay={600}>
                  {(step) => {
                    const neuronLabels = Array.from(
                      { length: 8 },
                      (_, i) => `n${i}`,
                    );
                    return (
                      <div className="space-y-3">
                        <MatrixDisplay
                          data={FFN.W_2}
                          title="W₂"
                          shape="(8 × 4)"
                          rowLabels={neuronLabels}
                          colLabels={["d₀", "d₁", "d₂", "d₃"]}
                          compact
                          highlightRows={step >= 0 ? [step] : undefined}
                          cellColor={(_, r) =>
                            step === -1
                              ? ""
                              : r === step
                                ? "text-amber-300"
                                : r < step
                                  ? "text-gray-500"
                                  : "text-gray-700"
                          }
                        />

                        <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                          <p className="text-gray-500 mb-1">
                            {t(
                              "training.backpropagation.calc.ffnW2.gradFFNOutputLabel",
                            )}
                          </p>
                          <div className="flex items-center gap-1 flex-wrap">
                            [
                            {BP.gradFFNOutput.map((v, i) => (
                              <span key={i}>
                                <span
                                  className={`${NCELL} ${
                                    step >= 0
                                      ? "text-purple-400 ring-1 ring-purple-500/30 bg-purple-500/5 rounded px-0.5"
                                      : "text-purple-400"
                                  }`}
                                >
                                  {fmt(v)}
                                </span>
                                {i < 3 && (
                                  <span className="text-gray-700">, </span>
                                )}
                              </span>
                            ))}
                            ]
                          </div>
                        </div>

                        <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                          <p className="text-gray-500 mb-1">
                            relu_h[5] (
                            <Link
                              to="/training/feedforward"
                              className="text-primary-400 hover:underline"
                            >
                              {t(
                                "training.backpropagation.calc.ffnW2.step5Link",
                              )}
                            </Link>
                            ,{" "}
                            {t(
                              "training.backpropagation.calc.ffnW2.activationsAfterReLU",
                            )}
                            ) :
                          </p>
                          <div className="flex items-center gap-1 flex-wrap">
                            [
                            {FFN.relu_h[5].map((v, j) => (
                              <span key={j}>
                                <span
                                  className={`${NCELL} ${
                                    v === 0 ? "text-gray-600" : "text-cyan-400"
                                  }`}
                                >
                                  {v.toFixed(2)}
                                </span>
                                {j < 7 && (
                                  <span className="text-gray-700">, </span>
                                )}
                              </span>
                            ))}
                            ]
                          </div>
                          <div className="flex items-center gap-1 flex-wrap mt-0.5">
                            <span className="text-transparent">[</span>
                            {neuronLabels.map((label, j) => (
                              <span key={j}>
                                <span
                                  className={`${NCELL} text-[10px] ${FFN.relu_h[5][j] === 0 ? "text-red-400" : "text-gray-600"}`}
                                >
                                  {FFN.relu_h[5][j] === 0 ? "✗" : label}
                                </span>
                                {j < 7 && (
                                  <span className="text-transparent">,</span>
                                )}
                              </span>
                            ))}
                          </div>
                          <p className="text-gray-600 text-[10px] mt-0.5">
                            {t(
                              "training.backpropagation.calc.ffnW2.neuronsBlockGradient",
                            )}
                          </p>
                        </div>

                        <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                          <p className="text-gray-500 mb-1">
                            {t(
                              "training.backpropagation.calc.ffnW2.gradReluHLabel",
                            )}
                          </p>
                          <div className="flex items-center gap-1 flex-wrap">
                            [
                            {neuronLabels.map((_, j) => {
                              const vis = step === -1 || step >= j;
                              const act = step === j;
                              const masked = BP.reluMask[j] === 0;
                              return (
                                <span key={j}>
                                  <span
                                    className={`${NCELL} transition-all duration-300 ${
                                      act
                                        ? "text-amber-300 font-bold ring-2 ring-amber-500/40 bg-amber-500/10 rounded px-0.5"
                                        : vis
                                          ? masked
                                            ? "text-gray-600 line-through"
                                            : "text-amber-300"
                                          : "text-gray-700"
                                    }`}
                                  >
                                    {vis ? fmt(BP.gradRelu_h[j]) : "____"}
                                  </span>
                                  {j < 7 && (
                                    <span className="text-gray-700">, </span>
                                  )}
                                </span>
                              );
                            })}
                            ]
                          </div>
                        </div>

                        {step >= 0 &&
                          (() => {
                            const row = FFN.W_2[step];
                            const masked = BP.reluMask[step] === 0;
                            return (
                              <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                                <p className="text-gray-500">
                                  ∂L/∂relu_h[
                                  <span className="text-amber-300">
                                    n{step}
                                  </span>
                                  ] = Σ(gradFFNOutput[i] × W₂[{step}][i]) :
                                </p>
                                <div className="flex items-center gap-1 flex-wrap text-[11px]">
                                  {BP.gradFFNOutput.map((gv, i) => (
                                    <span key={i}>
                                      {i > 0 && (
                                        <span className="text-gray-600 mx-0.5">
                                          +
                                        </span>
                                      )}
                                      <span className="text-purple-400">
                                        {fmtMul(gv)}
                                      </span>
                                      <span className="text-gray-600">×</span>
                                      <span className="text-amber-400">
                                        {fmtMul(row[i])}
                                      </span>
                                    </span>
                                  ))}
                                  <span className="text-gray-600 mx-1">=</span>
                                  <span
                                    className={`font-bold ${masked ? "text-gray-600 line-through" : "text-amber-300"}`}
                                  >
                                    {fmt(BP.gradRelu_h[step])}
                                  </span>
                                </div>
                                {masked && (
                                  <p className="text-red-400 text-[10px]">
                                    {t(
                                      "training.backpropagation.calc.ffnW2.neuronOff",
                                    )}{" "}
                                    n{step}{" "}
                                    {t(
                                      "training.backpropagation.calc.ffnW2.neuronOffResult",
                                    )}
                                  </p>
                                )}
                              </div>
                            );
                          })()}

                        {(step >= 7 || step === -1) && (
                          <div className="border-t border-gray-800 pt-3 mt-3">
                            <p className="text-xs text-gray-500 mb-2">
                              {t(
                                "training.backpropagation.calc.ffnW2.afterReluMask",
                              )}
                            </p>
                            <div className="flex items-center gap-1 flex-wrap font-mono text-xs">
                              [
                              {BP.gradH.map((v, j) => (
                                <span key={j}>
                                  <span
                                    className={`${NCELL} ${
                                      v === 0
                                        ? "text-gray-600"
                                        : v > 0
                                          ? "text-green-400"
                                          : "text-blue-300"
                                    }`}
                                  >
                                    {v === 0 ? " 0.00" : fmt(v)}
                                  </span>
                                  {j < 7 && (
                                    <span className="text-gray-700">, </span>
                                  )}
                                </span>
                              ))}
                              ]
                            </div>
                            <p className="text-gray-500 text-[10px] mt-1">
                              {BP.reluMask.filter((m) => m === 0).length}{" "}
                              {t(
                                "training.backpropagation.calc.ffnW2.neuronsOffCount",
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }}
                </AnimatedMathOperation>
              </div>

              {/* Sortie ∂L/∂h */}
              <div className="bg-amber-900/10 border border-amber-800/30 rounded p-3 space-y-1">
                <p className="text-amber-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸ {t("training.backpropagation.calc.ffnW2.outputGradH")}
                </p>
                <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                  [
                  {BP.gradH.map((v, j) => (
                    <span key={j}>
                      <span
                        className={`inline-block min-w-[3rem] text-center py-0.5 px-1.5 rounded ${
                          v === 0
                            ? "bg-gray-800 text-gray-600"
                            : v < 0
                              ? "bg-blue-900/30 text-blue-300"
                              : "bg-red-900/30 text-red-300"
                        }`}
                      >
                        {v === 0 ? "0.00" : fmt(v)}
                      </span>
                      {j < 7 && <span className="text-gray-700">,</span>}
                    </span>
                  ))}
                  ]
                </div>
                <p className="text-gray-500 text-xs">
                  {t("training.backpropagation.calc.ffnW2.reluMaskBlocks")}{" "}
                  {t(
                    "training.backpropagation.calc.ffnW2.onlyNeuronsTransmit",
                    { count: BP.reluMask.filter((m) => m === 1).length },
                  )}
                </p>
              </div>

              {/* Calcul de ∂L/∂W₂ (outer product relu_h[5] × gradFFNOutput) */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.backpropagation.calc.ffnW2.gradWeightsTitle")}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.backpropagation.calc.ffnW2.gradWeightsDesc")}
                </p>

                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation totalSteps={8} delay={600}>
                    {(step) => {
                      const neuronLabels = Array.from(
                        { length: 8 },
                        (_, i) => `n${i}`,
                      );
                      const rh = FFN.relu_h[5];
                      return (
                        <div className="space-y-3">
                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              relu_h[5] (
                              <Link
                                to="/training/feedforward"
                                className="text-primary-400 hover:underline"
                              >
                                {t(
                                  "training.backpropagation.calc.ffnW2.step5Link",
                                )}
                              </Link>
                              ) :
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                              [
                              {rh.map((v, j) => (
                                <span key={j}>
                                  <span
                                    className={`${NCELL} ${
                                      step === j
                                        ? "text-cyan-400 ring-1 ring-cyan-500/30 bg-cyan-500/5 rounded px-0.5 font-bold"
                                        : v === 0
                                          ? "text-gray-600"
                                          : step === -1 || step > j
                                            ? "text-cyan-400"
                                            : "text-gray-700"
                                    }`}
                                  >
                                    {v.toFixed(2)}
                                  </span>
                                  {j < 7 && (
                                    <span className="text-gray-700">, </span>
                                  )}
                                </span>
                              ))}
                              ]
                            </div>
                          </div>

                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              {t(
                                "training.backpropagation.calc.ffnW2.inputGradientLabel",
                              )}
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                              [
                              {BP.gradFFNOutput.map((v, i) => (
                                <span key={i}>
                                  <span
                                    className={`${NCELL} ${
                                      step >= 0
                                        ? "text-purple-400 ring-1 ring-purple-500/30 bg-purple-500/5 rounded px-0.5"
                                        : "text-purple-400"
                                    }`}
                                  >
                                    {fmt(v)}
                                  </span>
                                  {i < 3 && (
                                    <span className="text-gray-700">, </span>
                                  )}
                                </span>
                              ))}
                              ]
                            </div>
                          </div>

                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              {t(
                                "training.backpropagation.calc.ffnW2.gradW2RowByRow",
                              )}
                            </p>
                            {neuronLabels.map((label, j) => {
                              const vis = step === -1 || step >= j;
                              const act = step === j;
                              const isZero = rh[j] === 0;
                              return (
                                <div
                                  key={j}
                                  className={`flex items-center gap-1 flex-wrap py-0.5 transition-all duration-300 ${
                                    act
                                      ? "bg-amber-500/5 rounded px-1 -mx-1"
                                      : ""
                                  }`}
                                >
                                  <span
                                    className={`w-5 text-[10px] ${act ? "text-amber-300 font-bold" : "text-gray-600"}`}
                                  >
                                    {label}
                                  </span>
                                  [
                                  {BP.gradW_2[j].map((v, i) => (
                                    <span key={i}>
                                      <span
                                        className={`${NCELL} ${
                                          !vis
                                            ? "text-gray-700"
                                            : isZero
                                              ? "text-gray-600"
                                              : act
                                                ? v < -0.05
                                                  ? "text-green-400 font-bold"
                                                  : v > 0.05
                                                    ? "text-red-300 font-bold"
                                                    : "text-gray-500"
                                                : "text-gray-500"
                                        }`}
                                      >
                                        {vis ? fmt(v) : "____"}
                                      </span>
                                      {i < 3 && (
                                        <span className="text-gray-700">
                                          ,{" "}
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                  ]
                                </div>
                              );
                            })}
                          </div>

                          {step >= 0 && (
                            <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                              {rh[step] === 0 ? (
                                <p className="text-gray-600">
                                  {t(
                                    "training.backpropagation.calc.ffnW2.neuronLabel",
                                  )}{" "}
                                  n{step} : relu_h ={" "}
                                  <span className="text-red-400">0.00</span> (
                                  {t("training.backpropagation.calc.ffnW2.off")}
                                  ) →{" "}
                                  {t(
                                    "training.backpropagation.calc.ffnW2.allRowZero",
                                  )}
                                </p>
                              ) : (
                                <>
                                  <p className="text-gray-500">
                                    {t(
                                      "training.backpropagation.calc.ffnW2.rowLabel",
                                    )}{" "}
                                    n{step} : relu_h[5][{step}] ={" "}
                                    <span className="text-cyan-400">
                                      {rh[step].toFixed(2)}
                                    </span>{" "}
                                    ×{" "}
                                    {t(
                                      "training.backpropagation.calc.ffnW2.eachGradFFNOutput",
                                    )}{" "}
                                    :
                                  </p>
                                  <div className="flex items-center gap-1 flex-wrap text-[11px]">
                                    {BP.gradFFNOutput.map((gv, i) => (
                                      <span key={i}>
                                        {i > 0 && (
                                          <span className="text-gray-700 mx-0.5">
                                            |
                                          </span>
                                        )}
                                        <span className="text-cyan-400">
                                          {rh[step].toFixed(2)}
                                        </span>
                                        <span className="text-gray-600">×</span>
                                        <span className="text-purple-400">
                                          {fmtMul(gv)}
                                        </span>
                                        <span className="text-gray-600">=</span>
                                        <span
                                          className={
                                            BP.gradW_2[step][i] < -0.05
                                              ? "text-green-400"
                                              : BP.gradW_2[step][i] > 0.05
                                                ? "text-red-300"
                                                : "text-gray-500"
                                          }
                                        >
                                          {fmt(BP.gradW_2[step][i])}
                                        </span>
                                      </span>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </AnimatedMathOperation>
                </div>
              </div>

              {/* Correction animée de W₂ */}
              <div className="bg-amber-900/10 border border-amber-800/30 rounded p-3 space-y-2">
                <p className="text-amber-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸ {t("training.backpropagation.calc.ffnW2.correctionTitle")}{" "}
                  <span className="text-gray-500">(lr = {BP.lr})</span>
                </p>

                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation totalSteps={8} delay={600}>
                    {(step) => {
                      const neuronLabels = Array.from(
                        { length: 8 },
                        (_, i) => `n${i}`,
                      );
                      return (
                        <div className="space-y-3">
                          <MatrixDisplay
                            data={FFN.W_2}
                            title={t(
                              "training.backpropagation.calc.ffnW2.w2Before",
                            )}
                            shape="(8 × 4)"
                            rowLabels={neuronLabels}
                            colLabels={["d₀", "d₁", "d₂", "d₃"]}
                            compact
                            highlightRows={step >= 0 ? [step] : undefined}
                            cellColor={(_, r) =>
                              step === -1
                                ? ""
                                : r === step
                                  ? "text-white"
                                  : r < step
                                    ? "text-gray-600"
                                    : "text-gray-700"
                            }
                          />

                          <MatrixDisplay
                            data={BP.gradW_2}
                            title="∂L/∂W₂ (gradient)"
                            shape="(8 × 4)"
                            rowLabels={neuronLabels}
                            colLabels={["d₀", "d₁", "d₂", "d₃"]}
                            compact
                            highlightRows={step >= 0 ? [step] : undefined}
                            cellColor={(v, r) =>
                              step === -1
                                ? v === 0
                                  ? "text-gray-700"
                                  : v < -0.05
                                    ? "text-green-400"
                                    : v > 0.05
                                      ? "text-red-400"
                                      : "text-gray-500"
                                : r === step
                                  ? v === 0
                                    ? "text-gray-700"
                                    : v < -0.05
                                      ? "text-green-400"
                                      : v > 0.05
                                        ? "text-red-400"
                                        : "text-gray-500"
                                  : "text-gray-700"
                            }
                          />

                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              {t(
                                "training.backpropagation.calc.ffnW2.w2CorrectedLabel",
                              )}
                            </p>
                            {neuronLabels.map((label, i) => {
                              const vis = step === -1 || step >= i;
                              const act = step === i;
                              const allZero = BP.gradW_2[i].every(
                                (v) => v === 0,
                              );
                              return (
                                <div
                                  key={i}
                                  className={`flex items-center gap-1 flex-wrap py-0.5 transition-all duration-300 ${
                                    act
                                      ? "bg-amber-500/5 rounded px-1 -mx-1"
                                      : ""
                                  }`}
                                >
                                  <span
                                    className={`w-5 text-[10px] ${act ? "text-amber-300 font-bold" : "text-gray-600"}`}
                                  >
                                    {label}
                                  </span>
                                  [
                                  {FFN.W_2[i].map((w, j) => {
                                    const corrected =
                                      w - BP.lr * BP.gradW_2[i][j];
                                    const diff = Math.abs(
                                      BP.lr * BP.gradW_2[i][j],
                                    );
                                    return (
                                      <span key={j}>
                                        <span
                                          className={`${NCELL} ${
                                            !vis
                                              ? "text-gray-700"
                                              : allZero
                                                ? "text-gray-600"
                                                : act
                                                  ? diff > 0.0005
                                                    ? "text-amber-300 font-bold"
                                                    : "text-gray-500"
                                                  : diff > 0.0005
                                                    ? "text-amber-300"
                                                    : "text-gray-500"
                                          }`}
                                        >
                                          {vis
                                            ? corrected.toFixed(4)
                                            : "______"}
                                        </span>
                                        {j < 3 && (
                                          <span className="text-gray-700">
                                            ,{" "}
                                          </span>
                                        )}
                                      </span>
                                    );
                                  })}
                                  ]
                                </div>
                              );
                            })}
                          </div>

                          {step >= 0 && (
                            <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                              {BP.gradW_2[step].every((v) => v === 0) ? (
                                <p className="text-gray-600">
                                  {t(
                                    "training.backpropagation.calc.ffnW2.neuronLabel",
                                  )}{" "}
                                  n{step}{" "}
                                  {t(
                                    "training.backpropagation.calc.ffnW2.neuronOffNoCorrection",
                                  )}
                                </p>
                              ) : (
                                <>
                                  <p className="text-gray-500">
                                    {t(
                                      "training.backpropagation.calc.ffnW2.rowLabel",
                                    )}{" "}
                                    <span className="text-amber-300">
                                      n{step}
                                    </span>{" "}
                                    : W₂[{step}][j] − {BP.lr} × ∂L/∂W₂[{step}
                                    ][j]
                                  </p>
                                  <div className="flex items-center gap-1 flex-wrap text-[11px]">
                                    {FFN.W_2[step].map((w, j) => {
                                      const g = BP.gradW_2[step][j];
                                      const corrected = w - BP.lr * g;
                                      return (
                                        <span key={j}>
                                          {j > 0 && (
                                            <span className="text-gray-700 mx-0.5">
                                              |
                                            </span>
                                          )}
                                          <span className="text-white">
                                            {w.toFixed(2)}
                                          </span>
                                          <span className="text-gray-600">
                                            {g >= 0 ? "−" : "+"}
                                          </span>
                                          <span
                                            className={
                                              g < 0
                                                ? "text-green-400"
                                                : "text-red-400"
                                            }
                                          >
                                            {Math.abs(BP.lr * g).toFixed(4)}
                                          </span>
                                          <span className="text-gray-600">
                                            =
                                          </span>
                                          <span className="text-amber-300">
                                            {corrected.toFixed(4)}
                                          </span>
                                        </span>
                                      );
                                    })}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </AnimatedMathOperation>
                </div>
              </div>
            </div>
          </ConcreteCalculation>

          {/* ─── 4. Couche FFN — W₁ (expansion) ─── */}
          <ConcreteCalculation
            title={t("training.backpropagation.calc.ffnW1.title")}
            description={t("training.backpropagation.calc.ffnW1.description")}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                {t("training.backpropagation.calc.ffnW1.forwardRef")} (
                <Link
                  to="/training/feedforward"
                  className="text-primary-400 hover:underline"
                >
                  {t("training.backpropagation.calc.ffnW1.step5Link")}
                </Link>
                ) :<span className="font-mono text-xs"> h = ffnInput × W₁</span>
                . {t("training.backpropagation.calc.ffnW1.backwardRef")}{" "}
                <span className="font-mono text-xs">
                  ∂L/∂ffnInput[i] = Σ<sub>j</sub> gradH[j] × W₁[i][j]
                </span>
                . {t("training.backpropagation.calc.ffnW1.addResidual")}
              </p>

              <div className="bg-gray-900 rounded-lg p-4">
                <AnimatedMathOperation totalSteps={4} delay={800}>
                  {(step) => (
                    <div className="space-y-3">
                      <MatrixDisplay
                        data={FFN.W_1}
                        title="W₁"
                        shape="(4 × 8)"
                        rowLabels={["d₀", "d₁", "d₂", "d₃"]}
                        colLabels={Array.from({ length: 8 }, (_, i) => `n${i}`)}
                        compact
                        highlightRows={step >= 0 ? [step] : undefined}
                        cellColor={(_, r) =>
                          step === -1
                            ? ""
                            : r === step
                              ? "text-amber-300"
                              : r < step
                                ? "text-gray-500"
                                : "text-gray-700"
                        }
                      />

                      <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                        <p className="text-gray-500 mb-1">
                          {t("training.backpropagation.calc.ffnW1.gradHMasked")}
                        </p>
                        <div className="flex items-center gap-1 flex-wrap">
                          [
                          {BP.gradH.map((v, j) => (
                            <span key={j}>
                              <span
                                className={`${NCELL} ${
                                  v === 0
                                    ? "text-gray-600"
                                    : step >= 0
                                      ? "text-amber-400 ring-1 ring-amber-500/30 bg-amber-500/5 rounded px-0.5"
                                      : "text-amber-400"
                                }`}
                              >
                                {v === 0 ? " 0.00" : fmt(v)}
                              </span>
                              {j < 7 && (
                                <span className="text-gray-700">, </span>
                              )}
                            </span>
                          ))}
                          ]
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                        <p className="text-gray-500 mb-1">
                          {t(
                            "training.backpropagation.calc.ffnW1.gradFFNInputViaW1",
                          )}
                        </p>
                        <div className="flex items-center gap-1 flex-wrap">
                          [
                          {["d₀", "d₁", "d₂", "d₃"].map((label, i) => {
                            const vis = step === -1 || step >= i;
                            const act = step === i;
                            const partial =
                              BP.gradFFNInput[i] - BP.gradFFNOutput[i];
                            return (
                              <span key={i}>
                                <span
                                  className={`${NCELL} transition-all duration-300 ${
                                    act
                                      ? "text-green-300 font-bold ring-2 ring-green-500/40 bg-green-500/10 rounded px-0.5"
                                      : vis
                                        ? "text-green-300"
                                        : "text-gray-700"
                                  }`}
                                >
                                  {vis ? fmt(partial) : "____"}
                                </span>
                                {i < 3 && (
                                  <span className="text-gray-700">, </span>
                                )}
                              </span>
                            );
                          })}
                          ]
                        </div>
                      </div>

                      {step >= 0 &&
                        (() => {
                          const row = FFN.W_1[step];
                          const partial =
                            BP.gradFFNInput[step] - BP.gradFFNOutput[step];
                          return (
                            <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                              <p className="text-gray-500">
                                ∂L/∂ffnInput[
                                <span className="text-green-300">d{step}</span>]
                                = Σ(gradH[j] × W₁[{step}][j]) :
                              </p>
                              <div className="flex items-center gap-1 flex-wrap text-[11px]">
                                {BP.gradH.map((gv, j) => (
                                  <span key={j}>
                                    {j > 0 && (
                                      <span className="text-gray-600 mx-0.5">
                                        +
                                      </span>
                                    )}
                                    <span
                                      className={
                                        gv === 0
                                          ? "text-gray-600"
                                          : "text-amber-400"
                                      }
                                    >
                                      {fmtMul(gv)}
                                    </span>
                                    <span className="text-gray-600">×</span>
                                    <span className="text-amber-400">
                                      {fmtMul(row[j])}
                                    </span>
                                  </span>
                                ))}
                                <span className="text-gray-600 mx-1">=</span>
                                <span className="text-green-300 font-bold">
                                  {fmt(partial)}
                                </span>
                              </div>
                              <p className="text-gray-600 text-[10px]">
                                {t(
                                  "training.backpropagation.calc.ffnW1.zeroTermsNote",
                                )}
                              </p>
                            </div>
                          );
                        })()}
                    </div>
                  )}
                </AnimatedMathOperation>
              </div>

              {/* Connexion résiduelle */}
              <div className="bg-green-900/15 border border-green-800/30 rounded p-3 space-y-2">
                <p className="text-green-300 font-semibold text-xs">
                  {t("training.backpropagation.calc.ffnW1.residualTitle")}
                </p>
                <div className="font-mono text-xs space-y-1">
                  <p className="text-gray-500">
                    {t("training.backpropagation.calc.ffnW1.residualComment1")}
                  </p>
                  <p className="text-gray-500">
                    {t("training.backpropagation.calc.ffnW1.residualComment2")}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-xs">
                      <thead>
                        <tr className="text-gray-500 border-b border-gray-800">
                          <th className="p-1">dim</th>
                          <th className="p-1">via W₁</th>
                          <th className="p-1">+</th>
                          <th className="p-1">
                            {t(
                              "training.backpropagation.calc.ffnW1.residualLabel",
                            )}
                          </th>
                          <th className="p-1">=</th>
                          <th className="p-1">total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {["d₀", "d₁", "d₂", "d₃"].map((label, i) => {
                          const partial =
                            BP.gradFFNInput[i] - BP.gradFFNOutput[i];
                          return (
                            <tr key={i} className="border-b border-gray-900/50">
                              <td className="p-1 text-gray-400">{label}</td>
                              <td className="p-1 text-green-300">
                                {fmt(partial)}
                              </td>
                              <td className="p-1 text-gray-600">+</td>
                              <td className="p-1 text-purple-300">
                                {fmt(BP.gradFFNOutput[i])}
                              </td>
                              <td className="p-1 text-gray-600">=</td>
                              <td className="p-1 text-white font-bold">
                                {fmt(BP.gradFFNInput[i])}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-gray-500 text-xs">
                  {t("training.backpropagation.calc.ffnW1.residualExplanation")}
                </p>
              </div>

              {/* Sortie ∂L/∂ffnInput */}
              <div className="bg-green-900/10 border border-green-800/30 rounded p-3 space-y-1">
                <p className="text-green-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸ {t("training.backpropagation.calc.ffnW1.outputLabel")}
                </p>
                <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                  [
                  {BP.gradFFNInput.map((v, i) => (
                    <span key={i}>
                      <span
                        className={`inline-block min-w-[3rem] text-center py-0.5 px-1.5 rounded ${
                          v < 0
                            ? "bg-blue-900/30 text-blue-300"
                            : "bg-red-900/30 text-red-300"
                        }`}
                      >
                        {fmt(v)}
                      </span>
                      {i < 3 && <span className="text-gray-700">,</span>}
                    </span>
                  ))}
                  ]
                </div>
                <p className="text-gray-500 text-xs">
                  {t("training.backpropagation.calc.ffnW1.outputExplanation")}
                </p>
              </div>

              {/* Calcul de ∂L/∂W₁ (outer product ffnInput[5] × gradH) */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.backpropagation.calc.ffnW1.gradWeightsTitle")}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.backpropagation.calc.ffnW1.gradWeightsDesc")}
                </p>

                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation totalSteps={4} delay={800}>
                    {(step) => {
                      const fi = FFN.ffnInput[5];
                      const neuronLabels = Array.from(
                        { length: 8 },
                        (_, i) => `n${i}`,
                      );
                      return (
                        <div className="space-y-3">
                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              ffnInput[5] (
                              <Link
                                to="/training/feedforward"
                                className="text-primary-400 hover:underline"
                              >
                                {t(
                                  "training.backpropagation.calc.ffnW1.step5Link",
                                )}
                              </Link>
                              ,{" "}
                              {t(
                                "training.backpropagation.calc.ffnW1.ffnInputLabel",
                              )}
                              ) :
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                              [
                              {fi.map((v, i) => (
                                <span key={i}>
                                  <span
                                    className={`${NCELL} ${
                                      step === i
                                        ? "text-blue-400 ring-1 ring-blue-500/30 bg-blue-500/5 rounded px-0.5 font-bold"
                                        : v === 0
                                          ? "text-gray-600"
                                          : step === -1 || step > i
                                            ? "text-blue-400"
                                            : "text-gray-700"
                                    }`}
                                  >
                                    {v === 0 ? " 0.00" : fmt(v)}
                                  </span>
                                  {i < 3 && (
                                    <span className="text-gray-700">, </span>
                                  )}
                                </span>
                              ))}
                              ]
                            </div>
                          </div>

                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              {t(
                                "training.backpropagation.calc.ffnW1.gradHMasked",
                              )}
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                              [
                              {BP.gradH.map((v, j) => (
                                <span key={j}>
                                  <span
                                    className={`${NCELL} ${
                                      v === 0
                                        ? "text-gray-600"
                                        : step >= 0
                                          ? "text-amber-400 ring-1 ring-amber-500/30 bg-amber-500/5 rounded px-0.5"
                                          : "text-amber-400"
                                    }`}
                                  >
                                    {v === 0 ? " 0.00" : fmt(v)}
                                  </span>
                                  {j < 7 && (
                                    <span className="text-gray-700">, </span>
                                  )}
                                </span>
                              ))}
                              ]
                            </div>
                          </div>

                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              {t(
                                "training.backpropagation.calc.ffnW1.gradW1RowByRow",
                              )}
                            </p>
                            {["d₀", "d₁", "d₂", "d₃"].map((label, i) => {
                              const vis = step === -1 || step >= i;
                              const act = step === i;
                              const isZero = fi[i] === 0;
                              return (
                                <div
                                  key={i}
                                  className={`flex items-center gap-1 flex-wrap py-0.5 transition-all duration-300 ${
                                    act
                                      ? "bg-green-500/5 rounded px-1 -mx-1"
                                      : ""
                                  }`}
                                >
                                  <span
                                    className={`w-5 text-[10px] ${act ? "text-green-300 font-bold" : "text-gray-600"}`}
                                  >
                                    {label}
                                  </span>
                                  [
                                  {BP.gradW_1[i].map((v, j) => (
                                    <span key={j}>
                                      <span
                                        className={`${NCELL} ${
                                          !vis
                                            ? "text-gray-700"
                                            : isZero || v === 0
                                              ? "text-gray-600"
                                              : act
                                                ? v < -0.05
                                                  ? "text-green-400 font-bold"
                                                  : v > 0.05
                                                    ? "text-red-300 font-bold"
                                                    : "text-gray-500"
                                                : "text-gray-500"
                                        }`}
                                      >
                                        {vis
                                          ? v === 0
                                            ? " 0.00"
                                            : fmt(v)
                                          : "____"}
                                      </span>
                                      {j < 7 && (
                                        <span className="text-gray-700">
                                          ,{" "}
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                  ]
                                </div>
                              );
                            })}
                          </div>

                          {step >= 0 && (
                            <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                              {fi[step] === 0 ? (
                                <p className="text-gray-600">
                                  {t(
                                    "training.backpropagation.calc.ffnW1.rowLabel",
                                  )}{" "}
                                  d{step} : ffnInput[5][{step}] ={" "}
                                  <span className="text-red-400">0.00</span>→{" "}
                                  {t(
                                    "training.backpropagation.calc.ffnW1.allRowZero",
                                  )}
                                </p>
                              ) : (
                                <>
                                  <p className="text-gray-500">
                                    {t(
                                      "training.backpropagation.calc.ffnW1.rowLabel",
                                    )}{" "}
                                    d{step} : ffnInput[5][{step}] ={" "}
                                    <span className="text-blue-400">
                                      {fi[step].toFixed(2)}
                                    </span>{" "}
                                    ×{" "}
                                    {t(
                                      "training.backpropagation.calc.ffnW1.eachGradH",
                                    )}{" "}
                                    :
                                  </p>
                                  <div className="flex items-center gap-1 flex-wrap text-[11px]">
                                    {BP.gradH.map((gv, j) => {
                                      if (gv === 0)
                                        return (
                                          <span key={j}>
                                            {j > 0 && (
                                              <span className="text-gray-700 mx-0.5">
                                                |
                                              </span>
                                            )}
                                            <span className="text-gray-600">
                                              n{j}:0
                                            </span>
                                          </span>
                                        );
                                      return (
                                        <span key={j}>
                                          {j > 0 && (
                                            <span className="text-gray-700 mx-0.5">
                                              |
                                            </span>
                                          )}
                                          <span className="text-blue-400">
                                            {fi[step].toFixed(2)}
                                          </span>
                                          <span className="text-gray-600">
                                            ×
                                          </span>
                                          <span className="text-amber-400">
                                            {fmtMul(gv)}
                                          </span>
                                          <span className="text-gray-600">
                                            =
                                          </span>
                                          <span
                                            className={
                                              BP.gradW_1[step][j] < -0.05
                                                ? "text-green-400"
                                                : BP.gradW_1[step][j] > 0.05
                                                  ? "text-red-300"
                                                  : "text-gray-500"
                                            }
                                          >
                                            {fmt(BP.gradW_1[step][j])}
                                          </span>
                                        </span>
                                      );
                                    })}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </AnimatedMathOperation>
                </div>
              </div>

              {/* Correction animée de W₁ */}
              <div className="bg-green-900/10 border border-green-800/30 rounded p-3 space-y-2">
                <p className="text-green-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸ {t("training.backpropagation.calc.ffnW1.correctionTitle")}{" "}
                  <span className="text-gray-500">(lr = {BP.lr})</span>
                </p>

                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation totalSteps={4} delay={800}>
                    {(step) => {
                      const neuronLabels = Array.from(
                        { length: 8 },
                        (_, i) => `n${i}`,
                      );
                      return (
                        <div className="space-y-3">
                          <MatrixDisplay
                            data={FFN.W_1}
                            title={t(
                              "training.backpropagation.calc.ffnW1.w1Before",
                            )}
                            shape="(4 × 8)"
                            rowLabels={["d₀", "d₁", "d₂", "d₃"]}
                            colLabels={neuronLabels}
                            compact
                            highlightRows={step >= 0 ? [step] : undefined}
                            cellColor={(_, r) =>
                              step === -1
                                ? ""
                                : r === step
                                  ? "text-white"
                                  : r < step
                                    ? "text-gray-600"
                                    : "text-gray-700"
                            }
                          />

                          <MatrixDisplay
                            data={BP.gradW_1}
                            title="∂L/∂W₁ (gradient)"
                            shape="(4 × 8)"
                            rowLabels={["d₀", "d₁", "d₂", "d₃"]}
                            colLabels={neuronLabels}
                            compact
                            highlightRows={step >= 0 ? [step] : undefined}
                            cellColor={(v, r) =>
                              step === -1
                                ? v === 0
                                  ? "text-gray-700"
                                  : v < -0.05
                                    ? "text-green-400"
                                    : v > 0.05
                                      ? "text-red-400"
                                      : "text-gray-500"
                                : r === step
                                  ? v === 0
                                    ? "text-gray-700"
                                    : v < -0.05
                                      ? "text-green-400"
                                      : v > 0.05
                                        ? "text-red-400"
                                        : "text-gray-500"
                                  : "text-gray-700"
                            }
                          />

                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              {t(
                                "training.backpropagation.calc.ffnW1.w1CorrectedLabel",
                              )}
                            </p>
                            {["d₀", "d₁", "d₂", "d₃"].map((label, i) => {
                              const vis = step === -1 || step >= i;
                              const act = step === i;
                              const allZero = BP.gradW_1[i].every(
                                (v) => v === 0,
                              );
                              return (
                                <div
                                  key={i}
                                  className={`flex items-center gap-1 flex-wrap py-0.5 transition-all duration-300 ${
                                    act
                                      ? "bg-green-500/5 rounded px-1 -mx-1"
                                      : ""
                                  }`}
                                >
                                  <span
                                    className={`w-5 text-[10px] ${act ? "text-green-300 font-bold" : "text-gray-600"}`}
                                  >
                                    {label}
                                  </span>
                                  [
                                  {FFN.W_1[i].map((w, j) => {
                                    const corrected =
                                      w - BP.lr * BP.gradW_1[i][j];
                                    const diff = Math.abs(
                                      BP.lr * BP.gradW_1[i][j],
                                    );
                                    return (
                                      <span key={j}>
                                        <span
                                          className={`${NCELL} ${
                                            !vis
                                              ? "text-gray-700"
                                              : allZero
                                                ? "text-gray-600"
                                                : act
                                                  ? diff > 0.0005
                                                    ? "text-green-300 font-bold"
                                                    : "text-gray-500"
                                                  : diff > 0.0005
                                                    ? "text-green-300"
                                                    : "text-gray-500"
                                          }`}
                                        >
                                          {vis
                                            ? corrected.toFixed(4)
                                            : "______"}
                                        </span>
                                        {j < 7 && (
                                          <span className="text-gray-700">
                                            ,{" "}
                                          </span>
                                        )}
                                      </span>
                                    );
                                  })}
                                  ]
                                </div>
                              );
                            })}
                          </div>

                          {step >= 0 && (
                            <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                              {BP.gradW_1[step].every((v) => v === 0) ? (
                                <p className="text-gray-600">
                                  {t(
                                    "training.backpropagation.calc.ffnW1.rowLabel",
                                  )}{" "}
                                  d{step} : ffnInput[5][{step}] = 0 → gradient =
                                  0 →{" "}
                                  <strong>
                                    {t(
                                      "training.backpropagation.calc.ffnW1.noCorrection",
                                    )}
                                  </strong>
                                  .
                                </p>
                              ) : (
                                <>
                                  <p className="text-gray-500">
                                    {t(
                                      "training.backpropagation.calc.ffnW1.rowLabel",
                                    )}{" "}
                                    <span className="text-green-300">
                                      d{step}
                                    </span>{" "}
                                    : W₁[{step}][j] − {BP.lr} × ∂L/∂W₁[{step}
                                    ][j]
                                  </p>
                                  <div className="flex items-center gap-1 flex-wrap text-[11px]">
                                    {FFN.W_1[step].map((w, j) => {
                                      const g = BP.gradW_1[step][j];
                                      if (g === 0) return null;
                                      const corrected = w - BP.lr * g;
                                      return (
                                        <span key={j}>
                                          {j > 0 &&
                                            BP.gradW_1[step]
                                              .slice(0, j)
                                              .some((v) => v !== 0) && (
                                              <span className="text-gray-700 mx-0.5">
                                                |
                                              </span>
                                            )}
                                          <span className="text-gray-600">
                                            n{j}:
                                          </span>
                                          <span className="text-white">
                                            {w.toFixed(2)}
                                          </span>
                                          <span className="text-gray-600">
                                            {g >= 0 ? "−" : "+"}
                                          </span>
                                          <span
                                            className={
                                              g < 0
                                                ? "text-green-400"
                                                : "text-red-400"
                                            }
                                          >
                                            {Math.abs(BP.lr * g).toFixed(4)}
                                          </span>
                                          <span className="text-gray-600">
                                            =
                                          </span>
                                          <span className="text-green-300">
                                            {corrected.toFixed(4)}
                                          </span>
                                        </span>
                                      );
                                    })}
                                  </div>
                                  <p className="text-gray-600 text-[10px]">
                                    {t(
                                      "training.backpropagation.calc.ffnW1.zeroColumnsNote",
                                    )}
                                  </p>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </AnimatedMathOperation>
                </div>
              </div>
            </div>
          </ConcreteCalculation>

          {/* ─── 5. Couche d'attention — W_O ─── */}
          <ConcreteCalculation
            title={t("training.backpropagation.calc.attentionWO.title")}
            description={t(
              "training.backpropagation.calc.attentionWO.description",
            )}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                {t("training.backpropagation.calc.attentionWO.forwardRef")} (
                <Link
                  to="/training/attention"
                  className="text-primary-400 hover:underline"
                >
                  {t("training.backpropagation.calc.attentionWO.step4Link")}
                </Link>
                ) :
                <span className="font-mono text-xs">
                  {" "}
                  multiHeadOutput = concatenated × W_O
                </span>
                . {t("training.backpropagation.calc.attentionWO.backwardRef")}
              </p>

              <div className="bg-gray-900 rounded-lg p-4">
                <AnimatedMathOperation totalSteps={4} delay={800}>
                  {(step) => (
                    <div className="space-y-3">
                      <MatrixDisplay
                        data={ATT.W_O}
                        title="W_O"
                        shape="(16 × 4)"
                        colLabels={["d₀", "d₁", "d₂", "d₃"]}
                        compact
                        highlightRows={
                          step >= 0
                            ? Array.from({ length: 4 }, (_, k) => step * 4 + k)
                            : undefined
                        }
                        cellColor={(_, r) => {
                          if (step === -1) return "";
                          const headIdx = Math.floor(r / 4);
                          return headIdx === step
                            ? "text-amber-300"
                            : headIdx < step
                              ? "text-gray-500"
                              : "text-gray-700";
                        }}
                      />

                      <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                        <p className="text-gray-500 mb-1">
                          {t(
                            "training.backpropagation.calc.attentionWO.inputGradientLabel",
                          )}
                        </p>
                        <div className="flex items-center gap-1 flex-wrap">
                          [
                          {BP.gradFFNInput.map((v, i) => (
                            <span key={i}>
                              <span
                                className={`${NCELL} ${
                                  step >= 0
                                    ? "text-green-400 ring-1 ring-green-500/30 bg-green-500/5 rounded px-0.5"
                                    : "text-green-400"
                                }`}
                              >
                                {fmt(v)}
                              </span>
                              {i < 3 && (
                                <span className="text-gray-700">, </span>
                              )}
                            </span>
                          ))}
                          ]
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                        <p className="text-gray-500 mb-1">
                          {t(
                            "training.backpropagation.calc.attentionWO.gradConcatLabel",
                          )}
                        </p>
                        {BP.headGrads.map((hg, h) => {
                          const vis = step === -1 || step >= h;
                          const act = step === h;
                          return (
                            <div
                              key={h}
                              className={`flex items-center gap-1 py-0.5 transition-all duration-300 ${
                                act ? "bg-yellow-500/5 rounded px-1 -mx-1" : ""
                              }`}
                            >
                              <span
                                className={`w-12 text-[10px] ${act ? "text-yellow-300 font-bold" : "text-gray-600"}`}
                              >
                                {t(
                                  "training.backpropagation.calc.attentionWO.head",
                                )}{" "}
                                {h + 1}
                              </span>
                              [
                              {hg.map((v, i) => (
                                <span key={i}>
                                  <span
                                    className={`${NCELL} ${
                                      !vis
                                        ? "text-gray-700"
                                        : act
                                          ? "text-yellow-300"
                                          : "text-gray-500"
                                    }`}
                                  >
                                    {vis ? fmt(v) : "____"}
                                  </span>
                                  {i < 3 && (
                                    <span className="text-gray-700">, </span>
                                  )}
                                </span>
                              ))}
                              ]
                            </div>
                          );
                        })}
                      </div>

                      {step >= 0 &&
                        (() => {
                          const hg = BP.headGrads[step];
                          return (
                            <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                              <p className="text-gray-500">
                                {t(
                                  "training.backpropagation.calc.attentionWO.head",
                                )}{" "}
                                {step + 1} : ∂L/∂concat[{step * 4}..
                                {step * 4 + 3}] = W_O[{step * 4}..{step * 4 + 3}
                                ]<sup>T</sup> × ∂L/∂ffnInput :
                              </p>
                              {hg.map((v, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-1 flex-wrap text-[11px]"
                                >
                                  <span className="text-gray-600 w-4">
                                    [{i}]
                                  </span>
                                  {BP.gradFFNInput.map((gi, d) => (
                                    <span key={d}>
                                      {d > 0 && (
                                        <span className="text-gray-600 mx-0.5">
                                          +
                                        </span>
                                      )}
                                      <span className="text-green-400">
                                        {fmtMul(gi)}
                                      </span>
                                      <span className="text-gray-600">×</span>
                                      <span className="text-amber-400">
                                        {fmtMul(ATT.W_O[step * 4 + i][d])}
                                      </span>
                                    </span>
                                  ))}
                                  <span className="text-gray-600 mx-1">=</span>
                                  <span className="text-yellow-300 font-bold">
                                    {fmt(v)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                    </div>
                  )}
                </AnimatedMathOperation>
              </div>

              {/* Sortie par tête */}
              <div className="bg-yellow-900/10 border border-yellow-800/30 rounded p-3 space-y-1">
                <p className="text-yellow-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸{" "}
                  {t("training.backpropagation.calc.attentionWO.outputPerHead")}
                </p>
                <div className="space-y-0.5 font-mono text-xs">
                  {BP.headGrads.map((hg, h) => (
                    <div key={h} className="flex items-center gap-1">
                      <span className="text-gray-600 w-12 text-[10px]">
                        {t("training.backpropagation.calc.attentionWO.head")}{" "}
                        {h + 1}
                      </span>
                      [
                      {hg.map((v, i) => (
                        <span key={i}>
                          <span
                            className={`${NCELL} ${v < 0 ? "text-blue-300" : "text-red-300"}`}
                          >
                            {fmt(v)}
                          </span>
                          {i < 3 && <span className="text-gray-700">, </span>}
                        </span>
                      ))}
                      ]
                    </div>
                  ))}
                </div>
              </div>

              {/* Calcul de ∂L/∂W_O (outer product concatenated[5] × gradFFNInput) */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t(
                    "training.backpropagation.calc.attentionWO.gradWeightsTitle",
                  )}
                </h4>
                <p className="text-sm text-gray-400">
                  <span className="font-mono text-xs">
                    ∂L/∂W_O[i][j] = concatenated[5][i] × gradFFNInput[j]
                  </span>
                  .{" "}
                  {t(
                    "training.backpropagation.calc.attentionWO.gradWeightsDesc",
                  )}{" "}
                  (
                  <Link
                    to="/training/attention"
                    className="text-primary-400 hover:underline"
                  >
                    {t("training.backpropagation.calc.attentionWO.step4Link")}
                  </Link>
                  ){" "}
                  {t(
                    "training.backpropagation.calc.attentionWO.gradWeightsDesc2",
                  )}
                </p>

                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation totalSteps={4} delay={800}>
                    {(step) => {
                      const concat5 = ATT.concatenated[5];
                      return (
                        <div className="space-y-3">
                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              concatenated[5] (
                              <Link
                                to="/training/attention"
                                className="text-primary-400 hover:underline"
                              >
                                {t(
                                  "training.backpropagation.calc.attentionWO.step4Link",
                                )}
                              </Link>
                              ,{" "}
                              {t(
                                "training.backpropagation.calc.attentionWO.values16",
                              )}
                              ) :
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                              [
                              {concat5.map((v, i) => {
                                const headIdx = Math.floor(i / 4);
                                const act = step === headIdx;
                                return (
                                  <span key={i}>
                                    <span
                                      className={`${NCELL} ${
                                        act
                                          ? "text-cyan-400 font-bold"
                                          : step === -1 || step > headIdx
                                            ? "text-cyan-400"
                                            : "text-gray-700"
                                      }`}
                                    >
                                      {fmt(v)}
                                    </span>
                                    {i < 15 && (
                                      <span
                                        className={
                                          i % 4 === 3
                                            ? "text-gray-600 mx-0.5"
                                            : "text-gray-700"
                                        }
                                      >
                                        {i % 4 === 3 ? "|" : ","}{" "}
                                      </span>
                                    )}
                                  </span>
                                );
                              })}
                              ]
                            </div>
                          </div>

                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              {t(
                                "training.backpropagation.calc.attentionWO.inputGradientLabel",
                              )}
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                              [
                              {BP.gradFFNInput.map((v, j) => (
                                <span key={j}>
                                  <span
                                    className={`${NCELL} ${
                                      step >= 0
                                        ? "text-green-400 ring-1 ring-green-500/30 bg-green-500/5 rounded px-0.5"
                                        : "text-green-400"
                                    }`}
                                  >
                                    {fmt(v)}
                                  </span>
                                  {j < 3 && (
                                    <span className="text-gray-700">, </span>
                                  )}
                                </span>
                              ))}
                              ]
                            </div>
                          </div>

                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              {t(
                                "training.backpropagation.calc.attentionWO.gradWOLabel",
                              )}
                            </p>
                            {[0, 1, 2, 3].map((h) => {
                              const vis = step === -1 || step >= h;
                              const act = step === h;
                              return (
                                <div
                                  key={h}
                                  className={`py-0.5 transition-all duration-300 ${
                                    act
                                      ? "bg-yellow-500/5 rounded px-1 -mx-1"
                                      : ""
                                  }`}
                                >
                                  <span
                                    className={`text-[10px] ${act ? "text-yellow-300 font-bold" : "text-gray-600"}`}
                                  >
                                    T{h + 1}{" "}
                                  </span>
                                  {[0, 1, 2, 3].map((k) => (
                                    <span key={k} className="inline-block mr-1">
                                      [
                                      {BP.gradW_O[h * 4 + k].map((v, j) => (
                                        <span key={j}>
                                          <span
                                            className={`${NCELL} ${
                                              !vis
                                                ? "text-gray-700"
                                                : act
                                                  ? Math.abs(v) > 0.05
                                                    ? v < 0
                                                      ? "text-green-400"
                                                      : "text-red-400"
                                                    : "text-gray-500"
                                                  : "text-gray-500"
                                            }`}
                                          >
                                            {vis ? fmt(v) : "____"}
                                          </span>
                                          {j < 3 && (
                                            <span className="text-gray-700">
                                              ,
                                            </span>
                                          )}
                                        </span>
                                      ))}
                                      ]
                                    </span>
                                  ))}
                                </div>
                              );
                            })}
                          </div>

                          {step >= 0 && (
                            <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                              <p className="text-gray-500">
                                {t(
                                  "training.backpropagation.calc.attentionWO.head",
                                )}{" "}
                                {step + 1} : concat[{step * 4}..{step * 4 + 3}]
                                × gradFFNInput
                              </p>
                              <div className="flex items-center gap-1 flex-wrap text-[11px]">
                                {[0, 1, 2, 3].map((k) => {
                                  const ci = concat5[step * 4 + k];
                                  return (
                                    <span key={k}>
                                      {k > 0 && (
                                        <span className="text-gray-700 mx-1">
                                          |
                                        </span>
                                      )}
                                      <span className="text-gray-600">
                                        [{step * 4 + k}]:
                                      </span>
                                      <span className="text-cyan-400">
                                        {ci.toFixed(2)}
                                      </span>
                                      <span className="text-gray-600">
                                        → max|g|=
                                        {Math.max(
                                          ...BP.gradW_O[step * 4 + k].map((v) =>
                                            Math.abs(v),
                                          ),
                                        ).toFixed(3)}
                                      </span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </AnimatedMathOperation>
                </div>
              </div>

              {/* Correction animée de W_O */}
              <div className="bg-yellow-900/10 border border-yellow-800/30 rounded p-3 space-y-2">
                <p className="text-yellow-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸{" "}
                  {t(
                    "training.backpropagation.calc.attentionWO.correctionTitle",
                  )}{" "}
                  <span className="text-gray-500">(lr = {BP.lr})</span>
                </p>

                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation totalSteps={4} delay={800}>
                    {(step) => {
                      const headLabels = ["T1", "T2", "T3", "T4"];
                      return (
                        <div className="space-y-3">
                          <MatrixDisplay
                            data={ATT.W_O}
                            title={t(
                              "training.backpropagation.calc.attentionWO.wOBefore",
                            )}
                            shape="(16 × 4)"
                            colLabels={["d₀", "d₁", "d₂", "d₃"]}
                            compact
                            highlightRows={
                              step >= 0
                                ? Array.from(
                                    { length: 4 },
                                    (_, k) => step * 4 + k,
                                  )
                                : undefined
                            }
                            cellColor={(_, r) => {
                              if (step === -1) return "";
                              const h = Math.floor(r / 4);
                              return h === step
                                ? "text-white"
                                : h < step
                                  ? "text-gray-600"
                                  : "text-gray-700";
                            }}
                          />

                          <MatrixDisplay
                            data={BP.gradW_O}
                            title="∂L/∂W_O (gradient)"
                            shape="(16 × 4)"
                            colLabels={["d₀", "d₁", "d₂", "d₃"]}
                            compact
                            highlightRows={
                              step >= 0
                                ? Array.from(
                                    { length: 4 },
                                    (_, k) => step * 4 + k,
                                  )
                                : undefined
                            }
                            cellColor={(v, r) => {
                              if (step === -1)
                                return v === 0
                                  ? "text-gray-700"
                                  : Math.abs(v) > 0.05
                                    ? v < 0
                                      ? "text-green-400"
                                      : "text-red-400"
                                    : "text-gray-500";
                              const h = Math.floor(r / 4);
                              if (h !== step) return "text-gray-700";
                              return v === 0
                                ? "text-gray-700"
                                : Math.abs(v) > 0.05
                                  ? v < 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                  : "text-gray-500";
                            }}
                          />

                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              {t(
                                "training.backpropagation.calc.attentionWO.wOCorrectedLabel",
                              )}
                            </p>
                            {headLabels.map((hl, h) => {
                              const vis = step === -1 || step >= h;
                              const act = step === h;
                              return (
                                <div
                                  key={h}
                                  className={`py-0.5 transition-all duration-300 ${
                                    act
                                      ? "bg-yellow-500/5 rounded px-1 -mx-1"
                                      : ""
                                  }`}
                                >
                                  <span
                                    className={`text-[10px] ${act ? "text-yellow-300 font-bold" : "text-gray-600"}`}
                                  >
                                    {hl}{" "}
                                  </span>
                                  {[0, 1, 2, 3].map((k) => {
                                    const r = h * 4 + k;
                                    return (
                                      <span
                                        key={k}
                                        className="inline-block mr-1"
                                      >
                                        [
                                        {ATT.W_O[r].map((w, j) => {
                                          const corrected =
                                            w - BP.lr * BP.gradW_O[r][j];
                                          const diff = Math.abs(
                                            BP.lr * BP.gradW_O[r][j],
                                          );
                                          return (
                                            <span key={j}>
                                              <span
                                                className={`${NCELL} ${
                                                  !vis
                                                    ? "text-gray-700"
                                                    : act
                                                      ? diff > 0.0005
                                                        ? "text-yellow-300"
                                                        : "text-gray-500"
                                                      : "text-gray-500"
                                                }`}
                                              >
                                                {vis
                                                  ? corrected.toFixed(4)
                                                  : "______"}
                                              </span>
                                              {j < 3 && (
                                                <span className="text-gray-700">
                                                  ,
                                                </span>
                                              )}
                                            </span>
                                          );
                                        })}
                                        ]
                                      </span>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>

                          {step >= 0 && (
                            <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                              <p className="text-gray-500">
                                {t(
                                  "training.backpropagation.calc.attentionWO.head",
                                )}{" "}
                                {step + 1} (
                                {t(
                                  "training.backpropagation.calc.attentionWO.rows",
                                )}{" "}
                                {step * 4}–{step * 4 + 3}) : W_O[i][j] − {BP.lr}{" "}
                                × ∂L/∂W_O[i][j]
                              </p>
                              <div className="flex items-center gap-1 flex-wrap text-[11px]">
                                {[0, 1, 2, 3].map((k) => {
                                  const r = step * 4 + k;
                                  const maxDiff = Math.max(
                                    ...ATT.W_O[r].map((w, j) =>
                                      Math.abs(BP.lr * BP.gradW_O[r][j]),
                                    ),
                                  );
                                  return (
                                    <span key={k} className="text-gray-500">
                                      [{r}]: max Δ={maxDiff.toFixed(5)}
                                      {k < 3 && (
                                        <span className="text-gray-700 mx-1">
                                          |
                                        </span>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </AnimatedMathOperation>
                </div>
              </div>
            </div>
          </ConcreteCalculation>

          {/* ─── 6. À travers l'attention (tête 1 détaillée) ─── */}
          <ConcreteCalculation
            title={t("training.backpropagation.calc.attentionHead1.title")}
            description={t(
              "training.backpropagation.calc.attentionHead1.description",
            )}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                {t("training.backpropagation.calc.attentionHead1.forwardRef")} (
                <Link
                  to="/training/attention"
                  className="text-primary-400 hover:underline"
                >
                  {t("training.backpropagation.calc.attentionHead1.step4Link")}
                </Link>
                ),
                {t(
                  "training.backpropagation.calc.attentionHead1.forwardFormula",
                )}{" "}
                <span className="font-mono text-xs">
                  Σ<sub>p</sub> attention[p] × V[p]
                </span>
                .{" "}
                {t("training.backpropagation.calc.attentionHead1.backwardRef")}
              </p>

              <div className="bg-gray-900 rounded-lg p-4">
                <AnimatedMathOperation totalSteps={6} delay={700}>
                  {(step) => {
                    const weights = ATT.attentionWeights[5];
                    const tokens = ["L", "e", "⎵", "c", "h", "a"];
                    return (
                      <div className="space-y-3">
                        <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                          <p className="text-gray-500 mb-1">
                            {t(
                              "training.backpropagation.calc.attentionHead1.gradHead1Label",
                            )}
                          </p>
                          <div className="flex items-center gap-1 flex-wrap">
                            [
                            {BP.headGrads[0].map((v, i) => (
                              <span key={i}>
                                <span
                                  className={`${NCELL} ${
                                    step >= 0
                                      ? "text-yellow-400 ring-1 ring-yellow-500/30 bg-yellow-500/5 rounded px-0.5"
                                      : "text-yellow-400"
                                  }`}
                                >
                                  {fmt(v)}
                                </span>
                                {i < 3 && (
                                  <span className="text-gray-700">, </span>
                                )}
                              </span>
                            ))}
                            ]
                          </div>
                        </div>

                        <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                          <p className="text-gray-500 mb-1">
                            {t(
                              "training.backpropagation.calc.attentionHead1.attWeightsLabel",
                            )}{" "}
                            (
                            <Link
                              to="/training/attention"
                              className="text-primary-400 hover:underline"
                            >
                              {t(
                                "training.backpropagation.calc.attentionHead1.step4Link",
                              )}
                            </Link>
                            ) :
                          </p>
                          <div className="flex items-center gap-1 flex-wrap">
                            [
                            {tokens.map((tok, p) => {
                              const act = step === p;
                              const vis = step === -1 || step >= p;
                              return (
                                <span key={p}>
                                  <span
                                    className={`${NCELL} ${
                                      act
                                        ? "text-yellow-300 font-bold ring-1 ring-yellow-500/30 bg-yellow-500/5 rounded px-0.5"
                                        : vis
                                          ? "text-yellow-300"
                                          : "text-gray-700"
                                    }`}
                                  >
                                    {weights[p].toFixed(2)}
                                  </span>
                                  {p < 5 && (
                                    <span className="text-gray-700">, </span>
                                  )}
                                </span>
                              );
                            })}
                            ]
                          </div>
                          <div className="flex items-center gap-1 flex-wrap mt-0.5">
                            <span className="text-transparent">[</span>
                            {tokens.map((tok, p) => (
                              <span key={p}>
                                <span
                                  className={`${NCELL} text-[10px] text-gray-600`}
                                >
                                  {tok}
                                </span>
                                {p < 5 && (
                                  <span className="text-transparent">,</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                          <p className="text-gray-500 mb-1">
                            {t(
                              "training.backpropagation.calc.attentionHead1.gradVLabel",
                            )}
                          </p>
                          {tokens.map((tok, p) => {
                            const vis = step === -1 || step >= p;
                            const act = step === p;
                            const gv = BP.gradV_head1_pos5[p];
                            return (
                              <div
                                key={p}
                                className={`flex items-center gap-1 py-0.5 transition-all duration-300 ${
                                  act
                                    ? "bg-yellow-500/5 rounded px-1 -mx-1"
                                    : ""
                                }`}
                              >
                                <span
                                  className={`w-3 text-[10px] ${act ? "text-yellow-300 font-bold" : "text-gray-600"}`}
                                >
                                  {tok}
                                </span>
                                <span
                                  className={`w-10 text-[10px] ${act ? "text-yellow-300" : "text-gray-600"}`}
                                >
                                  ×{weights[p].toFixed(2)}
                                </span>
                                [
                                {gv.map((v, i) => (
                                  <span key={i}>
                                    <span
                                      className={`${NCELL} ${
                                        !vis
                                          ? "text-gray-700"
                                          : act
                                            ? Math.abs(v) > 0.02
                                              ? "text-yellow-300"
                                              : "text-gray-600"
                                            : "text-gray-500"
                                      }`}
                                    >
                                      {vis ? fmt(v) : "____"}
                                    </span>
                                    {i < 3 && (
                                      <span className="text-gray-700">, </span>
                                    )}
                                  </span>
                                ))}
                                ]
                              </div>
                            );
                          })}
                        </div>

                        {step >= 0 && (
                          <div className="border-t border-gray-800 pt-2 text-xs">
                            <p className="text-gray-500">
                              Token «{" "}
                              <span className="text-yellow-300">
                                {tokens[step]}
                              </span>{" "}
                              »{" "}
                              {t(
                                "training.backpropagation.calc.attentionHead1.hadAttention",
                              )}{" "}
                              {(weights[step] * 100).toFixed(0)}% →{" "}
                              {t(
                                "training.backpropagation.calc.attentionHead1.receivesGradient",
                              )}{" "}
                              {(weights[step] * 100).toFixed(0)}%.
                              {weights[step] >= 0.3 && (
                                <span className="text-amber-300">
                                  {" "}
                                  {t(
                                    "training.backpropagation.calc.attentionHead1.strongSignal",
                                  )}
                                </span>
                              )}
                              {weights[step] <= 0.07 && (
                                <span className="text-gray-500">
                                  {" "}
                                  {t(
                                    "training.backpropagation.calc.attentionHead1.almostNothing",
                                  )}
                                </span>
                              )}
                            </p>
                          </div>
                        )}

                        {(step >= 5 || step === -1) && (
                          <div className="border-t border-gray-800 pt-3 mt-2">
                            <p className="text-xs text-gray-500">
                              {t(
                                "training.backpropagation.calc.attentionHead1.topTokensNote",
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }}
                </AnimatedMathOperation>
              </div>

              {/* Traversée de W_V vers les embeddings */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t(
                    "training.backpropagation.calc.attentionHead1.gradEmbTitle",
                  )}
                </h4>
                <p className="text-sm text-gray-400">
                  {t(
                    "training.backpropagation.calc.attentionHead1.gradEmbDesc",
                  )}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <MatrixDisplay
                    data={ATT.W_V}
                    title="W_V"
                    shape="(4 × 4)"
                    rowLabels={["d₀", "d₁", "d₂", "d₃"]}
                    colLabels={["v₀", "v₁", "v₂", "v₃"]}
                    compact
                  />
                  <MatrixDisplay
                    data={ATT.W_Q}
                    title="W_Q"
                    shape="(4 × 4)"
                    rowLabels={["d₀", "d₁", "d₂", "d₃"]}
                    colLabels={["q₀", "q₁", "q₂", "q₃"]}
                    compact
                  />
                  <MatrixDisplay
                    data={ATT.W_K}
                    title="W_K"
                    shape="(4 × 4)"
                    rowLabels={["d₀", "d₁", "d₂", "d₃"]}
                    colLabels={["k₀", "k₁", "k₂", "k₃"]}
                    compact
                  />
                </div>

                <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-2">
                  <p className="text-gray-500">
                    {t(
                      "training.backpropagation.calc.attentionHead1.tokenAComment",
                    )}
                  </p>

                  <div className="bg-gray-800/50 rounded p-2 space-y-1">
                    <p className="text-gray-500 text-[10px] mb-1">
                      {t(
                        "training.backpropagation.calc.attentionHead1.gradV5Label",
                      )}
                    </p>
                    <p>
                      [
                      <span className="text-yellow-300">
                        {BP.gradV_head1_pos5[5].map((v) => fmt(v)).join(", ")}
                      </span>
                      ]
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p>
                      <span className="text-gray-600">via V :</span> gradEmb =
                      gradV[5] × W_V<sup>T</sup> = [
                      <span className="text-cyan-300">
                        {BP.gradEmb_fromV.map((v) => fmt(v)).join(", ")}
                      </span>
                      ]
                    </p>
                    <p>
                      <span className="text-gray-600">via Q :</span> gradEmb =
                      gradQ[5] × W_Q<sup>T</sup> = [
                      <span className="text-cyan-300">
                        {BP.gradEmb_fromQ.map((v) => fmt(v)).join(", ")}
                      </span>
                      ]
                    </p>
                    <p>
                      <span className="text-gray-600">via K :</span> gradEmb =
                      gradK[5] × W_K<sup>T</sup> = [
                      <span className="text-cyan-300">
                        {BP.gradEmb_fromK.map((v) => fmt(v)).join(", ")}
                      </span>
                      ]
                    </p>
                    <div className="border-t border-gray-800 pt-1 mt-1">
                      <p>
                        <span className="text-white font-semibold">
                          Total tête 1 :
                        </span>{" "}
                        [
                        <span className="text-cyan-400 font-bold">
                          {BP.gradEmb_head1.map((v) => fmt(v)).join(", ")}
                        </span>
                        ]
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-[10px]">
                    {t(
                      "training.backpropagation.calc.attentionHead1.times4Heads",
                    )}
                  </p>
                </div>

                {/* Sortie */}
                <div className="bg-cyan-900/10 border border-cyan-800/30 rounded p-3 space-y-1">
                  <p className="text-cyan-300 font-semibold text-[10px] uppercase tracking-wide">
                    ▸{" "}
                    {t(
                      "training.backpropagation.calc.attentionHead1.outputLabel",
                    )}
                  </p>
                  <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                    [
                    {BP.gradEmb_head1.map((v, i) => (
                      <span key={i}>
                        <span
                          className={`inline-block min-w-[3rem] text-center py-0.5 px-1.5 rounded ${
                            v < 0
                              ? "bg-blue-900/30 text-blue-300"
                              : "bg-red-900/30 text-red-300"
                          }`}
                        >
                          {fmt(v)}
                        </span>
                        {i < 3 && <span className="text-gray-700">,</span>}
                      </span>
                    ))}
                    ]
                  </div>
                  <p className="text-gray-500 text-xs">
                    {t(
                      "training.backpropagation.calc.attentionHead1.outputExplanation",
                    )}
                  </p>
                </div>
              </div>

              {/* Correction animée de W_V (tête 1) */}
              <div className="bg-cyan-900/10 border border-cyan-800/30 rounded p-3 space-y-2">
                <p className="text-cyan-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸{" "}
                  {t(
                    "training.backpropagation.calc.attentionHead1.wvCorrectionTitle",
                  )}{" "}
                  <span className="text-gray-500">(lr = {BP.lr})</span>
                </p>

                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation totalSteps={4} delay={800}>
                    {(step) => (
                      <div className="space-y-3">
                        <MatrixDisplay
                          data={ATT.W_V}
                          title={t(
                            "training.backpropagation.calc.attentionHead1.wvBefore",
                          )}
                          shape="(4 × 4)"
                          rowLabels={["d₀", "d₁", "d₂", "d₃"]}
                          colLabels={["v₀", "v₁", "v₂", "v₃"]}
                          compact
                          highlightRows={step >= 0 ? [step] : undefined}
                          cellColor={(_, r) =>
                            step === -1
                              ? ""
                              : r === step
                                ? "text-white"
                                : r < step
                                  ? "text-gray-600"
                                  : "text-gray-700"
                          }
                        />

                        <MatrixDisplay
                          data={BP.gradW_V_head1}
                          title="∂L/∂W_V — tête 1 (gradient)"
                          shape="(4 × 4)"
                          rowLabels={["d₀", "d₁", "d₂", "d₃"]}
                          colLabels={["v₀", "v₁", "v₂", "v₃"]}
                          compact
                          highlightRows={step >= 0 ? [step] : undefined}
                          cellColor={(v, r) =>
                            step === -1
                              ? Math.abs(v) > 0.01
                                ? v < 0
                                  ? "text-green-400"
                                  : "text-red-400"
                                : "text-gray-500"
                              : r === step
                                ? Math.abs(v) > 0.01
                                  ? v < 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                  : "text-gray-500"
                                : "text-gray-700"
                          }
                        />

                        <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                          <p className="text-gray-500 mb-1">
                            {t(
                              "training.backpropagation.calc.attentionHead1.wvCorrectedLabel",
                            )}
                          </p>
                          {["d₀", "d₁", "d₂", "d₃"].map((label, i) => {
                            const vis = step === -1 || step >= i;
                            const act = step === i;
                            return (
                              <div
                                key={i}
                                className={`flex items-center gap-1 flex-wrap py-0.5 transition-all duration-300 ${
                                  act ? "bg-cyan-500/5 rounded px-1 -mx-1" : ""
                                }`}
                              >
                                <span
                                  className={`w-5 text-[10px] ${act ? "text-cyan-300 font-bold" : "text-gray-600"}`}
                                >
                                  {label}
                                </span>
                                [
                                {ATT.W_V[i].map((w, j) => {
                                  const corrected =
                                    w - BP.lr * BP.gradW_V_head1[i][j];
                                  const diff = Math.abs(
                                    BP.lr * BP.gradW_V_head1[i][j],
                                  );
                                  return (
                                    <span key={j}>
                                      <span
                                        className={`${NCELL} ${
                                          !vis
                                            ? "text-gray-700"
                                            : act
                                              ? diff > 0.0001
                                                ? "text-cyan-300 font-bold"
                                                : "text-gray-500"
                                              : diff > 0.0001
                                                ? "text-cyan-300"
                                                : "text-gray-500"
                                        }`}
                                      >
                                        {vis ? corrected.toFixed(4) : "______"}
                                      </span>
                                      {j < 3 && (
                                        <span className="text-gray-700">
                                          ,{" "}
                                        </span>
                                      )}
                                    </span>
                                  );
                                })}
                                ]
                              </div>
                            );
                          })}
                        </div>

                        {step >= 0 && (
                          <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                            <p className="text-gray-500">
                              Ligne{" "}
                              <span className="text-cyan-300">d{step}</span> :
                              W_V[{step}][j] − {BP.lr} × ∂L/∂W_V[{step}][j]
                            </p>
                            <div className="flex items-center gap-1 flex-wrap text-[11px]">
                              {ATT.W_V[step].map((w, j) => {
                                const g = BP.gradW_V_head1[step][j];
                                const corrected = w - BP.lr * g;
                                return (
                                  <span key={j}>
                                    {j > 0 && (
                                      <span className="text-gray-700 mx-0.5">
                                        |
                                      </span>
                                    )}
                                    <span className="text-white">
                                      {w.toFixed(2)}
                                    </span>
                                    <span className="text-gray-600">
                                      {g >= 0 ? "−" : "+"}
                                    </span>
                                    <span
                                      className={
                                        g < 0
                                          ? "text-green-400"
                                          : "text-red-400"
                                      }
                                    >
                                      {Math.abs(BP.lr * g).toFixed(4)}
                                    </span>
                                    <span className="text-gray-600">=</span>
                                    <span className="text-cyan-300">
                                      {corrected.toFixed(4)}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {(step >= 3 || step === -1) && (
                          <div className="border-t border-gray-800 pt-3 mt-2">
                            <p className="text-xs text-gray-500">
                              {t(
                                "training.backpropagation.calc.attentionHead1.onlyHead1Note",
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

          {/* ─── 7. Embedding : destination finale ─── */}
          <ConcreteCalculation
            title={t("training.backpropagation.calc.embedding.title")}
            description={t(
              "training.backpropagation.calc.embedding.description",
            )}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                {t("training.backpropagation.calc.embedding.embeddingReceives")}{" "}
                (
                <Link
                  to="/training/embedding"
                  className="text-primary-400 hover:underline"
                >
                  {t("training.backpropagation.calc.embedding.step2Link")}
                </Link>
                ) {t("training.backpropagation.calc.embedding.twoPaths")}
              </p>

              <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-2">
                <p className="text-gray-500">
                  {t(
                    "training.backpropagation.calc.embedding.totalGradComment",
                  )}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-800">
                        <th className="p-1 text-left">source</th>
                        <th className="p-1">d₀</th>
                        <th className="p-1">d₁</th>
                        <th className="p-1">d₂</th>
                        <th className="p-1">d₃</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-900/50">
                        <td className="p-1 text-left text-green-400">
                          {t(
                            "training.backpropagation.calc.embedding.residualSource",
                          )}
                        </td>
                        {BP.gradFFNInput.map((v, i) => (
                          <td
                            key={i}
                            className={`p-1 ${v < 0 ? "text-blue-300" : "text-red-300"}`}
                          >
                            {fmt(v)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-900/50">
                        <td className="p-1 text-left text-yellow-400">
                          {t(
                            "training.backpropagation.calc.embedding.head1Source",
                          )}
                        </td>
                        {BP.gradEmb_head1.map((v, i) => (
                          <td key={i} className="p-1 text-yellow-300">
                            {fmt(v)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-900/50">
                        <td className="p-1 text-left text-gray-500">
                          {t(
                            "training.backpropagation.calc.embedding.heads234",
                          )}
                        </td>
                        <td colSpan={4} className="p-1 text-gray-600 italic">
                          {t(
                            "training.backpropagation.calc.embedding.sameCalcParallel",
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* W_emb gradient */}
              <div className="bg-blue-900/15 border border-blue-800/30 rounded p-3 space-y-2">
                <p className="text-blue-300 font-semibold text-xs">
                  {t("training.backpropagation.calc.embedding.wEmbGradTitle")}
                </p>
                <div className="font-mono text-xs space-y-1">
                  {ATT.tokens.map((tok, p) => {
                    const isPos5 = p === 5;
                    return (
                      <p
                        key={p}
                        className={isPos5 ? "text-blue-300" : "text-gray-600"}
                      >
                        W_emb[
                        <span className="text-primary-400">
                          {ATT.tokenIds[p]}
                        </span>
                        ] (« {tok} »)
                        {isPos5 ? (
                          <span>
                            {" "}
                            : gradient = ∂L/∂embedding[5]{" "}
                            <span className="text-blue-400">
                              ←{" "}
                              {t(
                                "training.backpropagation.calc.embedding.updated",
                              )}
                            </span>
                          </span>
                        ) : (
                          <span>
                            {" "}
                            :{" "}
                            {t(
                              "training.backpropagation.calc.embedding.gradientFromOther",
                            )}{" "}
                            <span className="text-gray-500">
                              ←{" "}
                              {t(
                                "training.backpropagation.calc.embedding.contributesToo",
                              )}
                            </span>
                          </span>
                        )}
                      </p>
                    );
                  })}
                </div>
                <p className="text-gray-500 text-xs">
                  {t("training.backpropagation.calc.embedding.wEmbExplanation")}
                </p>
              </div>

              {/* Sortie finale */}
              <div className="bg-blue-900/10 border border-blue-800/30 rounded p-3 space-y-1">
                <p className="text-blue-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸ {t("training.backpropagation.calc.embedding.endBackward")}
                </p>
                <div className="bg-gray-900 rounded p-2 font-mono text-xs space-y-1">
                  <p className="text-gray-500">
                    {t(
                      "training.backpropagation.calc.embedding.gradientsComputed",
                    )}
                  </p>
                  <p>
                    ∂L/∂W_out{" "}
                    <span className="text-gray-600">(4×7 = 28 valeurs)</span>
                  </p>
                  <p>
                    ∂L/∂W₂{" "}
                    <span className="text-gray-600">(8×4 = 32 valeurs)</span>
                  </p>
                  <p>
                    ∂L/∂W₁{" "}
                    <span className="text-gray-600">(4×8 = 32 valeurs)</span>
                  </p>
                  <p>
                    ∂L/∂W_O{" "}
                    <span className="text-gray-600">(16×4 = 64 valeurs)</span>
                  </p>
                  <p>
                    ∂L/∂W_Q, W_K, W_V{" "}
                    <span className="text-gray-600">
                      (4×4 × 3 = 48 valeurs)
                    </span>
                  </p>
                  <p>
                    ∂L/∂W_emb{" "}
                    <span className="text-gray-600">
                      (7 lignes × 4 = 28 valeurs)
                    </span>
                  </p>
                  <p className="text-gray-500 mt-1">
                    {t(
                      "training.backpropagation.calc.embedding.totalGradients",
                    )}
                  </p>
                  <p className="text-gray-500">
                    {t("training.backpropagation.calc.embedding.realModel")}
                  </p>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {t("training.backpropagation.calc.embedding.allGradients")}{" "}
                  <Link
                    to="/training/optimizer"
                    className="text-primary-400 hover:underline"
                  >
                    {t("training.backpropagation.calc.embedding.optimizerLink")}
                  </Link>{" "}
                  {t(
                    "training.backpropagation.calc.embedding.appliesCorrections",
                  )}
                </p>
              </div>
            </div>
          </ConcreteCalculation>

          {/* ─── 6. Correction de l'embedding ─── */}
          <ConcreteCalculation
            title={t("training.backpropagation.calc.embeddingCorrection.title")}
            description={t(
              "training.backpropagation.calc.embeddingCorrection.description",
            )}
          >
            <div className="space-y-4">
              {/* Entrée : embedding actuel */}
              <div>
                <p className="text-gray-400 text-xs mb-2">
                  <strong className="text-white">
                    {t(
                      "training.backpropagation.calc.embeddingCorrection.inputLabel",
                    )}{" "}
                    :
                  </strong>{" "}
                  {t(
                    "training.backpropagation.calc.embeddingCorrection.inputDesc",
                  )}{" "}
                  « {ATT.tokens[5]} » (position 5),{" "}
                  {t(
                    "training.backpropagation.calc.embeddingCorrection.computedAt",
                  )}{" "}
                  <Link
                    to="/training/embedding"
                    className="text-primary-400 hover:underline"
                  >
                    {t(
                      "training.backpropagation.calc.embeddingCorrection.step2Link",
                    )}
                  </Link>
                </p>
                <div className="bg-gray-900 rounded p-2 font-mono text-xs">
                  <p className="text-gray-500 mb-1">
                    emb[5] (« {ATT.tokens[5]} ») =
                  </p>
                  <div className="flex gap-3">
                    {["d₀", "d₁", "d₂", "d₃"].map((label, i) => (
                      <div key={i} className="text-center">
                        <span className="text-gray-600 text-[10px]">
                          {label}
                        </span>
                        <div className="text-white">
                          {ATT.embeddings[5][i].toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gradient : breakdown par source */}
              <div>
                <p className="text-gray-400 text-xs mb-2">
                  <strong className="text-white">
                    {t(
                      "training.backpropagation.calc.embeddingCorrection.gradientLabel",
                    )}{" "}
                    :
                  </strong>{" "}
                  {t(
                    "training.backpropagation.calc.embeddingCorrection.gradientTwoPaths",
                  )}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-xs text-center">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-800">
                        <th className="p-1 text-left">source</th>
                        <th className="p-1">d₀</th>
                        <th className="p-1">d₁</th>
                        <th className="p-1">d₂</th>
                        <th className="p-1">d₃</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-900/50">
                        <td className="p-1 text-left text-amber-300">
                          {t(
                            "training.backpropagation.calc.embeddingCorrection.residualViaFFN",
                          )}
                        </td>
                        {BP.gradFFNInput.map((v, i) => (
                          <td
                            key={i}
                            className={`p-1 ${v < 0 ? "text-blue-300" : "text-red-400"}`}
                          >
                            {fmt(v)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-900/50">
                        <td className="p-1 text-left text-purple-300">
                          {t(
                            "training.backpropagation.calc.embeddingCorrection.head1VQK",
                          )}
                        </td>
                        {BP.gradEmb_head1.map((v, i) => (
                          <td
                            key={i}
                            className={`p-1 ${v < 0 ? "text-blue-300" : "text-red-400"}`}
                          >
                            {fmt(v)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-900/50">
                        <td className="p-1 text-left text-gray-500 italic">
                          {t(
                            "training.backpropagation.calc.embeddingCorrection.heads234",
                          )}
                        </td>
                        <td colSpan={4} className="p-1 text-gray-600 italic">
                          {t(
                            "training.backpropagation.calc.embeddingCorrection.sameCalcParallel",
                          )}
                        </td>
                      </tr>
                      <tr className="border-t border-gray-700">
                        <td className="p-1 text-left text-yellow-300 font-bold">
                          ∂L/∂emb[5] (total)
                        </td>
                        {BP.gradEmb_total.map((v, i) => (
                          <td key={i} className="p-1 text-yellow-300 font-bold">
                            {fmt(v)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-gray-500 text-[10px] mt-1">
                  {t(
                    "training.backpropagation.calc.embeddingCorrection.residualDominates",
                  )}
                </p>
              </div>

              {/* Animated correction */}
              <div>
                <p className="text-gray-400 text-xs mb-2">
                  <strong className="text-white">
                    {t(
                      "training.backpropagation.calc.embeddingCorrection.operationLabel",
                    )}{" "}
                    :
                  </strong>{" "}
                  emb_nouveau = emb_ancien − lr × gradient
                </p>
                <AnimatedMathOperation totalSteps={4} delay={900}>
                  {(step) => {
                    const embOld = ATT.embeddings[5];
                    const grad = BP.gradEmb_total;
                    const dimLabels = ["d₀", "d₁", "d₂", "d₃"];
                    return (
                      <div className="space-y-3">
                        {/* Two rows: embedding before + gradient */}
                        <div className="bg-gray-900 rounded p-2 font-mono text-xs space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 w-24 text-right">
                              {t(
                                "training.backpropagation.calc.embeddingCorrection.oldEmb",
                              )}
                            </span>
                            <div className="flex gap-2">
                              {embOld.map((v, i) => (
                                <span
                                  key={i}
                                  className={`${NCELL} ${step === i ? "text-white bg-gray-700/50 rounded px-1" : "text-gray-400"}`}
                                >
                                  {v.toFixed(2)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 w-24 text-right">
                              − {BP.lr} ×
                            </span>
                            <div className="flex gap-2">
                              {grad.map((v, i) => (
                                <span
                                  key={i}
                                  className={`${NCELL} ${step === i ? "text-yellow-300 bg-gray-700/50 rounded px-1" : "text-gray-600"}`}
                                >
                                  {fmt(v)}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="border-t border-gray-800 pt-1 flex items-center gap-2">
                            <span className="text-green-400 w-24 text-right font-bold">
                              {t(
                                "training.backpropagation.calc.embeddingCorrection.correctedEmb",
                              )}
                            </span>
                            <div className="flex gap-2">
                              {embOld.map((v, i) => {
                                const vis = step === -1 || step >= i;
                                const act = step === i;
                                const corrected = v - BP.lr * grad[i];
                                return (
                                  <span
                                    key={i}
                                    className={`${NCELL} ${act ? "text-green-300 font-bold bg-green-900/30 rounded px-1" : vis ? "text-green-400" : "text-gray-700"}`}
                                  >
                                    {vis ? corrected.toFixed(4) : "______"}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Detail for active step */}
                        {step >= 0 && step < 4 && (
                          <div className="bg-gray-800/50 rounded p-2 text-xs font-mono text-center">
                            <span className="text-gray-500">
                              {dimLabels[step]} :
                            </span>{" "}
                            <span className="text-white">
                              {embOld[step].toFixed(2)}
                            </span>
                            <span className="text-gray-500"> − {BP.lr} × </span>
                            <span className="text-yellow-300">
                              {fmtMul(grad[step])}
                            </span>
                            <span className="text-gray-500"> = </span>
                            <span className="text-white">
                              {embOld[step].toFixed(2)}
                            </span>
                            <span className="text-gray-500">
                              {" "}
                              {grad[step] >= 0 ? "−" : "+"}{" "}
                            </span>
                            <span className="text-gray-400">
                              {Math.abs(BP.lr * grad[step]).toFixed(4)}
                            </span>
                            <span className="text-gray-500"> = </span>
                            <span className="text-green-300 font-bold">
                              {(embOld[step] - BP.lr * grad[step]).toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }}
                </AnimatedMathOperation>
              </div>

              {/* Sortie */}
              <div className="bg-green-900/10 border border-green-800/30 rounded p-3 space-y-2">
                <p className="text-green-400 font-semibold text-[10px] uppercase tracking-wide">
                  ▸{" "}
                  {t(
                    "training.backpropagation.calc.embeddingCorrection.outputLabel",
                  )}{" "}
                  « {ATT.tokens[5]} »
                </p>
                <div className="bg-gray-900 rounded p-2 font-mono text-xs">
                  <div className="flex gap-4">
                    {["d₀", "d₁", "d₂", "d₃"].map((label, i) => {
                      const old = ATT.embeddings[5][i];
                      const corrected = old - BP.lr * BP.gradEmb_total[i];
                      const diff = -BP.lr * BP.gradEmb_total[i];
                      return (
                        <div key={i} className="text-center">
                          <span className="text-gray-600 text-[10px]">
                            {label}
                          </span>
                          <div className="text-green-400 font-bold">
                            {corrected.toFixed(4)}
                          </div>
                          <div
                            className={`text-[10px] ${diff > 0 ? "text-red-400" : "text-blue-300"}`}
                          >
                            ({diff > 0 ? "+" : "−"}
                            {Math.abs(diff).toFixed(4)})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="text-gray-500 text-xs">
                  {t(
                    "training.backpropagation.calc.embeddingCorrection.smallCorrections",
                  )}{" "}
                  (lr = {BP.lr}){" "}
                  {t(
                    "training.backpropagation.calc.embeddingCorrection.rightDirection",
                  )}{" "}
                  {t(
                    "training.backpropagation.calc.embeddingCorrection.negativeGrad",
                  )}{" "}
                  <span className="text-blue-300">
                    {t(
                      "training.backpropagation.calc.embeddingCorrection.negative",
                    )}
                  </span>{" "}
                  {t(
                    "training.backpropagation.calc.embeddingCorrection.increasesD0",
                  )}{" "}
                  {t(
                    "training.backpropagation.calc.embeddingCorrection.afterThousands",
                  )}
                </p>
              </div>

              {/* Résumé : tous les poids corrigés */}
              <div className="bg-gray-800/50 rounded p-3 text-xs space-y-2">
                <p className="text-gray-300 font-semibold">
                  {t(
                    "training.backpropagation.calc.embeddingCorrection.recapTitle",
                  )}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-xs text-center">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-800">
                        <th className="p-1.5 text-left">
                          {t(
                            "training.backpropagation.calc.embeddingCorrection.colWeight",
                          )}
                        </th>
                        <th className="p-1.5">
                          {t(
                            "training.backpropagation.calc.embeddingCorrection.colOld",
                          )}
                        </th>
                        <th className="p-1.5">
                          {t(
                            "training.backpropagation.calc.embeddingCorrection.colGradient",
                          )}
                        </th>
                        <th className="p-1.5">
                          {t(
                            "training.backpropagation.calc.embeddingCorrection.colCorrection",
                          )}
                        </th>
                        <th className="p-1.5">
                          {t(
                            "training.backpropagation.calc.embeddingCorrection.colNew",
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {BP.exampleUpdates.map((u, i) => (
                        <tr key={i} className="border-b border-gray-900/50">
                          <td className="p-1.5 text-left text-gray-400">
                            {u.name}
                          </td>
                          <td className="p-1.5 text-white">
                            {u.old.toFixed(2)}
                          </td>
                          <td
                            className={`p-1.5 ${u.grad < 0 ? "text-blue-300" : "text-red-400"}`}
                          >
                            {fmt(u.grad)}
                          </td>
                          <td className="p-1.5 text-gray-400">
                            {fmt(-BP.lr * u.grad)}
                          </td>
                          <td className="p-1.5 text-green-400 font-bold">
                            {u.updated.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-gray-500 text-xs">
                  {t(
                    "training.backpropagation.calc.embeddingCorrection.recapExplanation",
                  )}{" "}
                  <Link
                    to="/training/optimizer"
                    className="text-primary-400 hover:underline"
                  >
                    {t(
                      "training.backpropagation.calc.embeddingCorrection.adamLink",
                    )}
                  </Link>{" "}
                  {t(
                    "training.backpropagation.calc.embeddingCorrection.adamAdapts",
                  )}
                </p>
              </div>
            </div>
          </ConcreteCalculation>

          {/* ─── Note : approche naïve vs Adam ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("training.backpropagation.calc.adamNote.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.backpropagation.calc.adamNote.simplified")}
            </p>
            <div className="bg-gray-900 rounded p-2 font-mono text-xs text-center">
              <span className="text-gray-400">
                w_nouveau = w_ancien − lr × gradient
              </span>
              <span className="text-gray-600 ml-2">
                ({t("training.backpropagation.calc.adamNote.naiveDescent")})
              </span>
            </div>
            <p className="text-gray-300 text-sm">
              {t("training.backpropagation.calc.adamNote.inReality")}
            </p>
            <div className="bg-gray-900 rounded p-2 font-mono text-xs text-center">
              <span className="text-amber-300">θ</span> = θ − α ×{" "}
              <span className="text-amber-300">m̂</span> / (
              <span className="text-purple-300">√v̂</span> + ε)
              <span className="text-gray-600 ml-2">(Adam)</span>
            </div>
            <p className="text-gray-400 text-xs">
              {t("training.backpropagation.calc.adamNote.detailsIn")}{" "}
              <Link
                to="/training/optimizer"
                className="text-primary-400 hover:underline font-semibold"
              >
                {t("training.backpropagation.calc.adamNote.step8Link")}
              </Link>
            </p>
          </div>

          {/* ─── En résumé ─── */}
          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-green-300 font-semibold text-sm">
              {t("training.backpropagation.calc.summary.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.backpropagation.calc.summary.objective")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-semibold w-16">
                  {t("training.backpropagation.calc.summary.input")}
                </span>
                <span className="text-gray-400">
                  {t("training.backpropagation.calc.summary.inputDesc")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-semibold w-16">
                  {t("training.backpropagation.calc.summary.principle")}
                </span>
                <span className="text-gray-400">
                  {t("training.backpropagation.calc.summary.principleDesc")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-semibold w-16">
                  {t("training.backpropagation.calc.summary.output")}
                </span>
                <span className="text-gray-400">
                  {t("training.backpropagation.calc.summary.outputDesc")}
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-xs">
              {t("training.backpropagation.calc.summary.repeated")}{" "}
              <Link
                to="/training/optimizer"
                className="text-primary-400 hover:underline"
              >
                {t("training.backpropagation.calc.summary.adamLink")}
              </Link>{" "}
              {t("training.backpropagation.calc.summary.usesGradients")}
            </p>
          </div>
        </div>
      }
      deepDive={
        <DeepDiveSection
          title={t("training.backpropagation.deepDive.title")}
          docSlug="loss"
          formulas={[
            {
              name: t("training.backpropagation.deepDive.chainRule.name"),
              latex:
                "\\frac{\\partial L}{\\partial W_i} = \\frac{\\partial L}{\\partial y} \\cdot \\frac{\\partial y}{\\partial h} \\cdot \\frac{\\partial h}{\\partial W_i}",
              explanation: t(
                "training.backpropagation.deepDive.chainRule.explanation",
              ),
            },
            {
              name: t("training.backpropagation.deepDive.crossEntropy.name"),
              latex:
                "\\frac{\\partial L}{\\partial \\text{logits}} = \\text{softmax}(\\text{logits}) - \\text{one\\_hot}(y)",
              explanation: t(
                "training.backpropagation.deepDive.crossEntropy.explanation",
              ),
            },
            {
              name: t(
                "training.backpropagation.deepDive.residualConnection.name",
              ),
              latex:
                "\\frac{\\partial (x + f(x))}{\\partial x} = 1 + \\frac{\\partial f(x)}{\\partial x}",
              explanation: t(
                "training.backpropagation.deepDive.residualConnection.explanation",
              ),
            },
          ]}
        />
      }
    />
  );
}
