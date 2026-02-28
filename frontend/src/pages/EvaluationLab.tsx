import { useEffect, useState, useRef, useCallback } from "react";
import {
  FlaskConical,
  Loader2,
  Play,
  Layers,
  BarChart3,
  Cpu,
  CircleDot,
  Grid3X3,
  Sparkles,
} from "lucide-react";
import {
  ScatterChart,
  Scatter as RScatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  getAttention,
  getPerplexity,
  getEmbeddings,
  getParameters,
  getWeightMatrices,
  getGenerationWeights,
  type AttentionResult,
  type PerplexityResult,
  type EmbeddingPoint,
  type ParameterStat,
  type WeightMatrix,
  type GenerationWeight,
} from "@/api/evaluation";
import { formatNumber } from "@/lib/utils";

type TabId =
  | "attention"
  | "perplexity"
  | "parameters"
  | "embeddings"
  | "weights"
  | "gen-weights";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "attention", label: "Attention Heatmap", icon: Layers },
  { id: "perplexity", label: "Perplexity", icon: BarChart3 },
  { id: "parameters", label: "Parameters", icon: Cpu },
  { id: "embeddings", label: "Embeddings", icon: CircleDot },
  { id: "weights", label: "Weight Matrix", icon: Grid3X3 },
  { id: "gen-weights", label: "Generation Weights", icon: Sparkles },
];

