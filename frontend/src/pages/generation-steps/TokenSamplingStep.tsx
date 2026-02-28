/**
 * Étape Génération 4 : Échantillonnage
 *
 * Page enrichie avec :
 * - Problématique : pourquoi ne pas toujours prendre le plus probable ?
 * - Analogie de la roue de la fortune
 * - Exemple concret avec tirage pondéré
 * - Comparaison greedy vs sampling vs top-k/top-p
 *
 * @module pages/generation-steps/TokenSamplingStep
 */

import { useTranslation } from "react-i18next";
import StepExplainer from "@/components/educational/StepExplainer";
import ConcreteCalculation from "@/components/educational/ConcreteCalculation";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";

export default function TokenSamplingStep() {
  const { t } = useTranslation("pages");

  return (
    <StepExplainer
      sectionId="generation/sampling"
      phase="generation"
      stepNumber={4}
      totalSteps={5}
      title={t("generation.sampling.title")}
      subtitle={t("generation.sampling.subtitle")}
      docSlug="generator"
      exampleContext={t("generation.sampling.exampleContext")}
      explanation={
        <>
          {/* ─── Le problème ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("generation.sampling.problem.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("generation.sampling.problem.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono space-y-1">
              <p className="text-gray-500">
                {t("generation.sampling.code.greedyComment")}
              </p>
              <p>
                « Le chat
                <span className="text-red-400">Le chatLe chatLe chat...</span> »
              </p>
              <p className="text-gray-500 mt-1">
                {t("generation.sampling.code.greedyLoopComment")}
              </p>
            </div>
            <p className="text-gray-400 text-xs">
              {t("generation.sampling.problem.greedyProblem")}
            </p>
          </div>

          {/* ─── L'idée ─── */}
          <p>
            <VulgarizedTerm termKey="sampling">échantillonnage</VulgarizedTerm>{" "}
            {t("generation.sampling.idea").split("échantillonnage")[1]}
          </p>

          {/* ─── Analogie de la roue ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("generation.sampling.wheelAnalogy.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("generation.sampling.wheelAnalogy.description")}
            </p>
            <div className="flex items-center justify-center gap-1 py-2">
              {[
                { char: "t", pct: 52, color: "bg-green-500" },
                { char: "e", pct: 15, color: "bg-blue-500" },
                { char: "a", pct: 12, color: "bg-blue-400" },
                { char: "h", pct: 8, color: "bg-purple-500" },
                { char: "c", pct: 6, color: "bg-gray-500" },
                { char: "⎵", pct: 5, color: "bg-gray-500" },
                { char: "L", pct: 3, color: "bg-gray-600" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`${item.color} rounded opacity-80 flex items-center justify-center`}
                  style={{ width: `${item.pct * 2.5}px`, height: "40px" }}
                >
                  <span className="text-white text-xs font-mono font-bold">
                    {item.char}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-xs">
              {t("generation.sampling.wheelAnalogy.note")}
            </p>
          </div>

          {/* ─── Stratégies de sélection ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("generation.sampling.strategies.title")}
            </h4>
            <div className="space-y-2 mt-1">
              <div className="bg-gray-900 rounded p-3">
                <p className="text-primary-400 font-semibold text-xs">
                  {t("generation.sampling.strategies.simple.title")}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {t("generation.sampling.strategies.simple.description")}
                </p>
              </div>
              <div className="bg-gray-900 rounded p-3">
                <p className="text-purple-400 font-semibold text-xs">
                  {t("generation.sampling.strategies.topK.title")}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {t("generation.sampling.strategies.topK.description")}
                </p>
              </div>
              <div className="bg-gray-900 rounded p-3">
                <p className="text-green-400 font-semibold text-xs">
                  {t("generation.sampling.strategies.topP.title")}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {t("generation.sampling.strategies.topP.description")}
                </p>
              </div>
              <div className="bg-gray-900 rounded p-3">
                <p className="text-gray-400 font-semibold text-xs">
                  {t("generation.sampling.strategies.greedy.title")}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {t("generation.sampling.strategies.greedy.description")}
                </p>
              </div>
            </div>
          </div>
        </>
      }
      calculation={
        <div className="space-y-8">
          <ConcreteCalculation
            title={t("generation.sampling.calculation.title")}
            description={t("generation.sampling.calculation.description")}
          >
            <div className="space-y-4">
              <div className="text-center space-y-4 py-2">
                <div className="flex items-end justify-center gap-3">
                  {[
                    { char: "t", prob: 52, color: "bg-green-500" },
                    { char: "e", prob: 15, color: "bg-blue-500" },
                    { char: "a", prob: 12, color: "bg-blue-400" },
                    { char: "h", prob: 8, color: "bg-purple-500" },
                    { char: "c", prob: 6, color: "bg-gray-500" },
                    { char: "⎵", prob: 5, color: "bg-gray-500" },
                    { char: "L", prob: 3, color: "bg-gray-700" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-500">
                        {item.prob}%
                      </span>
                      <div
                        className={`w-12 ${item.color} rounded-t opacity-80`}
                        style={{ height: `${item.prob * 2.5}px` }}
                      />
                      <span className="text-sm font-mono text-gray-300">
                        {item.char === "⎵" ? "⎵" : item.char}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <div className="text-sm text-gray-400 space-y-2">
                  <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-1">
                    <p className="text-gray-500">
                      {t("generation.sampling.code.randomDrawComment")}
                    </p>
                    <p>
                      random() = <span className="text-amber-300">0.27</span>
                    </p>
                    <p className="text-gray-500 mt-1">
                      {t("generation.sampling.code.accumulateComment")}
                    </p>
                    <p>
                      t : 0.00 – 0.52{" "}
                      <span className="text-green-400">
                        {t("generation.sampling.code.fallsHere")}
                      </span>
                    </p>
                    <p>e : 0.52 – 0.67</p>
                    <p>a : 0.67 – 0.79</p>
                    <p>h : 0.79 – 0.87</p>
                    <p>c : 0.87 – 0.93</p>
                    <p>⎵ : 0.93 – 0.97</p>
                    <p>L : 0.97 – 1.00</p>
                    <p className="mt-1">
                      {t("generation.sampling.code.selectedToken")}{" "}
                      <strong className="text-green-400">« t »</strong>
                    </p>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {t("generation.sampling.calculation.randomNote")}
                  </p>
                </div>
              </div>
            </div>
          </ConcreteCalculation>

          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-2">
            <h4 className="text-green-300 font-semibold text-sm">
              {t("generation.sampling.summary.title")}
            </h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>
                <strong>1.</strong> {t("generation.sampling.summary.step1")}
              </p>
              <p>
                <strong>2.</strong> {t("generation.sampling.summary.step2")}
              </p>
              <p>
                <strong>3.</strong> {t("generation.sampling.summary.step3")}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                {t("generation.sampling.summary.note")}
              </p>
            </div>
          </div>
        </div>
      }
    />
  );
}
