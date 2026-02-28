/**
 * Étape Génération 3 : Probabilités et Température
 *
 * Page enrichie avec :
 * - Problématique : les scores bruts ne sont pas des probabilités
 * - Comment softmax transforme les scores
 * - Exemple numérique complet
 * - Le rôle de la température avec analogie
 *
 * @module pages/generation-steps/SoftmaxTemperatureStep
 */

import { useTranslation } from "react-i18next";
import StepExplainer from "@/components/educational/StepExplainer";
import ConcreteCalculation from "@/components/educational/ConcreteCalculation";
import DeepDiveSection from "@/components/educational/DeepDiveSection";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";
import SoftmaxBar from "@/components/visualizations/SoftmaxBar";
import AnimatedMathOperation from "@/components/visualizations/AnimatedMathOperation";
import { EXAMPLE_SOFTMAX } from "@/lib/exampleData";

export default function SoftmaxTemperatureStep() {
  const { t } = useTranslation("pages");

  return (
    <StepExplainer
      sectionId="generation/softmax"
      phase="generation"
      stepNumber={3}
      totalSteps={5}
      title={t("generation.softmax.title")}
      subtitle={t("generation.softmax.subtitle")}
      docSlug="generator"
      exampleContext={t("generation.softmax.exampleContext")}
      explanation={
        <>
          {/* ─── Le problème ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("generation.softmax.problem.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {
                t("generation.softmax.problem.description1").split(
                  "scores bruts",
                )[0]
              }
              <VulgarizedTerm termKey="logits">scores bruts</VulgarizedTerm>
              {
                t("generation.softmax.problem.description1").split(
                  "scores bruts",
                )[1]
              }
            </p>
            <p className="text-gray-300 text-sm">
              {t("generation.softmax.problem.description2")}
            </p>
          </div>

          {/* ─── Softmax expliqué ─── */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-blue-300 font-semibold text-sm">
              {t("generation.softmax.softmaxExplained.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {
                t("generation.softmax.softmaxExplained.description").split(
                  "softmax",
                )[0]
              }
              <VulgarizedTerm termKey="softmax" />
              {
                t("generation.softmax.softmaxExplained.description").split(
                  "softmax",
                )[1]
              }
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-400 space-y-1 ml-2">
              <li>{t("generation.softmax.softmaxExplained.step1")}</li>
              <li>{t("generation.softmax.softmaxExplained.step2")}</li>
              <li>{t("generation.softmax.softmaxExplained.step3")}</li>
            </ol>
            <div className="bg-gray-900 rounded p-3 font-mono text-xs mt-2">
              <p className="text-gray-500">
                {t("generation.softmax.code.rawScoresComment")}
              </p>
              <p>
                t: <span className="text-white">2.1</span>, e:{" "}
                <span className="text-white">1.1</span>, a:{" "}
                <span className="text-white">0.9</span>
              </p>
              <p className="text-gray-500 mt-1">
                {t("generation.softmax.code.afterSoftmaxComment")}
              </p>
              <p>
                t: <span className="text-green-400">36%</span>, e:{" "}
                <span className="text-blue-300">13%</span>, a:{" "}
                <span className="text-blue-300">11%</span>
              </p>
              <p className="text-gray-600 mt-1">
                {t("generation.softmax.code.amplificationNote")}
              </p>
            </div>
          </div>

          {/* ─── La température ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("generation.softmax.temperature.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {
                t("generation.softmax.temperature.description").split(
                  "température",
                )[0]
              }
              <VulgarizedTerm termKey="temperature">température</VulgarizedTerm>
              {
                t("generation.softmax.temperature.description").split(
                  "température",
                )[1]
              }
            </p>
            <div className="space-y-2 mt-2">
              <div className="bg-gray-900 rounded p-3">
                <p className="text-blue-400 font-semibold text-xs">
                  {t("generation.softmax.temperature.low.title")}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {t("generation.softmax.temperature.low.description")}
                </p>
              </div>
              <div className="bg-gray-900 rounded p-3">
                <p className="text-green-400 font-semibold text-xs">
                  {t("generation.softmax.temperature.medium.title")}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {t("generation.softmax.temperature.medium.description")}
                </p>
              </div>
              <div className="bg-gray-900 rounded p-3">
                <p className="text-red-400 font-semibold text-xs">
                  {t("generation.softmax.temperature.high.title")}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {t("generation.softmax.temperature.high.description")}
                </p>
              </div>
            </div>
          </div>
        </>
      }
      calculation={
        <div className="space-y-8">
          {/* ─── Exemple concret ─── */}
          <ConcreteCalculation
            title={t("generation.softmax.calculation.title")}
            description={t("generation.softmax.calculation.description")}
          >
            <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
              <div className="text-sm text-gray-400 space-y-2">
                <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                  <AnimatedMathOperation totalSteps={4} delay={1200}>
                    {(step) => {
                      const tokens = ["t", "e", "a", "h", "c", "⎵", "L"];
                      const scores = [2.1, 1.1, 0.9, 0.6, 0.4, 0.2, -0.3];
                      const divided = [
                        "2.63",
                        "1.38",
                        "1.13",
                        "0.75",
                        "0.50",
                        "0.25",
                        "-0.38",
                      ];
                      const exps = [
                        "13.8",
                        "3.96",
                        "3.08",
                        "2.12",
                        "1.65",
                        "1.28",
                        "0.69",
                      ];
                      const probs = [
                        "52%",
                        "15%",
                        "12%",
                        "8%",
                        "6%",
                        "5%",
                        "3%",
                      ];
                      return (
                        <div className="space-y-1">
                          {/* Step 0: Scores bruts */}
                          <p
                            className={`transition-colors duration-300 ${step === 0 ? "text-white font-semibold" : "text-gray-500"}`}
                          >
                            {t("generation.softmax.code.rawLogitsComment")}
                          </p>
                          <p>
                            {tokens.map((t, i) => (
                              <span key={i}>
                                {t}:{" "}
                                <span className="text-blue-400">
                                  {scores[i]}
                                </span>
                                {i < 6 ? ", " : ""}
                              </span>
                            ))}
                          </p>

                          {/* Step 1: Division par T */}
                          <p
                            className={`mt-2 transition-all duration-300 ${step === -1 || step >= 1 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"} ${step === 1 ? "text-white font-semibold" : "text-gray-500"}`}
                          >
                            {t("generation.softmax.code.divideByTComment")}
                          </p>
                          <p
                            className={`transition-all duration-300 ${step === -1 || step >= 1 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
                          >
                            {tokens.map((t, i) => (
                              <span key={i}>
                                {t}:{" "}
                                <span
                                  className={
                                    step === 1
                                      ? "text-amber-400 font-bold"
                                      : "text-amber-400"
                                  }
                                >
                                  {divided[i]}
                                </span>
                                {i < 6 ? ", " : ""}
                              </span>
                            ))}
                          </p>

                          {/* Step 2: Exponentielle */}
                          <p
                            className={`mt-2 transition-all duration-300 ${step === -1 || step >= 2 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"} ${step === 2 ? "text-white font-semibold" : "text-gray-500"}`}
                          >
                            {t("generation.softmax.code.exponentialComment")}
                          </p>
                          <p
                            className={`transition-all duration-300 ${step === -1 || step >= 2 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
                          >
                            {tokens.map((t, i) => (
                              <span key={i}>
                                {t}:{" "}
                                <span
                                  className={
                                    step === 2
                                      ? "text-green-400 font-bold"
                                      : "text-green-400"
                                  }
                                >
                                  {exps[i]}
                                </span>
                                {i < 6 ? ", " : ""}
                              </span>
                            ))}
                          </p>

                          {/* Step 3: Division par somme → probabilités */}
                          <p
                            className={`mt-2 transition-all duration-300 ${step === -1 || step >= 3 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"} ${step === 3 ? "text-white font-semibold" : "text-gray-500"}`}
                          >
                            {t("generation.softmax.code.divisionBySumComment")}
                          </p>
                          <p
                            className={`transition-all duration-300 ${step === -1 || step >= 3 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
                          >
                            {tokens.map((t, i) => (
                              <span key={i}>
                                {t}:{" "}
                                <span
                                  className={`${step === 3 ? "font-bold" : ""} ${i === 0 ? "text-green-400" : "text-white"}`}
                                >
                                  {probs[i]}
                                </span>
                                {i < 6 ? ", " : ""}
                              </span>
                            ))}
                          </p>
                        </div>
                      );
                    }}
                  </AnimatedMathOperation>
                </div>
              </div>
            </div>
          </ConcreteCalculation>

          {/* ─── Visualisation interactive ─── */}
          <ConcreteCalculation
            title={t("generation.softmax.calculation.effectTitle")}
            description={t("generation.softmax.calculation.effectDescription")}
          >
            <SoftmaxBar
              logits={EXAMPLE_SOFTMAX.logits}
              temperatureDistributions={EXAMPLE_SOFTMAX.temperatures}
            />
          </ConcreteCalculation>

          {/* ─── Résumé ─── */}
          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-2">
            <h4 className="text-green-300 font-semibold text-sm">
              {t("generation.softmax.summary.title")}
            </h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>
                <strong>1.</strong> {t("generation.softmax.summary.step1")}
              </p>
              <p>
                <strong>2.</strong> {t("generation.softmax.summary.step2")}
              </p>
              <p>
                <strong>3.</strong> {t("generation.softmax.summary.step3")}
              </p>
              <div className="bg-gray-900 rounded p-3 font-mono text-xs text-center mt-2">
                P(x<sub>i</sub>) = e
                <sup>
                  <span className="text-amber-300">
                    score<sub>i</sub>
                  </span>{" "}
                  / <span className="text-blue-300">T</span>
                </sup>{" "}
                / Σ e
                <sup>
                  <span className="text-amber-300">
                    score<sub>j</sub>
                  </span>{" "}
                  / <span className="text-blue-300">T</span>
                </sup>
              </div>
            </div>
          </div>
        </div>
      }
      deepDive={
        <DeepDiveSection
          title={t("generation.softmax.deepDive.title")}
          docSlug="generator"
          formulas={[
            {
              name: t("generation.softmax.deepDive.formulaName"),
              latex: "P(x_i) = \\frac{e^{x_i / T}}{\\sum_j e^{x_j / T}}",
              explanation: t("generation.softmax.deepDive.formulaExplanation"),
            },
            {
              name: t("generation.softmax.deepDive.propertiesName"),
              latex:
                "\\sum_i P(x_i) = 1 \\quad \\text{et} \\quad 0 \\leq P(x_i) \\leq 1",
              explanation: t(
                "generation.softmax.deepDive.propertiesExplanation",
              ),
            },
          ]}
        />
      }
    />
  );
}
