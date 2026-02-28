import { useTranslation } from "react-i18next";
import { useProgress } from "@/hooks/useProgress";
import { getAdjacentSections } from "@/lib/pipelineSteps";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AnimatedMathOperation from "@/components/visualizations/AnimatedMathOperation";

const SECTION_ID = "math/vectors-matrices";

/** Classe CSS pour un élément selon son état dans l'animation */
function cellClass(
  step: number,
  index: number,
  color: "green" | "blue" | "amber",
) {
  const colors = {
    green: {
      active:
        "text-green-400 ring-2 ring-green-500/40 bg-green-500/10 rounded px-1",
      done: "text-green-400",
      pending: "text-gray-700",
    },
    blue: {
      active:
        "text-blue-400 ring-2 ring-blue-500/40 bg-blue-500/10 rounded px-1",
      done: "text-blue-400",
      pending: "text-gray-700",
    },
    amber: {
      active:
        "text-amber-400 ring-2 ring-amber-500/40 bg-amber-500/10 rounded px-1 font-bold",
      done: "text-amber-400",
      pending: "text-gray-700",
    },
  };
  const c = colors[color];
  if (step === -1) return c.done; // Avant animation : tout visible
  if (index === step) return `${c.active} transition-all duration-300`;
  if (index < step) return `${c.done} transition-all duration-300`;
  return `${c.pending} transition-all duration-300`;
}

