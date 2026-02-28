import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Brain,
  MessageSquare,
  Play,
  Settings,
  Database,
  TrendingDown,
  Loader2,
  Cpu,
  BookOpen,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getTrainingStatus } from "@/api/training";
import { getCurrentModel } from "@/api/models";
import { formatNumber } from "@/lib/utils";
import type { TrainingStatus } from "@/types/training";
import type { CurrentModel } from "@/types/model";

export default function Dashboard() {
  const navigate = useNavigate();
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(
    null,
  );
  const [currentModel, setCurrentModel] = useState<CurrentModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statusRes, modelRes] = await Promise.all([
          getTrainingStatus(),
          getCurrentModel(),
        ]);
        setTrainingStatus(statusRes.data);
        setCurrentModel(modelRes.data);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard data";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const lossChartData = (trainingStatus?.loss_history ?? []).map((loss, i) => ({
    epoch: i + 1,
    loss,
  }));

  const statusColor: Record<string, string> = {
    idle: "text-gray-400",
    running: "text-green-400",
    paused: "text-yellow-400",
  };

  const statusLabel: Record<string, string> = {
    idle: "Idle",
    running: "Training",
    paused: "Paused",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="card p-6 text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Parameters",
      value: trainingStatus?.total_parameters
        ? formatNumber(trainingStatus.total_parameters)
        : currentModel?.total_parameters
          ? formatNumber(currentModel.total_parameters)
          : "--",
      icon: Brain,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      label: "Vocab Size",
      value: currentModel?.vocab_size
        ? formatNumber(currentModel.vocab_size)
        : "--",
      icon: BookOpen,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Current Loss",
      value:
        trainingStatus?.loss_history && trainingStatus.loss_history.length > 0
          ? trainingStatus.loss_history[
              trainingStatus.loss_history.length - 1
            ].toFixed(4)
          : "--",
      icon: TrendingDown,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      label: "Training Status",
      value: statusLabel[trainingStatus?.status ?? "idle"] ?? "Idle",
      icon: Activity,
      color: statusColor[trainingStatus?.status ?? "idle"] ?? "text-gray-400",
      bgColor:
        trainingStatus?.status === "running"
          ? "bg-green-400/10"
          : trainingStatus?.status === "paused"
            ? "bg-yellow-400/10"
            : "bg-gray-400/10",
    },
  ];

  const quickActions = [
    {
      label: "Start Training",
      icon: Play,
      color: "btn-primary",
      onClick: () => navigate("/training"),
    },
    {
      label: "Open Chat",
      icon: MessageSquare,
      color: "btn-secondary",
      onClick: () => navigate("/chat"),
    },
    {
      label: "Configure Model",
      icon: Settings,
      color: "btn-secondary",
      onClick: () => navigate("/config"),
    },
    {
      label: "Manage Data",
      icon: Database,
      color: "btn-secondary",
      onClick: () => navigate("/data"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Noesis overview and quick actions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-500">
              Model {currentModel?.loaded ? "loaded" : "not loaded"}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                currentModel?.loaded ? "bg-green-500" : "bg-gray-600"
              }`}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Model Architecture Summary */}
        {currentModel?.loaded && (
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-white mb-4">
              Model Architecture
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: "d_model", value: currentModel.d_model },
                { label: "n_heads", value: currentModel.n_heads },
                { label: "n_layers", value: currentModel.n_layers },
                { label: "d_ff", value: currentModel.d_ff },
                { label: "seq_len", value: currentModel.seq_len },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-lg font-mono text-white mt-1">
                    {item.value ?? "--"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mini Loss Chart */}
        {lossChartData.length > 0 && (
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-white mb-4">
              Loss History
            </h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lossChartData}>
                  <XAxis
                    dataKey="epoch"
                    stroke="#4b5563"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#4b5563"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickLine={false}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                      color: "#f3f4f6",
                    }}
                    labelFormatter={(label) => `Epoch ${label}`}
                    formatter={(value: number) => [value.toFixed(4), "Loss"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="loss"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className={`${action.color} flex items-center justify-center gap-3 p-4 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]`}
                onClick={action.onClick}
              >
                <action.icon className="w-5 h-5" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
