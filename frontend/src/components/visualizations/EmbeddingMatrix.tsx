/**
 * Visualisation de la matrice d'embedding avec valeurs numériques.
 *
 * Montre comment chaque token est transformé en vecteur de nombres.
 * Les cellules sont colorées selon la valeur (bleu négatif, rouge positif).
 *
 * @module components/visualizations/EmbeddingMatrix
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";

interface EmbeddingSample {
  char: string;
  id: number;
  vector: number[];
}

interface EmbeddingMatrixProps {
  samples: EmbeddingSample[];
  /** Nombre de dimensions à afficher (défaut: 8) */
  displayDims?: number;
  /** Dimensions totales de la matrice */
  matrixShape?: { rows: number; cols: number };
}

function valueToColor(value: number): string {
  const intensity = Math.min(Math.abs(value) * 8, 1);
  if (value > 0) {
    return `rgba(239, 68, 68, ${intensity})`; // rouge
  }
  return `rgba(59, 130, 246, ${intensity})`; // bleu
}

export default function EmbeddingMatrix({
  samples,
  displayDims = 8,
  matrixShape,
}: EmbeddingMatrixProps) {
  const { t } = useTranslation("components");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Hide "..." when we display all dimensions
  const hasMoreDims = matrixShape ? displayDims < matrixShape.cols : true;

  return (
    <div className="space-y-3">
      {/* En-tête dimensions */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        {matrixShape && (
          <span>
            {t("visualizations.embeddingMatrix.fullMatrix", {
              rows: matrixShape.rows,
              cols: matrixShape.cols,
            })}
          </span>
        )}
        <span>
          {hasMoreDims
            ? t("visualizations.embeddingMatrix.displayFirstDims", {
                count: samples.length,
                dims: displayDims,
              })
            : t("visualizations.embeddingMatrix.displayAllDims", {
                count: samples.length,
                dims: displayDims,
              })}
        </span>
      </div>

      {/* Matrice */}
      <div className="overflow-x-auto">
        <table className="text-xs font-mono">
          <thead>
            <tr>
              <th className="p-2 text-gray-500 text-left">
                {t("visualizations.embeddingMatrix.tokenHeader")}
              </th>
              <th className="p-2 text-gray-500 text-left">ID</th>
              {Array.from({ length: displayDims }).map((_, i) => (
                <th key={i} className="p-2 text-gray-600 text-center w-16">
                  d{i}
                </th>
              ))}
              {hasMoreDims && <th className="p-2 text-gray-600">...</th>}
            </tr>
          </thead>
          <tbody>
            {samples.map((sample, rowIdx) => (
              <tr
                key={sample.id}
                className={`transition-colors ${hoveredRow === rowIdx ? "bg-gray-800" : ""}`}
                onMouseEnter={() => setHoveredRow(rowIdx)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="p-2 text-primary-400 font-semibold">
                  {sample.char === " " ? "⎵" : sample.char}
                </td>
                <td className="p-2 text-green-400">{sample.id}</td>
                {sample.vector.slice(0, displayDims).map((val, dimIdx) => (
                  <td
                    key={dimIdx}
                    className="p-1 text-center"
                    title={`d${dimIdx} = ${val.toFixed(4)}`}
                  >
                    <span
                      className="inline-block px-1.5 py-0.5 rounded text-gray-200"
                      style={{ backgroundColor: valueToColor(val) }}
                    >
                      {val.toFixed(3)}
                    </span>
                  </td>
                ))}
                {hasMoreDims && (
                  <td className="p-2 text-gray-600 text-center">...</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: "rgba(59, 130, 246, 0.6)" }}
          />
          <span>{t("visualizations.embeddingMatrix.negativeValues")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-800" />
          <span>{t("visualizations.embeddingMatrix.nearZero")}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.6)" }}
          />
          <span>{t("visualizations.embeddingMatrix.positiveValues")}</span>
        </div>
      </div>
    </div>
  );
}
