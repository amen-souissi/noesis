/**
 * Étape 4 : Attention — Comprendre le contexte
 *
 * Page enrichie avec approche mathématique honnête :
 * - Q, K, V ne sont PAS des concepts sémantiques — ce sont des projections matricielles
 * - Comment on arrive à cette construction mathématique depuis le problème
 * - Le produit scalaire comme mesure d'alignement entre vecteurs
 * - Pourquoi 3 projections (pas de sémantique : un besoin mathématique)
 * - Les têtes multiples comme projections parallèles indépendantes
 * - Tout est appris par rétropropagation — la « sémantique » émerge après entraînement
 * - Exemples numériques complets
 *
 * @module pages/training-steps/AttentionStep
 */

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import StepExplainer from "@/components/educational/StepExplainer";
import DeepDiveSection from "@/components/educational/DeepDiveSection";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";
import AnimatedMathOperation from "@/components/visualizations/AnimatedMathOperation";
import AttentionDetailedCalculation from "@/components/visualizations/AttentionDetailedCalculation";

export default function AttentionStep() {
  const { t } = useTranslation("pages");
  return (
    <StepExplainer
      sectionId="training/attention"
      phase="training"
      stepNumber={4}
      totalSteps={8}
      title={t("training.attention.title")}
      subtitle={t("training.attention.subtitle")}
      exampleContext={t("training.attention.exampleContext")}
      docSlug="attention"
      explanation={
        <>
          {/* ─── Le problème ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("training.attention.problem.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.attention.problem.description1")}
            </p>
            <p className="text-gray-300 text-sm">
              {t("training.attention.problem.description2")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-sm space-y-1">
              <p className="text-gray-400">
                {t("training.attention.problem.example1Before")}{" "}
                <strong className="text-amber-300">
                  {t("training.attention.problem.example1Bold")}
                </strong>{" "}
                {t("training.attention.problem.example1After")}
              </p>
              <p className="text-gray-400">
                {t("training.attention.problem.example2Before")}{" "}
                <strong className="text-amber-300">
                  {t("training.attention.problem.example2Bold")}
                </strong>{" "}
                {t("training.attention.problem.example2After")}
              </p>
            </div>
            <p className="text-gray-400 text-xs">
              {t("training.attention.problem.contextNote")}
            </p>
          </div>

          {/* ─── Le défi mathématique ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("training.attention.mathChallenge.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.attention.mathChallenge.description")}
            </p>
            <p className="text-gray-300 text-sm">
              {t("training.attention.mathChallenge.buildSolution")}
            </p>

            {/* Étape A : moyenne pondérée */}
            <div className="space-y-2 mt-2">
              <p className="text-gray-200 text-sm font-semibold">
                {t("training.attention.mathChallenge.stepA")}
              </p>
              <p className="text-gray-300 text-sm">
                {t("training.attention.mathChallenge.stepADescription1")}{" "}
                <strong>
                  {t("training.attention.mathChallenge.stepABold1")}
                </strong>{" "}
                {t("training.attention.mathChallenge.stepADescription2")}{" "}
                <strong>
                  {t("training.attention.mathChallenge.stepABold2")}
                </strong>{" "}
                {t("training.attention.mathChallenge.stepADescription3")}
              </p>
              <div className="bg-gray-900 rounded p-3 text-xs font-mono">
                <p className="text-gray-500">
                  {t("training.attention.mathChallenge.stepACodeComment")}
                </p>
                <p>{t("training.attention.mathChallenge.stepAFormula")}</p>
                <p className="text-amber-300 mt-1">
                  {t("training.attention.mathChallenge.stepACodeQuestion")}
                </p>
              </div>
            </div>

            {/* Étape B : le produit scalaire */}
            <div className="space-y-2">
              <p className="text-gray-200 text-sm font-semibold">
                {t("training.attention.mathChallenge.stepB")}
              </p>
              <p className="text-gray-300 text-sm">
                {t("training.attention.mathChallenge.stepBDescription1")}{" "}
                <strong>
                  {t("training.attention.mathChallenge.stepBBold")}
                </strong>{" "}
                {t("training.attention.mathChallenge.stepBDescription2")}
              </p>
              <div className="bg-gray-900 rounded p-3 text-xs font-mono">
                <AnimatedMathOperation totalSteps={3} delay={1200}>
                  {(step) => {
                    const examples = [
                      {
                        label: t(
                          "training.attention.mathChallenge.dotProductLabel",
                        ),
                        a: "[0.5, 0.3]",
                        b: "[0.4, 0.6]",
                        calc: "0.5×0.4 + 0.3×0.6",
                        result: "0.38",
                        cls: "text-white",
                        note: "",
                      },
                      {
                        label: t(
                          "training.attention.mathChallenge.alignedLabel",
                        ),
                        a: "[0.5, 0.3]",
                        b: "[0.5, 0.3]",
                        calc: "0.25 + 0.09",
                        result: "0.34",
                        cls: "text-green-400",
                        note: t("training.attention.mathChallenge.alignedNote"),
                      },
                      {
                        label: t(
                          "training.attention.mathChallenge.oppositeLabel",
                        ),
                        a: "[0.5, 0.3]",
                        b: "[−0.5, −0.3]",
                        calc: "−0.25 − 0.09",
                        result: "−0.34",
                        cls: "text-red-400",
                        note: t(
                          "training.attention.mathChallenge.oppositeNote",
                        ),
                      },
                    ];
                    return (
                      <div className="space-y-1">
                        {examples.map((e, i) => {
                          const visible = step === -1 || step >= i;
                          const active = step === i;
                          return (
                            <div
                              key={i}
                              className={`transition-all duration-500 ${!visible ? "opacity-0" : ""}`}
                            >
                              <p className="text-gray-500">{e.label}</p>
                              <p>
                                {e.a} · {e.b} = {e.calc} ={" "}
                                <span
                                  className={`${e.cls} ${active ? "font-bold ring-2 ring-amber-500/40 bg-amber-500/10 rounded px-0.5" : ""}`}
                                >
                                  {e.result}
                                </span>
                                {e.note && (
                                  <span className="text-gray-600 ml-2">
                                    {e.note}
                                  </span>
                                )}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }}
                </AnimatedMathOperation>
              </div>
              <p className="text-gray-400 text-xs">
                {t("training.attention.mathChallenge.stepBConclusion")}
              </p>
            </div>

            {/* Étape C : le problème d'un seul espace */}
            <div className="space-y-2">
              <p className="text-gray-200 text-sm font-semibold">
                {t("training.attention.mathChallenge.stepC")}
              </p>
              <p className="text-gray-300 text-sm">
                {t("training.attention.mathChallenge.stepCDescription1")}{" "}
                <code className="text-xs bg-gray-900 px-1 rounded">
                  vec(t) · vec(a)
                </code>
                {t("training.attention.mathChallenge.stepCDescription2")}
              </p>
              <div className="bg-gray-900 rounded p-3 text-xs font-mono space-y-1">
                <p className="text-gray-500">
                  {t("training.attention.mathChallenge.stepCCodeComment1")}
                </p>
                <p className="text-gray-500">
                  {t("training.attention.mathChallenge.stepCCodeComment2")}
                </p>
                <p className="text-gray-500">
                  {t("training.attention.mathChallenge.stepCCodeComment3")}
                </p>
                <p className="text-red-400 mt-1">
                  {t("training.attention.mathChallenge.stepCCodeConclusion")}
                </p>
              </div>
            </div>

            {/* Étape D : les projections */}
            <div className="space-y-2">
              <p className="text-gray-200 text-sm font-semibold">
                {t("training.attention.mathChallenge.stepD")}
              </p>
              <p className="text-gray-300 text-sm">
                {t("training.attention.mathChallenge.stepDDescription1")}{" "}
                <strong>
                  {t("training.attention.mathChallenge.stepDBold1")}
                </strong>
                {t("training.attention.mathChallenge.stepDDescription2")}{" "}
                <em>{t("training.attention.mathChallenge.stepDEmphasis")}</em>.
              </p>
              <div className="bg-gray-900 rounded p-3 text-xs font-mono space-y-2">
                <p className="text-gray-500">
                  {t("training.attention.mathChallenge.stepDNoProjection")}
                </p>
                <p>
                  score = embedding(t) · embedding(a){" "}
                  <span className="text-gray-600">
                    {t(
                      "training.attention.mathChallenge.stepDNoProjectionNote",
                    )}
                  </span>
                </p>
                <p className="text-gray-500 mt-2">
                  {t("training.attention.mathChallenge.stepDWithProjection")}
                </p>
                <p>
                  projection1 = embedding ×{" "}
                  <span className="text-blue-400">W₁</span>{" "}
                  <span className="text-gray-600">
                    {t("training.attention.mathChallenge.stepDLearnedMatrix")}
                  </span>
                </p>
                <p>
                  projection2 = embedding ×{" "}
                  <span className="text-green-400">W₂</span>{" "}
                  <span className="text-gray-600">
                    {t(
                      "training.attention.mathChallenge.stepDOtherLearnedMatrix",
                    )}
                  </span>
                </p>
                <p>
                  score = projection1(t) · projection2(a){" "}
                  <span className="text-gray-600">
                    {t(
                      "training.attention.mathChallenge.stepDLearnedSimilarity",
                    )}
                  </span>
                </p>
                <p className="text-amber-300 mt-1">
                  {t("training.attention.mathChallenge.stepDConclusion")}
                </p>
              </div>
              <p className="text-gray-300 text-sm mt-2">
                {t("training.attention.mathChallenge.stepDThirdProjection")}
              </p>
              <div className="bg-gray-900 rounded p-3 text-xs font-mono space-y-1 mt-1">
                <p>
                  projection 1 →{" "}
                  <span className="text-blue-400 font-bold">Q</span> (Query){" "}
                  <span className="text-gray-600">
                    {t("training.attention.mathChallenge.projQNote")}
                  </span>
                </p>
                <p>
                  projection 2 →{" "}
                  <span className="text-green-400 font-bold">K</span> (Key){" "}
                  <span className="text-gray-600">
                    {t("training.attention.mathChallenge.projKNote")}
                  </span>
                </p>
                <p>
                  projection 3 →{" "}
                  <span className="text-purple-400 font-bold">V</span> (Value){" "}
                  <span className="text-gray-600">
                    {t("training.attention.mathChallenge.projVNote")}
                  </span>
                </p>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                {t("training.attention.mathChallenge.namesOriginNote")}
              </p>
            </div>
          </div>

          {/* ─── Soyons honnêtes : Q, K, V sont des noms, pas des concepts ─── */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-blue-300 font-semibold text-sm">
              {t("training.attention.honesty.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.attention.honesty.description1")}
            </p>
            <p className="text-gray-300 text-sm">
              {t("training.attention.honesty.description2")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
              <p className="text-gray-500 font-mono">
                {t("training.attention.honesty.codeComment")}
              </p>
              <p className="text-gray-300">
                <span className="text-blue-400">Q</span> = embedding × W₁ →{" "}
                {t("training.attention.honesty.qDescription")}
              </p>
              <p className="text-gray-300">
                <span className="text-green-400">K</span> = embedding × W₂ →{" "}
                {t("training.attention.honesty.kDescription")}
              </p>
              <p className="text-gray-300">
                <span className="text-purple-400">V</span> = embedding × W₃ →{" "}
                {t("training.attention.honesty.vDescription")}
              </p>
              <p className="text-gray-500 mt-2">
                {t("training.attention.honesty.noOneDecided")}
                <VulgarizedTerm termKey="backpropagation">
                  {t("training.attention.honesty.backpropLabel")}
                </VulgarizedTerm>{" "}
                (
                <Link
                  to="/training/backpropagation"
                  className="text-primary-400 hover:underline text-[10px]"
                >
                  {t("training.attention.honesty.stepLink")}
                </Link>
                ),
                {t("training.attention.honesty.adjusts")}
                <strong>{t("training.attention.honesty.mathWorks")}</strong>
                {t("training.attention.honesty.noIntention")}
              </p>
            </div>
          </div>

          {/* ─── Pourquoi exactement 3 projections ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.attention.whyThreeProjections.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("training.attention.whyThreeProjections.description")}
            </p>
            <div className="space-y-2 mt-2">
              <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
                <p className="text-gray-300">
                  <strong className="text-red-400">
                    {t("training.attention.whyThreeProjections.oneProj")}
                  </strong>{" "}
                  → score = proj(t) · proj(a).
                  {t(
                    "training.attention.whyThreeProjections.oneProjDescription",
                  )}
                </p>
                <p className="text-gray-300">
                  <strong className="text-green-400">
                    {t("training.attention.whyThreeProjections.twoProj")}
                  </strong>{" "}
                  → score = proj1(t) · proj2(a).
                  {t(
                    "training.attention.whyThreeProjections.twoProjDescription",
                  )}
                </p>
                <p className="text-gray-300">
                  <strong className="text-blue-400">
                    {t("training.attention.whyThreeProjections.threeProj")}
                  </strong>{" "}
                  → score = proj1(t) · proj2(a),{" "}
                  {t("training.attention.whyThreeProjections.threeProjMix")}
                  {t(
                    "training.attention.whyThreeProjections.threeProjDescription",
                  )}{" "}
                  <strong>
                    {t("training.attention.whyThreeProjections.threeProjBold")}
                  </strong>
                </p>
                <p className="text-gray-300">
                  <strong className="text-gray-500">
                    {t("training.attention.whyThreeProjections.fourPlusProj")}
                  </strong>{" "}
                  →{" "}
                  {t(
                    "training.attention.whyThreeProjections.fourPlusProjDescription",
                  )}
                </p>
              </div>
            </div>
            <p className="text-gray-500 text-xs">
              {t("training.attention.whyThreeProjections.note")}
            </p>
          </div>

          {/* ─── D'où viennent les matrices ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.attention.matricesOrigin.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("training.attention.matricesOrigin.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono space-y-2">
              <p className="text-gray-500">
                {t("training.attention.matricesOrigin.codeComment")}
              </p>
              <p>
                <span className="text-blue-400">Q</span> = embedding ×{" "}
                <span className="text-blue-400">
                  W<sub>Q</sub>
                </span>
                <span className="text-gray-600 ml-2">
                  {t("training.attention.matricesOrigin.dimensionNote")}
                </span>
              </p>
              <p>
                <span className="text-green-400">K</span> = embedding ×{" "}
                <span className="text-green-400">
                  W<sub>K</sub>
                </span>
                <span className="text-gray-600 ml-2">
                  {t("training.attention.matricesOrigin.dimensionNote")}
                </span>
              </p>
              <p>
                <span className="text-purple-400">V</span> = embedding ×{" "}
                <span className="text-purple-400">
                  W<sub>V</sub>
                </span>
                <span className="text-gray-600 ml-2">
                  {t("training.attention.matricesOrigin.dimensionNote")}
                </span>
              </p>
            </div>
            <div className="bg-gray-900 rounded p-3 text-xs space-y-2 mt-2">
              <p className="text-gray-500 font-mono">
                {t("training.attention.matricesOrigin.lifecycleComment")}
              </p>
              <p className="text-gray-300">
                <strong>
                  {t("training.attention.matricesOrigin.startLabel")}
                </strong>{" "}
                W<sub>Q</sub>, W<sub>K</sub>, W<sub>V</sub>{" "}
                {t("training.attention.matricesOrigin.startDescription")}
              </p>
              <p className="text-gray-300">
                <strong>
                  {t("training.attention.matricesOrigin.duringLabel")}
                </strong>{" "}
                {t("training.attention.matricesOrigin.duringDescriptionBefore")}{" "}
                <VulgarizedTerm termKey="backpropagation">
                  {t("training.attention.matricesOrigin.backpropLabel")}
                </VulgarizedTerm>{" "}
                (
                <Link
                  to="/training/backpropagation"
                  className="text-primary-400 hover:underline text-[10px]"
                >
                  {t("training.attention.matricesOrigin.stepLink")}
                </Link>
                ){" "}
                {t("training.attention.matricesOrigin.duringDescriptionAfter")}
              </p>
              <p className="text-gray-300">
                <strong>
                  {t("training.attention.matricesOrigin.afterLabel")}
                </strong>{" "}
                {t("training.attention.matricesOrigin.afterDescription")}
              </p>
            </div>
            <p className="text-gray-500 text-xs">
              {t("training.attention.matricesOrigin.whyDimNote")}{" "}
              <VulgarizedTerm termKey="n_heads">
                {t("training.attention.matricesOrigin.headsLabel")}
              </VulgarizedTerm>
              ,{t("training.attention.matricesOrigin.dimExplanation")}
            </p>
          </div>

          {/* ─── La « sémantique » émerge, elle n'est pas conçue ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("training.attention.emergence.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.attention.emergence.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs space-y-1">
              <p className="font-mono">
                <span className="text-gray-500">
                  {t("training.attention.emergence.pattern1Label")}
                </span>{" "}
                {t("training.attention.emergence.pattern1")}
              </p>
              <p className="font-mono">
                <span className="text-gray-500">
                  {t("training.attention.emergence.pattern2Label")}
                </span>{" "}
                {t("training.attention.emergence.pattern2")}
              </p>
              <p className="font-mono">
                <span className="text-gray-500">
                  {t("training.attention.emergence.pattern3Label")}
                </span>{" "}
                {t("training.attention.emergence.pattern3")}
              </p>
            </div>
            <p className="text-gray-300 text-sm">
              {t("training.attention.emergence.conclusion")}
            </p>
          </div>

          {/* ─── Masque causal ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.attention.causalMask.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("training.attention.causalMask.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 font-mono text-xs text-center">
              <span className="text-gray-400">
                {t("training.attention.causalMask.canSee")}
              </span>{" "}
              <span className="text-green-400">L, e, ⎵, c, h, a, t</span>{" "}
              <span className="text-red-400 line-through">
                ⎵, m, a, n, g, e, ...
              </span>
            </div>
          </div>

          {/* ─── Multi-head ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.attention.multiHead.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("training.attention.multiHead.descriptionBefore")}{" "}
              <VulgarizedTerm termKey="n_heads">
                {t("training.attention.multiHead.headsLabel")}
              </VulgarizedTerm>{" "}
              {t("training.attention.multiHead.descriptionAfter")}
            </p>

            {/* Question clé : matrices identiques ? */}
            <div className="bg-red-900/15 border border-red-800/30 rounded p-3 space-y-2">
              <p className="text-red-300 font-semibold text-xs">
                {t("training.attention.multiHead.sameMatrices.question")}
              </p>
              <p className="text-gray-300 text-xs">
                <strong>
                  {t("training.attention.multiHead.sameMatrices.no")}
                </strong>{" "}
                {t("training.attention.multiHead.sameMatrices.answerPart1")}
                <strong>
                  {t("training.attention.multiHead.sameMatrices.answerBold1")}
                </strong>
                .{t("training.attention.multiHead.sameMatrices.answerPart2")}
                <strong>
                  {t("training.attention.multiHead.sameMatrices.answerBold2")}
                </strong>{" "}
                {t("training.attention.multiHead.sameMatrices.answerPart3")}
              </p>
              <p className="text-gray-400 text-xs">
                {t(
                  "training.attention.multiHead.sameMatrices.symmetryExplanation",
                )}
              </p>
            </div>

            {/* Question clé : en parallèle ou en séquence ? */}
            <div className="bg-blue-900/20 border border-blue-800/30 rounded p-3 space-y-2">
              <p className="text-blue-300 font-semibold text-xs">
                {t("training.attention.multiHead.parallel.question")}
              </p>
              <p className="text-gray-300 text-xs">
                <strong>{t("training.attention.multiHead.parallel.no")}</strong>{" "}
                {t("training.attention.multiHead.parallel.answerPart1")}
                <strong>
                  {t("training.attention.multiHead.parallel.answerBold")}
                </strong>
                {t("training.attention.multiHead.parallel.answerPart2")}
              </p>
            </div>

            <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-2">
              <p className="text-gray-500">
                {t("training.attention.multiHead.codeComment")}
              </p>
              <p>
                <span className="text-gray-400">embedding(t)</span> →
                <span className="text-blue-400">
                  {" "}
                  {t("training.attention.multiHead.head")} 1
                </span>{" "}
                (W<sub>Q1</sub>, W<sub>K1</sub>, W<sub>V1</sub>) →{" "}
                {t("training.attention.multiHead.output")}₁ [16 dims]
              </p>
              <p>
                <span className="text-gray-400">embedding(t)</span> →
                <span className="text-green-400">
                  {" "}
                  {t("training.attention.multiHead.head")} 2
                </span>{" "}
                (W<sub>Q2</sub>, W<sub>K2</sub>, W<sub>V2</sub>) →{" "}
                {t("training.attention.multiHead.output")}₂ [16 dims]
              </p>
              <p>
                <span className="text-gray-400">embedding(t)</span> →
                <span className="text-purple-400">
                  {" "}
                  {t("training.attention.multiHead.head")} 3
                </span>{" "}
                (W<sub>Q3</sub>, W<sub>K3</sub>, W<sub>V3</sub>) →{" "}
                {t("training.attention.multiHead.output")}₃ [16 dims]
              </p>
              <p>
                <span className="text-gray-400">embedding(t)</span> →
                <span className="text-amber-400">
                  {" "}
                  {t("training.attention.multiHead.head")} 4
                </span>{" "}
                (W<sub>Q4</sub>, W<sub>K4</sub>, W<sub>V4</sub>) →{" "}
                {t("training.attention.multiHead.output")}₄ [16 dims]
              </p>
              <p className="mt-2 text-gray-500">
                {t("training.attention.multiHead.concatComment")}
              </p>
              <p>
                [{t("training.attention.multiHead.output")}₁,{" "}
                {t("training.attention.multiHead.output")}₂,{" "}
                {t("training.attention.multiHead.output")}₃,{" "}
                {t("training.attention.multiHead.output")}₄] →{" "}
                <strong className="text-white">[64 dims]</strong> × W
                <sub>O</sub> →{" "}
                <strong className="text-amber-300">
                  {t("training.attention.multiHead.finalOutput")} [64 dims]
                </strong>
              </p>
            </div>

            <p className="text-gray-400 text-xs">
              {t("training.attention.multiHead.subspaceExplanation")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs space-y-1">
              <p className="text-gray-500 font-mono">
                {t("training.attention.multiHead.observedComment")}
              </p>
              <p className="font-mono">
                <span className="text-blue-400">
                  {t("training.attention.multiHead.head")} 1 :
                </span>{" "}
                {t("training.attention.multiHead.head1Pattern")}
              </p>
              <p className="font-mono">
                <span className="text-green-400">
                  {t("training.attention.multiHead.head")} 2 :
                </span>{" "}
                {t("training.attention.multiHead.head2Pattern")}
              </p>
              <p className="font-mono">
                <span className="text-purple-400">
                  {t("training.attention.multiHead.head")} 3 :
                </span>{" "}
                {t("training.attention.multiHead.head3Pattern")}
              </p>
              <p className="font-mono">
                <span className="text-amber-400">
                  {t("training.attention.multiHead.head")} 4 :
                </span>{" "}
                {t("training.attention.multiHead.head4Pattern")}
              </p>
              <p className="text-gray-500 mt-1">
                {t("training.attention.multiHead.emergenceNote")}
              </p>
            </div>
          </div>
        </>
      }
      calculation={
        <div className="space-y-8">
          <AttentionDetailedCalculation />

          {/* ─── En résumé ─── */}
          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-green-300 font-semibold text-sm">
              {t("training.attention.summary.title")}
            </h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>{t("training.attention.summary.input")}</p>
              <p>{t("training.attention.summary.operation")}</p>
              <p>{t("training.attention.summary.output")}</p>
              <div className="bg-gray-900 rounded p-3 font-mono text-xs text-center mt-2">
                7 × 64 →{" "}
                <span className="text-amber-300">
                  {t("training.attention.summary.headsLabel")}
                </span>{" "}
                → 7 × 64 ({t("training.attention.summary.plusResidual")})
              </div>
            </div>
          </div>
        </div>
      }
      deepDive={
        <DeepDiveSection
          title={t("training.attention.deepDive.title")}
          docSlug="attention"
          formulas={[
            {
              name: t("training.attention.deepDive.concepts.projections.name"),
              latex: "Q = X W_Q, \\quad K = X W_K, \\quad V = X W_V",
              explanation: t(
                "training.attention.deepDive.concepts.projections.explanation",
              ),
            },
            {
              name: t(
                "training.attention.deepDive.concepts.scaledDotProduct.name",
              ),
              latex:
                "\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V",
              explanation: t(
                "training.attention.deepDive.concepts.scaledDotProduct.explanation",
              ),
            },
            {
              name: t("training.attention.deepDive.concepts.multiHead.name"),
              latex:
                "\\text{MultiHead} = \\text{Concat}(\\text{head}_1, ..., \\text{head}_h) W^O",
              explanation: t(
                "training.attention.deepDive.concepts.multiHead.explanation",
              ),
            },
            {
              name: t("training.attention.deepDive.concepts.causalMask.name"),
              latex: `\\text{mask}_{ij} = \\begin{cases} 0 & \\text{${t("training.attention.deepDive.concepts.causalMask.latexIf")} } j \\leq i \\\\ -\\infty & \\text{${t("training.attention.deepDive.concepts.causalMask.latexIf")} } j > i \\end{cases}`,
              explanation: t(
                "training.attention.deepDive.concepts.causalMask.explanation",
              ),
            },
          ]}
        />
      }
    />
  );
}
