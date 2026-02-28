/**
 * Étape 3 : Encodage Positionnel — L'ordre des mots
 *
 * Page enrichie avec :
 * - Rappel des bases sin/cos
 * - Analogie de l'horloge à plusieurs aiguilles
 * - Exemple numérique complet avec "Le chat"
 * - Tableau interactif des vecteurs positionnels
 * - Courbes sin/cos à différentes fréquences
 *
 * @module pages/training-steps/PositionalEncodingStep
 */

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import StepExplainer from "@/components/educational/StepExplainer";
import ConcreteCalculation from "@/components/educational/ConcreteCalculation";
import DeepDiveSection from "@/components/educational/DeepDiveSection";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";
import AnimatedMathOperation from "@/components/visualizations/AnimatedMathOperation";
import { EXAMPLE_ATTENTION_DETAILED } from "@/lib/exampleData";

const D = EXAMPLE_ATTENTION_DETAILED;

/** Formate un nombre avec signe et largeur fixe (4 dims) */
function fmtPE(v: number): string {
  return v >= 0 ? ` ${v.toFixed(2)}` : `−${Math.abs(v).toFixed(2)}`;
}

export default function PositionalEncodingStep() {
  const { t } = useTranslation("pages");
  return (
    <StepExplainer
      sectionId="training/positional-encoding"
      phase="training"
      stepNumber={3}
      totalSteps={8}
      title={t("training.positionalEncoding.title")}
      subtitle={t("training.positionalEncoding.subtitle")}
      exampleContext={t("training.positionalEncoding.exampleContext")}
      docSlug="positional_encoding"
      explanation={
        <>
          {/* ─── Le problème ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("training.positionalEncoding.problem.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.positionalEncoding.problem.description1")}
            </p>
            <p className="text-gray-300 text-sm">
              {t("training.positionalEncoding.problem.description2")}
            </p>
          </div>

          <p>
            {t("training.positionalEncoding.solution.before")}
            <VulgarizedTerm termKey="positional_encoding" />
            {t("training.positionalEncoding.solution.middle")}
            <strong>{t("training.positionalEncoding.solution.add")}</strong>
            {t("training.positionalEncoding.solution.afterAdd")}
            <strong>{t("training.positionalEncoding.solution.signal")}</strong>
            {t("training.positionalEncoding.solution.after")}
          </p>

          {/* ─── Rappel sin/cos ─── */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-blue-300 font-semibold text-sm">
              {t("training.positionalEncoding.sinCosReminder.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.positionalEncoding.sinCosReminder.description")}
            </p>
            <div className="flex items-center justify-center gap-8 py-2">
              <div className="text-center">
                <div className="text-3xl font-mono text-blue-400">∿</div>
                <p className="text-xs text-gray-400 mt-1">
                  <strong>
                    {t("training.positionalEncoding.sinCosReminder.sinLabel")}
                  </strong>
                </p>
                <p className="text-xs text-gray-500">
                  {t("training.positionalEncoding.sinCosReminder.sinNote")}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-mono text-purple-400">∿</div>
                <p className="text-xs text-gray-400 mt-1">
                  <strong>
                    {t("training.positionalEncoding.sinCosReminder.cosLabel")}
                  </strong>
                </p>
                <p className="text-xs text-gray-500">
                  {t("training.positionalEncoding.sinCosReminder.cosNote")}
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-xs">
              {t("training.positionalEncoding.sinCosReminder.property")}
            </p>
          </div>

          {/* ─── L'analogie de l'horloge ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("training.positionalEncoding.clockAnalogy.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.positionalEncoding.clockAnalogy.description")}
            </p>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1.5 ml-2">
              <li>
                <strong className="text-blue-300">
                  {t("training.positionalEncoding.clockAnalogy.fastHandLabel")}
                </strong>{" "}
                {t("training.positionalEncoding.clockAnalogy.fastHandDesc")}
              </li>
              <li>
                <strong className="text-purple-300">
                  {t(
                    "training.positionalEncoding.clockAnalogy.mediumHandLabel",
                  )}
                </strong>{" "}
                {t("training.positionalEncoding.clockAnalogy.mediumHandDesc")}
              </li>
              <li>
                <strong className="text-pink-300">
                  {t("training.positionalEncoding.clockAnalogy.slowHandLabel")}
                </strong>{" "}
                {t("training.positionalEncoding.clockAnalogy.slowHandDesc")}
              </li>
            </ul>
            <p className="text-gray-300 text-sm">
              {t("training.positionalEncoding.clockAnalogy.conclusionBefore")}
              <strong>
                {t("training.positionalEncoding.clockAnalogy.conclusionStrong")}
              </strong>
              {t("training.positionalEncoding.clockAnalogy.conclusionAfter")}
            </p>
          </div>

          {/* ─── Pourquoi sin/cos et pas juste 0,1,2,3... ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.positionalEncoding.whySinCos.title")}
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1.5 ml-2">
              <li>
                <strong>
                  {t("training.positionalEncoding.whySinCos.boundedLabel")}
                </strong>
                {t("training.positionalEncoding.whySinCos.boundedDesc")}
              </li>
              <li>
                <strong>
                  {t("training.positionalEncoding.whySinCos.relativeLabel")}
                </strong>
                {t("training.positionalEncoding.whySinCos.relativeDesc")}
              </li>
              <li>
                <strong>
                  {t(
                    "training.positionalEncoding.whySinCos.generalizationLabel",
                  )}
                </strong>
                {t("training.positionalEncoding.whySinCos.generalizationDesc")}
              </li>
            </ul>
          </div>

          {/* ─── Rôle des PE pendant l'entraînement ─── */}
          <div className="bg-purple-900/15 border border-purple-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-purple-300 font-semibold text-sm">
              {t("training.positionalEncoding.duringTraining.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.positionalEncoding.duringTraining.descBefore")}
              <strong>
                {t("training.positionalEncoding.duringTraining.descNever")}
              </strong>
              {t("training.positionalEncoding.duringTraining.descAfterNever")}
              <strong>
                {t("training.positionalEncoding.duringTraining.descNotLearned")}
              </strong>
              {t(
                "training.positionalEncoding.duringTraining.descAfterNotLearned",
              )}
            </p>
            <p className="text-gray-300 text-sm">
              {t("training.positionalEncoding.duringTraining.whatLearnsBefore")}
              <strong>
                {t(
                  "training.positionalEncoding.duringTraining.whatLearnsStrong",
                )}
              </strong>
              {t("training.positionalEncoding.duringTraining.whatLearnsAfter")}
              <sub>Q</sub>
              {t("training.positionalEncoding.duringTraining.whatLearnsAndW")}
              <sub>K</sub>
              {t(
                "training.positionalEncoding.duringTraining.whatLearnsOf",
              )}{" "}
              <VulgarizedTerm termKey="attention">
                {t(
                  "training.positionalEncoding.duringTraining.whatLearnsAttention",
                )}
              </VulgarizedTerm>{" "}
              (
              <Link
                to="/training/attention"
                className="text-primary-400 hover:underline text-xs"
              >
                {t(
                  "training.positionalEncoding.duringTraining.whatLearnsStep4",
                )}
              </Link>
              ).
            </p>

            <div className="bg-gray-900 rounded p-3 text-xs space-y-3">
              <p className="text-gray-500 font-mono">
                {t("training.positionalEncoding.duringTraining.howItWorks")}
              </p>

              <div className="space-y-2">
                <p className="text-gray-300">
                  <strong className="text-purple-300">
                    {t("training.positionalEncoding.duringTraining.step1Title")}
                  </strong>
                </p>
                <div className="font-mono ml-2 space-y-1">
                  <p>
                    vecteur[pos=3] ={" "}
                    <span className="text-blue-300">embedding(« c »)</span> +{" "}
                    <span className="text-green-300">PE(3)</span>
                  </p>
                  <p className="text-gray-500">
                    {t(
                      "training.positionalEncoding.duringTraining.step1Vector",
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-gray-300">
                  <strong className="text-purple-300">
                    {t("training.positionalEncoding.duringTraining.step2Title")}
                  </strong>
                </p>
                <p className="text-gray-400 ml-2">
                  {t("training.positionalEncoding.duringTraining.step2Desc")}
                  <sup>T</sup>
                  {t(
                    "training.positionalEncoding.duringTraining.step2DescAfterSup",
                  )}
                  <sub>Q</sub>
                  {t(
                    "training.positionalEncoding.duringTraining.whatLearnsAndW",
                  )}
                  <sub>K</sub>
                  {t(
                    "training.positionalEncoding.duringTraining.step2DescLearnBefore",
                  )}
                  <strong>
                    {t(
                      "training.positionalEncoding.duringTraining.step2DescLearn",
                    )}
                  </strong>
                  {t(
                    "training.positionalEncoding.duringTraining.step2DescAfterLearn",
                  )}
                </p>
                <div className="font-mono ml-4 space-y-1 text-gray-300">
                  <p>
                    {t(
                      "training.positionalEncoding.duringTraining.step2Pattern1",
                    )}
                    <span className="text-amber-300">
                      {t(
                        "training.positionalEncoding.duringTraining.step2Pattern1Highlight",
                      )}
                    </span>
                    {t(
                      "training.positionalEncoding.duringTraining.step2Pattern1After",
                    )}
                  </p>
                  <p>
                    {t(
                      "training.positionalEncoding.duringTraining.step2Pattern2Before",
                    )}
                    <span className="text-amber-300">
                      {t(
                        "training.positionalEncoding.duringTraining.step2Pattern2Highlight",
                      )}
                    </span>
                    {t(
                      "training.positionalEncoding.duringTraining.step2Pattern2After",
                    )}
                  </p>
                  <p>
                    {t(
                      "training.positionalEncoding.duringTraining.step2Pattern3Before",
                    )}
                    <span className="text-amber-300">
                      {t(
                        "training.positionalEncoding.duringTraining.step2Pattern3Highlight",
                      )}
                    </span>
                    {t(
                      "training.positionalEncoding.duringTraining.step2Pattern3After",
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-gray-300">
                  <strong className="text-purple-300">
                    {t("training.positionalEncoding.duringTraining.step3Title")}
                  </strong>
                </p>
                <p className="text-gray-400 ml-2">
                  {t(
                    "training.positionalEncoding.duringTraining.step3DescBefore",
                  )}
                  <strong>
                    {t(
                      "training.positionalEncoding.duringTraining.step3DescDiff1",
                    )}
                  </strong>
                  {t(
                    "training.positionalEncoding.duringTraining.step3DescMiddle",
                  )}
                  <strong>
                    {t(
                      "training.positionalEncoding.duringTraining.step3DescDiff2",
                    )}
                  </strong>
                  {t(
                    "training.positionalEncoding.duringTraining.step3DescAfter",
                  )}
                  <strong>
                    {t(
                      "training.positionalEncoding.duringTraining.step3DescAnywhere",
                    )}
                  </strong>{" "}
                  {t("training.positionalEncoding.duringTraining.step3DescEnd")}
                </p>
              </div>
            </div>

            <div className="bg-gray-900 rounded p-3 text-xs space-y-2 mt-2">
              <p className="text-gray-500 font-mono">
                {t("training.positionalEncoding.duringTraining.exampleTitle")}
              </p>
              <div className="space-y-2">
                <p className="text-gray-300">
                  {t(
                    "training.positionalEncoding.duringTraining.exampleDesc1Before",
                  )}
                  <strong>
                    {t(
                      "training.positionalEncoding.duringTraining.exampleDesc1Pos",
                    )}
                  </strong>
                  {t(
                    "training.positionalEncoding.duringTraining.exampleDesc1After",
                  )}
                  <strong>
                    {t(
                      "training.positionalEncoding.duringTraining.exampleDesc1Chat",
                    )}
                  </strong>
                  {t(
                    "training.positionalEncoding.duringTraining.exampleDesc1Middle",
                  )}
                  <strong>
                    {t(
                      "training.positionalEncoding.duringTraining.exampleDesc1Soleil",
                    )}
                  </strong>
                  {t(
                    "training.positionalEncoding.duringTraining.exampleDesc1End1",
                  )}
                  <strong>
                    {t(
                      "training.positionalEncoding.duringTraining.exampleDesc1Matin",
                    )}
                  </strong>
                  {t(
                    "training.positionalEncoding.duringTraining.exampleDesc1End2",
                  )}
                </p>
                <p className="text-gray-300">
                  {t(
                    "training.positionalEncoding.duringTraining.exampleDesc2Before",
                  )}
                  <strong>
                    {t(
                      "training.positionalEncoding.duringTraining.exampleDesc2Same",
                    )}
                  </strong>
                  {t(
                    "training.positionalEncoding.duringTraining.exampleDesc2After",
                  )}
                  <strong>
                    {t(
                      "training.positionalEncoding.duringTraining.exampleDesc2Patterns",
                    )}
                  </strong>
                  {t(
                    "training.positionalEncoding.duringTraining.exampleDesc2End",
                  )}
                </p>
                <div className="font-mono ml-2 space-y-1">
                  <p>
                    <span className="text-gray-500">Position 0 :</span>{" "}
                    {t(
                      "training.positionalEncoding.duringTraining.examplePos0",
                    )}
                  </p>
                  <p>
                    <span className="text-gray-500">Position 2 :</span>{" "}
                    {t(
                      "training.positionalEncoding.duringTraining.examplePos2",
                    )}
                  </p>
                  <p>
                    <span className="text-gray-500">Pos. N−1 :</span>{" "}
                    {t(
                      "training.positionalEncoding.duringTraining.examplePosN",
                    )}
                  </p>
                </div>
                <p className="text-gray-400 mt-1">
                  {t(
                    "training.positionalEncoding.duringTraining.exampleConclusionBefore",
                  )}
                  <strong>
                    {t(
                      "training.positionalEncoding.duringTraining.exampleConclusionStrong",
                    )}
                  </strong>
                  {t(
                    "training.positionalEncoding.duringTraining.exampleConclusionMiddle",
                  )}
                  <strong>
                    {t(
                      "training.positionalEncoding.duringTraining.exampleConclusionDiscovers",
                    )}
                  </strong>
                  {t(
                    "training.positionalEncoding.duringTraining.exampleConclusionEnd",
                  )}
                </p>
              </div>
            </div>

            <p className="text-gray-400 text-xs mt-1">
              {t("training.positionalEncoding.duringTraining.rulerBefore")}
              <strong>
                {t("training.positionalEncoding.duringTraining.rulerStrong1")}
              </strong>
              {t("training.positionalEncoding.duringTraining.rulerMiddle")}
              <strong>
                {t("training.positionalEncoding.duringTraining.rulerStrong2")}
              </strong>
              {t("training.positionalEncoding.duringTraining.rulerAfter")} (W
              <sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub>{" "}
              {t("training.positionalEncoding.duringTraining.whatLearnsOf")}
              <Link
                to="/training/attention"
                className="text-primary-400 hover:underline"
              >
                {t(
                  "training.positionalEncoding.duringTraining.whatLearnsAttention",
                )}
              </Link>
              ,{" "}
              <Link
                to="/training/feedforward"
                className="text-primary-400 hover:underline"
              >
                FFN
              </Link>
              ){t("training.positionalEncoding.duringTraining.rulerParams")}
            </p>
          </div>
        </>
      }
      calculation={
        <div className="space-y-8">
          {/* ─── Exemple concret pas-à-pas ─── */}
          <ConcreteCalculation
            title={t("training.tokenization.calculation.concreteTitle")}
            description={t(
              "training.positionalEncoding.calculation.matrixDescription",
            )}
          >
            <div className="space-y-6">
              {/* Rappel de la notation */}
              <div className="bg-blue-900/15 border border-blue-800/30 rounded-lg p-4 space-y-2">
                <h4 className="text-blue-300 font-semibold text-sm">
                  {t("training.positionalEncoding.calculation.formulaTitle")}
                </h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>
                    {t(
                      "training.positionalEncoding.calculation.formulaDescription",
                    )}
                  </p>
                  <ul className="list-disc list-inside text-gray-400 space-y-1 ml-2 text-xs">
                    <li>
                      <strong className="text-white">pos</strong>{" "}
                      {t("training.positionalEncoding.calculation.formulaPos")}
                    </li>
                    <li>
                      <strong className="text-white">i</strong>{" "}
                      {t("training.positionalEncoding.calculation.formulaI")}
                    </li>
                    <li>
                      <strong className="text-white">d_model</strong>{" "}
                      {t(
                        "training.positionalEncoding.calculation.formulaDmodel",
                      )}{" "}
                      <strong>{D.dModel}</strong>{" "}
                      {t(
                        "training.positionalEncoding.calculation.formulaDmodelSuffix",
                      )}
                    </li>
                    <li>
                      <strong className="text-white">base</strong>{" "}
                      {t("training.positionalEncoding.calculation.formulaBase")}
                    </li>
                    <li>
                      <strong className="text-white">2i/d_model</strong>{" "}
                      {t("training.positionalEncoding.calculation.formula2i")}
                      <strong>
                        {t(
                          "training.positionalEncoding.calculation.formula2iStrong",
                        )}
                      </strong>
                      {t(
                        "training.positionalEncoding.calculation.formula2iDesc",
                      )}
                    </li>
                  </ul>
                  <p className="text-gray-500 text-xs">
                    {t(
                      "training.positionalEncoding.calculation.formulaPairNote",
                    )}
                    <strong>
                      {t(
                        "training.positionalEncoding.calculation.formulaPairNoteI",
                      )}
                    </strong>
                    {t(
                      "training.positionalEncoding.calculation.formulaPairNoteEnd",
                    )}
                  </p>
                </div>
              </div>

              {/* Animation : Construction de la matrice PE */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t(
                    "training.positionalEncoding.calculation.matrixBuildTitle",
                    { count: D.tokens.length, dims: D.dModel },
                  )}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.positionalEncoding.calculation.matrixBuildDesc")}
                </p>
                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation
                    totalSteps={D.tokens.length}
                    delay={1200}
                  >
                    {(step) => (
                      <div className="space-y-2 font-mono text-xs">
                        {/* En-tête colonnes */}
                        <div className="grid grid-cols-[56px_repeat(4,1fr)] gap-1 text-center text-[10px]">
                          <span />
                          <span className="text-blue-400">
                            dim 0<br />
                            sin, i=0
                          </span>
                          <span className="text-purple-400">
                            dim 1<br />
                            cos, i=0
                          </span>
                          <span className="text-blue-400">
                            dim 2<br />
                            sin, i=1
                          </span>
                          <span className="text-purple-400">
                            dim 3<br />
                            cos, i=1
                          </span>
                        </div>
                        {/* Lignes de la matrice */}
                        {D.tokens.map((char, i) => {
                          const visible = step === -1 || step >= i;
                          const active = step === i;
                          const pe = D.peVectors[i];
                          // Detail: PE(pos,0)=sin(pos/1), PE(pos,1)=cos(pos/1), PE(pos,2)=sin(pos/√10), PE(pos,3)=cos(pos/√10)
                          const detailLabels = [
                            `sin(${i}/1)`,
                            `cos(${i}/1)`,
                            `sin(${i}/√10)`,
                            `cos(${i}/√10)`,
                          ];
                          return (
                            <div
                              key={i}
                              className={`transition-all duration-500 ${!visible ? "opacity-0 h-0 overflow-hidden" : ""}`}
                            >
                              <div
                                className={`grid grid-cols-[56px_repeat(4,1fr)] gap-1 text-center items-center rounded-md py-1 ${active ? "bg-gray-800" : ""} transition-colors duration-300`}
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
                                    p{i}
                                  </span>
                                </span>
                                {pe.map((v, j) => (
                                  <span
                                    key={j}
                                    className={`transition-all duration-300 ${
                                      active
                                        ? "text-white font-bold ring-2 ring-green-500/40 bg-green-500/10 rounded px-1"
                                        : visible
                                          ? "text-green-400/70"
                                          : "text-gray-700"
                                    }`}
                                  >
                                    {fmtPE(v)}
                                  </span>
                                ))}
                              </div>
                              {active && (
                                <div className="mt-1 pl-[56px] text-[10px] text-gray-500 flex flex-wrap gap-x-3">
                                  {detailLabels.map((d, j) => (
                                    <span
                                      key={j}
                                      className={
                                        j % 2 === 0
                                          ? "text-blue-400/70"
                                          : "text-purple-400/70"
                                      }
                                    >
                                      {d} = {fmtPE(pe[j])}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {(step === -1 || step >= D.tokens.length - 1) && (
                          <p className="text-green-300/80 text-[10px] mt-1 transition-all duration-500">
                            {t(
                              "training.positionalEncoding.calculation.matrixBuildFinal",
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </AnimatedMathOperation>
                </div>
                <p className="text-xs text-gray-500">
                  {t("training.positionalEncoding.calculation.matrixBuildNote")}
                </p>
              </div>

              {/* Animation : Embedding + PE = vecteur final — les 7 tokens de "Le chat" */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.positionalEncoding.calculation.additionTitle")}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.positionalEncoding.calculation.additionDesc")}{" "}
                  <Link
                    to="/training/attention"
                    className="text-primary-400 hover:underline"
                  >
                    {t(
                      "training.positionalEncoding.calculation.additionDescAttention",
                    )}
                  </Link>
                  .{" "}
                  <Link
                    to="/math/vectors-matrices"
                    className="inline-flex items-center gap-1 text-primary-400 hover:underline text-xs"
                    title={t(
                      "training.positionalEncoding.calculation.additionDescVectorReminder",
                    )}
                  >
                    {t(
                      "training.positionalEncoding.calculation.additionDescVectorReminder",
                    )}
                  </Link>
                </p>
                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation
                    totalSteps={D.tokens.length}
                    delay={1200}
                  >
                    {(step) => (
                      <div className="space-y-1.5 font-mono text-xs">
                        {/* En-tête */}
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

                          const emb = D.rawEmbeddings[ti];
                          const pe = D.peVectors[ti];
                          const res = D.embeddings[ti];

                          return (
                            <div
                              key={ti}
                              className={`transition-all duration-300 ${!visible ? "opacity-0 h-0 overflow-hidden" : ""}`}
                            >
                              {/* Résultat compact (toujours visible quand done) */}
                              <div
                                className={`grid grid-cols-[56px_repeat(4,1fr)] gap-1 text-center items-center rounded py-0.5 transition-all duration-300 ${
                                  active
                                    ? "ring-2 ring-amber-500/40 bg-amber-500/10"
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
                                        ? "text-amber-300"
                                        : visible
                                          ? "text-amber-400/60"
                                          : "text-gray-700"
                                    }`}
                                  >
                                    {fmtPE(v)}
                                  </span>
                                ))}
                              </div>

                              {/* Détail emb + PE quand actif */}
                              {active && (
                                <div className="ml-[56px] mt-1 mb-2 space-y-0.5">
                                  {/* Embedding row */}
                                  <div className="grid grid-cols-[40px_repeat(4,1fr)] gap-1 text-center items-center text-[10px]">
                                    <span className="text-left text-blue-400">
                                      emb
                                    </span>
                                    {emb.map((v, d) => (
                                      <span
                                        key={d}
                                        className="text-blue-300 ring-1 ring-blue-500/30 bg-blue-500/5 rounded px-0.5"
                                      >
                                        {fmtPE(v)}
                                      </span>
                                    ))}
                                  </div>
                                  {/* PE row */}
                                  <div className="grid grid-cols-[40px_repeat(4,1fr)] gap-1 text-center items-center text-[10px]">
                                    <span className="text-left text-green-400">
                                      +PE
                                    </span>
                                    {pe.map((v, d) => (
                                      <span
                                        key={d}
                                        className="text-green-300 ring-1 ring-green-500/30 bg-green-500/5 rounded px-0.5"
                                      >
                                        {fmtPE(v)}
                                      </span>
                                    ))}
                                  </div>
                                  {/* Calcul détaillé dim par dim */}
                                  <div className="grid grid-cols-[40px_repeat(4,1fr)] gap-1 text-center items-center text-[10px] text-gray-500 mt-0.5">
                                    <span className="text-left">=</span>
                                    {emb.map((e, d) => (
                                      <span key={d} className="text-amber-400">
                                        {fmtPE(res[d])}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Note finale */}
                        {(step >= D.tokens.length - 1 || step === -1) && (
                          <div className="border-t border-gray-800 pt-2 mt-2">
                            <p className="text-green-300 text-xs font-medium">
                              {t(
                                "training.positionalEncoding.calculation.additionFinalDynamic",
                                { dModel: D.dModel },
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </AnimatedMathOperation>
                </div>
                <p className="text-xs text-gray-500">
                  {t("training.positionalEncoding.calculation.additionNote")}
                </p>
              </div>
            </div>
          </ConcreteCalculation>

          {/* ─── En résumé ─── */}
          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-green-300 font-semibold text-sm">
              {t("training.positionalEncoding.summary.title")}
            </h4>

            {/* ENTRÉE */}
            <div className="bg-blue-900/20 border border-blue-800/30 rounded p-3">
              <p className="text-blue-300 font-semibold text-[10px] uppercase tracking-wide mb-2">
                ▸ {t("training.positionalEncoding.summary.inputLabel")}
              </p>
              <div className="font-mono text-xs space-y-1">
                <p>
                  « <span className="text-primary-300">L</span> » (pos 0) →
                  embedding = [
                  <span className="text-white">
                    {D.rawEmbeddings[0].map((v) => fmtPE(v)).join(", ")}
                  </span>
                  ]
                </p>
                <p>
                  « <span className="text-primary-300">t</span> » (pos 6) →
                  embedding = [
                  <span className="text-white">
                    {D.rawEmbeddings[6].map((v) => fmtPE(v)).join(", ")}
                  </span>
                  ]
                </p>
              </div>
            </div>

            <div className="text-center text-gray-600">↓</div>

            {/* OPÉRATION */}
            <div className="bg-gray-800/50 border border-gray-700 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-gray-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸ {t("training.positionalEncoding.summary.operationLabel")}
                </p>
                <span className="text-blue-400 text-[10px] bg-blue-900/30 px-1.5 py-0.5 rounded">
                  {t("training.positionalEncoding.summary.operationTag")}
                </span>
              </div>
              <div className="font-mono text-xs space-y-2">
                <p className="text-gray-400">
                  {t("training.positionalEncoding.summary.operationText")}
                </p>
                <div className="ml-2 space-y-1">
                  <p>
                    <span className="text-green-300">PE(0)</span> = [
                    {D.peVectors[0].map((v) => fmtPE(v)).join(", ")}]{" "}
                    <span className="text-gray-600">
                      {t("training.positionalEncoding.summary.pe0Note")}
                    </span>
                  </p>
                  <p>
                    <span className="text-green-300">PE(6)</span> = [
                    {D.peVectors[6].map((v) => fmtPE(v)).join(", ")}]{" "}
                    <span className="text-gray-600">
                      {t("training.positionalEncoding.summary.pe6Note")}
                    </span>
                  </p>
                </div>
                <p className="text-gray-400">
                  {t("training.positionalEncoding.summary.operationFormula")}
                  <span className="text-blue-300">embedding</span> +{" "}
                  <span className="text-green-300">PE</span>
                </p>
              </div>
            </div>

            <div className="text-center text-gray-600">↓</div>

            {/* SORTIE */}
            <div className="bg-green-900/20 border border-green-800/30 rounded p-3">
              <p className="text-green-300 font-semibold text-[10px] uppercase tracking-wide mb-2">
                ▸ {t("training.positionalEncoding.summary.outputLabel")}
              </p>
              <div className="font-mono text-xs space-y-1">
                <p>
                  « <span className="text-primary-300">L</span> » → [
                  {D.embeddings[0].map((v, i) => (
                    <span key={i}>
                      {i > 0 && ", "}
                      <span className="text-amber-400">{fmtPE(v)}</span>
                    </span>
                  ))}
                  ]
                </p>
                <p>
                  « <span className="text-primary-300">t</span> » → [
                  {D.embeddings[6].map((v, i) => (
                    <span key={i}>
                      {i > 0 && ", "}
                      <span className="text-amber-400">{fmtPE(v)}</span>
                    </span>
                  ))}
                  ]
                </p>
              </div>
            </div>

            <p className="text-gray-500 text-xs">
              {t("training.positionalEncoding.summary.note")}
            </p>
          </div>
        </div>
      }
      deepDive={
        <DeepDiveSection
          title={t("training.positionalEncoding.deepDive.title")}
          docSlug="positional_encoding"
          formulas={[
            {
              name: t("training.positionalEncoding.deepDive.evenDim"),
              latex:
                "PE_{(pos, 2i)} = \\sin\\left(\\frac{pos}{base^{2i/d_{model}}}\\right)",
              explanation: t(
                "training.positionalEncoding.deepDive.evenDimExplanation",
              ),
            },
            {
              name: t("training.positionalEncoding.deepDive.oddDim"),
              latex:
                "PE_{(pos, 2i+1)} = \\cos\\left(\\frac{pos}{base^{2i/d_{model}}}\\right)",
              explanation: t(
                "training.positionalEncoding.deepDive.oddDimExplanation",
              ),
            },
            {
              name: t("training.positionalEncoding.deepDive.additionName"),
              latex: "x_{pos} = \\text{Embedding}(token_{pos}) + PE_{pos}",
              explanation: t(
                "training.positionalEncoding.deepDive.additionExplanation",
              ),
            },
          ]}
        />
      }
    />
  );
}
