/**
 * Visualisation des courbes sin/cos de l'encodage positionnel.
 *
 * Montre comment chaque position reçoit un signal unique basé
 * sur des fonctions sinus et cosinus à différentes fréquences.
 *
 * @module components/visualizations/PositionalWaves
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PositionalWavesProps {
  positions: number[];
  sinValues: number[][];
  cosValues: number[][];
  tokens?: string[];
}

const DIM_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316"];

export default function PositionalWaves({
  positions,
  sinValues,
  cosValues,
  tokens,
}: PositionalWavesProps) {
  const { t } = useTranslation("components");
  const [showCos, setShowCos] = useState(false);
  const numDims = sinValues[0]?.length ?? 0;

  const data = positions.map((pos, i) => {
    const point: Record<string, number | string> = { position: pos };
    if (tokens?.[i]) point.token = tokens[i];
    const values = showCos ? cosValues : sinValues;
    for (let d = 0; d < numDims; d++) {
      point[`dim${d}`] = values[i][d];
    }
    return point;
  });

  return (
    <div className="space-y-4">
      {/* Toggle sin/cos */}
      <div className="flex items-center gap-3">
        <button
          className={`px-3 py-1 rounded text-sm transition-colors ${!showCos ? "bg-primary-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
          onClick={() => setShowCos(false)}
        >
          sin(pos)
        </button>
        <button
          className={`px-3 py-1 rounded text-sm transition-colors ${showCos ? "bg-primary-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
          onClick={() => setShowCos(true)}
        >
          cos(pos)
        </button>
      </div>

      {/* Graphique */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="position"
            stroke="#6b7280"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            label={{
              value: t("visualizations.positionalWaves.positionLabel"),
              fill: "#9ca3af",
              fontSize: 12,
              position: "bottom",
            }}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            domain={[-1.1, 1.1]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#e5e7eb" }}
            formatter={(value: number, name: string) => [
              value.toFixed(3),
              name,
            ]}
            labelFormatter={(label) => {
              const idx = Number(label);
              return tokens?.[idx]
                ? t("visualizations.positionalWaves.tooltipWithToken", {
                    pos: label,
                    token: tokens[idx],
                  })
                : t("visualizations.positionalWaves.tooltipWithoutToken", {
                    pos: label,
                  });
            }}
          />
          <Legend />
          {Array.from({ length: numDims }).map((_, d) => (
            <Line
              key={d}
              type="monotone"
              dataKey={`dim${d}`}
              name={t("visualizations.positionalWaves.dimensionLabel", {
                dim: d,
              })}
              stroke={DIM_COLORS[d % DIM_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4, fill: DIM_COLORS[d % DIM_COLORS.length] }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Tokens sous le graphique */}
      {tokens && (
        <div className="flex gap-0.5 px-12">
          {tokens.map((t, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-xs font-mono text-primary-400">
                {t === " " ? "⎵" : t}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
