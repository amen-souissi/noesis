/**
 * Étape 8 : Optimiseur (Adam) — Mettre à jour les poids
 *
 * Calculs animés étape par étape avec les vrais gradients de l'étape 7 :
 * 1. Mise à jour du momentum m
 * 2. Mise à jour de la vitesse adaptative v
 * 3. Correction du biais (m̂, v̂)
 * 4. Mise à jour du poids
 * 5. Momentum en action sur 3 itérations (absorption du bruit)
 *
 * @module pages/training-steps/OptimizerStep
 */

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import StepExplainer from "@/components/educational/StepExplainer";
import ConcreteCalculation from "@/components/educational/ConcreteCalculation";
import DeepDiveSection from "@/components/educational/DeepDiveSection";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";
import OptimizerViz from "@/components/visualizations/OptimizerViz";
import AnimatedMathOperation from "@/components/visualizations/AnimatedMathOperation";
import { EXAMPLE_OPTIMIZER as OPT } from "@/lib/exampleData";

/* ─── helpers ─── */

function fmt(v: number): string {
  return v >= 0 ? `+${v.toFixed(4)}` : `−${Math.abs(v).toFixed(4)}`;
}

function fmtSci(v: number): string {
  if (Math.abs(v) >= 0.001) return v.toFixed(6);
  return v.toExponential(2);
}

const NCELL = "inline-block min-w-[3.5rem] text-right";

/* ─── couleur du gradient ─── */
function gradColor(g: number): string {
  return g < 0 ? "text-blue-300" : "text-red-400";
}