export default function VectorsMatricesPage() {
  const { t } = useTranslation("pages");
  useProgress(SECTION_ID);
  const { prev, next } = getAdjacentSections(SECTION_ID);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-1">
          {t("math.vectorsMatrices.categoryLabel")}
        </p>
        <h1 className="text-2xl font-bold text-white mb-2">
          {t("math.vectorsMatrices.title")}
        </h1>
        <p className="text-gray-400">{t("math.vectorsMatrices.subtitle")}</p>
      </div>

      {/* Vecteur */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.vectorsMatrices.vector.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.vectorsMatrices.vector.description")}
        </p>
        <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-center">
          <span className="text-primary-400">v</span> = [
          <span className="text-green-400">0.5</span>,{" "}
          <span className="text-green-400">-1.2</span>,{" "}
          <span className="text-green-400">3.0</span>,{" "}
          <span className="text-green-400">0.8</span>]
        </div>
        <p className="text-xs text-gray-500">
          {t("math.vectorsMatrices.vector.note")}
        </p>
      </section>

      {/* Addition de vecteurs — ANIMÉE */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.vectorsMatrices.addition.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.vectorsMatrices.addition.description")}
        </p>
        <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
          <AnimatedMathOperation totalSteps={3} delay={800}>
            {(step) => {
              const a = [1, 2, 3];
              const b = [4, 5, 6];
              const result = [5, 7, 9];
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <span>
                      [
                      {a.map((v, i) => (
                        <span key={i}>
                          <span className={cellClass(step, i, "green")}>
                            {v}
                          </span>
                          {i < a.length - 1 && ", "}
                        </span>
                      ))}
                      ]
                    </span>
                    <span className="text-gray-500">+</span>
                    <span>
                      [
                      {b.map((v, i) => (
                        <span key={i}>
                          <span className={cellClass(step, i, "blue")}>
                            {v}
                          </span>
                          {i < b.length - 1 && ", "}
                        </span>
                      ))}
                      ]
                    </span>
                    <span className="text-gray-500">=</span>
                    <span>
                      [
                      {result.map((v, i) => (
                        <span key={i}>
                          <span className={cellClass(step, i, "amber")}>
                            {step === -1 || step >= i ? v : "_"}
                          </span>
                          {i < result.length - 1 && ", "}
                        </span>
                      ))}
                      ]
                    </span>
                  </div>
                  {step >= 0 && (
                    <div className="text-center text-xs border-t border-gray-700 pt-2">
                      <span className="text-green-400">{a[step]}</span>
                      {" + "}
                      <span className="text-blue-400">{b[step]}</span>
                      {" = "}
                      <span className="text-amber-400 font-bold">
                        {result[step]}
                      </span>
                    </div>
                  )}
                </div>
              );
            }}
          </AnimatedMathOperation>
        </div>
      </section>

      {/* Matrice */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.vectorsMatrices.matrix.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.vectorsMatrices.matrix.description")}
        </p>
        <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
          <div className="flex justify-center">
            <table className="border-collapse">
              <tbody>
                <tr>
                  <td className="px-3 py-1 text-green-400">1</td>
                  <td className="px-3 py-1 text-green-400">2</td>
                  <td className="px-3 py-1 text-green-400">3</td>
                </tr>
                <tr>
                  <td className="px-3 py-1 text-green-400">4</td>
                  <td className="px-3 py-1 text-green-400">5</td>
                  <td className="px-3 py-1 text-green-400">6</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600 text-center mt-2">
            {t("math.vectorsMatrices.matrix.sizeNote")}
          </p>
        </div>
        <p className="text-sm text-gray-400">
          {
            t("math.vectorsMatrices.matrix.llmNote").split(
              "vocabulaire × dimension",
            )[0]
          }
          <span className="text-white font-mono text-xs">
            {t("math.vectorsMatrices.labels.vocabDimension")}
          </span>
          {
            t("math.vectorsMatrices.matrix.llmNote").split(
              "vocabulaire × dimension",
            )[1]
          }
        </p>
      </section>

      {/* Produit scalaire — ANIMÉ */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.vectorsMatrices.dotProduct.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.vectorsMatrices.dotProduct.description")}
        </p>
        <div className="bg-gray-800 rounded-lg p-5 font-mono text-sm">
          <AnimatedMathOperation totalSteps={3} delay={800}>
            {(step) => {
              const a = [2, 3, 4];
              const b = [5, 0, 2];
              const products = [10, 0, 8];
              const cumSum = [10, 10, 18];
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <span>
                      [
                      {a.map((v, i) => (
                        <span key={i}>
                          <span className={cellClass(step, i, "green")}>
                            {v}
                          </span>
                          {i < a.length - 1 && ", "}
                        </span>
                      ))}
                      ]
                    </span>
                    <span className="text-gray-500">·</span>
                    <span>
                      [
                      {b.map((v, i) => (
                        <span key={i}>
                          <span className={cellClass(step, i, "blue")}>
                            {v}
                          </span>
                          {i < b.length - 1 && ", "}
                        </span>
                      ))}
                      ]
                    </span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 text-center space-y-2">
                    <p className="text-xs text-gray-500">
                      {t("math.vectorsMatrices.dotProduct.calcNote")}
                    </p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {a.map((v, i) => {
                        const visible = step === -1 || step >= i;
                        const active = step === i;
                        return (
                          <span
                            key={i}
                            className={`transition-all duration-300 ${!visible ? "opacity-20" : active ? "text-white" : "text-gray-400"}`}
                          >
                            {i > 0 && (
                              <span className="text-gray-600 mx-1">+</span>
                            )}
                            <span className={active ? "text-green-400" : ""}>
                              {v}
                            </span>
                            ×
                            <span className={active ? "text-blue-400" : ""}>
                              {b[i]}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                    {step >= 0 && (
                      <div className="text-sm">
                        = {products.slice(0, step + 1).join(" + ")}
                        {" = "}
                        <span
                          className={`text-amber-400 font-bold ${step >= 2 ? "text-lg" : ""}`}
                        >
                          {cumSum[step]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }}
          </AnimatedMathOperation>
        </div>
        <p className="text-xs text-gray-500">
          {t("math.vectorsMatrices.dotProduct.note")}
        </p>
      </section>

      {/* Multiplication élément par élément — ANIMÉE */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.vectorsMatrices.elementWise.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.vectorsMatrices.elementWise.description")}
        </p>
        <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
          <AnimatedMathOperation totalSteps={3} delay={800}>
            {(step) => {
              const a = [2, 3, 4];
              const b = [5, 0, 2];
              const result = [10, 0, 8];
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <span>
                      [
                      {a.map((v, i) => (
                        <span key={i}>
                          <span className={cellClass(step, i, "green")}>
                            {v}
                          </span>
                          {i < a.length - 1 && ", "}
                        </span>
                      ))}
                      ]
                    </span>
                    <span className="text-gray-500">⊙</span>
                    <span>
                      [
                      {b.map((v, i) => (
                        <span key={i}>
                          <span className={cellClass(step, i, "blue")}>
                            {v}
                          </span>
                          {i < b.length - 1 && ", "}
                        </span>
                      ))}
                      ]
                    </span>
                    <span className="text-gray-500">=</span>
                    <span>
                      [
                      {result.map((v, i) => (
                        <span key={i}>
                          <span className={cellClass(step, i, "amber")}>
                            {step === -1 || step >= i ? v : "_"}
                          </span>
                          {i < result.length - 1 && ", "}
                        </span>
                      ))}
                      ]
                    </span>
                  </div>
                  {step >= 0 && (
                    <div className="text-center text-xs border-t border-gray-700 pt-2">
                      <span className="text-green-400">{a[step]}</span>
                      {" × "}
                      <span className="text-blue-400">{b[step]}</span>
                      {" = "}
                      <span className="text-amber-400 font-bold">
                        {result[step]}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 text-center">
                    {t("math.vectorsMatrices.elementWise.resultNote")}
                  </p>
                </div>
              );
            }}
          </AnimatedMathOperation>
        </div>
      </section>

      {/* Où c'est utilisé */}
      <section className="card space-y-3">
        <h2 className="text-lg font-semibold text-white">
          {t("math.vectorsMatrices.usedIn.title")}
        </h2>
        <ul className="text-sm text-gray-400 space-y-1.5">
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>
              <strong className="text-white">
                {t("math.vectorsMatrices.usedIn.embeddingLabel")}
              </strong>{" "}
              : {t("math.vectorsMatrices.usedIn.embeddingDesc")}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>
              <strong className="text-white">
                {t("math.vectorsMatrices.usedIn.positionalEncodingLabel")}
              </strong>{" "}
              : {t("math.vectorsMatrices.usedIn.positionalEncodingDesc")}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>
              <strong className="text-white">
                {t("math.vectorsMatrices.usedIn.attentionLabel")}
              </strong>{" "}
              : {t("math.vectorsMatrices.usedIn.attentionDesc")}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>
              <strong className="text-white">
                {t("math.vectorsMatrices.usedIn.weightsLabel")}
              </strong>{" "}
              : {t("math.vectorsMatrices.usedIn.weightsDesc")}
            </span>
          </li>
        </ul>
      </section>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        {prev ? (
          <Link
            to={prev.path}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {prev.title}
          </Link>
        ) : (
          <div />
        )}
        {next && (
          <Link
            to={next.path}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {next.title}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
