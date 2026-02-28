/**
 * Onglet Entraînement du Playground.
 *
 * Enveloppe le TrainingMonitor avec annotations pédagogiques.
 * Reçoit l'objet training du parent (useTraining est lifté dans PlaygroundPage).
 *
 * @module components/playground/PlaygroundTraining
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Play,
  Square,
  Pause,
  Loader2,
  AlertCircle,
  Clock,
  Zap,
  TrendingDown,
  ChevronDown,
  History,
  BookOpen,
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
import type { useTraining } from "@/hooks/useTraining";
import {
  startTraining,
  stopTraining,
  pauseTraining,
  resumeTraining,
  getTrainingHistory,
} from "@/api/training";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";
import ModelExplorer from "./ModelExplorer";

interface TrainingRunHistory {
  id: string;
  config: string;
  config_name: string;
  status: string;
  current_epoch: number;
  total_epochs: number;
  loss_history: number[];
  started_at: string | null;
  completed_at: string | null;
  error_message: string;
}

function formatDuration(
  startedAt: string | null,
  completedAt: string | null,
): string {
  if (!startedAt) return "-";
  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const seconds = Math.floor((end - start) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

interface Props {
  configId?: string | null;
  training: ReturnType<typeof useTraining>;
}

export default function PlaygroundTraining({ configId, training }: Props) {
  const { t } = useTranslation("components");
  const [numEpochs, setNumEpochs] = useState(50);
  const [continueTraining, setContinueTraining] = useState(false);
  const [history, setHistory] = useState<TrainingRunHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "starting" | "stopping" | "pausing" | "resuming" | null
  >(null);

  useEffect(() => {
    async function loadData() {
      try {
        const histRes = await getTrainingHistory(configId ?? undefined);
        setHistory(histRes.data.results as TrainingRunHistory[]);
      } catch {
        /* ignore */
      }
    }
    loadData();
  }, [configId]);

  async function handleStart() {
    if (!configId) return;
    setPendingAction("starting");
    setError(null);
    try {
      await startTraining(configId, numEpochs, continueTraining);
      training.setStatus("running");
    } catch (e: any) {
      setError(e?.response?.data?.error || t("playground.training.startError"));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleStop() {
    setPendingAction("stopping");
    setError(null);
    try {
      await stopTraining(configId ?? undefined);
      training.setStatus("idle");
      training.reset();
    } catch (e: any) {
      setError(e?.response?.data?.error || t("playground.training.stopError"));
    } finally {
      setPendingAction(null);
    }
  }

  async function handlePause() {
    setPendingAction("pausing");
    setError(null);
    try {
      await pauseTraining(configId ?? undefined);
      training.setStatus("paused");
    } catch (e: any) {
      setError(e?.response?.data?.error || t("playground.training.pauseError"));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleResume() {
    setPendingAction("resuming");
    setError(null);
    try {
      await resumeTraining(configId ?? undefined);
      training.setStatus("running");
    } catch (e: any) {
      setError(
        e?.response?.data?.error || t("playground.training.resumeError"),
      );
    } finally {
      setPendingAction(null);
    }
  }

  const busy = pendingAction !== null;
  const isRunning = training.status === "running";
  const isPaused = training.status === "paused";
  const isIdle = !isRunning && !isPaused;

  // Préparer les données pour le graphique de loss
  const lossData = (training.lossHistory ?? []).map(
    (loss: number, i: number) => ({
      step: i + 1,
      loss,
    }),
  );

  const elapsedMinutes = training.elapsed
    ? Math.floor(training.elapsed / 60)
    : 0;
  const elapsedSeconds = training.elapsed
    ? Math.round(training.elapsed % 60)
    : 0;

  return (
    <div className="space-y-6">
      {/* Contexte éducatif */}
      <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4 text-sm text-green-200">
        <BookOpen className="w-4 h-4 inline mr-2" />
        {t("playground.training.educationalContext")}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 text-sm text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Contrôles */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-800 p-3 space-y-3">
        {/* Mode idle — réglages + démarrage sur une ligne */}
        {isIdle && (
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs text-gray-400 whitespace-nowrap">
              <VulgarizedTerm termKey="epochs" showIcon={false}>
                {t("playground.training.iterationsLabel")}
              </VulgarizedTerm>
            </label>
            <input
              type="range"
              min={10}
              max={5000}
              step={10}
              value={numEpochs}
              onChange={(e) => setNumEpochs(Number(e.target.value))}
              className="flex-1 min-w-[120px]"
            />
            <input
              type="number"
              value={numEpochs}
              onChange={(e) =>
                setNumEpochs(Math.max(1, Number(e.target.value)))
              }
              min={1}
              className="w-16 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white text-center"
            />
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={continueTraining}
                onChange={(e) => setContinueTraining(e.target.checked)}
                className="rounded accent-primary-500"
              />
              {t("playground.training.continueLabel")}
            </label>
            <button
              onClick={handleStart}
              disabled={busy || !configId}
              className="btn-primary flex items-center gap-1.5 px-4 py-1.5 text-sm ml-auto"
            >
              {pendingAction === "starting" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              {pendingAction === "starting"
                ? t("playground.training.starting")
                : t("playground.training.start")}
            </button>
          </div>
        )}

        {/* Mode actif — métriques inline + actions */}
        {!isIdle && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Métriques inline */}
              <div className="flex items-center gap-4 text-xs flex-1 min-w-0">
                <span className="flex items-center gap-1 text-gray-300">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span className="font-semibold text-white">
                    {training.epoch ?? "-"}
                  </span>
                  <span className="text-gray-500">/ {numEpochs}</span>
                </span>
                <span className="flex items-center gap-1 text-gray-300">
                  <TrendingDown className="w-3 h-3 text-green-400" />
                  <span className="font-semibold text-white">
                    {training.batchLoss != null
                      ? training.batchLoss.toFixed(4)
                      : "-"}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-gray-300">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-400">
                    {elapsedMinutes}m {elapsedSeconds}s
                  </span>
                </span>
                <span
                  className={`text-xs font-medium ${isRunning ? "text-green-400" : "text-amber-400"}`}
                >
                  {isRunning
                    ? t("playground.training.running")
                    : t("playground.training.paused")}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {isRunning && (
                  <>
                    <button
                      onClick={handlePause}
                      disabled={busy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700 transition-colors disabled:opacity-50"
                      title="Pause"
                    >
                      {pendingAction === "pausing" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Pause className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={handleStop}
                      disabled={busy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-gray-700 hover:border-red-800/50 transition-colors disabled:opacity-50"
                      title={t("playground.training.stopButton")}
                    >
                      {pendingAction === "stopping" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </>
                )}
                {isPaused && (
                  <>
                    <button
                      onClick={handleResume}
                      disabled={busy}
                      className="btn-primary flex items-center gap-1.5 px-3 py-1 text-xs"
                    >
                      {pendingAction === "resuming" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      {t("playground.training.resume")}
                    </button>
                    <button
                      onClick={handleStop}
                      disabled={busy}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-gray-700 hover:border-red-800/50 transition-colors disabled:opacity-50"
                      title={t("playground.training.stopButton")}
                    >
                      {pendingAction === "stopping" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Square className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Barre de progression */}
            {training.epoch != null && numEpochs > 0 && (
              <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isRunning ? "bg-blue-500" : "bg-amber-500"}`}
                  style={{
                    width: `${Math.min(100, ((training.epoch ?? 0) / numEpochs) * 100)}%`,
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Graphique de loss */}
      {lossData.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-300">
            {t("playground.training.lossCurveTitle")}
          </h3>
          <p className="text-xs text-gray-500">
            {t("playground.training.lossCurveDesc")}
          </p>
          <div className="h-64 bg-gray-800/30 rounded-lg p-2 border border-gray-800">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="step" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(l) =>
                    t("playground.training.stepTooltip", { step: l })
                  }
                />
                <Line
                  type="monotone"
                  dataKey="loss"
                  stroke="#3b82f6"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Explorateur du modèle */}
      {configId && <ModelExplorer configId={configId} />}

      {/* Historique */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          <History className="w-4 h-4" />
          {t("playground.training.historyTitle")}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showHistory ? "rotate-180" : ""}`}
          />
        </button>
        {showHistory && history.length > 0 && (
          <div className="mt-3 space-y-2">
            {history.map((run) => {
              const lastLoss =
                run.loss_history?.length > 0
                  ? run.loss_history[run.loss_history.length - 1]
                  : null;
              return (
                <div
                  key={run.id}
                  className="bg-gray-800/50 rounded-lg p-3 border border-gray-800 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">{run.config_name}</span>
                    <span className="text-xs text-gray-500">
                      {run.started_at
                        ? new Date(run.started_at).toLocaleDateString("fr-FR")
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span>
                      {t("playground.training.epochsLabel", {
                        current: run.current_epoch,
                        total: run.total_epochs,
                      })}
                    </span>
                    <span>
                      {t("playground.training.finalLoss", {
                        value: lastLoss != null ? lastLoss.toFixed(4) : "-",
                      })}
                    </span>
                    <span>
                      {formatDuration(run.started_at, run.completed_at)}
                    </span>
                    <span
                      className={
                        run.status === "completed"
                          ? "text-green-400"
                          : run.status === "failed"
                            ? "text-red-400"
                            : run.status === "stopped"
                              ? "text-amber-400"
                              : ""
                      }
                    >
                      {run.status === "completed"
                        ? t("playground.training.statusCompleted")
                        : run.status === "failed"
                          ? t("playground.training.statusFailed")
                          : run.status === "stopped"
                            ? t("playground.training.statusStopped")
                            : run.status === "running"
                              ? t("playground.training.statusRunning")
                              : run.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {showHistory && history.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            {t("playground.training.noHistory")}
          </p>
        )}
      </div>
    </div>
  );
}
