import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Play,
  Square,
  Pause,
  RotateCcw,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
  Zap,
  TrendingDown,
  ChevronDown,
  History,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTraining } from "@/hooks/useTraining";
import {
  startTraining,
  stopTraining,
  pauseTraining,
  resumeTraining,
  getTrainingHistory,
} from "@/api/training";
import { getPresets, getConfigs } from "@/api/config";
import type { ModelConfig } from "@/types/config";
import type { TrainingRun, WeightSnapshot } from "@/types/training";
import { formatDuration } from "@/lib/utils";

export default function TrainingMonitor() {
  const { t } = useTranslation("components");
  const training = useTraining();
  const {
    status,
    epoch,
    totalEpochs,
    batch,
    totalBatches,
    batchLoss,
    lossHistory,
    elapsed,
    weightSnapshot,
    wsConnected,
  } = training;

  const [configs, setConfigs] = useState<ModelConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");
  const [numEpochs, setNumEpochs] = useState<number>(10);
  const [history, setHistory] = useState<TrainingRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "starting" | "stopping" | "pausing" | "resuming" | null
  >(null);
  const [showHistory, setShowHistory] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load configs and history
  useEffect(() => {
    async function fetchData() {
      try {
        const [configsRes, presetsRes, historyRes] = await Promise.all([
          getConfigs(),
          getPresets(),
          getTrainingHistory(),
        ]);
        const allConfigs = [...configsRes.data.results, ...presetsRes.data];
        setConfigs(allConfigs);
        if (allConfigs.length > 0) setSelectedConfigId(allConfigs[0].id);
        setHistory(historyRes.data.results);
      } catch {
        setError("Failed to load training data");
      }
    }
    fetchData();
  }, []);

  // Draw weight matrix visualization on canvas
  const drawWeights = useCallback((snapshot: WeightSnapshot[] | null) => {
    const canvas = canvasRef.current;
    if (!canvas || !snapshot || snapshot.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Pick first layer's weight snapshot for visualization
    const layer = snapshot[0];
    const { rows, cols, values, min, max } = layer;

    // Set canvas size proportionally (cap at reasonable size)
    const maxDim = 300;
    const scale = Math.max(
      1,
      Math.min(Math.floor(maxDim / cols), Math.floor(maxDim / rows)),
    );
    const dotSize = Math.max(1, scale);
    const gap = Math.max(1, Math.floor(dotSize * 0.2));
    const cellSize = dotSize + gap;

    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;

    // Black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const absMax = Math.max(Math.abs(min), Math.abs(max), 1e-8);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = values[r]?.[c] ?? 0;
        const norm = val / absMax; // -1 to 1

        // Color mapping: blue (negative) -> black (zero) -> red (positive)
        let red: number, green: number, blue: number;
        if (norm >= 0) {
          // black -> red
          red = Math.round(norm * 255);
          green = 0;
          blue = 0;
        } else {
          // black -> blue
          red = 0;
          green = 0;
          blue = Math.round(Math.abs(norm) * 255);
        }

        // Size based on absolute magnitude
        const magnitude = Math.abs(norm);
        const radius = (dotSize / 2) * Math.max(0.15, magnitude);

        const cx = c * cellSize + cellSize / 2;
        const cy = r * cellSize + cellSize / 2;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.fill();
      }
    }
  }, []);

  useEffect(() => {
    drawWeights(weightSnapshot);
  }, [weightSnapshot, drawWeights]);

  async function handleStart(continueTraining = false) {
    if (!selectedConfigId) return;
    setPendingAction("starting");
    setError(null);
    try {
      await startTraining(selectedConfigId, numEpochs, continueTraining);
      training.setStatus("running");
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosErr = err as any;
      const message =
        axiosErr?.response?.data?.error ||
        (err instanceof Error ? err.message : "Failed to start training");
      setError(message);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleStop() {
    setPendingAction("stopping");
    setError(null);
    try {
      await stopTraining();
      training.setStatus("idle");
      training.reset();
    } catch {
      setError("Failed to stop training");
    } finally {
      setPendingAction(null);
    }
  }

  async function handlePause() {
    setPendingAction("pausing");
    setError(null);
    try {
      await pauseTraining();
      training.setStatus("paused");
    } catch {
      setError("Failed to pause training");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleResume() {
    setPendingAction("resuming");
    setError(null);
    try {
      await resumeTraining();
      training.setStatus("running");
    } catch {
      setError("Failed to resume training");
    } finally {
      setPendingAction(null);
    }
  }

  const busy = pendingAction !== null;
  const lossChartData = lossHistory.map((loss, i) => ({ epoch: i + 1, loss }));
  const epochProgress = totalEpochs > 0 ? (epoch / totalEpochs) * 100 : 0;
  const batchProgress = totalBatches > 0 ? (batch / totalBatches) * 100 : 0;
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isIdle = status === "idle";
  const currentLoss =
    lossHistory.length > 0 ? lossHistory[lossHistory.length - 1] : null;

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Training Monitor</h1>
            <p className="text-gray-400 mt-1">
              Real-time training visualization and controls
            </p>
          </div>
          <div className="flex items-center gap-2">
            {wsConnected ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            <span className="text-xs text-gray-500">
              {wsConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm">{error}</span>
            <button
              className="ml-auto text-xs underline"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Controls Panel */}
        <div className="card p-5">
          <div className="flex flex-wrap items-end gap-4">
            {/* Config Selector */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-gray-400 mb-1.5">
                Configuration
              </label>
              <select
                className="input w-full"
                value={selectedConfigId}
                onChange={(e) => setSelectedConfigId(e.target.value)}
                disabled={!isIdle}
              >
                {configs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.is_preset ? "(preset)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Epochs Input */}
            <div className="w-32">
              <label className="block text-xs text-gray-400 mb-1.5">
                Epochs
              </label>
              <input
                className="input w-full"
                type="number"
                min={1}
                value={numEpochs}
                onChange={(e) => setNumEpochs(parseInt(e.target.value) || 1)}
                disabled={!isIdle}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isIdle && (
                <>
                  <button
                    className="btn-primary flex items-center gap-2"
                    onClick={() => handleStart(false)}
                    disabled={busy || !selectedConfigId}
                  >
                    {pendingAction === "starting" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {pendingAction === "starting"
                      ? "Starting..."
                      : "Start Training"}
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition text-sm font-medium"
                    onClick={() => handleStart(true)}
                    disabled={busy || !selectedConfigId}
                    title={t("playground.trainingMonitor.continueTraining")}
                  >
                    {pendingAction === "starting" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    Continue
                  </button>
                </>
              )}
              {isRunning && (
                <>
                  <button
                    className="btn-secondary flex items-center gap-2"
                    onClick={handlePause}
                    disabled={busy}
                  >
                    {pendingAction === "pausing" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                    {pendingAction === "pausing" ? "Pausing..." : "Pause"}
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition text-sm font-medium"
                    onClick={handleStop}
                    disabled={busy}
                  >
                    {pendingAction === "stopping" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    {pendingAction === "stopping" ? "Stopping..." : "Stop"}
                  </button>
                </>
              )}
              {isPaused && (
                <>
                  <button
                    className="btn-primary flex items-center gap-2"
                    onClick={handleResume}
                    disabled={busy}
                  >
                    {pendingAction === "resuming" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    {pendingAction === "resuming" ? "Resuming..." : "Resume"}
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition text-sm font-medium"
                    onClick={handleStop}
                    disabled={busy}
                  >
                    {pendingAction === "stopping" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    {pendingAction === "stopping" ? "Stopping..." : "Stop"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isRunning
                    ? "bg-green-500 animate-pulse"
                    : isPaused
                      ? "bg-yellow-500"
                      : "bg-gray-600"
                }`}
              />
              <span className="text-gray-400 capitalize">{status}</span>
            </div>
            {!isIdle && (
              <>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(elapsed)}
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Zap className="w-3.5 h-3.5" />
                  Batch {batch}/{totalBatches}
                </div>
                {currentLoss !== null && (
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Loss: {currentLoss.toFixed(4)}
                  </div>
                )}
                {batchLoss > 0 && (
                  <div className="text-gray-500 text-xs">
                    Batch loss: {batchLoss.toFixed(4)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Epoch Progress */}
        {!isIdle && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-300">
                Epoch Progress
              </h2>
              <span className="text-sm text-gray-400">
                {epoch} / {totalEpochs}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                style={{ width: `${epochProgress}%` }}
              />
            </div>
            {/* Batch sub-progress */}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-gray-500 w-24">
                Batch {batch}/{totalBatches}
              </span>
              <div className="flex-1 bg-gray-800/50 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500/60 transition-all duration-300"
                  style={{ width: `${batchProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Loss Chart + Weight Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loss Chart */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
              Loss Curve
            </h2>
            {lossChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lossChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis
                      dataKey="epoch"
                      stroke="#4b5563"
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      tickLine={false}
                      label={{
                        value: "Epoch",
                        position: "insideBottom",
                        offset: -5,
                        fill: "#6b7280",
                        fontSize: 11,
                      }}
                    />
                    <YAxis
                      stroke="#4b5563"
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      tickLine={false}
                      domain={["auto", "auto"]}
                      label={{
                        value: "Loss",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#6b7280",
                        fontSize: 11,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "0.5rem",
                        color: "#f3f4f6",
                        fontSize: 12,
                      }}
                      labelFormatter={(label) => `Epoch ${label}`}
                      formatter={(value: number) => [value.toFixed(6), "Loss"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="loss"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={lossChartData.length < 50}
                      activeDot={{ r: 4, fill: "#3b82f6" }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-sm text-gray-600">
                  No loss data yet. Start training to see the loss curve.
                </p>
              </div>
            )}
          </div>

          {/* Weight Matrix Dot Visualization */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Weight Matrix Visualization
            </h2>
            {weightSnapshot && weightSnapshot.length > 0 && (
              <p className="text-xs text-gray-500 mb-3">
                {weightSnapshot[0].module}.{weightSnapshot[0].param} (
                {weightSnapshot[0].rows} x {weightSnapshot[0].cols})
              </p>
            )}
            <div className="bg-black rounded-lg flex items-center justify-center overflow-auto min-h-[256px] max-h-[320px]">
              {weightSnapshot && weightSnapshot.length > 0 ? (
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <p className="text-sm text-gray-700 py-16">
                  Weight data appears after each epoch completes
                </p>
              )}
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
                Negative
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-900 border border-gray-700 inline-block" />
                Zero
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
                Positive
              </div>
            </div>
          </div>
        </div>

        {/* Training History */}
        <div className="card">
          <button
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-800/30 transition"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Training History ({history.length} runs)
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 ml-auto transition-transform ${
                showHistory ? "rotate-180" : ""
              }`}
            />
          </button>
          {showHistory && (
            <div className="border-t border-gray-800">
              {history.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-600">
                  No previous training runs
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {history.map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center gap-4 px-5 py-3"
                    >
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          run.status === "completed"
                            ? "bg-green-500"
                            : run.status === "failed"
                              ? "bg-red-500"
                              : run.status === "stopped"
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          {run.current_epoch}/{run.total_epochs} epochs
                          <span className="text-gray-500 ml-2 capitalize">
                            ({run.status})
                          </span>
                        </p>
                        {run.started_at && (
                          <p className="text-xs text-gray-500">
                            {new Date(run.started_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      {run.loss_history && run.loss_history.length > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            Final loss:{" "}
                            {run.loss_history[
                              run.loss_history.length - 1
                            ].toFixed(4)}
                          </p>
                        </div>
                      )}
                      {run.error_message && (
                        <p className="text-xs text-red-400 truncate max-w-[200px]">
                          {run.error_message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
