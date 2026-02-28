/**
 * Calcul détaillé de l'attention pas-à-pas avec matrices explicites.
 *
 * Montre le pipeline complet pour UNE tête d'attention :
 * 1. Phrase d'entrée + embeddings
 * 2. Matrices de projection W_Q, W_K, W_V
 * 3. Calcul de Q, K, V = E × W
 * 4. Scores = Q · K^T / √d_k
 * 5. Masque causal + Softmax → Poids
 * 6. Sortie = Poids × V
 * 7. Matrice résultat finale
 *
 * @module components/visualizations/AttentionDetailedCalculation
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ConcreteCalculation from "@/components/educational/ConcreteCalculation";
import AnimatedMathOperation from "@/components/visualizations/AnimatedMathOperation";
import MatrixDisplay from "@/components/visualizations/MatrixDisplay";
import { EXAMPLE_ATTENTION_DETAILED } from "@/lib/exampleData";

const D = EXAMPLE_ATTENTION_DETAILED;
const TOKS = D.tokens;
const NUM_TOKS = TOKS.length;
const DIM = D.dK;

/** Formate un nombre avec signe explicite */
function fmt(v: number, prec = 2): string {
  return v >= 0 ? v.toFixed(prec) : `−${Math.abs(v).toFixed(prec)}`;
}

/** Formate pour les multiplications (parenthèses si négatif) */
function fmtMul(v: number, prec = 2): string {
  return v < 0 ? `(−${Math.abs(v).toFixed(prec)})` : v.toFixed(prec);
}

/** Couleur selon la valeur d'un poids d'attention */
function weightColor(value: number): string {
  if (value >= 0.3) return "text-amber-300 font-bold";
  if (value >= 0.2) return "text-amber-400";
  if (value >= 0.1) return "text-gray-200";
  if (value > 0) return "text-gray-500";
  return "text-gray-700";
}

/** Classe pour cellule numérique à largeur fixe dans les matrices inline */
const NCELL = "inline-block min-w-[2.5rem] text-right";

/** Couleurs par tête pour le multi-head display */
const HEAD_COLORS = [
  "text-amber-400",
  "text-cyan-400",
  "text-pink-400",
  "text-lime-400",
];

/** Ring/bg par tête pour la mise en évidence active */
const HEAD_RING = [
  "ring-amber-500/40 bg-amber-500/10",
  "ring-cyan-500/40 bg-cyan-500/10",
  "ring-pink-500/40 bg-pink-500/10",
  "ring-lime-500/40 bg-lime-500/10",
];

