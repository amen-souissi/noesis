/**
 * Explorateur éducatif du modèle — Tokens, Embeddings & Poids.
 *
 * Section pliable affichée dans l'onglet Entraînement quand le modèle est prêt.
 * Trois onglets internes liés aux leçons du cours.
 *
 * @module components/playground/ModelExplorer
 */

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Search, BookOpen, Loader2, Play, Sparkles } from "lucide-react";
import TokenGrid from "@/components/visualizations/TokenGrid";
import EmbeddingMatrix from "@/components/visualizations/EmbeddingMatrix";
import {
  tokenizeText,
  getEmbeddings,
  getWeightMatrices,
  getGenerationWeights,
} from "@/api/evaluation";
import { useModelRegistryStore } from "@/stores/modelRegistryStore";
import type {
  TokenizeResult,
  EmbeddingPoint,
  WeightMatrix,
  GenerationWeight,
} from "@/api/evaluation";

type ExplorerTab = "weights" | "generation" | "tokens" | "embeddings";

const TABS: {
  id: ExplorerTab;
  labelKey: string;
  lessonPath: string;
  lessonLabelKey: string;
}[] = [
  {
    id: "weights",
    labelKey: "playground.explorer.tabs.weights",
    lessonPath: "/training/attention",
    lessonLabelKey: "playground.explorer.lessonLabels.weights",
  },
  {
    id: "generation",
    labelKey: "playground.explorer.tabs.generation",
    lessonPath: "/generation/autoregressive",
    lessonLabelKey: "playground.explorer.lessonLabels.generation",
  },
  {
    id: "tokens",
    labelKey: "playground.explorer.tabs.tokens",
    lessonPath: "/training/tokenization",
    lessonLabelKey: "playground.explorer.lessonLabels.tokens",
  },
  {
    id: "embeddings",
    labelKey: "playground.explorer.tabs.embeddings",
    lessonPath: "/training/embedding",
    lessonLabelKey: "playground.explorer.lessonLabels.embeddings",
  },
];

// ─── Onglet Tokenisation ─────────────────────────────────────

function TokenisationTab({ configId }: { configId: string }) {
  const { t } = useTranslation("components");
  const [text, setText] = useState("");
  const [result, setResult] = useState<TokenizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!text.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await tokenizeText(text, configId);
        setResult(res.data);
      } catch (e: any) {
        const msg = e?.response?.data?.error;
        setError(
          msg || t("playground.explorer.tokenisation.tokenizationError"),
        );
        setResult(null);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [text, configId]);

  const isBPE = result ? result.tokenizer_type.includes("Tiktoken") : false;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        {t("playground.explorer.tokenisation.description")}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("playground.explorer.tokenisation.placeholder")}
        rows={2}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-primary-500"
      />
      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />{" "}
          {t("playground.explorer.tokenisation.loading")}
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
      {result && (
        <>
          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
            <span>
              {t("playground.explorer.tokenisation.tokenizerLabel")}{" "}
              <span
                className={`font-medium ${isBPE ? "text-purple-400" : "text-sky-400"}`}
              >
                {result.tokenizer_type}
              </span>
            </span>
            <span>
              {t("playground.explorer.tokenisation.vocabLabel", {
                count: result.vocab_size,
              })}
            </span>
            <span>
              {t(
                result.ids.length > 1
                  ? "playground.explorer.tokenisation.resultLabelPlural"
                  : "playground.explorer.tokenisation.resultLabel",
                { count: result.ids.length },
              )}
            </span>
            {isBPE && (
              <span className="text-purple-400/60">
                {t("playground.explorer.tokenisation.subwordsBPE")}
              </span>
            )}
          </div>
          <TokenGrid
            chars={result.chars}
            ids={result.ids}
            vocab={result.vocab}
            showVocab
          />
        </>
      )}
    </div>
  );
}

// ─── Onglet Embedding ────────────────────────────────────────

