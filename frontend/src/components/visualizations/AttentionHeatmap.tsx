/**
 * Heatmap interactive des poids d'attention.
 *
 * Affiche une matrice colorée montrant quels tokens "regardent" quels autres.
 * Au hover, affiche le poids exact et une description accessible.
 * Le masque causal (triangle supérieur) est grisé.
 *
 * @module components/visualizations/AttentionHeatmap
 */

import { useRef, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

interface AttentionHeatmapProps {
  /** Labels des tokens (colonnes et lignes) */
  tokens: string[];
  /** Matrice de poids d'attention (tokens × tokens) */
  weights: number[][];
  /** Taille en pixels de chaque cellule */
  cellSize?: number;
}

export default function AttentionHeatmap({
  tokens,
  weights,
  cellSize = 48,
}: AttentionHeatmapProps) {
  const { t } = useTranslation("components");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<{ row: number; col: number } | null>(
    null,
  );
  const n = tokens.length;
  const labelMargin = 40;
  const canvasWidth = labelMargin + n * cellSize;
  const canvasHeight = labelMargin + n * cellSize;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Dessiner les cellules
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = labelMargin + j * cellSize;
        const y = labelMargin + i * cellSize;
        const w = weights[i][j];

        if (j > i) {
          // Masque causal — zone grisée
          ctx.fillStyle = "#111827";
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = "#1f2937";
          ctx.strokeRect(x, y, cellSize, cellSize);
        } else {
          // Poids d'attention — gradient bleu
          const intensity = Math.min(w, 1);
          const r = Math.round(14 + intensity * (56 - 14));
          const g = Math.round(24 + intensity * (189 - 24));
          const b = Math.round(40 + intensity * (248 - 40));
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(x, y, cellSize, cellSize);

          // Bordure
          ctx.strokeStyle = "#1f2937";
          ctx.strokeRect(x, y, cellSize, cellSize);

          // Valeur
          ctx.fillStyle = intensity > 0.5 ? "#ffffff" : "#9ca3af";
          ctx.font = "11px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(w.toFixed(2), x + cellSize / 2, y + cellSize / 2);
        }

        // Surbrillance hover
        if (hovered && (hovered.row === i || hovered.col === j)) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
          ctx.fillRect(x, y, cellSize, cellSize);
        }
        if (hovered && hovered.row === i && hovered.col === j) {
          ctx.strokeStyle = "#0ea5e9";
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
          ctx.lineWidth = 1;
        }
      }
    }

    // Labels colonnes (en haut)
    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    for (let j = 0; j < n; j++) {
      const x = labelMargin + j * cellSize + cellSize / 2;
      ctx.fillText(tokens[j] === " " ? "⎵" : tokens[j], x, labelMargin - 8);
    }

    // Labels lignes (à gauche)
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i < n; i++) {
      const y = labelMargin + i * cellSize + cellSize / 2;
      ctx.fillText(tokens[i] === " " ? "⎵" : tokens[i], labelMargin - 8, y);
    }

    // Label "regarde →" en haut
    ctx.fillStyle = "#6b7280";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    const looksAtLabel = t("visualizations.attentionHeatmap.looksAt");
    ctx.fillText(looksAtLabel, labelMargin + (n * cellSize) / 2, 8);
  }, [
    tokens,
    weights,
    cellSize,
    n,
    canvasWidth,
    canvasHeight,
    hovered,
    labelMargin,
    t,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - labelMargin;
    const y = e.clientY - rect.top - labelMargin;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (row >= 0 && row < n && col >= 0 && col < n) {
      setHovered({ row, col });
    } else {
      setHovered(null);
    }
  };

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
        className="cursor-crosshair"
      />

      {/* Info hover */}
      {hovered &&
        hovered.col <= hovered.row &&
        (() => {
          const sourceToken =
            tokens[hovered.row] === " "
              ? t("visualizations.attentionHeatmap.space")
              : tokens[hovered.row];
          const targetToken =
            tokens[hovered.col] === " "
              ? t("visualizations.attentionHeatmap.space")
              : tokens[hovered.col];
          const weightValue = weights[hovered.row][hovered.col].toFixed(2);
          return (
            <div className="text-sm text-gray-400 text-center">
              {t("visualizations.attentionHeatmap.hoverInfo", {
                source: sourceToken,
                target: targetToken,
                weight: weightValue,
              })}
            </div>
          );
        })()}
      {hovered && hovered.col > hovered.row && (
        <div className="text-sm text-gray-500 text-center italic">
          {t("visualizations.attentionHeatmap.maskedZone")}
        </div>
      )}
    </div>
  );
}