export default function OptimizerStep() {
  const { t } = useTranslation("pages");
  return (
    <StepExplainer
      sectionId="training/optimizer"
      phase="training"
      stepNumber={8}
      totalSteps={8}
      title={t("training.optimizer.title")}
      subtitle={t("training.optimizer.subtitle")}
      exampleContext={t("training.optimizer.exampleContext")}
      docSlug="optimizer"
      explanation={
        <>
          {/* ─── Le problème ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("training.optimizer.problem.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.optimizer.problem.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono space-y-2">
              <p>{t("training.optimizer.problem.problem1")}</p>
              <p>{t("training.optimizer.problem.problem2")}</p>
              <p>{t("training.optimizer.problem.problem3")}</p>
            </div>
          </div>

          {/* ─── L'idée ─── */}
          <p>{t("training.optimizer.idea")}</p>

          {/* ─── Analogie de la bille ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("training.optimizer.ballAnalogy.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.optimizer.ballAnalogy.description")}
            </p>
            <div className="space-y-2 mt-2">
              <div className="flex items-start gap-3">
                <span className="text-gray-400 font-mono text-xs whitespace-nowrap mt-0.5">
                  naïf
                </span>
                <p className="text-sm text-gray-400">
                  {t("training.optimizer.ballAnalogy.naive")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-mono text-xs whitespace-nowrap mt-0.5">
                  Adam
                </span>
                <p className="text-sm text-gray-300">
                  {t("training.optimizer.ballAnalogy.adam")}
                </p>
              </div>
            </div>
          </div>

          {/* ─── Les deux mémoires ─── */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-blue-300 font-semibold text-sm">
              {t("training.optimizer.twoMemories.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.optimizer.twoMemories.description")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="bg-gray-900 rounded p-3">
                <p className="text-amber-400 font-semibold text-sm">
                  {t("training.optimizer.twoMemories.momentum.title")}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {t("training.optimizer.twoMemories.momentum.description")}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {t("training.optimizer.twoMemories.momentum.beta1Note")}
                </p>
              </div>
              <div className="bg-gray-900 rounded p-3">
                <p className="text-purple-400 font-semibold text-sm">
                  {t("training.optimizer.twoMemories.velocity.title")}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {t("training.optimizer.twoMemories.velocity.description")}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {t("training.optimizer.twoMemories.velocity.beta2Note")}
                </p>
              </div>
            </div>
          </div>

          {/* ─── Learning rate ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.optimizer.learningRate.title")}
            </h4>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono space-y-1">
              <p>{t("training.optimizer.learningRate.tooLarge")}</p>
              <p>{t("training.optimizer.learningRate.good")}</p>
              <p>{t("training.optimizer.learningRate.tooSmall")}</p>
            </div>
          </div>
        </>
      }
      calculation={
        <div className="space-y-8">
          {/* ─── 0. Rappel des gradients (étape 7) ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("training.optimizer.calculation.gradientRecapTitle")}
              <Link
                to="/training/backpropagation"
                className="text-primary-400 hover:underline"
              >
                {t("training.optimizer.calculation.gradientRecapTitleLink")}
              </Link>
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.optimizer.calculation.gradientRecapDescription")}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs text-center">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="p-1.5 text-left">
                      {t(
                        "training.optimizer.calculation.gradientRecapTableWeight",
                      )}
                    </th>
                    <th className="p-1.5">
                      {t(
                        "training.optimizer.calculation.gradientRecapTableValue",
                      )}
                    </th>
                    <th className="p-1.5">
                      {t(
                        "training.optimizer.calculation.gradientRecapTableGradient",
                      )}
                    </th>
                    <th className="p-1.5">
                      {t(
                        "training.optimizer.calculation.gradientRecapTableInterpretation",
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {OPT.weights.map((w, i) => (
                    <tr key={i} className="border-b border-gray-900/50">
                      <td className="p-1.5 text-left text-gray-400">
                        {w.name}
                      </td>
                      <td className="p-1.5 text-white">{w.theta.toFixed(2)}</td>
                      <td className={`p-1.5 font-bold ${gradColor(w.grad)}`}>
                        {fmt(w.grad)}
                      </td>
                      <td className="p-1.5 text-gray-500 text-[10px] text-left">
                        {w.desc} —{" "}
                        {w.grad < 0
                          ? t(
                              "training.optimizer.calculation.gradientRecapIncrease",
                            )
                          : t(
                              "training.optimizer.calculation.gradientRecapDecrease",
                            )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p
              className="text-gray-500 text-xs"
              dangerouslySetInnerHTML={{
                __html: t("training.optimizer.calculation.gradientRecapNote"),
              }}
            />
          </div>

          {/* ─── Hyperparamètres ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded p-3">
            <p className="text-gray-300 font-semibold text-xs mb-2">
              {t("training.optimizer.calculation.hyperparamsTitle")}
            </p>
            <div className="flex flex-wrap gap-4 font-mono text-xs">
              <span>
                α = <span className="text-green-400">{OPT.lr}</span>{" "}
                <span className="text-gray-600">
                  {t("training.optimizer.calculation.hyperparamsLr")}
                </span>
              </span>
              <span>
                β₁ = <span className="text-amber-400">{OPT.beta1}</span>{" "}
                <span className="text-gray-600">
                  {t("training.optimizer.calculation.hyperparamsMomentum")}
                </span>
              </span>
              <span>
                β₂ = <span className="text-purple-400">{OPT.beta2}</span>{" "}
                <span className="text-gray-600">
                  {t("training.optimizer.calculation.hyperparamsAdapter")}
                </span>
              </span>
              <span>
                ε = <span className="text-gray-400">10⁻⁸</span>{" "}
                <span className="text-gray-600">
                  {t("training.optimizer.calculation.hyperparamsStability")}
                </span>
              </span>
              <span>
                t = <span className="text-white">1</span>{" "}
                <span className="text-gray-600">
                  {t("training.optimizer.calculation.hyperparamsFirstIter")}
                </span>
              </span>
            </div>
          </div>

          {/* ─── Étape 1 : Momentum ─── */}
          <ConcreteCalculation
            title={t("training.optimizer.calculation.step1Title")}
            description={t("training.optimizer.calculation.step1Description")}
          >
            <div className="space-y-3">
              <div className="bg-gray-900 rounded p-2 font-mono text-xs text-center">
                <span className="text-amber-300">m</span> = β₁ ×{" "}
                <span className="text-gray-500">m_ancien</span> + (1 − β₁) ×{" "}
                <span className="text-yellow-300">gradient</span>
                <span className="text-gray-600 ml-2">
                  = 0.9 × m_ancien + 0.1 × g
                </span>
              </div>

              <AnimatedMathOperation totalSteps={3} delay={1200}>
                {(step) => (
                  <div className="space-y-2">
                    {OPT.weights.map((w, i) => {
                      const vis = step === -1 || step >= i;
                      const act = step === i;
                      return (
                        <div
                          key={i}
                          className={`bg-gray-800/30 rounded p-2.5 font-mono text-xs transition-all duration-500 ${!vis ? "opacity-0 h-0 overflow-hidden p-0 m-0" : act ? "border border-primary-500/50" : "border border-transparent"}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-400 text-[10px]">
                              {w.name}
                            </span>
                            <span className="text-gray-600 text-[10px]">
                              ({w.desc})
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <p>
                              <span className="text-amber-300">m</span> = 0.9 ×{" "}
                              <span className="text-gray-500">0</span> + 0.1 ×{" "}
                              <span className={gradColor(w.grad)}>
                                ({w.grad.toFixed(4)})
                              </span>
                              {" = "}
                              <span className="text-amber-300 font-bold">
                                {w.m.toFixed(4)}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Sortie */}
                    {(step === -1 || step >= 2) && (
                      <div className="bg-amber-900/10 border border-amber-800/30 rounded p-2 mt-2">
                        <p className="text-amber-300 font-semibold text-[10px] uppercase tracking-wide">
                          ▸{" "}
                          {t("training.optimizer.calculation.step1OutputLabel")}
                        </p>
                        <div className="font-mono text-xs mt-1 space-y-0.5">
                          {OPT.weights.map((w, i) => (
                            <p key={i}>
                              <span className="text-gray-500">{w.name} :</span>{" "}
                              <span className="text-amber-300">
                                {w.m.toFixed(4)}
                              </span>
                              <span className="text-gray-600">
                                {" "}
                                ←{" "}
                                {Math.abs(w.grad) > 0.5
                                  ? t(
                                      "training.optimizer.calculation.step1LargeGradient",
                                    )
                                  : t(
                                      "training.optimizer.calculation.step1SmallGradient",
                                    )}
                              </span>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </AnimatedMathOperation>
            </div>
          </ConcreteCalculation>

          {/* ─── Étape 2 : Vitesse adaptative ─── */}
          <ConcreteCalculation
            title={t("training.optimizer.calculation.step2Title")}
            description={t("training.optimizer.calculation.step2Description")}
          >
            <div className="space-y-3">
              <div className="bg-gray-900 rounded p-2 font-mono text-xs text-center">
                <span className="text-purple-300">v</span> = β₂ ×{" "}
                <span className="text-gray-500">v_ancien</span> + (1 − β₂) ×{" "}
                <span className="text-yellow-300">gradient²</span>
                <span className="text-gray-600 ml-2">
                  = 0.999 × v_ancien + 0.001 × g²
                </span>
              </div>

              <AnimatedMathOperation totalSteps={3} delay={1200}>
                {(step) => (
                  <div className="space-y-2">
                    {OPT.weights.map((w, i) => {
                      const vis = step === -1 || step >= i;
                      const act = step === i;
                      return (
                        <div
                          key={i}
                          className={`bg-gray-800/30 rounded p-2.5 font-mono text-xs transition-all duration-500 ${!vis ? "opacity-0 h-0 overflow-hidden p-0 m-0" : act ? "border border-primary-500/50" : "border border-transparent"}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-400 text-[10px]">
                              {w.name}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <p>
                              g² = ({w.grad.toFixed(4)})² ={" "}
                              <span className="text-white">
                                {w.gradSq.toFixed(4)}
                              </span>
                            </p>
                            <p>
                              <span className="text-purple-300">v</span> = 0.999
                              × <span className="text-gray-500">0</span> + 0.001
                              ×{" "}
                              <span className="text-white">
                                {w.gradSq.toFixed(4)}
                              </span>
                              {" = "}
                              <span className="text-purple-300 font-bold">
                                {fmtSci(w.v)}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {(step === -1 || step >= 2) && (
                      <div className="bg-purple-900/10 border border-purple-800/30 rounded p-2 mt-2">
                        <p className="text-purple-300 font-semibold text-[10px] uppercase tracking-wide">
                          ▸{" "}
                          {t("training.optimizer.calculation.step2OutputLabel")}
                        </p>
                        <div className="font-mono text-xs mt-1 space-y-0.5">
                          {OPT.weights.map((w, i) => (
                            <p key={i}>
                              <span className="text-gray-500">{w.name} :</span>{" "}
                              <span className="text-purple-300">
                                {fmtSci(w.v)}
                              </span>
                              <span className="text-gray-600">
                                {" "}
                                ← gradient{" "}
                                {Math.abs(w.grad) > 0.5
                                  ? t(
                                      "training.optimizer.calculation.step2StrongGradient",
                                    )
                                  : t(
                                      "training.optimizer.calculation.step2WeakGradient",
                                    )}{" "}
                                → v{" "}
                                {w.v > 0.0001
                                  ? t(
                                      "training.optimizer.calculation.step2LargeV",
                                    )
                                  : t(
                                      "training.optimizer.calculation.step2SmallV",
                                    )}
                              </span>
                            </p>
                          ))}
                        </div>
                        <p className="text-gray-500 text-[10px] mt-1">
                          {t("training.optimizer.calculation.step2Note")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </AnimatedMathOperation>
            </div>
          </ConcreteCalculation>

          {/* ─── Étape 3 : Correction du biais ─── */}
          <ConcreteCalculation
            title={t("training.optimizer.calculation.step3Title")}
            description={t("training.optimizer.calculation.step3Description")}
          >
            <div className="space-y-3">
              <div className="bg-gray-900 rounded p-2 font-mono text-xs text-center space-y-1">
                <p>
                  <span className="text-amber-300">m̂</span> ={" "}
                  <span className="text-amber-300">m</span> / (1 − β₁
                  <sup>t</sup>) = m / (1 − 0.9¹) = m /{" "}
                  <span className="text-white">0.1</span>{" "}
                  <span className="text-gray-600">← ×10 !</span>
                </p>
                <p>
                  <span className="text-purple-300">v̂</span> ={" "}
                  <span className="text-purple-300">v</span> / (1 − β₂
                  <sup>t</sup>) = v / (1 − 0.999¹) = v /{" "}
                  <span className="text-white">0.001</span>{" "}
                  <span className="text-gray-600">← ×1000 !</span>
                </p>
              </div>

              <div className="bg-amber-900/10 border border-amber-800/30 rounded p-2 text-xs text-gray-400">
                {t("training.optimizer.calculation.step3BiasExplanation")}
              </div>

              <AnimatedMathOperation totalSteps={3} delay={1200}>
                {(step) => (
                  <div className="space-y-2">
                    {OPT.weights.map((w, i) => {
                      const vis = step === -1 || step >= i;
                      const act = step === i;
                      return (
                        <div
                          key={i}
                          className={`bg-gray-800/30 rounded p-2.5 font-mono text-xs transition-all duration-500 ${!vis ? "opacity-0 h-0 overflow-hidden p-0 m-0" : act ? "border border-primary-500/50" : "border border-transparent"}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-400 text-[10px]">
                              {w.name}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <p>
                              <span className="text-amber-300">m̂</span> ={" "}
                              <span className="text-amber-300">
                                {w.m.toFixed(4)}
                              </span>{" "}
                              / 0.1
                              {" = "}
                              <span className="text-amber-300 font-bold">
                                {w.mHat.toFixed(4)}
                              </span>
                            </p>
                            <p>
                              <span className="text-purple-300">v̂</span> ={" "}
                              <span className="text-purple-300">
                                {fmtSci(w.v)}
                              </span>{" "}
                              / 0.001
                              {" = "}
                              <span className="text-purple-300 font-bold">
                                {w.vHat.toFixed(4)}
                              </span>
                              <span className="text-gray-600">
                                {" "}
                                → √v̂ = {w.sqrtVHat.toFixed(4)}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {(step === -1 || step >= 2) && (
                      <div className="bg-gray-800/50 border border-gray-700 rounded p-2 mt-2">
                        <p className="text-gray-300 font-semibold text-[10px] uppercase tracking-wide">
                          ▸{" "}
                          {t(
                            "training.optimizer.calculation.step3ObservationTitle",
                          )}
                        </p>
                        <div className="font-mono text-xs mt-1 space-y-0.5">
                          {OPT.weights.map((w, i) => (
                            <p key={i}>
                              <span className="text-gray-500">{w.name} :</span>{" "}
                              <span className="text-purple-300">
                                √v̂ = {w.sqrtVHat.toFixed(4)}
                              </span>{" "}
                              <span className="text-gray-600">
                                ≈ |g| = {Math.abs(w.grad).toFixed(4)}
                              </span>{" "}
                              <span className="text-green-400">✓</span>
                            </p>
                          ))}
                        </div>
                        <p className="text-gray-500 text-[10px] mt-1">
                          {t(
                            "training.optimizer.calculation.step3ObservationNote",
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </AnimatedMathOperation>
            </div>
          </ConcreteCalculation>

          {/* ─── Étape 4 : Mise à jour du poids ─── */}
          <ConcreteCalculation
            title={t("training.optimizer.calculation.step4Title")}
            description={t("training.optimizer.calculation.step4Description")}
          >
            <div className="space-y-3">
              <div className="bg-gray-900 rounded p-2 font-mono text-xs text-center">
                <span className="text-green-300">θ_nouveau</span> ={" "}
                <span className="text-white">θ</span> − α ×{" "}
                <span className="text-amber-300">m̂</span> / (
                <span className="text-purple-300">√v̂</span> + ε)
              </div>

              <AnimatedMathOperation totalSteps={3} delay={1200}>
                {(step) => (
                  <div className="space-y-2">
                    {OPT.weights.map((w, i) => {
                      const vis = step === -1 || step >= i;
                      const act = step === i;
                      return (
                        <div
                          key={i}
                          className={`bg-gray-800/30 rounded p-2.5 font-mono text-xs transition-all duration-500 ${!vis ? "opacity-0 h-0 overflow-hidden p-0 m-0" : act ? "border border-primary-500/50" : "border border-transparent"}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-400 text-[10px]">
                              {w.name}
                            </span>
                            <span className="text-gray-600 text-[10px]">
                              gradient = {w.grad.toFixed(4)}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            <p>
                              correction = {OPT.lr} ×{" "}
                              <span className="text-amber-300">
                                {w.mHat.toFixed(4)}
                              </span>{" "}
                              / (
                              <span className="text-purple-300">
                                {w.sqrtVHat.toFixed(4)}
                              </span>{" "}
                              + ε)
                              {" = "}
                              <span
                                className={`font-bold ${w.update < 0 ? "text-blue-300" : "text-red-400"}`}
                              >
                                {w.update.toFixed(4)}
                              </span>
                            </p>
                            <p>
                              <span className="text-green-300 font-bold">
                                {w.thetaNew.toFixed(4)}
                              </span>
                              {" = "}
                              <span className="text-white">
                                {w.theta.toFixed(2)}
                              </span>
                              {" − "}
                              <span className="text-gray-400">
                                ({w.update.toFixed(4)})
                              </span>
                              <span className="text-gray-600">
                                {" "}
                                ←{" "}
                                {w.grad < 0
                                  ? t(
                                      "training.optimizer.calculation.step4Increased",
                                    )
                                  : t(
                                      "training.optimizer.calculation.step4Decreased",
                                    )}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Sortie + observation */}
                    {(step === -1 || step >= 2) && (
                      <div className="space-y-2 mt-2">
                        <div className="bg-green-900/10 border border-green-800/30 rounded p-2">
                          <p className="text-green-400 font-semibold text-[10px] uppercase tracking-wide">
                            ▸{" "}
                            {t(
                              "training.optimizer.calculation.step4OutputLabel",
                            )}
                          </p>
                          <div className="font-mono text-xs mt-1 space-y-0.5">
                            {OPT.weights.map((w, i) => (
                              <p key={i}>
                                <span className="text-gray-500">
                                  {w.name} :
                                </span>{" "}
                                <span className="text-gray-500">
                                  {w.theta.toFixed(2)}
                                </span>
                                {" → "}
                                <span className="text-green-400 font-bold">
                                  {w.thetaNew.toFixed(4)}
                                </span>
                                <span className="text-gray-600">
                                  {" "}
                                  (correction : {w.update.toFixed(4)})
                                </span>
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="bg-amber-900/15 border border-amber-800/30 rounded p-3 space-y-2">
                          <p className="text-amber-300 font-semibold text-xs">
                            {t(
                              "training.optimizer.calculation.step4MagicTitle",
                            )}
                          </p>
                          <div className="font-mono text-xs space-y-1">
                            {OPT.weights.map((w, i) => (
                              <p key={i}>
                                <span className="text-gray-400">
                                  {w.name} :
                                </span>{" "}
                                <span className="text-gray-500">
                                  |gradient| = {Math.abs(w.grad).toFixed(4)}
                                </span>
                                {" → "}
                                <span className="text-white">
                                  |correction| = {Math.abs(w.update).toFixed(4)}
                                </span>
                              </p>
                            ))}
                          </div>
                          <p
                            className="text-gray-400 text-xs"
                            dangerouslySetInnerHTML={{
                              __html: t(
                                "training.optimizer.calculation.step4MagicNote",
                                { lr: OPT.lr },
                              ),
                            }}
                          />
                          <p
                            className="text-gray-500 text-xs"
                            dangerouslySetInnerHTML={{
                              __html: t(
                                "training.optimizer.calculation.step4NaiveNote",
                              ),
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </AnimatedMathOperation>
            </div>
          </ConcreteCalculation>

          {/* ─── Momentum en action sur 3 itérations ─── */}
          <ConcreteCalculation
            title={t("training.optimizer.calculation.momentumActionTitle")}
            description={t(
              "training.optimizer.calculation.momentumActionDescription",
              { name: OPT.weights[0].name },
            )}
          >
            <div className="space-y-3">
              <div
                className="bg-gray-800/50 rounded p-2 text-xs text-gray-400"
                dangerouslySetInnerHTML={{
                  __html: t(
                    "training.optimizer.calculation.momentumExplanation",
                  ),
                }}
              />

              <AnimatedMathOperation totalSteps={3} delay={2000}>
                {(step) => (
                  <div className="space-y-3">
                    {OPT.iterations.map((it, i) => {
                      const vis = step === -1 || step >= i;
                      const act = step === i;
                      const isOpposite = it.grad > 0;
                      return (
                        <div
                          key={i}
                          className={`bg-gray-800/30 rounded-lg p-3 space-y-2 border transition-all duration-500 ${!vis ? "opacity-0 h-0 overflow-hidden p-0 m-0" : act ? "border-primary-500/50" : "border-gray-800/50"}`}
                        >
                          <h4
                            className={`text-xs font-semibold ${act ? "text-white" : "text-gray-300"}`}
                          >
                            Itération {it.t} — gradient :{" "}
                            <span
                              className={
                                isOpposite ? "text-red-400" : "text-blue-300"
                              }
                            >
                              {it.grad.toFixed(4)}
                            </span>{" "}
                            <span className="text-gray-500 font-normal">
                              ({it.gradDesc})
                            </span>
                          </h4>
                          <div className="bg-gray-900 rounded p-2 font-mono text-xs space-y-1">
                            <p>
                              <span className="text-amber-300">m</span> = 0.9 ×{" "}
                              <span className="text-gray-500">
                                {i === 0
                                  ? "0"
                                  : OPT.iterations[i - 1].m.toFixed(4)}
                              </span>{" "}
                              + 0.1 ×{" "}
                              <span className={gradColor(it.grad)}>
                                ({it.grad.toFixed(4)})
                              </span>
                              {" = "}
                              <span className="text-amber-300 font-bold">
                                {it.m.toFixed(4)}
                              </span>
                              {isOpposite && (
                                <span className="text-gray-500">
                                  {" "}
                                  ← ralenti, mais reste négatif
                                </span>
                              )}
                            </p>
                            <p>
                              <span className="text-amber-300">m̂</span> ={" "}
                              {it.mHat.toFixed(4)}
                              {" → "}correction ={" "}
                              <span
                                className={`font-bold ${it.update < 0 ? "text-blue-300" : "text-red-400"}`}
                              >
                                {it.update.toFixed(4)}
                              </span>
                              {" → "}θ ={" "}
                              <span className="text-green-300 font-bold">
                                {it.theta.toFixed(4)}
                              </span>
                            </p>
                          </div>
                          {isOpposite && (
                            <p className="text-green-300 text-xs font-medium">
                              Le gradient dit « recule » (+0.15), mais le
                              momentum (m={it.m.toFixed(4)}) dit « continue ! ».
                              Adam ignore le bruit ponctuel.
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* Comparaison Adam vs naïf */}
                    {(step === -1 || step >= 2) && (
                      <div className="bg-gray-800/50 border border-gray-700 rounded p-3 mt-2">
                        <p className="text-gray-300 font-semibold text-xs mb-2">
                          Comparaison après 3 itérations :
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full font-mono text-xs text-center">
                            <thead>
                              <tr className="text-gray-500 border-b border-gray-800">
                                <th className="p-1">itération</th>
                                <th className="p-1">gradient</th>
                                <th className="p-1">Adam</th>
                                <th className="p-1">naïf</th>
                              </tr>
                            </thead>
                            <tbody>
                              {OPT.iterations.map((it, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-gray-900/50"
                                >
                                  <td className="p-1 text-gray-400">
                                    t={it.t}
                                  </td>
                                  <td className={`p-1 ${gradColor(it.grad)}`}>
                                    {it.grad.toFixed(4)}
                                  </td>
                                  <td className="p-1 text-green-400 font-bold">
                                    {it.theta.toFixed(4)}
                                  </td>
                                  <td
                                    className={`p-1 ${i === 2 ? "text-red-400" : "text-gray-400"}`}
                                  >
                                    {OPT.naiveSGD[i].theta.toFixed(4)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">
                          À t=3, le gradient naïf{" "}
                          <span className="text-red-400">recule</span> (0.8316 →
                          0.8315) tandis qu'Adam{" "}
                          <span className="text-green-400">
                            continue d'avancer
                          </span>{" "}
                          (0.8320 → 0.8327). Sur des milliers d'itérations, cet
                          effet s'accumule considérablement.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </AnimatedMathOperation>
            </div>
          </ConcreteCalculation>

          {/* ─── Visualisation ─── */}
          <ConcreteCalculation
            title={t("training.optimizer.calculation.vizTitle")}
            description={t("training.optimizer.calculation.vizDescription")}
          >
            <OptimizerViz />
          </ConcreteCalculation>

          {/* ─── En résumé ─── */}
          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-green-300 font-semibold text-sm">
              {t("training.optimizer.summary.title")}
            </h4>

            {/* ENTRÉE */}
            <div className="bg-red-900/20 border border-red-800/30 rounded p-3">
              <p className="text-red-300 font-semibold text-[10px] uppercase tracking-wide mb-2">
                ▸ {t("training.optimizer.summary.inputLabel")}
              </p>
              <div className="font-mono text-xs space-y-1">
                {OPT.weights.map((w, i) => (
                  <p key={i}>
                    <span className="text-gray-400">{w.name}</span> ={" "}
                    <span className="text-white">{w.theta.toFixed(2)}</span>,
                    gradient ={" "}
                    <span className={gradColor(w.grad)}>{fmt(w.grad)}</span>
                  </p>
                ))}
                <p className="text-gray-500 text-[10px]">
                  × ~50 000 poids — chacun avec son propre gradient.
                </p>
              </div>
            </div>

            <div className="text-center text-gray-600">↓</div>

            {/* OPÉRATION */}
            <div className="bg-gray-800/50 border border-gray-700 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-gray-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸ {t("training.optimizer.summary.operationLabel")}
                </p>
              </div>
              <div className="font-mono text-xs space-y-1">
                <p>
                  <span className="text-amber-300">1.</span> m = β₁ × m + (1−β₁)
                  × g <span className="text-gray-600">← direction (élan)</span>
                </p>
                <p>
                  <span className="text-purple-300">2.</span> v = β₂ × v +
                  (1−β₂) × g²{" "}
                  <span className="text-gray-600">
                    ← amplitude (adaptateur)
                  </span>
                </p>
                <p>
                  <span className="text-gray-300">3.</span> m̂ = m / (1−β₁
                  <sup>t</sup>), v̂ = v / (1−β₂<sup>t</sup>){" "}
                  <span className="text-gray-600">← correction biais</span>
                </p>
                <p>
                  <span className="text-green-300">4.</span> θ = θ − α × m̂ / (√v̂
                  + ε) <span className="text-gray-600">← mise à jour</span>
                </p>
              </div>
            </div>

            <div className="text-center text-gray-600">↓</div>

            {/* SORTIE */}
            <div className="bg-green-900/20 border border-green-800/30 rounded p-3">
              <p className="text-green-300 font-semibold text-[10px] uppercase tracking-wide mb-2">
                ▸ {t("training.optimizer.summary.outputLabel")}
              </p>
              <div className="font-mono text-xs space-y-1">
                {OPT.weights.map((w, i) => (
                  <p key={i}>
                    <span className="text-gray-400">{w.name}</span> :{" "}
                    <span className="text-gray-500">{w.theta.toFixed(2)}</span>
                    {" → "}
                    <strong className="text-green-400">
                      {w.thetaNew.toFixed(4)}
                    </strong>
                    <span className="text-gray-600">
                      {" "}
                      (correction : {w.update.toFixed(4)})
                    </span>
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded p-3 font-mono text-xs text-center mt-1">
              <span className="text-green-300">θ</span> = θ −{" "}
              <span className="text-green-400">α</span> ×{" "}
              <span className="text-amber-300">m̂</span> / (
              <span className="text-purple-300">√v̂</span> + ε)
            </div>
            <p className="text-gray-500 text-xs">
              {t("training.optimizer.summary.note")}
            </p>
          </div>
        </div>
      }
      deepDive={
        <DeepDiveSection
          title={t("training.optimizer.deepDive.title")}
          docSlug="optimizer"
          formulas={[
            {
              name: "Mise à jour des moments",
              latex:
                "m_t = \\beta_1 m_{t-1} + (1-\\beta_1) g_t \\quad v_t = \\beta_2 v_{t-1} + (1-\\beta_2) g_t^2",
              explanation:
                "m est la moyenne mobile du gradient (direction), v est la moyenne mobile du gradient² (amplitude). β₁ = 0.9 → m change assez vite. β₂ = 0.999 → v est très stable (mémoire longue).",
            },
            {
              name: "Correction du biais",
              latex:
                "\\hat{m}_t = \\frac{m_t}{1 - \\beta_1^t} \\quad \\hat{v}_t = \\frac{v_t}{1 - \\beta_2^t}",
              explanation:
                "Au début (t petit), m et v sont initialisés à 0 et donc sous-estiment les vraies valeurs. La division par (1−β^t) corrige ce biais. Quand t est grand, (1−β^t) ≈ 1 et la correction disparaît.",
            },
            {
              name: "Mise à jour du poids",
              latex:
                "\\theta_t = \\theta_{t-1} - \\alpha \\frac{\\hat{m}_t}{\\sqrt{\\hat{v}_t} + \\epsilon}",
              explanation:
                "Le poids est ajusté proportionnellement à la direction (m̂) et inversement à l'amplitude (√v̂). α = learning rate (typiquement 0.001). ε = 10⁻⁸ pour la stabilité numérique. Chaque poids a sa propre « vitesse effective » = α/√v̂.",
            },
          ]}
        />
      }
    />
  );
}
