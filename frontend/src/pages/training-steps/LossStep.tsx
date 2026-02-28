/**
 * Étape 6 : Calcul de l'Erreur — Mesurer les progrès
 *
 * Page enrichie avec :
 * - Algorithme complet : comment une phrase d'entraînement est décomposée
 * - Exemple simplifié sur "Le chat" (6 prédictions)
 * - Explication détaillée de la notion de logit
 * - Formule cross-entropy expliquée progressivement
 * - Évolution du loss pendant l'entraînement
 *
 * @module pages/training-steps/LossStep
 */

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import StepExplainer from "@/components/educational/StepExplainer";
import ConcreteCalculation from "@/components/educational/ConcreteCalculation";
import DeepDiveSection from "@/components/educational/DeepDiveSection";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";
import LossComparison from "@/components/visualizations/LossComparison";
import AnimatedMathOperation from "@/components/visualizations/AnimatedMathOperation";
import MatrixDisplay from "@/components/visualizations/MatrixDisplay";
import { EXAMPLE_LOSS, EXAMPLE_LOSS_DETAILED } from "@/lib/exampleData";

const LD = EXAMPLE_LOSS_DETAILED;

/** Formate un nombre avec signe explicite */
function fmt(v: number): string {
  return v >= 0 ? ` ${v.toFixed(2)}` : `−${Math.abs(v).toFixed(2)}`;
}

/** Formate un nombre pour la multiplication (parenthèses si négatif) */
function fmtMul(v: number): string {
  return v < 0 ? `(−${Math.abs(v).toFixed(2)})` : v.toFixed(2);
}

/** Cellule numérique à largeur fixe */
const NCELL = "inline-block min-w-[2.5rem] text-right";

/** Données de l'entraînement position par position pour « Le chat » */
function useFullTrainingPositions() {
  const { t } = useTranslation("pages");
  return [
    { pos: 0, context: "L", target: "e", prob: 0.35, loss: 1.05, note: "" },
    { pos: 1, context: "Le", target: " ", prob: 0.4, loss: 0.92, note: "" },
    {
      pos: 2,
      context: "Le ",
      target: "c",
      prob: 0.08,
      loss: 2.53,
      note: t("training.loss.data.note_pos2"),
    },
    { pos: 3, context: "Le c", target: "h", prob: 0.25, loss: 1.39, note: "" },
    {
      pos: 4,
      context: "Le ch",
      target: "a",
      prob: 0.55,
      loss: 0.6,
      note: t("training.loss.data.note_pos4"),
    },
    {
      pos: 5,
      context: "Le cha",
      target: "t",
      prob: 0.42,
      loss: 0.87,
      note: t("training.loss.data.note_pos5"),
    },
  ];
}

const AVERAGE_LOSS = (
  [1.05, 0.92, 2.53, 1.39, 0.6, 0.87].reduce((s, v) => s + v, 0) / 6
).toFixed(2);