/* ─────────────────────── Attention Heatmap Tab ─────────────────────── */
function AttentionTab() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<AttentionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [layer, setLayer] = useState(0);
  const [head, setHead] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const analyse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await getAttention(text);
      setResults(res.data.attention);
      setLayer(0);
      setHead(0);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  // Find available layers and heads
  const layers = [...new Set(results.map((r) => r.layer))].sort(
    (a, b) => a - b,
  );
  const heads = [
    ...new Set(results.filter((r) => r.layer === layer).map((r) => r.head)),
  ].sort((a, b) => a - b);
  const current = results.find((r) => r.layer === layer && r.head === head);

  // Draw heatmap on canvas
  useEffect(() => {
    if (!current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { weights, tokens } = current;
    const n = tokens.length;
    const cellSize = Math.min(40, Math.floor(500 / n));
    const labelMargin = 80;
    const size = n * cellSize + labelMargin;

    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, size, size);

    // Token labels
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    for (let i = 0; i < n; i++) {
      ctx.fillText(
        tokens[i].slice(0, 8),
        labelMargin - 6,
        labelMargin + i * cellSize + cellSize / 2 + 4,
      );
    }
    ctx.save();
    ctx.textAlign = "left";
    for (let j = 0; j < n; j++) {
      ctx.save();
      ctx.translate(labelMargin + j * cellSize + cellSize / 2, labelMargin - 6);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(tokens[j].slice(0, 8), 0, 0);
      ctx.restore();
    }
    ctx.restore();

    // Heatmap cells
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const v = weights[i]?.[j] ?? 0;
        const intensity = Math.min(255, Math.floor(v * 255));
        ctx.fillStyle = `rgb(${intensity}, ${Math.floor(intensity * 0.4)}, ${Math.floor(255 - intensity * 0.7)})`;
        ctx.fillRect(
          labelMargin + j * cellSize,
          labelMargin + i * cellSize,
          cellSize - 1,
          cellSize - 1,
        );
      }
    }
  }, [current]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze attention patterns..."
          rows={3}
          className="input flex-1 resize-none"
        />
        <button
          onClick={analyse}
          disabled={loading || !text.trim()}
          className="btn-primary self-end disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div className="card space-y-4">
          <div className="flex gap-4">
            <div>
              <label className="label">Layer</label>
              <select
                value={layer}
                onChange={(e) => {
                  setLayer(Number(e.target.value));
                  setHead(0);
                }}
                className="input"
              >
                {layers.map((l) => (
                  <option key={l} value={l}>
                    Layer {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Head</label>
              <select
                value={head}
                onChange={(e) => setHead(Number(e.target.value))}
                className="input"
              >
                {heads.map((h) => (
                  <option key={h} value={h}>
                    Head {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-auto">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>

          {current && (
            <p className="text-xs text-gray-500">
              {current.tokens.length} tokens | Layer {layer} Head {head} |
              Values 0.0 (purple) to 1.0 (orange)
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Perplexity Tab ─────────────────────── */
function PerplexityTab() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<PerplexityResult | null>(null);
  const [loading, setLoading] = useState(false);

  const evaluate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await getPerplexity(text);
      setResult(res.data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to compute perplexity..."
          rows={3}
          className="input flex-1 resize-none"
        />
        <button
          onClick={evaluate}
          disabled={loading || !text.trim()}
          className="btn-primary self-end disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
      </div>

      {result && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card text-center">
            <p className="text-gray-400 text-sm mb-2">Loss (Cross-Entropy)</p>
            <p className="text-4xl font-bold text-primary-400">
              {result.loss.toFixed(4)}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-gray-400 text-sm mb-2">Perplexity</p>
            <p className="text-4xl font-bold text-amber-400">
              {result.perplexity.toFixed(2)}
            </p>
          </div>
          <div className="card col-span-2">
            <p className="text-gray-400 text-sm mb-2">Evaluated Text</p>
            <p className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-800 rounded-lg p-3">
              {result.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Parameters Tab ─────────────────────── */
function ParametersTab() {
  const [params, setParams] = useState<ParameterStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParameters()
      .then((res) => {
        setParams(res.data.parameters);
        setTotal(res.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="text-gray-400 text-sm">Total Parameters</p>
        <p className="text-3xl font-bold text-primary-400">
          {formatNumber(total)}
        </p>
      </div>

      <div className="card overflow-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left p-3 text-gray-400 font-medium">
                Module
              </th>
              <th className="text-right p-3 text-gray-400 font-medium">
                Parameters
              </th>
              <th className="text-right p-3 text-gray-400 font-medium">
                Weight Norm
              </th>
              <th className="text-right p-3 text-gray-400 font-medium">
                Grad Norm
              </th>
              <th className="text-right p-3 text-gray-400 font-medium">Mean</th>
              <th className="text-right p-3 text-gray-400 font-medium">Std</th>
            </tr>
          </thead>
          <tbody>
            {params.map((p) => (
              <tr
                key={p.module_name}
                className="border-b border-gray-800/50 hover:bg-gray-800/30"
              >
                <td className="p-3 font-mono text-xs text-gray-300">
                  {p.module_name}
                </td>
                <td className="p-3 text-right text-gray-300">
                  {formatNumber(p.param_count)}
                </td>
                <td className="p-3 text-right text-gray-300">
                  {p.weight_norm.toFixed(4)}
                </td>
                <td className="p-3 text-right text-gray-300">
                  {p.gradient_norm != null ? (
                    p.gradient_norm.toFixed(4)
                  ) : (
                    <span className="text-gray-600">N/A</span>
                  )}
                </td>
                <td className="p-3 text-right text-gray-300">
                  {p.mean.toFixed(6)}
                </td>
                <td className="p-3 text-right text-gray-300">
                  {p.std.toFixed(6)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────── Embeddings Tab ─────────────────────── */
function EmbeddingsTab() {
  const [points, setPoints] = useState<EmbeddingPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmbeddings()
      .then((res) => setPoints(res.data.embeddings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;

  const colors = [
    "#6366f1",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#06b6d4",
    "#84cc16",
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">
        2D Token Embedding Visualization
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {points.length} tokens projected into 2D space
      </p>

      <div className="bg-gray-950 rounded-lg p-2" style={{ height: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis
              type="number"
              dataKey="x"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={{ stroke: "#374151" }}
              tickLine={{ stroke: "#374151" }}
              name="Dim 1"
            />
            <YAxis
              type="number"
              dataKey="y"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={{ stroke: "#374151" }}
              tickLine={{ stroke: "#374151" }}
              name="Dim 2"
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const pt = payload[0].payload as EmbeddingPoint;
                return (
                  <div className="card text-xs !p-2">
                    <p className="text-primary-400 font-mono font-bold">
                      {pt.token}
                    </p>
                    <p className="text-gray-400">ID: {pt.token_id}</p>
                    <p className="text-gray-400">
                      ({pt.x.toFixed(3)}, {pt.y.toFixed(3)})
                    </p>
                  </div>
                );
              }}
            />
            <RScatter data={points} name="Tokens">
              {points.map((pt, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </RScatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─────────────────────── Weight Matrix Tab ─────────────────────── */
function WeightMatrixTab() {
  const [matrices, setMatrices] = useState<WeightMatrix[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeightMatrices()
      .then((res) => setMatrices(res.data.matrices))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const dotColor = (val: number, maxAbs: number): string => {
    if (maxAbs === 0) return "rgb(100, 100, 100)";
    const norm = val / maxAbs;
    if (norm >= 0) {
      const intensity = Math.floor(norm * 255);
      return `rgb(${intensity}, ${Math.floor(intensity * 0.3)}, ${Math.floor(intensity * 0.3)})`;
    } else {
      const intensity = Math.floor(-norm * 255);
      return `rgb(${Math.floor(intensity * 0.3)}, ${Math.floor(intensity * 0.3)}, ${intensity})`;
    }
  };

  const dotSize = (val: number, maxAbs: number): number => {
    if (maxAbs === 0) return 1;
    return Math.max(1, Math.floor((Math.abs(val) / maxAbs) * 6));
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        {matrices.length} weight matrices loaded
      </p>

      {matrices.map((mat, mi) => {
        const maxAbs = Math.max(Math.abs(mat.min), Math.abs(mat.max));
        const maxRows = Math.min(mat.rows, 32);
        const maxCols = Math.min(mat.cols, 64);

        return (
          <div key={mi} className="card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-mono text-sm text-gray-200">
                  {mat.module}.{mat.param}
                </h4>
                <p className="text-xs text-gray-500">
                  Shape: [{mat.shape.join(", ")}] | Range: [{mat.min.toFixed(3)}
                  , {mat.max.toFixed(3)}]
                </p>
              </div>
              <div className="text-xs text-gray-500 text-right">
                <span>mean={mat.mean.toFixed(4)}</span>
                <span className="ml-3">std={mat.std.toFixed(4)}</span>
              </div>
            </div>

            <div className="bg-black rounded-lg p-3 overflow-auto">
              <div
                className="inline-grid gap-px"
                style={{
                  gridTemplateColumns: `repeat(${maxCols}, 8px)`,
                  gridTemplateRows: `repeat(${maxRows}, 8px)`,
                }}
              >
                {Array.from({ length: maxRows }).map((_, r) =>
                  Array.from({ length: maxCols }).map((_, c) => {
                    const val = mat.values[r]?.[c] ?? 0;
                    const size = dotSize(val, maxAbs);
                    return (
                      <div
                        key={`${r}-${c}`}
                        className="flex items-center justify-center"
                        title={`[${r},${c}] = ${val.toFixed(4)}`}
                      >
                        <div
                          className="rounded-full"
                          style={{
                            width: size,
                            height: size,
                            backgroundColor: dotColor(val, maxAbs),
                          }}
                        />
                      </div>
                    );
                  }),
                )}
              </div>
            </div>

            {(mat.rows > maxRows || mat.cols > maxCols) && (
              <p className="text-xs text-gray-600">
                Showing {maxRows}x{maxCols} of {mat.rows}x{mat.cols}
              </p>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: "rgb(0, 0, 200)" }}
                />
                Negative
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: "rgb(100, 100, 100)" }}
                />
                Zero
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: "rgb(200, 60, 60)" }}
                />
                Positive
              </span>
              <span className="ml-auto">Dot size = |value|</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────── Generation Weights Tab ─────────────────────── */
function GenerationWeightsTab() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<GenerationWeight | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStep, setSelectedStep] = useState(0);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await getGenerationWeights(prompt);
      setResult(res.data);
      setSelectedStep(0);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to see step-by-step generation weights..."
          rows={2}
          className="input flex-1 resize-none"
        />
        <button
          onClick={generate}
          disabled={loading || !prompt.trim()}
          className="btn-primary self-end disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Full generated text */}
          <div className="card">
            <p className="text-gray-400 text-sm mb-2">Generated Text</p>
            <p className="text-sm text-gray-200 whitespace-pre-wrap font-mono">
              {result.full_text}
            </p>
          </div>

          {/* Step selector */}
          <div className="card">
            <label className="label">
              Generation Step: {selectedStep + 1} /{" "}
              {result.generated_tokens.length}
            </label>
            <input
              type="range"
              min={0}
              max={Math.max(0, result.generated_tokens.length - 1)}
              value={selectedStep}
              onChange={(e) => setSelectedStep(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          {/* Current token info */}
          {result.generated_tokens[selectedStep] && (
            <div className="grid grid-cols-2 gap-4">
              <div className="card">
                <p className="text-gray-400 text-sm mb-2">Generated Token</p>
                <p className="text-2xl font-mono text-primary-400">
                  "{result.generated_tokens[selectedStep].token}"
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Probability:{" "}
                  {(
                    result.generated_tokens[selectedStep].probability * 100
                  ).toFixed(2)}
                  %
                </p>
              </div>

              <div className="card">
                <p className="text-gray-400 text-sm mb-2">
                  Top Candidate Tokens
                </p>
                <div className="space-y-1">
                  {result.generated_tokens[selectedStep].top_probs.map(
                    (tp, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-300 w-20 truncate">
                          "{tp.token}"
                        </span>
                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, tp.prob * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-14 text-right">
                          {(tp.prob * 100).toFixed(1)}%
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Attention to context tokens */}
          {result.attention_snapshots[selectedStep] && (
            <div className="card">
              <p className="text-gray-400 text-sm mb-3">
                Attention to Context Tokens
              </p>
              {result.attention_snapshots[selectedStep].map((snap, li) => {
                const contextTokens = [
                  ...result.prompt_tokens,
                  ...result.generated_tokens
                    .slice(0, selectedStep)
                    .map((t) => t.token),
                ];
                return (
                  <div key={li} className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">
                      Layer {snap.layer}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {snap.attention_to_context.map((w, ti) => {
                        const opacity = Math.max(0.1, w);
                        return (
                          <span
                            key={ti}
                            className="inline-block px-1.5 py-0.5 rounded text-xs font-mono"
                            style={{
                              backgroundColor: `rgba(99, 102, 241, ${opacity})`,
                              color: opacity > 0.5 ? "white" : "#d1d5db",
                            }}
                            title={`${contextTokens[ti] ?? `[${ti}]`}: ${(w * 100).toFixed(1)}%`}
                          >
                            {contextTokens[ti] ?? `[${ti}]`}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Loading State ─────────────────────── */
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );
}

/* ─────────────────────── Main Page ─────────────────────── */
export default function EvaluationLab() {
  const [activeTab, setActiveTab] = useState<TabId>("attention");

  const renderTab = useCallback(() => {
    switch (activeTab) {
      case "attention":
        return <AttentionTab />;
      case "perplexity":
        return <PerplexityTab />;
      case "parameters":
        return <ParametersTab />;
      case "embeddings":
        return <EmbeddingsTab />;
      case "weights":
        return <WeightMatrixTab />;
      case "gen-weights":
        return <GenerationWeightsTab />;
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FlaskConical className="w-8 h-8 text-primary-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Evaluation Lab</h1>
          <p className="text-sm text-gray-500">
            Inspect model internals - attention, weights, embeddings, and more
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
              activeTab === id
                ? "bg-primary-600/20 text-primary-400"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden lg:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>{renderTab()}</div>
    </div>
  );
}
