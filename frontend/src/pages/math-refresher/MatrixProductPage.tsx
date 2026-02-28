import { useTranslation } from "react-i18next";
import { useProgress } from "@/hooks/useProgress";
import { getAdjacentSections } from "@/lib/pipelineSteps";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AnimatedMathOperation from "@/components/visualizations/AnimatedMathOperation";

const SECTION_ID = "math/matrix-product";

/** Style conditionnel pour un élément selon le step courant */
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
  if (step === -1) return c.done;
  if (index === step) return `${c.active} transition-all duration-300`;
  if (index < step) return `${c.done} transition-all duration-300`;
  return `${c.pending} transition-all duration-300`;
}

export default function MatrixProductPage() {
  const { t } = useTranslation("pages");
  useProgress(SECTION_ID);
  const { prev, next } = getAdjacentSections(SECTION_ID);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-1">
          {t("math.matrixProduct.categoryLabel")}
        </p>
        <h1 className="text-2xl font-bold text-white mb-2">
          {t("math.matrixProduct.title")}
        </h1>
        <p className="text-gray-400">{t("math.matrixProduct.subtitle")}</p>
      </div>

      {/* Intuition */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.matrixProduct.intuition.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.matrixProduct.intuition.description")}
        </p>
      </section>

      {/* Produit matrice × vecteur — ANIMÉ */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.matrixProduct.matVec.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.matrixProduct.matVec.description")}
        </p>
        <div className="bg-gray-800 rounded-lg p-5 font-mono text-sm">
          <AnimatedMathOperation totalSteps={2} delay={1200}>
            {(step) => {
              const mat = [
                [1, 2, 3],
                [4, 5, 6],
              ];
              const vec = [2, 1, 3];
              const result = [13, 31];
              const products = [
                [2, 2, 9],
                [8, 5, 18],
              ];
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    {/* Matrice */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {t("math.matrixProduct.labels.matrix", {
                          rows: 2,
                          cols: 3,
                        })}
                      </div>
                      <div className="space-y-1">
                        {mat.map((row, r) => (
                          <div key={r}>
                            [
                            {row.map((v, c) => (
                              <span key={c}>
                                <span
                                  className={
                                    step === -1
                                      ? "text-green-400"
                                      : r === step
                                        ? "text-green-400 ring-2 ring-green-500/40 bg-green-500/10 rounded px-1 transition-all duration-300"
                                        : r < step
                                          ? "text-green-400 transition-all duration-300"
                                          : "text-gray-700 transition-all duration-300"
                                  }
                                >
                                  {v}
                                </span>
                                {c < row.length - 1 && ", "}
                              </span>
                            ))}
                            ]
                          </div>
                        ))}
                      </div>
                    </div>
                    <span className="text-gray-500 text-lg">×</span>
                    {/* Vecteur */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {t("math.matrixProduct.labels.vector", { size: 3 })}
                      </div>
                      <div>
                        [
                        {vec.map((v, i) => (
                          <span key={i}>
                            <span
                              className={
                                step === -1
                                  ? "text-blue-400"
                                  : step >= 0
                                    ? "text-blue-400 ring-2 ring-blue-500/40 bg-blue-500/10 rounded px-1 transition-all duration-300"
                                    : "text-gray-700 transition-all duration-300"
                              }
                            >
                              {v}
                            </span>
                            {i < vec.length - 1 && ", "}
                          </span>
                        ))}
                        ]
                      </div>
                    </div>
                    <span className="text-gray-500 text-lg">=</span>
                    {/* Résultat */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {t("math.matrixProduct.labels.result", { size: 2 })}
                      </div>
                      <div>
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
                      </div>
                    </div>
                  </div>
                  {/* Détail du calcul courant */}
                  {step >= 0 && (
                    <div className="border-t border-gray-700 pt-3 text-center text-xs space-y-1">
                      <p className="text-gray-500">
                        {t("math.matrixProduct.labels.rowN", { n: step + 1 })} :
                      </p>
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {mat[step].map((v, c) => (
                          <span key={c}>
                            {c > 0 && (
                              <span className="text-gray-600 mx-1">+</span>
                            )}
                            <span className="text-green-400">{v}</span>×
                            <span className="text-blue-400">{vec[c]}</span>
                          </span>
                        ))}
                        <span className="text-gray-600 mx-1">=</span>
                        <span className="text-gray-400">
                          {products[step].join(" + ")}
                        </span>
                        <span className="text-gray-600 mx-1">=</span>
                        <span className="text-amber-400 font-bold">
                          {result[step]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
          </AnimatedMathOperation>
        </div>
      </section>

      {/* Produit matrice × matrice — ANIMÉ */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.matrixProduct.matMat.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.matrixProduct.matMat.description")}
        </p>
        <div className="bg-gray-800 rounded-lg p-5 font-mono text-sm">
          <AnimatedMathOperation totalSteps={4} delay={1200}>
            {(step) => {
              const A = [
                [1, 0, 2],
                [3, 1, 0],
              ];
              const B = [
                [1, 2],
                [0, 3],
                [4, 1],
              ];
              const result = [
                [9, 4],
                [3, 9],
              ];
              // Step order: (0,0), (0,1), (1,0), (1,1)
              const steps = [
                { r: 0, c: 0, products: [1, 0, 8], sum: 9 },
                { r: 0, c: 1, products: [2, 0, 2], sum: 4 },
                { r: 1, c: 0, products: [3, 0, 0], sum: 3 },
                { r: 1, c: 1, products: [6, 3, 0], sum: 9 },
              ];
              const cur = step >= 0 ? steps[step] : null;
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    {/* Matrice A */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">(2×3)</div>
                      <div className="space-y-1">
                        {A.map((row, r) => (
                          <div key={r}>
                            [
                            {row.map((v, c) => (
                              <span key={c}>
                                <span
                                  className={
                                    step === -1
                                      ? "text-green-400"
                                      : cur && r === cur.r
                                        ? "text-green-400 ring-2 ring-green-500/40 bg-green-500/10 rounded px-1 transition-all duration-300"
                                        : "text-green-400/30 transition-all duration-300"
                                  }
                                >
                                  {v}
                                </span>
                                {c < row.length - 1 && ", "}
                              </span>
                            ))}
                            ]
                          </div>
                        ))}
                      </div>
                    </div>
                    <span className="text-gray-500 text-lg">×</span>
                    {/* Matrice B */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">(3×2)</div>
                      <div className="space-y-1">
                        {B.map((row, r) => (
                          <div key={r}>
                            [
                            {row.map((v, c) => (
                              <span key={c}>
                                <span
                                  className={
                                    step === -1
                                      ? "text-blue-400"
                                      : cur && c === cur.c
                                        ? "text-blue-400 ring-2 ring-blue-500/40 bg-blue-500/10 rounded px-1 transition-all duration-300"
                                        : "text-blue-400/30 transition-all duration-300"
                                  }
                                >
                                  {v}
                                </span>
                                {c < row.length - 1 && ", "}
                              </span>
                            ))}
                            ]
                          </div>
                        ))}
                      </div>
                    </div>
                    <span className="text-gray-500 text-lg">=</span>
                    {/* Résultat */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">(2×2)</div>
                      <div className="space-y-1">
                        {result.map((row, r) => (
                          <div key={r}>
                            [
                            {row.map((v, c) => {
                              const idx = r * 2 + c;
                              const visible = step === -1 || step >= idx;
                              const active = step === idx;
                              return (
                                <span key={c}>
                                  <span
                                    className={
                                      active
                                        ? "text-amber-400 ring-2 ring-amber-500/40 bg-amber-500/10 rounded px-1 font-bold transition-all duration-300"
                                        : visible
                                          ? "text-amber-400 transition-all duration-300"
                                          : "text-gray-700 transition-all duration-300"
                                    }
                                  >
                                    {visible ? v : "_"}
                                  </span>
                                  {c < row.length - 1 && ", "}
                                </span>
                              );
                            })}
                            ]
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Détail du calcul courant */}
                  {cur && (
                    <div className="border-t border-gray-700 pt-3 text-center text-xs space-y-1">
                      <p className="text-gray-500">
                        {t("math.matrixProduct.labels.rowNColN", {
                          row: cur.r + 1,
                          col: cur.c + 1,
                        })}{" "}
                        :
                      </p>
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {A[cur.r].map((v, k) => (
                          <span key={k}>
                            {k > 0 && (
                              <span className="text-gray-600 mx-1">+</span>
                            )}
                            <span className="text-green-400">{v}</span>×
                            <span className="text-blue-400">{B[k][cur.c]}</span>
                          </span>
                        ))}
                        <span className="text-gray-600 mx-1">=</span>
                        <span className="text-gray-400">
                          {cur.products.join(" + ")}
                        </span>
                        <span className="text-gray-600 mx-1">=</span>
                        <span className="text-amber-400 font-bold">
                          {cur.sum}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
          </AnimatedMathOperation>
        </div>
        <p className="text-xs text-gray-500">
          {t("math.matrixProduct.matMat.rule")}
        </p>
      </section>

      {/* Transposition — ANIMÉE */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.matrixProduct.transpose.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.matrixProduct.transpose.description")}
        </p>
        <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
          <AnimatedMathOperation totalSteps={3} delay={800}>
            {(step) => {
              const M = [
                [1, 2, 3],
                [4, 5, 6],
              ];
              const T = [
                [1, 4],
                [2, 5],
                [3, 6],
              ];
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-6 flex-wrap">
                    {/* Matrice originale */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {t("math.matrixProduct.labels.originalMatrix", {
                          rows: 2,
                          cols: 3,
                        })}
                      </div>
                      <div className="space-y-1">
                        {M.map((row, r) => (
                          <div key={r}>
                            [
                            {row.map((v, c) => (
                              <span key={c}>
                                <span
                                  className={
                                    step === -1
                                      ? "text-green-400"
                                      : c === step
                                        ? "text-green-400 ring-2 ring-green-500/40 bg-green-500/10 rounded px-1 transition-all duration-300"
                                        : c < step
                                          ? "text-green-400/50 transition-all duration-300"
                                          : "text-gray-700 transition-all duration-300"
                                  }
                                >
                                  {v}
                                </span>
                                {c < row.length - 1 && ", "}
                              </span>
                            ))}
                            ]
                          </div>
                        ))}
                      </div>
                    </div>
                    <span className="text-gray-500">→</span>
                    {/* Matrice transposée */}
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        {t("math.matrixProduct.labels.transposedMatrix", {
                          rows: 3,
                          cols: 2,
                        })}
                      </div>
                      <div className="space-y-1">
                        {T.map((row, r) => {
                          const visible = step === -1 || step >= r;
                          const active = step === r;
                          return (
                            <div key={r}>
                              [
                              {row.map((v, c) => (
                                <span key={c}>
                                  <span
                                    className={
                                      active
                                        ? "text-amber-400 ring-2 ring-amber-500/40 bg-amber-500/10 rounded px-1 font-bold transition-all duration-300"
                                        : visible
                                          ? "text-amber-400 transition-all duration-300"
                                          : "text-gray-700 transition-all duration-300"
                                    }
                                  >
                                    {visible ? v : "_"}
                                  </span>
                                  {c < row.length - 1 && ", "}
                                </span>
                              ))}
                              ]
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  {step >= 0 && (
                    <div className="text-center text-xs border-t border-gray-700 pt-2">
                      <span className="text-gray-500">
                        {t("math.matrixProduct.labels.columnN", {
                          n: step + 1,
                        })}
                      </span>
                      {" → "}
                      <span className="text-gray-500">
                        {t("math.matrixProduct.labels.rowN", { n: step + 1 })} :
                      </span>{" "}
                      <span className="text-green-400">
                        [{M.map((row) => row[step]).join(", ")}]
                      </span>
                      {" → "}
                      <span className="text-amber-400 font-bold">
                        [{T[step].join(", ")}]
                      </span>
                    </div>
                  )}
                </div>
              );
            }}
          </AnimatedMathOperation>
        </div>
      </section>

      {/* Où c'est utilisé */}
      <section className="card space-y-3">
        <h2 className="text-lg font-semibold text-white">
          {t("math.matrixProduct.usedIn.title")}
        </h2>
        <ul className="text-sm text-gray-400 space-y-1.5">
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>
              <strong className="text-white">
                {t("math.matrixProduct.usedIn.embeddingLabel")}
              </strong>{" "}
              : {t("math.matrixProduct.usedIn.embeddingDesc")}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>
              <strong className="text-white">
                {t("math.matrixProduct.usedIn.attentionLabel")}
              </strong>{" "}
              : {t("math.matrixProduct.usedIn.attentionDesc")} <sup>T</sup>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>
              <strong className="text-white">
                {t("math.matrixProduct.usedIn.feedforwardLabel")}
              </strong>{" "}
              : {t("math.matrixProduct.usedIn.feedforwardDesc")}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>
              <strong className="text-white">
                {t("math.matrixProduct.usedIn.projectionLabel")}
              </strong>{" "}
              : {t("math.matrixProduct.usedIn.projectionDesc")}
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