export default function AttentionDetailedCalculation() {
  const { t } = useTranslation("components");
  const [focusToken, setFocusToken] = useState(6); // "t" par défaut

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════════
          ÉTAPE 0 : Entrée — la phrase et ses embeddings
          ═══════════════════════════════════════════════════════════ */}
      <ConcreteCalculation
        title={t("visualizations.attentionDetailedCalculation.step0.title")}
        description={t(
          "visualizations.attentionDetailedCalculation.step0.description",
        )}
      >
        <div className="space-y-4">
          {/* La phrase avec tokens mis en évidence */}
          <div className="flex items-center gap-1 justify-center flex-wrap">
            <span className="text-sm text-gray-500 mr-2">
              {t(
                "visualizations.attentionDetailedCalculation.step0.phraseLabel",
              )}
            </span>
            <span className="text-lg font-mono tracking-wider">
              {TOKS.map((tok, i) => (
                <span
                  key={i}
                  className={`inline-block px-1.5 py-0.5 mx-0.5 rounded cursor-pointer transition-all ${
                    i === focusToken
                      ? "bg-primary-500/20 text-primary-300 ring-2 ring-primary-500/40"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setFocusToken(i)}
                  title={t(
                    "visualizations.attentionDetailedCalculation.step0.tokenTitle",
                    {
                      idx: i,
                      token: tok === "⎵" ? "espace" : tok,
                      id: D.tokenIds[i],
                    },
                  )}
                >
                  {tok}
                </span>
              ))}
            </span>
          </div>
          <p className="text-center text-[10px] text-gray-600">
            {t(
              "visualizations.attentionDetailedCalculation.step0.clickInstruction",
            )}
          </p>

          {/* Matrice d'embedding complète */}
          <div className="bg-gray-900 rounded-lg p-4">
            <MatrixDisplay
              title={t(
                "visualizations.attentionDetailedCalculation.step0.matrixTitle",
              )}
              shape={`(${NUM_TOKS} × ${DIM})`}
              data={D.embeddings}
              rowLabels={[...TOKS]}
              colLabels={["d₀", "d₁", "d₂", "d₃"]}
              rowLabelColor="text-primary-400"
              highlightRows={[focusToken]}
            />
            <p className="text-[10px] text-gray-600 mt-2">
              {t(
                "visualizations.attentionDetailedCalculation.step0.rowExplanation",
              )}
            </p>
          </div>
        </div>
      </ConcreteCalculation>

      {/* ═══════════════════════════════════════════════════════════
          ÉTAPE 1 : Les matrices de projection W_Q, W_K, W_V
          ═══════════════════════════════════════════════════════════ */}
      <ConcreteCalculation
        title={t("visualizations.attentionDetailedCalculation.step1.title")}
        description={t(
          "visualizations.attentionDetailedCalculation.step1.description",
        )}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* W_Q */}
            <div className="bg-gray-900 rounded-lg p-3">
              <MatrixDisplay
                title="W_Q"
                shape="(4 × 4)"
                data={D.W_Q}
                colLabels={["", "", "", ""]}
                rowLabelColor="text-blue-400"
                compact
              />
              <p className="text-[10px] text-blue-400 mt-1">
                {t(
                  "visualizations.attentionDetailedCalculation.step1.projQuery",
                )}
              </p>
            </div>
            {/* W_K */}
            <div className="bg-gray-900 rounded-lg p-3">
              <MatrixDisplay
                title="W_K"
                shape="(4 × 4)"
                data={D.W_K}
                colLabels={["", "", "", ""]}
                rowLabelColor="text-green-400"
                compact
              />
              <p className="text-[10px] text-green-400 mt-1">
                {t("visualizations.attentionDetailedCalculation.step1.projKey")}
              </p>
            </div>
            {/* W_V */}
            <div className="bg-gray-900 rounded-lg p-3">
              <MatrixDisplay
                title="W_V"
                shape="(4 × 4)"
                data={D.W_V}
                colLabels={["", "", "", ""]}
                rowLabelColor="text-purple-400"
                compact
              />
              <p className="text-[10px] text-purple-400 mt-1">
                {t(
                  "visualizations.attentionDetailedCalculation.step1.projValue",
                )}
              </p>
            </div>
          </div>

          <div className="bg-amber-900/15 border border-amber-800/30 rounded p-3 text-xs text-gray-400 space-y-1">
            <p>
              <strong className="text-amber-300">
                {t(
                  "visualizations.attentionDetailedCalculation.step1.learnedParams",
                )}
              </strong>{" "}
              {t(
                "visualizations.attentionDetailedCalculation.step1.learnedParamsDetail",
              )}
            </p>
            <p className="text-gray-500">
              {t("visualizations.attentionDetailedCalculation.step1.realSize")}
            </p>
          </div>
        </div>
      </ConcreteCalculation>

      {/* ═══════════════════════════════════════════════════════════
          ÉTAPE 2 : Calculer Q, K, V pour chaque token
          ═══════════════════════════════════════════════════════════ */}
      <ConcreteCalculation
        title={t("visualizations.attentionDetailedCalculation.step2.title")}
        description={t(
          "visualizations.attentionDetailedCalculation.step2.description",
          { token: TOKS[focusToken] },
        )}
      >
        <div className="space-y-6">
          {/* Calcul détaillé pour le token focus */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-800 space-y-4">
            <h4 className="text-sm font-semibold text-gray-200">
              {t(
                "visualizations.attentionDetailedCalculation.step2.calcQTitle",
                { token: TOKS[focusToken] },
              )}{" "}
              <span className="font-mono text-xs text-gray-500">
                E<sub>{TOKS[focusToken]}</sub> × W<sub>Q</sub> = Q
                <sub>{TOKS[focusToken]}</sub>
              </span>
            </h4>

            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
              <AnimatedMathOperation totalSteps={DIM} delay={1200}>
                {(step) => {
                  const emb = D.embeddings[focusToken];
                  const q = D.Q[focusToken];
                  return (
                    <div className="space-y-3">
                      {/* Visualisation matrice × vecteur */}
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        {/* Vecteur embedding */}
                        <div className="text-center">
                          <div className="text-[10px] text-gray-500 mb-1">
                            E<sub>{TOKS[focusToken]}</sub>
                          </div>
                          <div className="text-xs">
                            [
                            {emb.map((v, i) => (
                              <span key={i}>
                                <span
                                  className={`${NCELL} ${
                                    step === -1
                                      ? "text-primary-400"
                                      : "text-primary-300 ring-2 ring-primary-500/40 bg-primary-500/10 rounded px-0.5 transition-all duration-300"
                                  }`}
                                >
                                  {fmt(v)}
                                </span>
                                {i < DIM - 1 && (
                                  <span className="text-gray-700">, </span>
                                )}
                              </span>
                            ))}
                            ]
                          </div>
                        </div>
                        <span className="text-gray-500 text-lg">×</span>
                        {/* Matrice W_Q */}
                        <div className="text-center">
                          <div className="text-[10px] text-blue-400 mb-1">
                            W<sub>Q</sub>
                          </div>
                          <div className="space-y-0.5 text-[10px]">
                            {D.W_Q.map((row, r) => (
                              <div key={r}>
                                [
                                {row.map((v, c) => (
                                  <span key={c}>
                                    <span
                                      className={`${NCELL} ${
                                        step === -1
                                          ? "text-blue-400"
                                          : c === step
                                            ? "text-blue-400 ring-2 ring-blue-500/40 bg-blue-500/10 rounded px-0.5 transition-all duration-300"
                                            : "text-blue-400/30 transition-all duration-300"
                                      }`}
                                    >
                                      {fmt(v)}
                                    </span>
                                    {c < DIM - 1 && (
                                      <span className="text-gray-700">, </span>
                                    )}
                                  </span>
                                ))}
                                ]
                              </div>
                            ))}
                          </div>
                        </div>
                        <span className="text-gray-500 text-lg">=</span>
                        {/* Résultat Q */}
                        <div className="text-center">
                          <div className="text-[10px] text-blue-300 mb-1">
                            Q<sub>{TOKS[focusToken]}</sub>
                          </div>
                          <div className="text-xs">
                            [
                            {q.map((v, i) => (
                              <span key={i}>
                                <span
                                  className={`${NCELL} ${
                                    step === -1
                                      ? "text-amber-400"
                                      : i === step
                                        ? "text-amber-300 font-bold ring-2 ring-amber-500/40 bg-amber-500/10 rounded px-0.5 transition-all duration-300"
                                        : i < step
                                          ? "text-amber-400 transition-all duration-300"
                                          : "text-gray-700 transition-all duration-300"
                                  }`}
                                >
                                  {step === -1 || i <= step ? fmt(v) : "?"}
                                </span>
                                {i < DIM - 1 && (
                                  <span className="text-gray-700">, </span>
                                )}
                              </span>
                            ))}
                            ]
                          </div>
                        </div>
                      </div>

                      {/* Détail du calcul pour la dimension courante */}
                      {step >= 0 && (
                        <div className="border-t border-gray-800 pt-2 text-center text-[10px] space-y-1">
                          <p className="text-gray-500">
                            {t(
                              "visualizations.attentionDetailedCalculation.step2.dimensionDetail",
                              { dim: step, token: TOKS[focusToken] },
                            )}
                          </p>
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            {emb.map((eVal, c) => (
                              <span key={c}>
                                {c > 0 && (
                                  <span className="text-gray-600 mx-0.5">
                                    +
                                  </span>
                                )}
                                <span className="text-primary-300">
                                  {fmtMul(eVal)}
                                </span>
                                <span className="text-gray-600">×</span>
                                <span className="text-blue-400">
                                  {fmtMul(D.W_Q[c][step])}
                                </span>
                              </span>
                            ))}
                            <span className="text-gray-600 mx-1">=</span>
                            <span className="text-amber-300 font-bold">
                              {fmt(q[step])}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              </AnimatedMathOperation>
            </div>

            <p className="text-[10px] text-gray-500">
              {t(
                "visualizations.attentionDetailedCalculation.step2.sameCalcNote",
                { token: TOKS[focusToken] },
              )}
            </p>
          </div>

          {/* Résultat complet : les 3 matrices Q, K, V */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-3">
              <MatrixDisplay
                title="Q = E × W_Q"
                shape={`(${NUM_TOKS} × ${DIM})`}
                data={D.Q}
                rowLabels={[...TOKS]}
                colLabels={["d₀", "d₁", "d₂", "d₃"]}
                rowLabelColor="text-blue-400"
                highlightRows={[focusToken]}
                compact
              />
            </div>
            <div className="bg-gray-900 rounded-lg p-3">
              <MatrixDisplay
                title="K = E × W_K"
                shape={`(${NUM_TOKS} × ${DIM})`}
                data={D.K}
                rowLabels={[...TOKS]}
                colLabels={["d₀", "d₁", "d₂", "d₃"]}
                rowLabelColor="text-green-400"
                highlightRows={[focusToken]}
                compact
              />
            </div>
            <div className="bg-gray-900 rounded-lg p-3">
              <MatrixDisplay
                title="V = E × W_V"
                shape={`(${NUM_TOKS} × ${DIM})`}
                data={D.V}
                rowLabels={[...TOKS]}
                colLabels={["d₀", "d₁", "d₂", "d₃"]}
                rowLabelColor="text-purple-400"
                highlightRows={[focusToken]}
                compact
              />
            </div>
          </div>
        </div>
      </ConcreteCalculation>

      {/* ═══════════════════════════════════════════════════════════
          ÉTAPE 3 : Scores d'alignement Q · K^T / √d_k
          ═══════════════════════════════════════════════════════════ */}
      <ConcreteCalculation
        title={t("visualizations.attentionDetailedCalculation.step3.title")}
        description={t(
          "visualizations.attentionDetailedCalculation.step3.description",
          { token: TOKS[focusToken] },
        )}
      >
        <div className="space-y-4">
          {/* Calcul détaillé des scores pour le token focus */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-800 space-y-3">
            <h4 className="text-sm font-semibold text-gray-200">
              {t(
                "visualizations.attentionDetailedCalculation.step3.scoresTitle",
                { token: TOKS[focusToken] },
              )}
            </h4>

            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs">
              <AnimatedMathOperation totalSteps={focusToken + 1} delay={800}>
                {(step) => {
                  const qt = D.Q[focusToken];
                  // Ligne K mise en évidence : le token j courant de l'animation
                  const activeKRow = step >= 0 ? step : -1;
                  return (
                    <div className="space-y-4">
                      {/* Matrices Q et K côte à côte avec highlight inline */}
                      <div className="flex items-start justify-center gap-6 flex-wrap">
                        {/* Matrice Q — ligne focusToken mise en évidence */}
                        <div className="text-center">
                          <div className="text-[10px] text-blue-400 mb-1">
                            Q{" "}
                            <span className="text-gray-600">
                              ({NUM_TOKS}×{DIM})
                            </span>
                          </div>
                          <div className="space-y-0.5 text-[10px]">
                            {D.Q.map((row, r) => (
                              <div key={r} className="flex items-center gap-1">
                                <span
                                  className={`w-4 text-right ${r === focusToken ? "text-blue-300 font-bold" : "text-gray-600"}`}
                                >
                                  {TOKS[r]}
                                </span>
                                <span>
                                  [
                                  {row.map((v, c) => (
                                    <span key={c}>
                                      <span
                                        className={`${NCELL} ${
                                          step === -1
                                            ? r === focusToken
                                              ? "text-blue-400"
                                              : "text-blue-400/40"
                                            : r === focusToken
                                              ? "text-blue-400 ring-2 ring-blue-500/40 bg-blue-500/10 rounded px-0.5 transition-all duration-300"
                                              : "text-blue-400/20 transition-all duration-300"
                                        }`}
                                      >
                                        {fmt(v)}
                                      </span>
                                      {c < DIM - 1 && (
                                        <span className="text-gray-700">
                                          ,{" "}
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                  ]
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <span className="text-gray-500 text-lg mt-8">·</span>

                        {/* Matrice K — ligne du token j courant mise en évidence */}
                        <div className="text-center">
                          <div className="text-[10px] text-green-400 mb-1">
                            K{" "}
                            <span className="text-gray-600">
                              ({NUM_TOKS}×{DIM})
                            </span>
                          </div>
                          <div className="space-y-0.5 text-[10px]">
                            {D.K.map((row, r) => (
                              <div key={r} className="flex items-center gap-1">
                                <span
                                  className={`w-4 text-right ${r === activeKRow ? "text-green-300 font-bold" : "text-gray-600"}`}
                                >
                                  {TOKS[r]}
                                </span>
                                <span>
                                  [
                                  {row.map((v, c) => (
                                    <span key={c}>
                                      <span
                                        className={`${NCELL} ${
                                          step === -1
                                            ? "text-green-400/40"
                                            : r === activeKRow
                                              ? "text-green-400 ring-2 ring-green-500/40 bg-green-500/10 rounded px-0.5 transition-all duration-300"
                                              : "text-green-400/20 transition-all duration-300"
                                        }`}
                                      >
                                        {fmt(v)}
                                      </span>
                                      {c < DIM - 1 && (
                                        <span className="text-gray-700">
                                          ,{" "}
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                  ]
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Calculs des scores ligne par ligne */}
                      <div className="space-y-2 border-t border-gray-800 pt-3">
                        {Array.from({ length: focusToken + 1 }).map((_, j) => {
                          const visible = step === -1 || step >= j;
                          const active = step === j;
                          const kj = D.K[j];
                          const score = D.scores[focusToken][j];

                          return (
                            <div
                              key={j}
                              className={`transition-all duration-300 ${!visible ? "opacity-0 h-0" : ""} ${
                                active ? "bg-gray-800/50 rounded p-2" : "px-2"
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-blue-300">
                                  Q<sub>{TOKS[focusToken]}</sub>
                                </span>
                                <span className="text-gray-600">·</span>
                                <span
                                  className={`text-green-300 ${active ? "font-bold" : ""}`}
                                >
                                  K<sub>{TOKS[j]}</sub>
                                </span>
                                <span className="text-gray-600">/ √{DIM}</span>
                                <span className="text-gray-600">=</span>
                                <span
                                  className={
                                    active
                                      ? "text-amber-300 font-bold"
                                      : "text-white"
                                  }
                                >
                                  {fmt(score)}
                                </span>
                                {score >= 0.5 && (
                                  <span className="text-green-500 text-[10px]">
                                    {t(
                                      "visualizations.attentionDetailedCalculation.step3.highScore",
                                    )}
                                  </span>
                                )}
                                {score <= -0.5 && (
                                  <span className="text-red-500 text-[10px]">
                                    {t(
                                      "visualizations.attentionDetailedCalculation.step3.negativeScore",
                                    )}
                                  </span>
                                )}
                              </div>
                              {active && (
                                <div className="text-[10px] text-gray-500 mt-1 ml-2">
                                  = (
                                  {qt.map((q, d) => (
                                    <span key={d}>
                                      {d > 0 && " + "}
                                      <span className="text-blue-300">
                                        {fmtMul(q)}
                                      </span>
                                      ×
                                      <span className="text-green-300">
                                        {fmtMul(kj[d])}
                                      </span>
                                    </span>
                                  ))}
                                  ) / {Math.sqrt(DIM).toFixed(1)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              </AnimatedMathOperation>
            </div>
          </div>

          {/* Matrice de scores complète */}
          <div className="bg-gray-900 rounded-lg p-4">
            <MatrixDisplay
              title={t(
                "visualizations.attentionDetailedCalculation.step3.matrixTitle",
              )}
              shape={`(${NUM_TOKS} × ${NUM_TOKS})`}
              data={D.scores}
              rowLabels={[...TOKS]}
              colLabels={[...TOKS]}
              rowLabelColor="text-blue-400"
              colLabelColor="text-green-400"
              highlightRows={[focusToken]}
              maskedCells={(row, col) => col > row}
              cellColor={(v, row, col) =>
                col > row
                  ? "text-gray-700"
                  : row === focusToken
                    ? v >= 0.5
                      ? "text-amber-300 font-bold"
                      : v <= -0.5
                        ? "text-red-300"
                        : "text-white"
                    : (undefined as unknown as string)
              }
            />
            <p className="text-[10px] text-gray-500 mt-2">
              {t(
                "visualizations.attentionDetailedCalculation.step3.maskedExplanation",
              )}
            </p>
          </div>
        </div>
      </ConcreteCalculation>

      {/* ═══════════════════════════════════════════════════════════
          ÉTAPE 4 : Softmax → Poids d'attention
          ═══════════════════════════════════════════════════════════ */}
      <ConcreteCalculation
        title={t("visualizations.attentionDetailedCalculation.step4.title")}
        description={t(
          "visualizations.attentionDetailedCalculation.step4.description",
        )}
      >
        <div className="space-y-4">
          {/* Softmax détaillé pour le token focus */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-800 space-y-3">
            <h4 className="text-sm font-semibold text-gray-200">
              {t(
                "visualizations.attentionDetailedCalculation.step4.softmaxTitle",
                { token: TOKS[focusToken] },
              )}
            </h4>

            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs">
              <AnimatedMathOperation totalSteps={3} delay={1500}>
                {(step) => {
                  const visibleScores = D.scores[focusToken].slice(
                    0,
                    focusToken + 1,
                  );
                  const exps = visibleScores.map((s) => Math.exp(s));
                  const total = exps.reduce((a, b) => a + b, 0);
                  const weights = exps.map((e) => e / total);

                  return (
                    <div className="space-y-3">
                      {/* Étape 1 : exp() */}
                      <div
                        className={`transition-all duration-500 ${step === 0 ? "ring-2 ring-white/20 bg-white/5 rounded p-2" : ""}`}
                      >
                        <p className="text-gray-500 mb-1">
                          {t(
                            "visualizations.attentionDetailedCalculation.step4.applyExp",
                          )}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          {visibleScores.map((s, i) => (
                            <span
                              key={i}
                              className={`transition-all duration-300 ${
                                step === 0
                                  ? "text-white"
                                  : step > 0 || step === -1
                                    ? "text-gray-300"
                                    : "text-gray-700"
                              }`}
                            >
                              <span className="text-gray-500">{TOKS[i]}:</span>{" "}
                              exp({fmt(s)}) ={" "}
                              <strong>{exps[i].toFixed(2)}</strong>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Étape 2 : somme */}
                      {(step >= 1 || step === -1) && (
                        <div
                          className={`transition-all duration-500 ${step === 1 ? "ring-2 ring-green-500/40 bg-green-500/10 rounded p-2" : ""}`}
                        >
                          <p className="text-gray-500 mb-1">
                            {t(
                              "visualizations.attentionDetailedCalculation.step4.sum",
                            )}
                          </p>
                          <p>
                            {exps.map((e, i) => (
                              <span key={i}>
                                {i > 0 && " + "}
                                {e.toFixed(2)}
                              </span>
                            ))}
                            {" = "}
                            <strong className="text-green-400">
                              {total.toFixed(2)}
                            </strong>
                          </p>
                        </div>
                      )}

                      {/* Étape 3 : diviser */}
                      {(step >= 2 || step === -1) && (
                        <div
                          className={`transition-all duration-500 ${step === 2 ? "ring-2 ring-amber-500/40 bg-amber-500/10 rounded p-2" : ""}`}
                        >
                          <p className="text-gray-500 mb-1">
                            {t(
                              "visualizations.attentionDetailedCalculation.step4.divideBySum",
                            )}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            {weights.map((w, i) => (
                              <span key={i} className={weightColor(w)}>
                                <span className="text-gray-500">
                                  {TOKS[i]}:
                                </span>{" "}
                                {(w * 100).toFixed(0)}%
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              </AnimatedMathOperation>
            </div>
          </div>

          {/* Matrice de poids complète */}
          <div className="bg-gray-900 rounded-lg p-4">
            <MatrixDisplay
              title={t(
                "visualizations.attentionDetailedCalculation.step4.weightsMatrixTitle",
              )}
              shape={`(${NUM_TOKS} × ${NUM_TOKS})`}
              data={D.attentionWeights}
              rowLabels={[...TOKS]}
              colLabels={[...TOKS]}
              rowLabelColor="text-amber-400"
              colLabelColor="text-gray-500"
              highlightRows={[focusToken]}
              maskedCells={(row, col) => col > row}
              cellColor={(v) => (v === 0 ? "text-gray-700" : weightColor(v))}
            />
            <p className="text-[10px] text-gray-500 mt-2">
              {t(
                "visualizations.attentionDetailedCalculation.step4.rowSumsToOne",
              )}{" "}
              {(() => {
                const row = D.attentionWeights[focusToken];
                const max = Math.max(...row);
                const maxIdx = row.indexOf(max);
                return t(
                  "visualizations.attentionDetailedCalculation.step4.tokenLooksMostly",
                  {
                    token: TOKS[focusToken],
                    targetToken: TOKS[maxIdx],
                    percentage: (max * 100).toFixed(0),
                  },
                );
              })()}
            </p>
          </div>
        </div>
      </ConcreteCalculation>

      {/* ═══════════════════════════════════════════════════════════
          ÉTAPE 5 : Sortie = Poids × V
          ═══════════════════════════════════════════════════════════ */}
      <ConcreteCalculation
        title={t("visualizations.attentionDetailedCalculation.step5.title")}
        description={t(
          "visualizations.attentionDetailedCalculation.step5.description",
          { token: TOKS[focusToken] },
        )}
      >
        <div className="space-y-4">
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-800 space-y-3">
            <h4 className="text-sm font-semibold text-gray-200">
              {t(
                "visualizations.attentionDetailedCalculation.step5.outputTitle",
                { token: TOKS[focusToken] },
              )}
            </h4>

            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs">
              <AnimatedMathOperation totalSteps={focusToken + 2} delay={1000}>
                {(step) => {
                  const weights = D.attentionWeights[focusToken];
                  const out = D.output[focusToken];

                  return (
                    <div className="space-y-3">
                      {/* Poids d'attention et matrice V avec highlighting */}
                      <div className="flex items-start justify-center gap-6 flex-wrap">
                        {/* Poids de focusToken */}
                        <div className="text-center">
                          <div className="text-[10px] text-amber-400 mb-1">
                            {t(
                              "visualizations.attentionDetailedCalculation.step5.weightsLabel",
                              { token: TOKS[focusToken] },
                            )}
                          </div>
                          <div className="space-y-0.5 text-[10px]">
                            {Array.from({ length: focusToken + 1 }).map(
                              (_, j) => {
                                const w = weights[j];
                                if (w === 0) return null;
                                const isActive =
                                  step >= 0 && step <= focusToken && step === j;
                                return (
                                  <div
                                    key={j}
                                    className="flex items-center gap-1"
                                  >
                                    <span
                                      className={`w-4 text-right ${isActive ? "text-amber-300 font-bold" : "text-gray-600"}`}
                                    >
                                      {TOKS[j]}
                                    </span>
                                    <span
                                      className={`${NCELL} ${
                                        step === -1
                                          ? "text-amber-400/40"
                                          : isActive
                                            ? "text-amber-400 ring-2 ring-amber-500/40 bg-amber-500/10 rounded px-0.5 transition-all duration-300"
                                            : step > j
                                              ? "text-amber-400/60 transition-all duration-300"
                                              : "text-amber-400/20 transition-all duration-300"
                                      }`}
                                    >
                                      {w.toFixed(2)}
                                    </span>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>

                        <span className="text-gray-500 text-lg mt-6">×</span>

                        {/* Matrice V avec ligne active */}
                        <div className="text-center">
                          <div className="text-[10px] text-purple-400 mb-1">
                            V{" "}
                            <span className="text-gray-600">
                              ({NUM_TOKS}×{DIM})
                            </span>
                          </div>
                          <div className="space-y-0.5 text-[10px]">
                            {D.V.map((row, r) => (
                              <div key={r} className="flex items-center gap-1">
                                <span
                                  className={`w-4 text-right ${step >= 0 && step <= focusToken && r === step ? "text-purple-300 font-bold" : "text-gray-600"}`}
                                >
                                  {TOKS[r]}
                                </span>
                                <span>
                                  [
                                  {row.map((v, c) => (
                                    <span key={c}>
                                      <span
                                        className={`${NCELL} ${
                                          step === -1
                                            ? "text-purple-400/40"
                                            : step <= focusToken && r === step
                                              ? "text-purple-400 ring-2 ring-purple-500/40 bg-purple-500/10 rounded px-0.5 transition-all duration-300"
                                              : "text-purple-400/20 transition-all duration-300"
                                        }`}
                                      >
                                        {fmt(v)}
                                      </span>
                                      {c < DIM - 1 && (
                                        <span className="text-gray-700">
                                          ,{" "}
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                  ]
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Calculs ligne par ligne */}
                      <div className="space-y-2 border-t border-gray-800 pt-3">
                        {Array.from({ length: focusToken + 1 }).map((_, j) => {
                          const visible = step === -1 || step >= j;
                          const active = step === j;
                          const w = weights[j];
                          const v = D.V[j];
                          const wv = v.map((val) => w * val);

                          if (w === 0) return null;

                          return (
                            <div
                              key={j}
                              className={`transition-all duration-300 ${!visible ? "opacity-0 h-0 overflow-hidden" : ""} ${
                                active
                                  ? "ring-2 ring-amber-500/20 bg-amber-500/5 rounded p-2"
                                  : "px-2"
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`${NCELL} ${active ? "text-amber-300 font-bold" : step > j ? "text-amber-400" : "text-amber-400/40"}`}
                                >
                                  {w.toFixed(2)}
                                </span>
                                <span className="text-gray-600">×</span>
                                <span className="text-purple-400">
                                  V<sub>{TOKS[j]}</sub>
                                </span>
                                <span className="text-gray-500">
                                  [
                                  {v.map((val, c) => (
                                    <span key={c}>
                                      <span className={NCELL}>{fmt(val)}</span>
                                      {c < DIM - 1 && ", "}
                                    </span>
                                  ))}
                                  ]
                                </span>
                                <span className="text-gray-600">=</span>
                                <span
                                  className={
                                    active ? "text-gray-200" : "text-gray-400"
                                  }
                                >
                                  [
                                  {wv.map((val, c) => (
                                    <span key={c}>
                                      <span className={NCELL}>{fmt(val)}</span>
                                      {c < DIM - 1 && ", "}
                                    </span>
                                  ))}
                                  ]
                                </span>
                              </div>
                              {active && (
                                <div className="text-[10px] text-gray-500 mt-1 ml-2">
                                  = [
                                  {v.map((val, c) => (
                                    <span key={c}>
                                      {c > 0 && ", "}
                                      <span className="text-amber-300">
                                        {fmtMul(w)}
                                      </span>
                                      <span className="text-gray-600">×</span>
                                      <span className="text-purple-300">
                                        {fmtMul(val)}
                                      </span>
                                      <span className="text-gray-600"> = </span>
                                      <span className="text-gray-300">
                                        {fmt(wv[c])}
                                      </span>
                                    </span>
                                  ))}
                                  ]
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Résultat final */}
                        {(step >= focusToken + 1 || step === -1) && (
                          <div
                            className={`border-t border-gray-700 pt-2 mt-2 ${
                              step >= focusToken + 1
                                ? "ring-2 ring-amber-500/20 bg-amber-500/5 rounded p-2"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-gray-500">Σ =</span>
                              <span className="text-amber-300 font-bold text-sm">
                                [
                                {out.map((v, c) => (
                                  <span key={c}>
                                    <span className={NCELL}>{fmt(v)}</span>
                                    {c < DIM - 1 && ", "}
                                  </span>
                                ))}
                                ]
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-1">
                              {t(
                                "visualizations.attentionDetailedCalculation.step5.resultNote",
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              </AnimatedMathOperation>
            </div>
          </div>
        </div>
      </ConcreteCalculation>

      {/* ═══════════════════════════════════════════════════════════
          ÉTAPE 6 : Matrice de sortie finale
          ═══════════════════════════════════════════════════════════ */}
      <ConcreteCalculation
        title={t("visualizations.attentionDetailedCalculation.step6.title")}
        description={t(
          "visualizations.attentionDetailedCalculation.step6.description",
        )}
      >
        <div className="space-y-4">
          {/* Matrice de sortie */}
          <div className="bg-gray-900 rounded-lg p-4">
            <MatrixDisplay
              title={t(
                "visualizations.attentionDetailedCalculation.step6.outputMatrixTitle",
              )}
              shape={`(${NUM_TOKS} × ${DIM})`}
              data={D.output}
              rowLabels={[...TOKS]}
              colLabels={["d₀", "d₁", "d₂", "d₃"]}
              rowLabelColor="text-amber-400"
              highlightRows={[focusToken]}
            />
          </div>

          {/* Comparaison entrée → sortie */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-800">
            <h4 className="text-sm font-semibold text-gray-200 mb-3">
              {t(
                "visualizations.attentionDetailedCalculation.step6.beforeAfterTitle",
                { token: TOKS[focusToken] },
              )}
            </h4>
            <div className="font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-500 w-16">
                  {t(
                    "visualizations.attentionDetailedCalculation.step6.inputLabel",
                  )}
                </span>
                <span className="text-gray-400">
                  [{D.embeddings[focusToken].map((v) => fmt(v)).join(", ")}]
                </span>
                <span className="text-gray-600 text-[10px]">
                  {t(
                    "visualizations.attentionDetailedCalculation.step6.isolatedEmbedding",
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-amber-400 w-16">
                  {t(
                    "visualizations.attentionDetailedCalculation.step6.outputLabel",
                  )}
                </span>
                <span className="text-amber-300 font-semibold">
                  [{D.output[focusToken].map((v) => fmt(v)).join(", ")}]
                </span>
                <span className="text-gray-600 text-[10px]">
                  {t(
                    "visualizations.attentionDetailedCalculation.step6.withContext",
                    {
                      details: (() => {
                        const row = D.attentionWeights[focusToken];
                        const parts: string[] = [];
                        for (let j = 0; j <= focusToken; j++) {
                          if (row[j] >= 0.15)
                            parts.push(
                              `${TOKS[j]}:${(row[j] * 100).toFixed(0)}%`,
                            );
                        }
                        return parts.join(", ");
                      })(),
                    },
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Note vers l'étape suivante */}
          <div className="bg-gray-800/30 border border-gray-700/30 rounded p-3 text-xs text-gray-400">
            {t(
              "visualizations.attentionDetailedCalculation.step6.singleHeadNote",
            )}
          </div>
        </div>
      </ConcreteCalculation>

      {/* ═══════════════════════════════════════════════════════════
          ÉTAPE 7 : Multi-tête — combiner les 4 têtes
          ═══════════════════════════════════════════════════════════ */}
      <ConcreteCalculation
        title={t("visualizations.attentionDetailedCalculation.step7.title")}
        description={t(
          "visualizations.attentionDetailedCalculation.step7.description",
        )}
      >
        <div className="space-y-6">
          {/* Les 4 sorties des têtes côte à côte */}
          <div>
            <h4 className="text-sm font-semibold text-gray-200 mb-3">
              {t(
                "visualizations.attentionDetailedCalculation.step7.headOutputsTitle",
              )}{" "}
              <span className="text-gray-500 font-normal">
                {t(
                  "visualizations.attentionDetailedCalculation.step7.eachSize",
                  { rows: NUM_TOKS, cols: DIM },
                )}
              </span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {D.headOutputs.map((head, h) => (
                <div
                  key={h}
                  className={`bg-gray-900 rounded-lg p-3 ${h === 0 ? "ring-1 ring-amber-500/30" : ""}`}
                >
                  <MatrixDisplay
                    title={
                      h === 0
                        ? t(
                            "visualizations.attentionDetailedCalculation.step7.headLabelCalculated",
                            { headNumber: h + 1 },
                          )
                        : t(
                            "visualizations.attentionDetailedCalculation.step7.headLabel",
                            { headNumber: h + 1 },
                          )
                    }
                    data={head}
                    rowLabels={[...TOKS]}
                    rowLabelColor={HEAD_COLORS[h]}
                    highlightRows={[focusToken]}
                    compact
                    precision={2}
                  />
                  {h > 0 && (
                    <p className="text-[10px] text-gray-600 mt-1">
                      {t(
                        "visualizations.attentionDetailedCalculation.step7.sameCalcDiffWeights",
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Concaténation */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-800 space-y-3">
            <h4 className="text-sm font-semibold text-gray-200">
              {t(
                "visualizations.attentionDetailedCalculation.step7.concatenationTitle",
                {
                  rows: NUM_TOKS,
                  cols: DIM,
                  nHeads: 4,
                  totalCols: DIM * D.nHeads,
                },
              )}
            </h4>
            <div className="bg-gray-900 rounded-lg p-3">
              <MatrixDisplay
                title="concat"
                shape={`(${NUM_TOKS} × ${DIM * D.nHeads})`}
                data={D.concatenated}
                rowLabels={[...TOKS]}
                colLabels={Array.from({ length: DIM * D.nHeads }, (_, i) => {
                  const head = Math.floor(i / DIM);
                  return `h${head + 1}`;
                })}
                rowLabelColor="text-gray-400"
                highlightRows={[focusToken]}
                cellColor={(_, __, col) => HEAD_COLORS[Math.floor(col / DIM)]}
                compact
              />
            </div>
            <p className="text-[10px] text-gray-500">
              {t(
                "visualizations.attentionDetailedCalculation.step7.colorExplanation",
                { dim: DIM, token: TOKS[focusToken] },
              )}
            </p>
          </div>

          {/* W_O et calcul animé */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-800 space-y-3">
            <h4 className="text-sm font-semibold text-gray-200">
              {t(
                "visualizations.attentionDetailedCalculation.step7.projWOTitle",
              )}
            </h4>
            <p className="text-xs text-gray-400">
              {t(
                "visualizations.attentionDetailedCalculation.step7.projWODescription",
                { inDim: DIM * D.nHeads, outDim: DIM, nHeads: D.nHeads },
              )}
            </p>

            <AnimatedMathOperation totalSteps={D.nHeads + 1} delay={1200}>
              {(step) => {
                const activeHead = step >= 0 && step < D.nHeads ? step : -1;

                // Contribution de chaque tête : headOutput[h][focusToken] × W_O[h*DIM:(h+1)*DIM, :]
                const headContribs = D.headOutputs.map((_, h) => {
                  const vec = D.headOutputs[h][focusToken];
                  const woBlock = D.W_O.slice(h * DIM, (h + 1) * DIM);
                  return Array.from({ length: DIM }, (_, d) =>
                    vec.reduce((sum, v, k) => sum + v * woBlock[k][d], 0),
                  );
                });

                return (
                  <div className="space-y-4">
                    {/* Matrices W_O et sortie avec highlighting dynamique */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-900 rounded-lg p-3">
                        <MatrixDisplay
                          title="W_O"
                          shape={`(${DIM * D.nHeads} × ${DIM})`}
                          data={D.W_O}
                          rowLabels={Array.from(
                            { length: DIM * D.nHeads },
                            (_, i) => {
                              const head = Math.floor(i / DIM);
                              const dim = i % DIM;
                              return `h${head + 1}.${dim}`;
                            },
                          )}
                          colLabels={["d₀", "d₁", "d₂", "d₃"]}
                          highlightRows={
                            activeHead >= 0
                              ? Array.from(
                                  { length: DIM },
                                  (_, i) => activeHead * DIM + i,
                                )
                              : []
                          }
                          cellColor={(_, row) => {
                            const hIdx = Math.floor(row / DIM);
                            if (activeHead === -1) return HEAD_COLORS[hIdx];
                            return hIdx === activeHead
                              ? HEAD_COLORS[hIdx]
                              : "text-gray-700";
                          }}
                          compact
                        />
                      </div>
                      <div className="bg-gray-900 rounded-lg p-3">
                        <MatrixDisplay
                          title={t(
                            "visualizations.attentionDetailedCalculation.step7.outputMatrixTitle",
                          )}
                          shape={`(${NUM_TOKS} × ${DIM})`}
                          data={D.multiHeadOutput}
                          rowLabels={[...TOKS]}
                          colLabels={["d₀", "d₁", "d₂", "d₃"]}
                          rowLabelColor="text-primary-400"
                          highlightRows={[focusToken]}
                        />
                      </div>
                    </div>

                    {/* Calcul détaillé par tête */}
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs">
                      <p className="text-gray-500 text-[10px] mb-2">
                        {t(
                          "visualizations.attentionDetailedCalculation.step7.projectionForToken",
                          { token: TOKS[focusToken] },
                        )}
                      </p>
                      <div className="space-y-2">
                        {D.headOutputs.map((_, h) => {
                          const visible = step === -1 || step >= h;
                          const active = step === h;
                          const vec = D.headOutputs[h][focusToken];
                          const woBlock = D.W_O.slice(h * DIM, (h + 1) * DIM);
                          const contrib = headContribs[h];
                          const runningTotal =
                            active && h > 0
                              ? Array.from({ length: DIM }, (_, d) =>
                                  headContribs
                                    .slice(0, h + 1)
                                    .reduce((s, c) => s + c[d], 0),
                                )
                              : null;

                          return (
                            <div
                              key={h}
                              className={`transition-all duration-300 ${!visible ? "opacity-0 h-0 overflow-hidden" : ""} ${
                                active
                                  ? `ring-2 ${HEAD_RING[h]} rounded p-2`
                                  : "px-2"
                              }`}
                            >
                              {/* Ligne principale : Tête h [vec] × W_O[bloc] → [contrib] */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`font-semibold ${active ? HEAD_COLORS[h] : "text-gray-500"}`}
                                >
                                  {t(
                                    "visualizations.attentionDetailedCalculation.step7.headLabel",
                                    { headNumber: h + 1 },
                                  )}
                                </span>
                                <span
                                  className={
                                    active ? HEAD_COLORS[h] : "text-gray-600"
                                  }
                                >
                                  [
                                  {vec.map((v, i) => (
                                    <span key={i}>
                                      <span
                                        className={`${NCELL} ${active ? `ring-2 ${HEAD_RING[h]} rounded px-1` : ""}`}
                                      >
                                        {fmt(v)}
                                      </span>
                                      {i < DIM - 1 && ", "}
                                    </span>
                                  ))}
                                  ]
                                </span>
                                <span className="text-gray-600">
                                  × W<sub>O</sub>
                                  <sub className="text-gray-700">
                                    [{h * DIM}:{(h + 1) * DIM}]
                                  </sub>{" "}
                                  →
                                </span>
                                <span
                                  className={
                                    active
                                      ? "text-white font-bold"
                                      : "text-gray-400"
                                  }
                                >
                                  [
                                  {contrib.map((v, i) => (
                                    <span key={i}>
                                      <span className={NCELL}>{fmt(v, 2)}</span>
                                      {i < DIM - 1 && ", "}
                                    </span>
                                  ))}
                                  ]
                                </span>
                              </div>

                              {/* Détail élément par élément quand actif */}
                              {active && (
                                <div className="text-[10px] text-gray-500 mt-1.5 ml-2 space-y-0.5">
                                  {Array.from({ length: DIM }, (_, d) => (
                                    <div
                                      key={d}
                                      className="flex items-center gap-1 flex-wrap"
                                    >
                                      <span className="text-gray-600 w-5">
                                        d<sub>{d}</sub> :
                                      </span>
                                      {vec.map((v, k) => (
                                        <span key={k}>
                                          {k > 0 && (
                                            <span className="text-gray-700">
                                              {" "}
                                              +{" "}
                                            </span>
                                          )}
                                          <span className={HEAD_COLORS[h]}>
                                            {fmtMul(v)}
                                          </span>
                                          <span className="text-gray-600">
                                            ×
                                          </span>
                                          <span className="text-gray-400">
                                            {fmtMul(woBlock[k][d])}
                                          </span>
                                        </span>
                                      ))}
                                      <span className="text-gray-600"> = </span>
                                      <span className="text-gray-300 font-semibold">
                                        {fmt(contrib[d])}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Total partiel */}
                              {runningTotal && (
                                <div className="text-[10px] text-gray-500 mt-1 ml-2">
                                  {t(
                                    "visualizations.attentionDetailedCalculation.step7.partialTotal",
                                    {
                                      values: runningTotal
                                        .map((v) => fmt(v, 2))
                                        .join(", "),
                                    },
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Résultat final */}
                        {(step >= D.nHeads || step === -1) && (
                          <div
                            className={`border-t border-gray-700 pt-2 mt-2 ${
                              step >= D.nHeads
                                ? "ring-2 ring-primary-500/20 bg-primary-500/5 rounded p-2"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-gray-500">Σ =</span>
                              <span className="text-primary-300 font-bold text-sm">
                                [
                                {D.multiHeadOutput[focusToken]
                                  .map((v) => fmt(v))
                                  .join(", ")}
                                ]
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-600 mt-1">
                              {t(
                                "visualizations.attentionDetailedCalculation.step7.finalRepresentation",
                                { token: TOKS[focusToken] },
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
            </AnimatedMathOperation>
          </div>

          {/* Comparaison entrée → sortie finale */}
          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-green-300 font-semibold text-sm">
              {t(
                "visualizations.attentionDetailedCalculation.step7.beforeAfterTitle",
                { token: TOKS[focusToken] },
              )}
            </h4>
            <div className="font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-500 w-28">
                  {t(
                    "visualizations.attentionDetailedCalculation.step7.embeddingLabel",
                  )}
                </span>
                <span className="text-gray-400">
                  [{D.embeddings[focusToken].map((v) => fmt(v)).join(", ")}]
                </span>
                <span className="text-gray-600 text-[10px]">
                  {t(
                    "visualizations.attentionDetailedCalculation.step7.isolatedNoContext",
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-amber-400 w-28">
                  {t(
                    "visualizations.attentionDetailedCalculation.step7.singleHeadLabel",
                  )}
                </span>
                <span className="text-amber-300">
                  [{D.output[focusToken].map((v) => fmt(v)).join(", ")}]
                </span>
                <span className="text-gray-600 text-[10px]">
                  {t(
                    "visualizations.attentionDetailedCalculation.step7.afterSingleHead",
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-primary-400 w-28 font-semibold">
                  {t(
                    "visualizations.attentionDetailedCalculation.step7.multiHeadLabel",
                  )}
                </span>
                <span className="text-primary-300 font-semibold">
                  [{D.multiHeadOutput[focusToken].map((v) => fmt(v)).join(", ")}
                  ]
                </span>
                <span className="text-gray-600 text-[10px]">
                  {t(
                    "visualizations.attentionDetailedCalculation.step7.enrichedFinalRepr",
                  )}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-gray-500">
              {t(
                "visualizations.attentionDetailedCalculation.step7.finalVectorNote",
              )}
            </p>
          </div>
        </div>
      </ConcreteCalculation>
    </div>
  );
}
