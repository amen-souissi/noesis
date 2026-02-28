/**
 * Distribution de probabilités interactive avec slider de température.
 *
 * Montre comment les logits bruts sont transformés en probabilités par softmax,
 * et comment la température affecte la distribution.
 *
 * @module components/visualizations/SoftmaxBar
 */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface LogitEntry {
  char: string;
  score: number;
}

interface SoftmaxBarProps {
  /** Logits bruts */
  logits: LogitEntry[];
  /** Distributions précalculées à différentes températures */
  temperatureDistributions: Record<number, { char: string; prob: number }[]>;
}

export default function SoftmaxBar({
  logits,
  temperatureDistributions,
}: SoftmaxBarProps) {
  const { t } = useTranslation("components");
  const [temperature, setTemperature] = useState(0.8);

  const availableTemps = Object.keys(temperatureDistributions)
    .map(Number)
    .sort();

  // Trouver la température précalculée la plus proche
  const closestTemp = useMemo(() => {
    return availableTemps.reduce((prev, curr) =>
      Math.abs(curr - temperature) < Math.abs(prev - temperature) ? curr : prev,
    );
  }, [temperature, availableTemps]);

  const distribution = temperatureDistributions[closestTemp] ?? [];
  const maxProb = Math.max(...distribution.map((d) => d.prob));

  const data = distribution.map((d) => ({
    name: d.char === " " ? "⎵" : d.char,
    probability: d.prob,
    percentage: (d.prob * 100).toFixed(1),
  }));

  return (
    <div className="space-y-4">
      {/* Slider température */}
      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-400 whitespace-nowrap">
          {t("visualizations.softmaxBar.temperatureLabel")}
        </label>
        <input
          type="range"
          min={0.1}
          max={2.0}
          step={0.1}
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="flex-1 accent-primary-500"
        />
        <span className="text-sm font-mono text-primary-400 w-8">
          {temperature.toFixed(1)}
        </span>
      </div>

      {/* Description dynamique */}
      <p className="text-sm text-gray-400">
        {temperature < 0.5 && t("visualizations.softmaxBar.veryFocused")}
        {temperature >= 0.5 &&
          temperature <= 1.0 &&
          t("visualizations.softmaxBar.balanced")}
        {temperature > 1.0 && t("visualizations.softmaxBar.veryCreative")}
      </p>

      {/* Logits vs Probabilités side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Logits bruts */}
        <div>
          <p className="text-xs text-gray-500 mb-2">
            {t("visualizations.softmaxBar.rawScores")}
          </p>
          <div className="space-y-1">
            {logits.map((l, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-4 font-mono text-gray-400">
                  {l.char === " " ? "⎵" : l.char}
                </span>
                <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gray-600 rounded-full"
                    style={{
                      width: `${(l.score / Math.max(...logits.map((x) => x.score))) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-gray-500">
                  {l.score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Probabilités */}
        <div>
          <p className="text-xs text-gray-500 mb-2">
            {t("visualizations.softmaxBar.probabilities", {
              temp: closestTemp,
            })}
          </p>
          <div className="space-y-1">
            {distribution.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-4 font-mono text-gray-400">
                  {d.char === " " ? "⎵" : d.char}
                </span>
                <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(d.prob / maxProb) * 100}%`,
                      backgroundColor:
                        d.prob === maxProb ? "#22c55e" : "#0ea5e9",
                    }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-gray-400">
                  {(d.prob * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