function EmbeddingTab({ configId }: { configId: string }) {
  const { t } = useTranslation("components");
  const [loading, setLoading] = useState(true);
  const [embeddings, setEmbeddings] = useState<EmbeddingPoint[]>([]);
  const [samples, setSamples] = useState<
    { char: string; id: number; vector: number[] }[]
  >([]);
  const [embShape, setEmbShape] = useState<{
    rows: number;
    cols: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getEmbeddings(configId), getWeightMatrices(configId)])
      .then(([embRes, matRes]) => {
        const embs = embRes.data.embeddings;
        setEmbeddings(embs);

        const embMatrix = matRes.data.matrices.find(
          (m) => m.module === "embedding" && m.param === "W",
        );
        if (embMatrix) {
          setEmbShape({ rows: embMatrix.shape[0], cols: embMatrix.shape[1] });
          const count = Math.min(10, embMatrix.rows);
          const s = embMatrix.values.slice(0, count).map((row, i) => ({
            char: embs[i]?.token ?? `[${i}]`,
            id: embs[i]?.token_id ?? i,
            vector: row,
          }));
          setSamples(s);
        }
      })
      .catch(() => setError(t("playground.explorer.embedding.loadError")))
      .finally(() => setLoading(false));
  }, [configId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 py-4">
        <Loader2 className="w-4 h-4 animate-spin" />{" "}
        {t("playground.explorer.embedding.loading")}
      </div>
    );
  }

  if (error) return <p className="text-xs text-red-400">{error}</p>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        {t("playground.explorer.embedding.description")}
      </p>
      {samples.length > 0 && embShape && (
        <EmbeddingMatrix
          samples={samples}
          displayDims={Math.min(8, samples[0].vector.length)}
          matrixShape={embShape}
        />
      )}
      {samples.length === 0 && (
        <p className="text-xs text-gray-500">
          {t("playground.explorer.embedding.noData")}
        </p>
      )}
    </div>
  );
}

// ─── Onglet Génération (animation token-by-token) ───────────

