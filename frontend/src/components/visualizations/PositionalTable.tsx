/**
 * Tableau interactif des vecteurs positionnels.
 *
 * Montre comment chaque position reçoit un vecteur unique (son "code-barres"),
 * avec coloration par valeur et mise en évidence au hover.
 * Complète le graphique PositionalWaves avec une vue concrète des nombres.
 *
 * @module components/visualizations/PositionalTable
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";

interface PositionalTableProps {
  tokens: string[];
  sinValues: number[][];
  cosValues: number[][];
}

/** Couleur interpolée de bleu (négatif) à blanc (0) à rouge (positif) */
function valueColor(v: number): string {
  const intensity = Math.min(Math.abs(v), 1);
  if (v > 0) {
    const r = 59 + (255 - 59) * (1 - intensity);
    const g = 130 + (255 - 130) * (1 - intensity);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, 246)`;
  }
  if (v < 0) {
    const g = 68 + (255 - 68) * (1 - intensity);
    const b = 68 + (255 - 68) * (1 - intensity);
    return `rgb(239, ${Math.round(g)}, ${Math.round(b)})`;
  }
  return "rgb(200, 200, 200)";
}

export default function PositionalTable({
  tokens,
  sinValues,
  cosValues,
}: PositionalTableProps) {
  const { t } = useTranslation("components");
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);
  const [hoveredDim, setHoveredDim] = useState<number | null>(null);
  const numDims = sinValues[0]?.length ?? 0;

  // Construire les vecteurs entrelacés : [sin_d0, cos_d0, sin_d1, cos_d1, ...]
  const headers: { label: string; type: "sin" | "cos"; dim: number }[] = [];
  for (let d = 0; d < numDims; d++) {
    headers.push({ label: `sin(d${d * 2})`, type: "sin", dim: d });
    headers.push({ label: `cos(d${d * 2 + 1})`, type: "cos", dim: d });
  }

  function getInterleavedValue(pos: number, colIdx: number): number {
    const dim = Math.floor(colIdx / 2);
    return colIdx % 2 === 0 ? sinValues[pos][dim] : cosValues[pos][dim];
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left text-gray-500 text-xs font-normal border-b border-gray-800">
                {t("visualizations.positionalTable.posHeader")}
              </th>
              <th className="px-2 py-2 text-left text-gray-500 text-xs font-normal border-b border-gray-800">
                {t("visualizations.positionalTable.charHeader")}
              </th>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`px-1.5 py-2 text-center text-xs font-normal border-b border-gray-800 cursor-help transition-colors ${
                    hoveredDim === i
                      ? "bg-gray-800/50 text-white"
                      : "text-gray-600"
                  }`}
                  onMouseEnter={() => setHoveredDim(i)}
                  onMouseLeave={() => setHoveredDim(null)}
                  title={
                    h.type === "sin"
                      ? t("visualizations.positionalTable.sinusTitle", {
                          dim: h.dim * 2,
                        })
                      : t("visualizations.positionalTable.cosinusTitle", {
                          dim: h.dim * 2 + 1,
                        })
                  }
                >
                  <span
                    className={
                      h.type === "sin" ? "text-blue-400" : "text-purple-400"
                    }
                  >
                    {h.type}
                  </span>
                  <span className="text-gray-600 text-[10px] block">
                    d{h.dim * 2 + (h.type === "cos" ? 1 : 0)}
                  </span>
                </th>
              ))}
              <th className="px-2 py-2 text-center text-gray-500 text-xs font-normal border-b border-gray-800">
                {t("visualizations.positionalTable.uniqueHeader")}
              </th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, pos) => {
              const isHighlighted = hoveredPos === pos;
              return (
                <tr
                  key={pos}
                  className={`transition-colors cursor-pointer ${
                    isHighlighted ? "bg-gray-800/70" : "hover:bg-gray-800/30"
                  }`}
                  onMouseEnter={() => setHoveredPos(pos)}
                  onMouseLeave={() => setHoveredPos(null)}
                >
                  <td className="px-2 py-1.5 text-gray-500 font-mono text-xs border-b border-gray-800/50">
                    {pos}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-primary-400 text-sm border-b border-gray-800/50">
                    {token === " " ? "⎵" : token}
                  </td>
                  {headers.map((_, colIdx) => {
                    const val = getInterleavedValue(pos, colIdx);
                    return (
                      <td
                        key={colIdx}
                        className={`px-1.5 py-1.5 text-center font-mono text-xs border-b border-gray-800/50 transition-all ${
                          hoveredDim === colIdx ? "ring-1 ring-gray-600" : ""
                        }`}
                        style={{
                          color: valueColor(val),
                          fontWeight: isHighlighted ? 600 : 400,
                        }}
                      >
                        {val >= 0 ? "+" : ""}
                        {val.toFixed(3)}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 text-center border-b border-gray-800/50">
                    <span className="text-green-400 text-xs">✓</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Légende et explication */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "rgb(59, 130, 246)" }}
          />{" "}
          {t("visualizations.positionalTable.positive")}
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "rgb(239, 68, 68)" }}
          />{" "}
          {t("visualizations.positionalTable.negative")}
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "rgb(200, 200, 200)" }}
          />{" "}
          {t("visualizations.positionalTable.zero")}
        </span>
      </div>

      {/* Highlight info */}
      {hoveredPos !== null && (
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 text-sm">
          <p className="text-gray-300">
            <strong className="text-primary-400">
              {t("visualizations.positionalTable.hoverTitle", {
                pos: hoveredPos,
              })}
            </strong>{" "}
            —{" "}
            {t("visualizations.positionalTable.hoverDescription", {
              token: tokens[hoveredPos] === " " ? "⎵" : tokens[hoveredPos],
              count: headers.length,
            })}
          </p>
          <p
            className="text-gray-500 text-xs mt-1"
            dangerouslySetInnerHTML={{
              __html: t("visualizations.positionalTable.hoverDetail", {
                pos: hoveredPos,
              }),
            }}
          />
        </div>
      )}
    </div>
  );
}
