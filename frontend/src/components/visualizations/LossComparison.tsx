/**
 * Visualisation de la comparaison prédictions vs réalité pour le loss.
 *
 * Affiche un bar chart des probabilités prédites pour chaque token,
 * avec le bon token mis en évidence en vert.
 *
 * @module components/visualizations/LossComparison
 */

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

interface Prediction {
  char: string;
  probability: number;
  isCorrect: boolean;
}

interface LossComparisonProps {
  /** Contexte vu par le modèle */
  context: string;
  /** Token correct */
  target: string;
  /** Prédictions du modèle */
  predictions: Prediction[];
  /** Valeur du loss */
  lossValue: number;
  /** Formule expliquée */
  formula?: string;
}

export default function LossComparison({
  context,
  target,
  predictions,
  lossValue,
  formula,
}: LossComparisonProps) {
  const { t } = useTranslation("components");
  const data = predictions.map((p) => ({
    name: p.char === " " ? "⎵" : p.char,
    probability: p.probability,
    isCorrect: p.isCorrect,
    percentage: (p.probability * 100).toFixed(1),
  }));

  return (
    <div className="space-y-4">
      {/* Contexte et cible */}
      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-gray-500">
            {t("visualizations.lossComparison.modelSees")}
          </span>
          <span className="ml-2 font-mono text-primary-300 bg-gray-800 px-2 py-1 rounded">
            {context}
          </span>
        </div>
        <div>
          <span className="text-gray-500">
            {t("visualizations.lossComparison.mustPredict")}
          </span>
          <span className="ml-2 font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded font-bold">
            {target}
          </span>
        </div>
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            type="number"
            domain={[0, 1]}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#e5e7eb", fontSize: 14, fontFamily: "monospace" }}
            width={30}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [
              `${(value * 100).toFixed(1)}%`,
              t("visualizations.lossComparison.probabilityTooltip"),
            ]}
          />
          <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isCorrect ? "#22c55e" : "#6b7280"}
                opacity={entry.isCorrect ? 1 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Loss value */}
      <div className="flex items-center justify-between bg-gray-900 rounded-lg p-3">
        <div>
          <span className="text-sm text-gray-400">
            {t("visualizations.lossComparison.errorLoss")}
          </span>
          <span className="ml-2 text-lg font-bold text-amber-400">
            {lossValue.toFixed(3)}
          </span>
        </div>
        {formula && (
          <span className="text-xs font-mono text-gray-500">{formula}</span>
        )}
      </div>
    </div>
  );
}