function GenerationTab({ configId }: { configId: string }) {
  const { t } = useTranslation("components");
  const [prompt, setPrompt] = useState("");
  const [maxTokens, setMaxTokens] = useState(20);
  const [temperature, setTemperature] = useState(0.8);
  const [speed, setSpeed] = useState(1200);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationWeight | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setVisibleCount(0);
    setActiveIdx(null);
    clearInterval(timerRef.current);

    try {
      const res = await getGenerationWeights(prompt, maxTokens, temperature);
      const data = res.data;
      setResult(data);

      // Animate tokens appearing one by one
      let count = 0;
      timerRef.current = setInterval(() => {
        count++;
        setVisibleCount(count);
        setActiveIdx(count - 1);
        if (count >= data.generated_tokens.length) {
          clearInterval(timerRef.current);
        }
      }, speed);
    } catch {
      setError(t("playground.explorer.generation.generationError"));
    } finally {
      setLoading(false);
    }
  }

  function handleShowAll() {
    if (!result) return;
    clearInterval(timerRef.current);
    setVisibleCount(result.generated_tokens.length);
  }

  const generated = result
    ? result.generated_tokens.slice(0, visibleCount)
    : [];
  const isAnimating =
    result !== null && visibleCount < result.generated_tokens.length;

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        {t("playground.explorer.generation.description")}
      </p>

      {/* Prompt input */}
      <div className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t("playground.explorer.generation.placeholder")}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary-500"
          onKeyDown={(e) => e.key === "Enter" && !loading && handleGenerate()}
          disabled={loading}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="btn-primary px-4 py-2 text-sm flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {t("playground.explorer.generation.generate")}
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <label className="flex items-center gap-2 text-gray-400">
          {t("playground.explorer.generation.tokensMax")}
          <input
            type="number"
            value={maxTokens}
            onChange={(e) =>
              setMaxTokens(Math.max(1, Math.min(100, Number(e.target.value))))
            }
            min={1}
            max={100}
            className="w-16 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-center"
          />
        </label>
        <label className="flex items-center gap-2 text-gray-400">
          {t("playground.explorer.generation.temperature")}
          <input
            type="number"
            value={temperature}
            onChange={(e) =>
              setTemperature(Math.max(0.1, Math.min(2, Number(e.target.value))))
            }
            min={0.1}
            max={2}
            step={0.1}
            className="w-16 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-center"
          />
        </label>
        <label className="flex items-center gap-2 text-gray-400">
          {t("playground.explorer.generation.speed")}
          <input
            type="range"
            min={200}
            max={3000}
            step={100}
            value={3200 - speed}
            onChange={(e) => setSpeed(3200 - Number(e.target.value))}
            className="w-24 accent-primary-500"
          />
          <span className="text-gray-500 w-10 text-right">
            {(speed / 1000).toFixed(1)}s
          </span>
        </label>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Generated text with animated tokens */}
      {result && (
        <div className="space-y-4" ref={resultRef}>
          <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                {t("playground.explorer.generation.generatedText")}
              </p>
              {isAnimating && (
                <button
                  onClick={handleShowAll}
                  className="text-[10px] text-primary-400 hover:text-primary-300 transition-colors"
                >
                  {t("playground.explorer.generation.showAll")}
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-baseline gap-0.5 font-mono text-sm leading-relaxed">
              {/* Prompt tokens */}
              {result.prompt_tokens.map((token, i) => (
                <span key={`p-${i}`} className="text-gray-500">
                  {token}
                </span>
              ))}
              {/* Generated tokens — animated appearance */}
              {generated.map((gt, i) => (
                <span
                  key={`g-${i}`}
                  onClick={() => setActiveIdx(activeIdx === i ? null : i)}
                  className={`cursor-pointer rounded px-0.5 transition-all duration-300 ${
                    i === activeIdx
                      ? "bg-primary-500/20 text-primary-300 ring-1 ring-primary-500/30"
                      : "text-white hover:bg-gray-800"
                  } ${i === visibleCount - 1 && isAnimating ? "animate-pulse" : ""}`}
                >
                  {gt.token}
                </span>
              ))}
              {isAnimating && (
                <span className="text-primary-400 animate-pulse ml-0.5">▌</span>
              )}
            </div>
          </div>

          {/* Probability detail panel for selected token */}
          {activeIdx !== null && generated[activeIdx] && (
            <div className="bg-gray-800/40 rounded-lg border border-gray-800 p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                  <span className="text-xs text-gray-400">
                    {t("playground.explorer.generation.tokenLabel", {
                      idx: activeIdx + 1,
                    })}
                    <span className="text-primary-400 font-mono ml-1.5 text-sm">
                      &ldquo;{generated[activeIdx].token}&rdquo;
                    </span>
                  </span>
                </div>
                <span className="text-sm font-mono font-bold text-primary-400">
                  {(generated[activeIdx].probability * 100).toFixed(1)}%
                </span>
              </div>

              {/* Probability bars */}
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 mb-2">
                  {t("playground.explorer.generation.candidatesDistribution")}
                </p>
                {generated[activeIdx].top_probs.map((tp, i) => {
                  const isChosen = tp.token === generated[activeIdx!].token;
                  const pct = tp.prob * 100;
                  return (
                    <div key={i} className="flex items-center gap-2 group">
                      <span
                        className={`text-xs font-mono w-16 truncate text-right ${
                          isChosen
                            ? "text-primary-400 font-semibold"
                            : "text-gray-500"
                        }`}
                        title={tp.token}
                      >
                        {tp.token === " " ? "␣" : tp.token}
                      </span>
                      <div className="flex-1 h-5 bg-gray-900/80 rounded overflow-hidden relative">
                        <div
                          className={`h-full rounded transition-all duration-700 ease-out ${
                            isChosen
                              ? "bg-gradient-to-r from-primary-600 to-primary-400"
                              : "bg-gray-700/80"
                          }`}
                          style={{ width: `${Math.max(1, pct)}%` }}
                        />
                        {pct > 15 && (
                          <span
                            className={`absolute inset-y-0 left-2 flex items-center text-[10px] font-mono ${
                              isChosen ? "text-white" : "text-gray-400"
                            }`}
                          >
                            {tp.token === " " ? "␣" : tp.token}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-mono w-14 text-right ${
                          isChosen
                            ? "text-primary-400 font-semibold"
                            : "text-gray-600"
                        }`}
                      >
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary stats */}
          {!isAnimating && generated.length > 0 && (
            <div className="flex items-center gap-4 text-[10px] text-gray-600">
              <span>
                {t("playground.explorer.generation.promptTokens", {
                  count: result.prompt_tokens.length,
                })}
              </span>
              <span className="text-gray-700">→</span>
              <span>
                {t("playground.explorer.generation.generatedTokens", {
                  count: generated.length,
                })}
              </span>
              <span className="text-gray-700">·</span>
              <span>
                {t("playground.explorer.generation.temperatureLabel", {
                  value: temperature,
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Canvas pour une matrice de poids ────────────────────────

function WeightMatrixCanvas({
  matrix,
  isSelected,
  onClick,
  large,
}: {
  matrix: WeightMatrix;
  isSelected?: boolean;
  onClick?: () => void;
  large?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { rows, cols, values, min, max } = matrix;

    if (large) {
      // Detail view: fit to maxDim
      const maxDim = 400;
      const cellSize = Math.max(
        2,
        Math.min(Math.floor(maxDim / cols), Math.floor(maxDim / rows)),
      );
      canvas.width = cols * cellSize;
      canvas.height = rows * cellSize;
    } else {
      // Thumbnail: fixed 200×200 canvas for uniform sizing
      canvas.width = 200;
      canvas.height = 200;
    }

    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;
    const absMax = Math.max(Math.abs(min), Math.abs(max)) || 1;

    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = (values[r]?.[c] ?? 0) / absMax;
        const magnitude = Math.abs(val);
        const cellMin = Math.min(cellW, cellH);
        const radius = (cellMin / 2) * Math.max(0.15, magnitude) * 0.85;
        const cx = c * cellW + cellW / 2;
        const cy = r * cellH + cellH / 2;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        if (val >= 0) {
          ctx.fillStyle = `rgba(59, 130, 246, ${Math.max(0.15, magnitude)})`;
        } else {
          ctx.fillStyle = `rgba(239, 68, 68, ${Math.max(0.15, magnitude)})`;
        }
        ctx.fill();
      }
    }
  }, [matrix, large]);

  if (large) {
    return (
      <canvas
        ref={canvasRef}
        className="w-full border border-gray-700 rounded-lg"
        style={{ maxHeight: "280px" }}
      />
    );
  }

  const params = matrix.rows * matrix.cols;

  return (
    <button
      onClick={onClick}
      className={`bg-gray-900/40 rounded-lg border p-2.5 text-left transition-all hover:border-gray-600 group ${
        isSelected
          ? "border-primary-500/50 ring-1 ring-primary-500/20 bg-primary-500/5"
          : "border-gray-800"
      }`}
    >
      <canvas
        ref={canvasRef}
        className="w-full rounded"
        style={{ imageRendering: "auto" }}
      />
      <div className="mt-1.5 space-y-0.5">
        <p className="text-[10px] font-mono text-gray-400 truncate group-hover:text-gray-300">
          {matrix.param}
        </p>
        <div className="flex items-center justify-between text-[9px] text-gray-600">
          <span>{matrix.shape.join("×")}</span>
          <span>{params.toLocaleString()}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Mapping module → leçon éducative ────────────────────────

/** Résout le lien éducatif pour un module du modèle. */
function getLessonForModule(
  moduleName: string,
): { path: string; label: string } | null {
  if (moduleName === "embedding")
    return { path: "/training/embedding", label: "Embedding" };
  if (moduleName === "output_head")
    return { path: "/training/loss", label: "errorLabel" };
  if (moduleName === "final_ln")
    return { path: "/training/feedforward", label: "Feed-Forward" };
  if (moduleName.endsWith(".attention"))
    return { path: "/training/attention", label: "Attention" };
  if (moduleName.endsWith(".ffn"))
    return { path: "/training/feedforward", label: "Feed-Forward" };
  if (moduleName.endsWith(".ln1") || moduleName.endsWith(".ln2"))
    return { path: "/training/feedforward", label: "Feed-Forward" };
  return null;
}

// ─── Onglet Poids du modèle ─────────────────────────────────

function WeightsTab({ configId }: { configId: string }) {
  const { t } = useTranslation("components");
  const [matrices, setMatrices] = useState<WeightMatrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getWeightMatrices(configId)
      .then((res) => setMatrices(res.data.matrices))
      .catch(() => setError(t("playground.explorer.weights.loadError")))
      .finally(() => setLoading(false));
  }, [configId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 py-4">
        <Loader2 className="w-4 h-4 animate-spin" />{" "}
        {t("playground.explorer.weights.loading")}
      </div>
    );
  }

  if (error) return <p className="text-xs text-red-400">{error}</p>;

  // Grouper par module
  const grouped = matrices.reduce<Record<string, WeightMatrix[]>>(
    (acc, mat) => {
      if (!acc[mat.module]) acc[mat.module] = [];
      acc[mat.module].push(mat);
      return acc;
    },
    {},
  );

  const totalParams = matrices.reduce((sum, m) => sum + m.rows * m.cols, 0);
  const selected = selectedIdx !== null ? matrices[selectedIdx] : null;

  return (
    <div className="space-y-4">
      {/* En-tête avec stats globales */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {t("playground.explorer.weights.description")}
        </p>
        <div className="flex items-center gap-3 text-[10px] text-gray-500 whitespace-nowrap ml-4">
          <span>
            {t("playground.explorer.weights.matricesCount", {
              count: matrices.length,
            })}
          </span>
          <span className="text-gray-700">·</span>
          <span>
            {t("playground.explorer.weights.parametersCount", {
              count: totalParams,
            })}
          </span>
        </div>
      </div>

      {/* Gradient legend */}
      <div className="flex items-center gap-2 text-[10px] text-gray-500">
        <span className="text-red-400 whitespace-nowrap">
          {t("playground.explorer.weights.negative")}
        </span>
        <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-gray-900 border border-gray-800">
          <div className="w-full h-full bg-gradient-to-r from-red-500 via-gray-900 to-blue-500" />
        </div>
        <span className="text-blue-400 whitespace-nowrap">
          {t("playground.explorer.weights.positive")}
        </span>
      </div>

      {/* Modules groupés */}
      {Object.entries(grouped).map(([moduleName, mats]) => {
        const moduleParams = mats.reduce((sum, m) => sum + m.rows * m.cols, 0);
        return (
          <div key={moduleName} className="space-y-2">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-mono text-gray-400">
                  {moduleName}
                </h4>
                {(() => {
                  const lesson = getLessonForModule(moduleName);
                  if (!lesson) return null;
                  return (
                    <Link
                      to={lesson.path}
                      className="flex items-center gap-1 text-[10px] text-primary-400 hover:text-primary-300 transition-colors"
                      title={t("playground.explorer.weights.lessonLabel", {
                        label:
                          lesson.label === "errorLabel"
                            ? t("playground.explorer.weights.errorLabel")
                            : lesson.label,
                      })}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>
                        {lesson.label === "errorLabel"
                          ? t("playground.explorer.weights.errorLabel")
                          : lesson.label}
                      </span>
                    </Link>
                  );
                })()}
              </div>
              <span className="text-[10px] text-gray-600">
                {t(
                  mats.length > 1
                    ? "playground.explorer.weights.paramsAndMatricesPlural"
                    : "playground.explorer.weights.paramsAndMatrices",
                  { params: moduleParams.toLocaleString(), count: mats.length },
                )}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mats.map((mat, i) => {
                const globalIdx = matrices.indexOf(mat);
                return (
                  <WeightMatrixCanvas
                    key={`${moduleName}-${i}`}
                    matrix={mat}
                    isSelected={globalIdx === selectedIdx}
                    onClick={() =>
                      setSelectedIdx(
                        globalIdx === selectedIdx ? null : globalIdx,
                      )
                    }
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Panneau de détail de la matrice sélectionnée */}
      {selected && (
        <div className="bg-gray-900/50 rounded-lg border border-primary-500/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-mono text-primary-400">
              {selected.module}
              <span className="text-gray-600">.</span>
              {selected.param}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{selected.shape.join(" × ")}</span>
              <span className="text-gray-700">·</span>
              <span>
                {t("playground.explorer.weights.weightsCount", {
                  count: selected.rows * selected.cols,
                })}
              </span>
            </div>
          </div>

          <WeightMatrixCanvas matrix={selected} large />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
              <p className="text-[9px] text-gray-500 mb-0.5">
                {t("playground.explorer.weights.statsMin")}
              </p>
              <p className="text-sm font-mono text-red-400">
                {selected.min.toFixed(4)}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
              <p className="text-[9px] text-gray-500 mb-0.5">
                {t("playground.explorer.weights.statsMax")}
              </p>
              <p className="text-sm font-mono text-blue-400">
                {selected.max.toFixed(4)}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
              <p className="text-[9px] text-gray-500 mb-0.5">
                {t("playground.explorer.weights.statsMean")}
              </p>
              <p className="text-sm font-mono text-gray-300">
                {selected.mean.toFixed(4)}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-center">
              <p className="text-[9px] text-gray-500 mb-0.5">
                {t("playground.explorer.weights.statsStd")}
              </p>
              <p className="text-sm font-mono text-gray-300">
                {selected.std.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}

      {matrices.length === 0 && (
        <p className="text-xs text-gray-500">
          {t("playground.explorer.weights.noMatrices")}
        </p>
      )}
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────

interface Props {
  configId: string;
}

export default function ModelExplorer({ configId }: Props) {
  const { t } = useTranslation("components");
  const [activeTab, setActiveTab] = useState<ExplorerTab>("weights");

  const activeModels = useModelRegistryStore((s) => s.activeModels);
  const refreshModels = useModelRegistryStore((s) => s.refreshModels);
  const isModelReady = activeModels.some(
    (m) => m.config_id === configId && m.is_ready,
  );

  // Sync with backend on mount / configId change
  useEffect(() => {
    refreshModels();
  }, [configId, refreshModels]);

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="space-y-4">
      {/* Titre */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
        <Search className="w-4 h-4" />
        {t("playground.explorer.title")}
      </div>

      {/* Message si le modèle n'est pas chargé */}
      {!isModelReady && (
        <div className="bg-gray-800/50 rounded-lg border border-gray-800 p-4">
          <p className="text-sm text-gray-400">
            {t("playground.explorer.modelNotLoaded")}
          </p>
        </div>
      )}

      {/* Onglets — visibles quand le modèle est chargé */}
      {isModelReady && (
        <>
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-600/20 text-primary-400"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* Lien vers la leçon */}
          <Link
            to={currentTab.lessonPath}
            className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            {t(currentTab.lessonLabelKey)}
          </Link>

          {/* Contenu de l'onglet actif */}
          <div className="bg-gray-800/30 rounded-lg border border-gray-800 p-4">
            {activeTab === "weights" && <WeightsTab configId={configId} />}
            {activeTab === "generation" && (
              <GenerationTab configId={configId} />
            )}
            {activeTab === "tokens" && <TokenisationTab configId={configId} />}
            {activeTab === "embeddings" && <EmbeddingTab configId={configId} />}
          </div>
        </>
      )}
    </div>
  );
}
