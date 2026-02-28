/**
 * Diagramme animé du flux de gradients dans le réseau.
 *
 * Montre les gradients circulant à l'envers à travers les couches du modèle,
 * du loss jusqu'à l'embedding. Utilise des animations SVG dash-offset.
 *
 * @module components/visualizations/GradientFlow
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface GradientFlowProps {
  /** Nombre de couches transformer (défaut: 2) */
  nLayers?: number;
  /** Animation active */
  animated?: boolean;
}

const MODULE_DEFS = [
  { id: "loss", labelKey: "loss", color: "#ef4444", x: 620 },
  { id: "output", labelKey: "output", color: "#f59e0b", x: 530 },
  { id: "ln_final", labelKey: "layerNorm", color: "#8b5cf6", x: 440 },
  { id: "block1", labelKey: "block2", color: "#3b82f6", x: 350 },
  { id: "block0", labelKey: "block1", color: "#3b82f6", x: 260 },
  { id: "pos_enc", labelKey: "posEnc", color: "#06b6d4", x: 170 },
  { id: "embedding", labelKey: "embedding", color: "#10b981", x: 80 },
];

export default function GradientFlow({ animated = true }: GradientFlowProps) {
  const { t } = useTranslation("components");
  const [activeIdx, setActiveIdx] = useState(0);

  const MODULES = MODULE_DEFS.map((def) => ({
    ...def,
    label: t(`visualizations.gradientFlow.modules.${def.labelKey}`),
  }));

  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % MODULES.length);
    }, 800);
    return () => clearInterval(interval);
  }, [animated]);

  const width = 700;
  const height = 120;
  const moduleY = 50;
  const moduleW = 70;
  const moduleH = 32;

  return (
    <div className="space-y-3">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto"
      >
        {/* Flèches de gradient (droite → gauche) */}
        {MODULES.slice(0, -1).map((mod, i) => {
          const next = MODULES[i + 1];
          const isActive = activeIdx === i || activeIdx === i + 1;
          return (
            <g key={`arrow-${i}`}>
              <line
                x1={mod.x - moduleW / 2 + 2}
                y1={moduleY + moduleH + 8}
                x2={next.x + moduleW / 2 - 2}
                y2={moduleY + moduleH + 8}
                stroke={isActive ? "#ef4444" : "#374151"}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? "6,3" : "none"}
                markerEnd={isActive ? "url(#arrowRed)" : undefined}
              >
                {isActive && animated && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="18"
                    to="0"
                    dur="0.6s"
                    repeatCount="indefinite"
                  />
                )}
              </line>
            </g>
          );
        })}

        {/* Defs */}
        <defs>
          <marker
            id="arrowRed"
            markerWidth="6"
            markerHeight="4"
            refX="6"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill="#ef4444" />
          </marker>
        </defs>

        {/* Modules */}
        {MODULES.map((mod, i) => {
          const isActive = activeIdx === i;
          return (
            <g key={mod.id}>
              <rect
                x={mod.x - moduleW / 2}
                y={moduleY}
                width={moduleW}
                height={moduleH}
                rx={6}
                fill={isActive ? mod.color : "#1f2937"}
                stroke={mod.color}
                strokeWidth={isActive ? 2 : 1}
                opacity={isActive ? 1 : 0.7}
              />
              <text
                x={mod.x}
                y={moduleY + moduleH / 2 + 4}
                textAnchor="middle"
                className="text-[10px] fill-gray-200"
                fontWeight={isActive ? "bold" : "normal"}
              >
                {mod.label}
              </text>
            </g>
          );
        })}

        {/* Label direction */}
        <text
          x={350}
          y={moduleY + moduleH + 24}
          textAnchor="middle"
          className="text-[10px] fill-red-400"
        >
          {t("visualizations.gradientFlow.gradientDirection")}
        </text>
        <text
          x={350}
          y={moduleY - 8}
          textAnchor="middle"
          className="text-[10px] fill-gray-500"
        >
          {t("visualizations.gradientFlow.forwardDirection")}
        </text>
      </svg>

      {/* Description de l'étape active */}
      <div className="text-center text-sm text-gray-400">
        {animated &&
          (() => {
            const desc = t("visualizations.gradientFlow.activeDescription", {
              module: MODULES[activeIdx].label,
            });
            const parts = desc.split(MODULES[activeIdx].label);
            return (
              <span>
                {parts[0]}
                <span className="text-white font-semibold">
                  {MODULES[activeIdx].label}
                </span>
                {parts[1]}
              </span>
            );
          })()}
      </div>
    </div>
  );
}
