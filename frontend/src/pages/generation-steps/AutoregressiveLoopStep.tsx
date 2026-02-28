/**
 * Étape Génération 5 : Boucle autorégressive
 *
 * Page enrichie avec :
 * - Problématique : un seul token ne fait pas un texte
 * - Analogie de l'écriture mot par mot
 * - Le concept de fenêtre de contexte
 * - Visualisation pas-à-pas interactive
 *
 * @module pages/generation-steps/AutoregressiveLoopStep
 */

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import StepExplainer from "@/components/educational/StepExplainer";
import ConcreteCalculation from "@/components/educational/ConcreteCalculation";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";
import AutoregressiveLoop from "@/components/visualizations/AutoregressiveLoop";
import { EXAMPLE_GENERATION } from "@/lib/exampleData";

export default function AutoregressiveLoopStep() {
  const { t } = useTranslation("pages");

  return (
    <StepExplainer
      sectionId="generation/autoregressive"
      phase="generation"
      stepNumber={5}
      totalSteps={5}
      title={t("generation.autoregressive.title")}
      subtitle={t("generation.autoregressive.subtitle")}
      docSlug="generator"
      exampleContext={t("generation.autoregressive.exampleContext")}
      explanation={
        <>
          {/* ─── Le problème ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("generation.autoregressive.problem.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("generation.autoregressive.problem.description1")}
            </p>
            <p className="text-gray-300 text-sm">
              {t("generation.autoregressive.problem.description2")}
            </p>
          </div>

          {/* ─── L'idée ─── */}
          <p>
            {
              t("generation.autoregressive.idea").split(
                "génération autorégressive",
              )[0]
            }
            <VulgarizedTerm termKey="autoregressive">
              génération autorégressive
            </VulgarizedTerm>
            {
              t("generation.autoregressive.idea").split(
                "génération autorégressive",
              )[1]
            }
          </p>

          {/* ─── Analogie ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("generation.autoregressive.blindWriterAnalogy.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("generation.autoregressive.blindWriterAnalogy.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-1">
              <p>
                {t("generation.autoregressive.code.blindWriterRead")} « Le » →{" "}
                {t("generation.autoregressive.code.blindWriterWrite")}{" "}
                <span className="text-green-400">⎵</span>
              </p>
              <p>
                {t("generation.autoregressive.code.blindWriterRead")} « Le ⎵ » →{" "}
                {t("generation.autoregressive.code.blindWriterWrite")}{" "}
                <span className="text-green-400">c</span>
              </p>
              <p>
                {t("generation.autoregressive.code.blindWriterRead")} « Le c » →{" "}
                {t("generation.autoregressive.code.blindWriterWrite")}{" "}
                <span className="text-green-400">h</span>
              </p>
              <p>
                {t("generation.autoregressive.code.blindWriterRead")} « Le ch »
                → {t("generation.autoregressive.code.blindWriterWrite")}{" "}
                <span className="text-green-400">a</span>
              </p>
              <p>
                {t("generation.autoregressive.code.blindWriterRead")} « Le cha »
                → {t("generation.autoregressive.code.blindWriterWrite")}{" "}
                <span className="text-green-400">t</span>
              </p>
              <p className="text-gray-500">
                {t("generation.autoregressive.code.blindWriterResult")}
              </p>
            </div>
            <p className="text-gray-400 text-xs">
              {t("generation.autoregressive.blindWriterAnalogy.note")}
            </p>
          </div>

          {/* ─── La boucle détaillée ─── */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-blue-300 font-semibold text-sm">
              {t("generation.autoregressive.loopSteps.title")}
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400 ml-2">
              <li>{t("generation.autoregressive.loopSteps.step1")}</li>
              <li>{t("generation.autoregressive.loopSteps.step2")}</li>
              <li>{t("generation.autoregressive.loopSteps.step3")}</li>
              <li>{t("generation.autoregressive.loopSteps.step4")}</li>
              <li>{t("generation.autoregressive.loopSteps.step5")}</li>
            </ol>
          </div>

          {/* ─── Fenêtre de contexte ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("generation.autoregressive.contextWindow.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {
                t("generation.autoregressive.contextWindow.description").split(
                  "derniers tokens",
                )[0]
              }
              <VulgarizedTerm termKey="seq_len">derniers tokens</VulgarizedTerm>
              {
                t("generation.autoregressive.contextWindow.description").split(
                  "derniers tokens",
                )[1]
              }
            </p>
            <div className="bg-gray-900 rounded p-3 font-mono text-xs">
              <p className="text-gray-500">
                {t("generation.autoregressive.code.contextWindowComment")}
              </p>
              <p>
                <span className="text-red-400 line-through">
                  Le chatLe chatLe ch
                </span>
                <span className="text-green-400">atLe chatLe chat...</span>
              </p>
              <p className="text-gray-600 mt-1">
                {t("generation.autoregressive.code.contextWindowForgotten")}
              </p>
            </div>
          </div>

          {/* ─── Conditions d'arrêt ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("generation.autoregressive.stopConditions.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("generation.autoregressive.stopConditions.description")}
            </p>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-1 ml-2">
              <li>
                {
                  t("generation.autoregressive.stopConditions.maxTokens").split(
                    "max_gen_len",
                  )[0]
                }
                <VulgarizedTerm termKey="max_gen_len" />
                {t(
                  "generation.autoregressive.stopConditions.maxTokens",
                ).includes("max_gen_len")
                  ? ""
                  : ""}
              </li>
              <li>
                {
                  t("generation.autoregressive.stopConditions.eosToken").split(
                    "token de fin",
                  )[0]
                }
                <VulgarizedTerm termKey="eos_token">
                  token de fin
                </VulgarizedTerm>{" "}
                (<code className="text-purple-300">&lt;EOS&gt;</code>)
              </li>
            </ul>
          </div>

          {/* ─── Tokens spéciaux BOS / EOS ─── */}
          <div className="bg-purple-900/15 border border-purple-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-purple-300 font-semibold text-sm">
              {t("generation.autoregressive.bosEos.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("generation.autoregressive.bosEos.description")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-900 rounded p-3 space-y-1">
                <p className="text-purple-300 font-mono text-xs font-bold">
                  {t("generation.autoregressive.bosEos.bos.title")}
                </p>
                <p className="text-gray-400 text-xs">
                  {t("generation.autoregressive.bosEos.bos.description")}
                </p>
              </div>
              <div className="bg-gray-900 rounded p-3 space-y-1">
                <p className="text-purple-300 font-mono text-xs font-bold">
                  {t("generation.autoregressive.bosEos.eos.title")}
                </p>
                <p className="text-gray-400 text-xs">
                  {t("generation.autoregressive.bosEos.eos.description")}
                </p>
              </div>
            </div>
            <div className="bg-gray-900 rounded p-3 font-mono text-xs text-center space-y-1">
              <p className="text-gray-500">
                {t("generation.autoregressive.code.trainingComment")}
              </p>
              <p>
                <span className="text-purple-400">&lt;BOS&gt;</span>{" "}
                {t("generation.autoregressive.code.trainingExample")}{" "}
                <span className="text-purple-400">&lt;EOS&gt;</span>
              </p>
              <p className="text-gray-500 mt-1">
                {t("generation.autoregressive.code.generationComment")}
              </p>
              <p>
                <span className="text-purple-400">&lt;BOS&gt;</span> Le chat{" "}
                <span className="text-green-400">chat</span>{" "}
                <span className="text-purple-400">&lt;EOS&gt;</span>{" "}
                <span className="text-gray-600">
                  {t("generation.autoregressive.code.autoStop")}
                </span>
              </p>
            </div>
            <p className="text-gray-500 text-xs">
              {t("generation.autoregressive.bosEos.note")}
            </p>
          </div>
        </>
      }
      calculation={
        <div className="space-y-8">
          {/* ─── Exemple pas-à-pas ─── */}
          <ConcreteCalculation
            title={t("generation.autoregressive.calculation.stepByStepTitle")}
            description={t(
              "generation.autoregressive.calculation.stepByStepDescription",
            )}
          >
            <div className="space-y-4">
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <div className="overflow-x-auto">
                  <table className="text-xs w-full">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-800">
                        <th className="text-left py-1.5 pr-3">
                          {t(
                            "generation.autoregressive.calculation.tableHeaders.step",
                          )}
                        </th>
                        <th className="text-left py-1.5 pr-3">
                          {t(
                            "generation.autoregressive.calculation.tableHeaders.inputText",
                          )}
                        </th>
                        <th className="text-left py-1.5 pr-3">
                          {t(
                            "generation.autoregressive.calculation.tableHeaders.predicted",
                          )}
                        </th>
                        <th className="text-left py-1.5 pr-3">
                          {t(
                            "generation.autoregressive.calculation.tableHeaders.confidence",
                          )}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {EXAMPLE_GENERATION.steps.map((step, i) => (
                        <tr key={i} className="border-b border-gray-800/50">
                          <td className="py-1.5 pr-3 text-gray-600 font-mono">
                            {i + 1}
                          </td>
                          <td className="py-1.5 pr-3 font-mono text-gray-400">
                            {step.input}
                            <span className="text-gray-600">▌</span>
                          </td>
                          <td className="py-1.5 pr-3 font-mono">
                            <span className="text-green-400 font-bold">
                              {step.predicted === " " ? "⎵" : step.predicted}
                            </span>
                          </td>
                          <td className="py-1.5 pr-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-900 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{
                                    width: `${step.probability * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-gray-500">
                                {(step.probability * 100).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-gray-500 text-xs">
                  {t("generation.autoregressive.calculation.confidenceNote")}
                </p>
              </div>
            </div>
          </ConcreteCalculation>

          {/* ─── Animation interactive ─── */}
          <ConcreteCalculation
            title={t("generation.autoregressive.calculation.animationTitle")}
            description={t(
              "generation.autoregressive.calculation.animationDescription",
            )}
          >
            <AutoregressiveLoop
              prompt={EXAMPLE_GENERATION.prompt}
              steps={EXAMPLE_GENERATION.steps}
            />
          </ConcreteCalculation>

          {/* ─── Résumé ─── */}
          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-2">
            <h4 className="text-green-300 font-semibold text-sm">
              {t("generation.autoregressive.summary.title")}
            </h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>
                <strong>1.</strong>{" "}
                {t("generation.autoregressive.summary.step1")}
              </p>
              <p>
                <strong>2.</strong>{" "}
                {t("generation.autoregressive.summary.step2")}
              </p>
              <p>
                <strong>3.</strong>{" "}
                {t("generation.autoregressive.summary.step3")}
              </p>
              <p>
                <strong>4.</strong>{" "}
                {t("generation.autoregressive.summary.step4")}
              </p>
              <div className="bg-gray-900 rounded p-3 font-mono text-xs text-center mt-2">
                prompt →{" "}
                <span className="text-amber-300">
                  {t("generation.autoregressive.code.summaryLoop")}
                </span>
                (model → softmax → sample →{" "}
                <span className="text-green-300">
                  {t("generation.autoregressive.code.summaryAppend")}
                </span>
                ) → {t("generation.autoregressive.code.summaryResult")}
              </div>
              <p className="text-gray-500 text-xs mt-2">
                {t("generation.autoregressive.summary.note")}
              </p>
              <Link
                to="/deeper/beyond"
                className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs font-medium mt-2 transition-colors"
              >
                {t("generation.autoregressive.summary.beyondLink")}
              </Link>
            </div>
          </div>
        </div>
      }
    />
  );
}