export default function LossStep() {
  const { t } = useTranslation("pages");
  const FULL_TRAINING_POSITIONS = useFullTrainingPositions();
  return (
    <StepExplainer
      sectionId="training/loss"
      phase="training"
      stepNumber={6}
      totalSteps={8}
      title={t("training.loss.title")}
      subtitle={t("training.loss.subtitle")}
      exampleContext={t("training.loss.exampleContext")}
      docSlug="loss"
      explanation={
        <>
          {/* ─── Le problème ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("training.loss.problem.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.loss.problem.description1")}
            </p>
            <p className="text-gray-300 text-sm">
              {t("training.loss.problem.description2")}
            </p>
          </div>

          {/* ─── L'algorithme général ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-4">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("training.loss.algorithm.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.loss.algorithm.description1")}
            </p>
            <p className="text-gray-300 text-sm">
              {t("training.loss.algorithm.description2")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono space-y-1">
              <p className="text-gray-500">
                # {t("training.loss.algorithm.exerciseComment")}
              </p>
              <p className="mt-1">{t("training.loss.algorithm.exercise1")}</p>
              <p>{t("training.loss.algorithm.exercise2")}</p>
              <p>{t("training.loss.algorithm.exercise3")}</p>
              <p>{t("training.loss.algorithm.exercise4")}</p>
              <p>{t("training.loss.algorithm.exercise5")}</p>
              <p>{t("training.loss.algorithm.exercise6")}</p>
            </div>
            <p className="text-gray-400 text-xs">
              {t("training.loss.algorithm.note")}
            </p>
          </div>

          {/* ─── D'où vient la cible ? ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.loss.targetOrigin.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.loss.targetOrigin.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono overflow-x-auto">
              <table className="mx-auto text-center">
                <thead>
                  <tr className="text-gray-500">
                    <td className="px-1.5 py-1">
                      {t("training.loss.targetOrigin.tableHeaders.position")}
                    </td>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <td key={i} className="px-1.5 py-1">
                        {i}
                      </td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-1.5 py-1 text-blue-400">
                      {t("training.loss.targetOrigin.tableHeaders.input")}
                    </td>
                    {["L", "e", "⎵", "c", "h", "a"].map((c, i) => (
                      <td key={i} className="px-1.5 py-1 text-white">
                        {c}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-1.5 py-1 text-green-400">
                      {t("training.loss.targetOrigin.tableHeaders.target")}
                    </td>
                    {["e", "⎵", "c", "h", "a", "t"].map((c, i) => (
                      <td key={i} className="px-1.5 py-1 text-green-400">
                        {c}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-400 text-xs">
              {t("training.loss.targetOrigin.note")}
            </p>
          </div>

          {/* ─── Avec des millions de textes ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.loss.millionsOfTexts.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.loss.millionsOfTexts.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono space-y-1">
              <p>{t("training.loss.millionsOfTexts.example1")}</p>
              <p>{t("training.loss.millionsOfTexts.example2")}</p>
              <p>{t("training.loss.millionsOfTexts.example3")}</p>
              <p>{t("training.loss.millionsOfTexts.example4")}</p>
            </div>
            <p className="text-gray-300 text-sm">
              {t("training.loss.millionsOfTexts.averaging")}
            </p>
            <p className="text-gray-400 text-xs">
              {t("training.loss.millionsOfTexts.contextNote")}
            </p>
          </div>

          {/* ─── Pont vers le calcul concret ─── */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 space-y-2">
            <h4 className="text-blue-300 font-semibold text-sm">
              {t("training.loss.howLossCalculated.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.loss.howLossCalculated.description")}
            </p>
            <p className="text-gray-400 text-xs">
              {t("training.loss.howLossCalculated.calculationNote")}
            </p>
          </div>

          {/* ─── Le loss sur TOUTE la phrase ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.loss.totalLoss.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("training.loss.totalLoss.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono">
              <p className="text-gray-500">
                # {t("training.loss.totalLoss.formulaComment")}
              </p>
              <p className="mt-1">
                Loss = (
                <span className="text-gray-400">
                  loss₀ + loss₁ + ... + loss₅
                </span>
                ) / 6 = <strong className="text-white">{AVERAGE_LOSS}</strong>
              </p>
            </div>
            <p className="text-gray-400 text-xs">
              {t("training.loss.totalLoss.summary")}
            </p>
          </div>

          {/* ─── Entraînement sur plusieurs phrases ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.loss.multipleSentences.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("training.loss.multipleSentences.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono space-y-1">
              <p className="text-gray-500">
                # {t("training.loss.multipleSentences.corpusComment")}
              </p>
              <p>
                {t("training.loss.multipleSentences.sentence1", {
                  loss: AVERAGE_LOSS,
                })}
              </p>
              <p>{t("training.loss.multipleSentences.sentence2")}</p>
              <p>{t("training.loss.multipleSentences.sentence3")}</p>
              <p className="text-gray-500 mt-1">
                # {t("training.loss.multipleSentences.batchLossComment")}
              </p>
            </div>
            <p className="text-gray-400 text-xs">
              {t("training.loss.multipleSentences.note")}
            </p>
          </div>
        </>
      }
      calculation={
        <div className="space-y-8">
          {/* ─── Visualisation interactive existante ─── */}
          <ConcreteCalculation
            title={t("training.loss.calculation.zoomTitle")}
            description={t("training.loss.calculation.zoomDescription")}
          >
            <LossComparison
              context={EXAMPLE_LOSS.context}
              target={EXAMPLE_LOSS.target}
              predictions={EXAMPLE_LOSS.predictions}
              lossValue={EXAMPLE_LOSS.lossValue}
              formula={EXAMPLE_LOSS.formula}
            />
          </ConcreteCalculation>

          {/* ─── Tableau des 6 positions ─── */}
          <ConcreteCalculation
            title={t("training.loss.calculation.sixExercisesTitle")}
            description={t("training.loss.calculation.sixExercisesDescription")}
          >
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-800">
                      <th className="p-1.5 text-left">
                        {t("training.loss.calculation.tableHeaders.exercise")}
                      </th>
                      <th className="p-1.5 text-left">
                        {t("training.loss.calculation.tableHeaders.context")}
                      </th>
                      <th className="p-1.5 text-center">
                        {t("training.loss.calculation.tableHeaders.predict")}
                      </th>
                      <th className="p-1.5 text-center">
                        {t("training.loss.calculation.tableHeaders.pGood")}
                      </th>
                      <th className="p-1.5 text-center">
                        {t("training.loss.calculation.tableHeaders.loss")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FULL_TRAINING_POSITIONS.map((p) => {
                      const isDetailed = p.pos === 5; // exercice détaillé ci-dessous
                      const bgClass = isDetailed
                        ? "bg-primary-900/20 border-l-2 border-primary-500"
                        : p.loss < 0.5
                          ? "bg-green-900/5"
                          : p.loss > 2
                            ? "bg-red-900/10"
                            : "";
                      return (
                        <tr
                          key={p.pos}
                          className={`${bgClass} border-b border-gray-900/50 hover:bg-gray-800/50`}
                        >
                          <td className="p-1.5 text-gray-600">{p.pos}</td>
                          <td className="p-1.5">
                            <span className="text-blue-300">«{p.context}»</span>
                          </td>
                          <td className="p-1.5 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded ${isDetailed ? "bg-primary-800/40 text-primary-300 font-bold" : "text-green-400"}`}
                            >
                              {p.target === " " ? "⎵" : p.target}
                            </span>
                          </td>
                          <td className="p-1.5 text-center">
                            <span
                              className={
                                p.prob >= 0.7
                                  ? "text-green-400"
                                  : p.prob >= 0.3
                                    ? "text-amber-400"
                                    : "text-red-400"
                              }
                            >
                              {(p.prob * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="p-1.5 text-center">
                            <span
                              className={
                                p.loss < 0.5
                                  ? "text-green-400"
                                  : p.loss < 1.5
                                    ? "text-amber-400"
                                    : "text-red-400"
                              }
                            >
                              {p.loss.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-700">
                      <td
                        colSpan={4}
                        className="p-2 text-right text-gray-400 font-semibold"
                      >
                        {t("training.loss.calculation.footerLabel")}
                      </td>
                      <td className="p-2 text-center text-white font-bold">
                        {AVERAGE_LOSS}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Légende du tableau */}
              <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-900/20 border border-green-800/30" />
                  <span>{t("training.loss.calculation.legendEasy")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-900/20 border border-red-800/30" />
                  <span>{t("training.loss.calculation.legendHard")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-primary-900/30 border-l-2 border-primary-500" />
                  <span>{t("training.loss.calculation.legendDetailed")}</span>
                </div>
              </div>

              {/* Observations */}
              <div className="bg-gray-800/50 rounded p-3 space-y-2 text-xs">
                <p className="text-gray-300 font-semibold">
                  {t("training.loss.calculation.observations.title")}
                </p>
                <p className="text-gray-400">
                  {t("training.loss.calculation.observations.hardest")}
                </p>
                <p className="text-gray-400">
                  {t("training.loss.calculation.observations.easiest")}
                </p>
                <p className="text-gray-400">
                  {t("training.loss.calculation.observations.detailed")}
                </p>
              </div>
            </div>
          </ConcreteCalculation>

          {/* ─── Évolution pendant l'entraînement ─── */}
          <ConcreteCalculation
            title={t("training.loss.calculation.evolutionTitle")}
            description={t("training.loss.calculation.evolutionDescription")}
          >
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    epoch: t("training.loss.calculation.evolutionEpochs.start"),
                    prob: 14,
                    loss: 1.95,
                    desc: t("training.loss.calculation.evolutionSteps.start"),
                  },
                  {
                    epoch: t(
                      "training.loss.calculation.evolutionEpochs.iter100",
                    ),
                    prob: 20,
                    loss: 1.61,
                    desc: t("training.loss.calculation.evolutionSteps.iter100"),
                  },
                  {
                    epoch: t(
                      "training.loss.calculation.evolutionEpochs.iter500",
                    ),
                    prob: 42,
                    loss: 0.87,
                    desc: t("training.loss.calculation.evolutionSteps.iter500"),
                  },
                  {
                    epoch: t(
                      "training.loss.calculation.evolutionEpochs.iter2000",
                    ),
                    prob: 75,
                    loss: 0.29,
                    desc: t(
                      "training.loss.calculation.evolutionSteps.iter2000",
                    ),
                  },
                  {
                    epoch: t(
                      "training.loss.calculation.evolutionEpochs.iter5000",
                    ),
                    prob: 92,
                    loss: 0.08,
                    desc: t(
                      "training.loss.calculation.evolutionSteps.iter5000",
                    ),
                  },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-32 text-xs text-gray-500 text-right shrink-0">
                      {step.epoch}
                    </div>
                    <div className="flex-1 bg-gray-900 rounded-full h-5 overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all bg-gradient-to-r from-red-500 via-amber-500 to-green-500"
                        style={{ width: `${step.prob}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white">
                        P({t("training.loss.calculation.evolutionBarGood")}) ={" "}
                        {step.prob}% → loss = {step.loss}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs text-center">
                {t("training.loss.calculation.evolutionNote")}
              </p>
            </div>
          </ConcreteCalculation>

          {/* ─── Pipeline d'un exercice ─── */}
          <ConcreteCalculation
            title={t("training.loss.calculation.pipelineTitle")}
            description={t("training.loss.calculation.pipelineDescription")}
          >
            <div className="space-y-0">
              {/* Sortie FFN */}
              <div className="bg-blue-900/10 border border-blue-800/30 rounded p-2.5 flex items-center gap-3">
                <div className="shrink-0">
                  <div className="text-blue-300 font-semibold text-xs">
                    {t("training.loss.calculation.pipelineLabels.ffnOutput")}
                  </div>
                  <div className="text-gray-500 text-[10px]">
                    {LD.ffnOutputPos5.length}{" "}
                    {t("training.loss.calculation.pipelineLabels.values")}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-gray-400 truncate">
                  [{LD.ffnOutputPos5.map((v) => v.toFixed(2)).join(", ")}]
                </div>
              </div>
              <div className="flex items-center gap-2 pl-6 py-1">
                <span className="text-gray-600">↓</span>
                <span className="text-gray-500 text-[10px] font-mono">
                  × W_out ({LD.ffnOutputPos5.length}×{LD.vocabOrder.length})
                </span>
              </div>

              {/* Logits */}
              <div className="bg-amber-900/10 border border-amber-800/30 rounded p-2.5 flex items-center gap-3">
                <div className="shrink-0">
                  <div className="text-amber-300 font-semibold text-xs">
                    {t("training.loss.calculation.pipelineLabels.logits")}
                  </div>
                  <div className="text-gray-500 text-[10px]">
                    {LD.vocabOrder.length}{" "}
                    {t(
                      "training.loss.calculation.pipelineLabels.logitsSubtitle",
                    )}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-gray-400 truncate">
                  [
                  {LD.logits
                    .map((v) => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2)))
                    .join(", ")}
                  ]
                </div>
              </div>
              <div className="flex items-center gap-2 pl-6 py-1">
                <span className="text-gray-600">↓</span>
                <span className="text-gray-500 text-[10px] font-mono">
                  softmax
                </span>
              </div>

              {/* Probabilités */}
              <div className="bg-green-900/10 border border-green-800/30 rounded p-2.5 flex items-center gap-3">
                <div className="shrink-0">
                  <div className="text-green-300 font-semibold text-xs">
                    {t(
                      "training.loss.calculation.pipelineLabels.probabilities",
                    )}
                  </div>
                  <div className="text-gray-500 text-[10px]">
                    {LD.vocabOrder.length}{" "}
                    {t(
                      "training.loss.calculation.pipelineLabels.probabilitiesSubtitle",
                    )}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-gray-400 truncate">
                  P(t)=42.1%, P(e)=18.0%, P(⎵)=15.0%, ...
                </div>
              </div>
              <div className="flex items-center gap-2 pl-6 py-1">
                <span className="text-gray-600">↓</span>
                <span className="text-gray-500 text-[10px] font-mono">
                  −log(P(
                  {t("training.loss.calculation.pipelineLabels.goodToken")}))
                </span>
              </div>

              {/* Loss */}
              <div className="bg-amber-900/10 border border-amber-800/30 rounded p-2.5 flex items-center gap-3">
                <div className="shrink-0">
                  <div className="text-amber-300 font-semibold text-xs">
                    {t("training.loss.calculation.pipelineLabels.loss")}
                  </div>
                  <div className="text-gray-500 text-[10px]">
                    {t("training.loss.calculation.pipelineLabels.lossSubtitle")}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-gray-400 truncate">
                  −log(0.42) = {LD.loss.toFixed(3)}
                </div>
              </div>

              {/* Gradient */}
              <div className="flex items-center gap-2 pl-6 py-1">
                <span className="text-gray-600">↓</span>
                <span className="text-gray-500 text-[10px] font-mono">
                  {t(
                    "training.loss.calculation.pipelineLabels.gradientFormula",
                  )}
                </span>
              </div>
              <div className="bg-purple-900/10 border border-purple-800/30 rounded p-2.5 flex items-center gap-3">
                <div className="shrink-0">
                  <div className="text-purple-300 font-semibold text-xs">
                    {t("training.loss.calculation.pipelineLabels.gradient")}
                  </div>
                  <div className="text-gray-500 text-[10px]">
                    {LD.vocabOrder.length}{" "}
                    {t("training.loss.calculation.pipelineLabels.values")}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-gray-400 truncate">
                  t: <span className="text-blue-400">−0.58</span> (↑), e:{" "}
                  <span className="text-red-400">+0.18</span> (↓), ⎵:{" "}
                  <span className="text-red-400">+0.15</span> (↓), ...
                </div>
              </div>

              {/* Rétropropagation */}
              <div className="flex items-center gap-2 pl-6 py-1">
                <span className="text-gray-600">↓</span>
              </div>
              <div className="bg-primary-900/10 border border-primary-800/30 rounded p-2.5 text-center">
                <span className="text-primary-300 text-xs font-semibold">
                  {t(
                    "training.loss.calculation.pipelineLabels.retropropagation",
                  )}
                </span>
                <span className="text-gray-500 text-[10px] ml-2">
                  {t(
                    "training.loss.calculation.pipelineLabels.retropropagationNote",
                  )}
                </span>
              </div>
            </div>

            <p className="text-gray-500 text-xs mt-3">
              {t("training.loss.calculation.pipelineNote")}
            </p>
          </ConcreteCalculation>

          {/* ─── Calcul concret : du logit au loss ─── */}
          <ConcreteCalculation
            title={t("training.loss.calculation.concreteTitle")}
            description={t("training.loss.calculation.concreteDescription")}
          >
            <div className="space-y-6">
              {/* D'abord : les logits — un score par token */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.loss.calculation.logitsTitle")}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.loss.calculation.logitsDescription1")}
                </p>
                <p className="text-sm text-gray-400">
                  {t("training.loss.calculation.logitsDescription2")}
                </p>

                {/* Animated matrix multiplication: FFN_output × W_out = logits */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation
                    totalSteps={LD.vocabOrder.length}
                    delay={800}
                  >
                    {(step) => {
                      const fOut = LD.ffnOutputPos5;
                      return (
                        <div className="space-y-3">
                          {/* W_out matrix with column highlighting */}
                          <MatrixDisplay
                            data={LD.W_out}
                            title={t("training.loss.calculation.wOutTitle")}
                            shape={`(${LD.ffnOutputPos5.length} × ${LD.vocabOrder.length})`}
                            rowLabels={["d₀", "d₁", "d₂", "d₃"]}
                            colLabels={[...LD.vocabOrder]}
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

                          {/* FFN output vector (input) */}
                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              {t("training.loss.calculation.ffnOutputLabel")} :
                            </p>
                            <div className="flex items-center gap-1">
                              [
                              {fOut.map((v, i) => (
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
                                  {i < fOut.length - 1 && (
                                    <span className="text-gray-700">, </span>
                                  )}
                                </span>
                              ))}
                              ]
                            </div>
                          </div>

                          {/* Progressive result: logits */}
                          <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                            <p className="text-gray-500 mb-1">
                              {t("training.loss.calculation.logitsEquation")} :
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                              [
                              {LD.vocabOrder.map((tok, j) => {
                                const vis = step === -1 || step >= j;
                                const act = step === j;
                                const isTarget = j === LD.targetIndex;
                                return (
                                  <span key={j}>
                                    <span
                                      className={`${NCELL} transition-all duration-300 ${
                                        act
                                          ? "text-amber-300 font-bold ring-2 ring-amber-500/40 bg-amber-500/10 rounded px-0.5"
                                          : vis
                                            ? isTarget
                                              ? "text-green-400 font-bold"
                                              : LD.logits[j] > 0
                                                ? "text-amber-300"
                                                : "text-gray-500"
                                            : "text-gray-700"
                                      }`}
                                    >
                                      {vis ? fmt(LD.logits[j]) : "____"}
                                    </span>
                                    {j < LD.vocabOrder.length - 1 && (
                                      <span className="text-gray-700">, </span>
                                    )}
                                  </span>
                                );
                              })}
                              ]
                            </div>
                            {/* Token labels */}
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

                          {/* Detailed dot product for active step */}
                          {step >= 0 &&
                            (() => {
                              const col = LD.W_out.map((row) => row[step]);
                              const isTarget = step === LD.targetIndex;
                              return (
                                <div className="border-t border-gray-800 pt-2 text-xs font-mono space-y-1">
                                  <p className="text-gray-500">
                                    logit(
                                    <span
                                      className={
                                        isTarget
                                          ? "text-green-400"
                                          : "text-gray-300"
                                      }
                                    >
                                      « {LD.vocabOrder[step]} »
                                    </span>
                                    ) = Σ(FFN[k] × W_out[k][{step}]) :
                                  </p>
                                  <div className="flex items-center gap-1 flex-wrap text-[11px]">
                                    {fOut.map((xv, k) => (
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
                                          {fmtMul(col[k])}
                                        </span>
                                      </span>
                                    ))}
                                    <span className="text-gray-600 mx-1">
                                      =
                                    </span>
                                    <span
                                      className={`font-bold ${isTarget ? "text-green-400" : LD.logits[step] > 0 ? "text-amber-300" : "text-gray-400"}`}
                                    >
                                      {fmt(LD.logits[step])}
                                    </span>
                                  </div>
                                </div>
                              );
                            })()}

                          {/* Summary when done: sorted with bars */}
                          {(step >= LD.vocabOrder.length - 1 ||
                            step === -1) && (
                            <div className="border-t border-gray-800 pt-3 mt-3 space-y-1">
                              <p className="text-xs text-gray-500 mb-2">
                                {t("training.loss.calculation.logitsSorted")}
                              </p>
                              {[
                                ...LD.vocabOrder.map((tok, i) => ({
                                  tok,
                                  logit: LD.logits[i],
                                  i,
                                })),
                              ]
                                .sort((a, b) => b.logit - a.logit)
                                .map(({ tok, logit, i }) => {
                                  const isTarget = i === LD.targetIndex;
                                  const barPct = Math.max(
                                    2,
                                    ((logit + 2) / 3.6) * 100,
                                  );
                                  return (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2 font-mono text-xs"
                                    >
                                      <span
                                        className={`w-3 font-semibold ${isTarget ? "text-green-400" : "text-gray-400"}`}
                                      >
                                        {tok}
                                      </span>
                                      <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden max-w-[140px]">
                                        <div
                                          className={`h-full rounded-full ${isTarget ? "bg-green-500" : logit > 0 ? "bg-amber-500/60" : "bg-gray-600/40"}`}
                                          style={{ width: `${barPct}%` }}
                                        />
                                      </div>
                                      <span
                                        className={`w-12 text-right ${isTarget ? "text-green-400 font-bold" : logit > 0 ? "text-amber-300" : "text-gray-500"}`}
                                      >
                                        {fmt(logit)}
                                      </span>
                                    </div>
                                  );
                                })}
                              <p className="text-xs text-gray-500 mt-2">
                                {t("training.loss.calculation.logitsSortNote")}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </AnimatedMathOperation>
                </div>

                {/* Sortie finale : vecteur logits */}
                <div className="bg-amber-900/10 border border-amber-800/30 rounded p-3 space-y-1">
                  <p className="text-amber-300 font-semibold text-[10px] uppercase tracking-wide">
                    ▸{" "}
                    {t("training.loss.calculation.logitsOutputLabel", {
                      count: LD.vocabOrder.length,
                    })}
                  </p>
                  <div className="font-mono text-xs flex flex-wrap gap-1">
                    {LD.vocabOrder.map((tok, i) => {
                      const isTarget = i === LD.targetIndex;
                      return (
                        <div
                          key={i}
                          className={`px-1.5 py-1 rounded text-center ${
                            isTarget
                              ? "bg-green-900/30 border border-green-700/40"
                              : LD.logits[i] > 0
                                ? "bg-amber-900/20 border border-amber-800/30"
                                : "bg-gray-800/50"
                          }`}
                        >
                          <div
                            className={`text-[10px] ${isTarget ? "text-green-300 font-bold" : "text-gray-500"}`}
                          >
                            {tok}
                          </div>
                          <div
                            className={`font-semibold ${
                              isTarget
                                ? "text-green-400"
                                : LD.logits[i] > 0
                                  ? "text-amber-300"
                                  : "text-gray-500"
                            }`}
                          >
                            {fmt(LD.logits[i])}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-gray-600 text-[10px]">
                    {t("training.loss.calculation.logitsNotProbabilities")}
                  </p>
                </div>
              </div>

              {/* Étape 1 : Softmax (logits → probabilités) */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.loss.calculation.softmaxTitle")}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.loss.calculation.softmaxDescription")}
                </p>

                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation
                    totalSteps={LD.vocabOrder.length}
                    delay={600}
                  >
                    {(step) => (
                      <div className="space-y-3">
                        {/* Logits row (always visible) */}
                        <div className="font-mono text-xs">
                          <p className="text-gray-500 mb-1">
                            {t("training.loss.calculation.logitsRawScores")} :
                          </p>
                          <div className="flex items-center gap-0.5 flex-wrap">
                            [
                            {LD.logits.map((v, i) => {
                              const act = step === i;
                              const isTarget = i === LD.targetIndex;
                              return (
                                <span key={i}>
                                  <span
                                    className={`${NCELL} transition-all duration-300 ${
                                      act
                                        ? "text-white ring-2 ring-primary-500/40 bg-primary-500/10 rounded px-0.5"
                                        : isTarget
                                          ? "text-green-300/60"
                                          : "text-gray-400"
                                    }`}
                                  >
                                    {fmt(v)}
                                  </span>
                                  {i < LD.logits.length - 1 && (
                                    <span className="text-gray-700">,</span>
                                  )}
                                </span>
                              );
                            })}
                            ]
                          </div>
                          {/* Token labels */}
                          <div className="flex items-center gap-0.5 flex-wrap mt-0.5">
                            <span className="text-transparent">[</span>
                            {LD.vocabOrder.map((tok, i) => (
                              <span key={i}>
                                <span
                                  className={`${NCELL} text-[10px] ${i === LD.targetIndex ? "text-green-400 font-bold" : "text-gray-600"}`}
                                >
                                  {tok === "⎵" ? "⎵" : tok}
                                </span>
                                {i < LD.vocabOrder.length - 1 && (
                                  <span className="text-transparent">,</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Progressive softmax results */}
                        <div className="font-mono text-xs space-y-0.5 mt-2">
                          <p className="text-gray-500 mb-1">
                            P(token) = exp(logit) / {LD.sumExp.toFixed(1)} :
                          </p>
                          {LD.vocabOrder.map((tok, i) => {
                            const vis = step === -1 || step >= i;
                            const act = step === i;
                            const prob = LD.probabilities[i];
                            const isTarget = i === LD.targetIndex;
                            const barPct = Math.round(
                              (prob / LD.probabilities[LD.targetIndex]) * 100,
                            );
                            if (!vis) return null;
                            return (
                              <div
                                key={i}
                                className={`flex items-center gap-2 rounded py-0.5 px-1 transition-all duration-300 ${
                                  act
                                    ? "ring-1 ring-primary-500/30 bg-primary-500/5"
                                    : ""
                                }`}
                              >
                                <span
                                  className={`w-3 text-center font-semibold ${isTarget ? "text-green-400" : "text-gray-500"}`}
                                >
                                  {tok}
                                </span>
                                <span className="text-gray-600 text-[10px] w-44">
                                  exp({fmt(LD.logits[i])}) ={" "}
                                  {LD.expLogits[i].toFixed(2)} /{" "}
                                  {LD.sumExp.toFixed(1)}
                                </span>
                                <span className="text-gray-600">=</span>
                                <span
                                  className={`w-12 text-right font-semibold ${
                                    isTarget
                                      ? "text-green-400"
                                      : prob >= 0.05
                                        ? "text-amber-300"
                                        : "text-gray-500"
                                  }`}
                                >
                                  {(prob * 100).toFixed(1)}%
                                </span>
                                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden max-w-[120px]">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      isTarget ? "bg-green-500" : "bg-gray-600"
                                    }`}
                                    style={{ width: `${Math.max(barPct, 1)}%` }}
                                  />
                                </div>
                                {isTarget && (
                                  <span className="text-green-400 text-[10px]">
                                    {t(
                                      "training.loss.annotations.correctToken",
                                    )}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Summary when done */}
                        {(step >= LD.vocabOrder.length - 1 || step === -1) && (
                          <div className="border-t border-gray-800 pt-2 mt-2 text-xs">
                            <p className="text-gray-500 text-[10px]">
                              {t("training.loss.calculation.softmaxNote")}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </AnimatedMathOperation>
                </div>

                {/* Sortie finale : vecteur de probabilités */}
                <div className="bg-green-900/10 border border-green-800/30 rounded p-3 space-y-1">
                  <p className="text-green-300 font-semibold text-[10px] uppercase tracking-wide">
                    ▸{" "}
                    {t("training.loss.calculation.softmaxOutputLabel", {
                      count: LD.vocabOrder.length,
                    })}
                  </p>
                  <div className="font-mono text-xs flex flex-wrap gap-1">
                    {LD.vocabOrder.map((tok, i) => {
                      const isTarget = i === LD.targetIndex;
                      const prob = LD.probabilities[i];
                      const barH = Math.max(
                        4,
                        Math.round(
                          (prob / LD.probabilities[LD.targetIndex]) * 24,
                        ),
                      );
                      return (
                        <div
                          key={i}
                          className={`px-1.5 py-1 rounded text-center min-w-[2.5rem] ${
                            isTarget
                              ? "bg-green-900/30 border border-green-700/40"
                              : "bg-gray-800/50"
                          }`}
                        >
                          <div className="flex justify-center mb-0.5">
                            <div
                              className={`w-3 rounded-t ${isTarget ? "bg-green-500" : "bg-gray-600"}`}
                              style={{ height: `${barH}px` }}
                            />
                          </div>
                          <div
                            className={`font-semibold ${
                              isTarget
                                ? "text-green-400"
                                : prob >= 0.1
                                  ? "text-amber-300"
                                  : "text-gray-500"
                            }`}
                          >
                            {(prob * 100).toFixed(1)}%
                          </div>
                          <div
                            className={`text-[10px] ${isTarget ? "text-green-300 font-bold" : "text-gray-500"}`}
                          >
                            {tok}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Étape 2 : Cross-Entropy Loss */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.loss.calculation.crossEntropyTitle")}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.loss.calculation.crossEntropyDescription")}
                </p>
                <p className="text-sm text-gray-400">
                  {t("training.loss.calculation.crossEntropyWhy")}
                </p>

                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation totalSteps={4} delay={900}>
                    {(step) => {
                      const rows = [
                        {
                          prob: "1.00",
                          pct: "100%",
                          loss: "0.00",
                          probColor: "text-green-400",
                          lossColor: "text-green-400",
                          note: t(
                            "training.loss.calculation.crossEntropyExamples.perfect",
                          ),
                        },
                        {
                          prob: "0.42",
                          pct: "42%",
                          loss: "0.87",
                          probColor: "text-green-400",
                          lossColor: "text-amber-400",
                          note: t(
                            "training.loss.calculation.crossEntropyExamples.ourCase",
                          ),
                        },
                        {
                          prob: "0.14",
                          pct: "14%",
                          loss: "1.97",
                          probColor: "text-red-400",
                          lossColor: "text-red-400",
                          note: t(
                            "training.loss.calculation.crossEntropyExamples.random",
                          ),
                        },
                        {
                          prob: "0.01",
                          pct: "1%",
                          loss: "4.60",
                          probColor: "text-red-400",
                          lossColor: "text-red-400",
                          note: t(
                            "training.loss.calculation.crossEntropyExamples.veryBad",
                          ),
                        },
                      ];
                      return (
                        <div className="font-mono text-xs space-y-2">
                          {rows.map((r, i) => {
                            const visible = step === -1 || step >= i;
                            const active = step === i;
                            return (
                              <p
                                key={i}
                                className={`transition-all duration-300 ${!visible ? "opacity-0 h-0 overflow-hidden" : ""}`}
                              >
                                {t("training.loss.calculation.crossEntropyIf")}{" "}
                                P(
                                {t(
                                  "training.loss.calculation.crossEntropyGood",
                                )}
                                ) ={" "}
                                <span
                                  className={
                                    active
                                      ? `${r.probColor} ring-2 ring-current/40 bg-current/10 rounded px-0.5`
                                      : r.probColor
                                  }
                                >
                                  {r.prob}
                                </span>{" "}
                                ({r.pct}) → Loss = −log({r.prob}) ={" "}
                                <strong
                                  className={
                                    active
                                      ? `${r.lossColor} ring-2 ring-current/40 bg-current/10 rounded px-0.5`
                                      : r.lossColor
                                  }
                                >
                                  {r.loss}
                                </strong>{" "}
                                <span className="text-gray-600">{r.note}</span>
                              </p>
                            );
                          })}
                          {(step >= 3 || step === -1) && (
                            <div className="border-t border-gray-800 pt-2 mt-2">
                              <p className="text-gray-300">
                                {t(
                                  "training.loss.calculation.crossEntropyOurModel",
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </AnimatedMathOperation>
                </div>

                {/* Sortie finale : loss */}
                <div className="bg-amber-900/10 border border-amber-800/30 rounded p-3 space-y-1">
                  <p className="text-amber-300 font-semibold text-[10px] uppercase tracking-wide">
                    ▸ {t("training.loss.calculation.lossOutputLabel")}
                  </p>
                  <div className="font-mono text-sm flex items-center gap-3">
                    <span className="text-gray-400">
                      Loss = −log(P(« t »)) = −log(0.42) =
                    </span>
                    <span className="text-amber-300 font-bold text-lg">
                      0.866
                    </span>
                  </div>
                  <p className="text-gray-600 text-[10px]">
                    {t("training.loss.calculation.crossEntropyResult")}
                  </p>
                </div>
              </div>

              {/* Étape 3 : Gradient (softmax − one_hot) */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.loss.calculation.gradientTitle")}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.loss.calculation.gradientDescription")}
                </p>

                {/* One-hot vector */}
                <div className="bg-gray-900 rounded p-3 font-mono text-xs overflow-x-auto">
                  <p className="text-gray-500 mb-1">
                    # {t("training.loss.calculation.gradientOneHotComment")}
                  </p>
                  <div className="flex flex-wrap gap-0.5">
                    {LD.vocabOrder.map((tok, i) => {
                      const isTarget = i === LD.targetIndex;
                      return (
                        <div
                          key={i}
                          className={`px-1.5 py-1 rounded text-center ${
                            isTarget
                              ? "bg-green-900/40 border border-green-700/50"
                              : "bg-gray-800/50"
                          }`}
                        >
                          <div
                            className={`text-[10px] ${isTarget ? "text-green-300" : "text-gray-600"}`}
                          >
                            {tok}
                          </div>
                          <div
                            className={`font-bold ${isTarget ? "text-green-400" : "text-gray-700"}`}
                          >
                            {isTarget ? "1" : "0"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Gradient animation */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation
                    totalSteps={LD.vocabOrder.length}
                    delay={500}
                  >
                    {(step) => (
                      <div className="font-mono text-xs space-y-0.5">
                        <p className="text-gray-500 mb-1">
                          gradient = P(token) − one_hot :
                        </p>
                        {LD.vocabOrder.map((tok, i) => {
                          const vis = step === -1 || step >= i;
                          const act = step === i;
                          const g = LD.gradient[i];
                          const isTarget = i === LD.targetIndex;
                          const prob = LD.probabilities[i];
                          if (!vis) return null;
                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-2 rounded py-0.5 px-1 transition-all duration-300 ${
                                act
                                  ? "ring-1 ring-primary-500/30 bg-primary-500/5"
                                  : ""
                              }`}
                            >
                              <span
                                className={`w-3 text-center font-semibold ${isTarget ? "text-green-400" : "text-gray-500"}`}
                              >
                                {tok}
                              </span>
                              <span className="text-gray-600 text-[10px] w-28">
                                {prob.toFixed(4)} − {isTarget ? "1" : "0"}
                              </span>
                              <span className="text-gray-600">=</span>
                              <span
                                className={`w-16 text-right font-semibold ${
                                  isTarget ? "text-blue-400" : "text-red-400"
                                }`}
                              >
                                {g >= 0 ? "+" : ""}
                                {g.toFixed(4)}
                              </span>
                              <span
                                className={`text-[10px] ${isTarget ? "text-blue-300" : g > 0.05 ? "text-red-300" : "text-gray-600"}`}
                              >
                                {isTarget
                                  ? t(
                                      "training.loss.calculation.gradientIncreaseTarget",
                                    )
                                  : g > 0.05
                                    ? `${t("training.loss.annotations.decrease")} (${(g * 100).toFixed(1)}%)`
                                    : ""}
                              </span>
                            </div>
                          );
                        })}

                        {(step >= LD.vocabOrder.length - 1 || step === -1) && (
                          <div className="border-t border-gray-800 pt-2 mt-2 space-y-1">
                            <p className="text-gray-300 text-xs">
                              {t("training.loss.calculation.gradientStrongest")}
                            </p>
                            <p className="text-gray-300 text-xs">
                              {t("training.loss.calculation.gradientSecond")}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </AnimatedMathOperation>
                </div>

                {/* Sortie finale : vecteur gradient */}
                <div className="bg-purple-900/10 border border-purple-800/30 rounded p-3 space-y-2">
                  <p className="text-purple-300 font-semibold text-[10px] uppercase tracking-wide">
                    ▸ {t("training.loss.calculation.gradientOutputLabel")} (
                    {LD.vocabOrder.length}{" "}
                    {t("training.loss.calculation.pipelineLabels.values")})
                  </p>
                  <div className="font-mono text-xs flex flex-wrap gap-1">
                    {LD.vocabOrder.map((tok, i) => {
                      const isTarget = i === LD.targetIndex;
                      const g = LD.gradient[i];
                      return (
                        <div
                          key={i}
                          className={`px-1.5 py-1 rounded text-center min-w-[2.5rem] ${
                            isTarget
                              ? "bg-blue-900/30 border border-blue-700/40"
                              : g > 0.1
                                ? "bg-red-900/20 border border-red-800/30"
                                : "bg-gray-800/50"
                          }`}
                        >
                          <div
                            className={`text-[10px] ${isTarget ? "text-blue-300 font-bold" : "text-gray-500"}`}
                          >
                            {tok}
                          </div>
                          <div
                            className={`font-semibold ${isTarget ? "text-blue-400" : "text-red-400"}`}
                          >
                            {g >= 0 ? "+" : ""}
                            {g.toFixed(4)}
                          </div>
                          <div
                            className={`text-[9px] mt-0.5 ${isTarget ? "text-blue-300" : g > 0.1 ? "text-red-300" : "text-gray-600"}`}
                          >
                            {isTarget
                              ? t("training.loss.annotations.increase")
                              : g > 0.1
                                ? t("training.loss.annotations.decreaseArrow")
                                : "↓"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-gray-500 text-[10px]">
                    {t("training.loss.calculation.gradientRetropropNote")}
                  </p>
                </div>
              </div>
            </div>
          </ConcreteCalculation>

          {/* ─── D'un exercice au batch ─── */}
          <ConcreteCalculation
            title={t("training.loss.batchTitle")}
            description={t("training.loss.batchDescription")}
          >
            <div className="space-y-4">
              {/* Tableau avec gradient dominant */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-800">
                      <th className="p-1.5 text-left">
                        {t("training.loss.batchTableHeaders.exercise")}
                      </th>
                      <th className="p-1.5 text-left">
                        {t("training.loss.batchTableHeaders.context")}
                      </th>
                      <th className="p-1.5 text-center">
                        {t("training.loss.batchTableHeaders.loss")}
                      </th>
                      <th className="p-1.5 text-left">
                        {t("training.loss.batchTableHeaders.dominantGradient")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FULL_TRAINING_POSITIONS.map((p) => {
                      const isDetailed = p.pos === 5;
                      return (
                        <tr
                          key={p.pos}
                          className={`border-b border-gray-900/50 ${isDetailed ? "bg-primary-900/20 border-l-2 border-primary-500" : ""}`}
                        >
                          <td className="p-1.5 text-gray-600">{p.pos}</td>
                          <td className="p-1.5">
                            <span className="text-blue-300">«{p.context}»</span>
                            <span className="text-gray-600"> → </span>
                            <span className="text-green-400">
                              {p.target === " " ? "⎵" : p.target}
                            </span>
                          </td>
                          <td className="p-1.5 text-center">
                            <span
                              className={
                                p.loss < 0.5
                                  ? "text-green-400"
                                  : p.loss < 1.5
                                    ? "text-amber-400"
                                    : "text-red-400"
                              }
                            >
                              {p.loss.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-1.5">
                            <span className="text-blue-400">
                              « {p.target === " " ? "⎵" : p.target} »
                            </span>
                            <span className="text-gray-600">
                              {" "}
                              : −{(1 - p.prob).toFixed(2)}
                            </span>
                            <span className="text-gray-500 text-[10px]">
                              {" "}
                              ({t("training.loss.annotations.increase")})
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="text-gray-400 text-xs">
                {t("training.loss.batchNote")}
              </p>

              {/* Agrégation */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
                <h4 className="text-gray-200 font-semibold text-sm">
                  {t("training.loss.aggregation.title")}
                </h4>

                <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-2">
                  <div>
                    <p className="text-gray-500">
                      # {t("training.loss.aggregation.lossComment")}
                    </p>
                    <p className="mt-1">
                      Loss = (
                      {FULL_TRAINING_POSITIONS.map((p) =>
                        p.loss.toFixed(2),
                      ).join(" + ")}
                      ) / 6
                    </p>
                    <p>
                      Loss ={" "}
                      <strong className="text-amber-300">{AVERAGE_LOSS}</strong>
                    </p>
                  </div>

                  <div className="border-t border-gray-800 pt-2">
                    <p className="text-gray-500">
                      # {t("training.loss.aggregation.gradientComment")}
                    </p>
                    <p className="mt-1 text-gray-400">
                      gradient_batch = (gradient₀ + gradient₁ + ... + gradient₅)
                      / 6
                    </p>
                    <p className="text-gray-500 text-[10px] mt-1">
                      {t("training.loss.aggregation.gradientNote", {
                        count: LD.vocabOrder.length,
                      })}
                    </p>
                  </div>
                </div>

                <p className="text-gray-400 text-xs">
                  {t("training.loss.aggregation.note")}
                </p>
              </div>

              {/* Transition vers rétropropagation */}
              <div className="bg-primary-900/10 border border-primary-800/30 rounded-lg p-4 space-y-2">
                <h4 className="text-primary-300 font-semibold text-sm">
                  {t("training.loss.afterTitle")}
                </h4>
                <p className="text-gray-300 text-xs">
                  {t("training.loss.afterDescription")}
                </p>
                <div className="bg-gray-900 rounded p-3 font-mono text-[10px] space-y-0.5">
                  <p>{t("training.loss.afterChain.accumulated")}</p>
                  <p className="text-gray-600">
                    {" "}
                    ↓ {t("training.loss.afterChain.adjustWout")}
                  </p>
                  <p className="text-gray-600">
                    {" "}
                    ↓ {t("training.loss.afterChain.adjustFFN")}
                  </p>
                  <p className="text-gray-600">
                    {" "}
                    ↓ {t("training.loss.afterChain.adjustAttention")}
                  </p>
                  <p className="text-gray-600">
                    {" "}
                    ↓ {t("training.loss.afterChain.adjustEmbeddings")}
                  </p>
                  <p className="text-gray-500 mt-1">
                    {t("training.loss.afterLoop")}
                  </p>
                </div>
                <p className="text-gray-400 text-xs">
                  <Link
                    to="/training/backpropagation"
                    className="text-primary-400 hover:underline"
                  >
                    {t("training.loss.afterLink")}
                  </Link>{" "}
                  {t("training.loss.afterLinkSuffix")}
                </p>
              </div>
            </div>
          </ConcreteCalculation>

          {/* ─── En résumé ─── */}
          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-green-300 font-semibold text-sm">
              {t("training.loss.summary.title")}
            </h4>

            {/* ENTRÉE */}
            <div className="bg-blue-900/20 border border-blue-800/30 rounded p-3">
              <p className="text-blue-300 font-semibold text-[10px] uppercase tracking-wide mb-2">
                ▸ {t("training.loss.summary.inputLabel")}
              </p>
              <div className="font-mono text-xs space-y-1">
                <p className="text-gray-400">
                  {t("training.loss.summary.inputDescription")}
                </p>
                <p className="text-gray-400">
                  {t("training.loss.summary.inputFFN", {
                    count: LD.ffnOutputPos5.length,
                  })}
                </p>
              </div>
            </div>

            <div className="text-center text-gray-600">↓</div>

            {/* PAR EXERCICE */}
            <div className="bg-gray-800/50 border border-gray-700 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-gray-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸ {t("training.loss.summary.perExerciseLabel")}
                </p>
                <span className="text-blue-400 text-[10px] bg-blue-900/30 px-1.5 py-0.5 rounded">
                  ×6
                </span>
              </div>
              <div className="font-mono text-xs space-y-0.5">
                <p className="text-gray-400">
                  {t("training.loss.summary.perExerciseStep1", {
                    count: LD.vocabOrder.length,
                  })}
                </p>
                <p className="text-gray-400">
                  {t("training.loss.summary.perExerciseStep2")}
                </p>
                <p className="text-gray-400">
                  {t("training.loss.summary.perExerciseStep3", {
                    count: LD.vocabOrder.length,
                  })}
                </p>
              </div>
            </div>

            <div className="text-center text-gray-600">↓</div>

            {/* AGRÉGATION */}
            <div className="bg-amber-900/10 border border-amber-800/30 rounded p-3">
              <p className="text-amber-300 font-semibold text-[10px] uppercase tracking-wide mb-2">
                ▸ {t("training.loss.summary.aggregationLabel")}
              </p>
              <div className="font-mono text-xs space-y-1">
                <p>
                  {t("training.loss.summary.aggregationLoss", {
                    loss: AVERAGE_LOSS,
                  })}
                </p>
                <p>
                  {t("training.loss.summary.aggregationGradient", {
                    count: LD.vocabOrder.length,
                  })}
                </p>
              </div>
            </div>

            <div className="text-center text-gray-600">↓</div>

            {/* SORTIE */}
            <div className="bg-green-900/20 border border-green-800/30 rounded p-3">
              <p className="text-green-300 font-semibold text-[10px] uppercase tracking-wide mb-2">
                ▸ {t("training.loss.summary.outputLabel")}
              </p>
              <div className="font-mono text-xs space-y-1">
                <p>{t("training.loss.summary.outputLoss")}</p>
                <p>{t("training.loss.summary.outputGradient")}</p>
                <p className="text-gray-500 text-[10px] mt-1">
                  {t("training.loss.summary.outputNote")}
                </p>
              </div>
            </div>
          </div>
        </div>
      }
      deepDive={
        <DeepDiveSection
          title={t("training.loss.deepDive.title")}
          docSlug="loss"
          formulas={[
            {
              name: t("training.loss.deepDive.crossEntropy.name"),
              latex: "L_i = -\\log P(y_i \\mid x_{<i})",
              explanation: t("training.loss.deepDive.crossEntropy.explanation"),
            },
            {
              name: t("training.loss.deepDive.averageLoss.name"),
              latex:
                "L = -\\frac{1}{N} \\sum_{i=1}^{N} \\log P(y_i \\mid x_{<i})",
              explanation: t("training.loss.deepDive.averageLoss.explanation"),
            },
            {
              name: t("training.loss.deepDive.perplexity.name"),
              latex: "\\text{PPL} = e^{L}",
              explanation: t("training.loss.deepDive.perplexity.explanation"),
            },
          ]}
        />
      }
    />
  );
}
