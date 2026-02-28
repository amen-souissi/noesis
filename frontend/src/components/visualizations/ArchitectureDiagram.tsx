/**
 * Diagramme d'architecture interactif du Transformer.
 *
 * Affiche le flux de données complet du LLM sous forme de blocs connectés.
 * Chaque bloc est cliquable et navigue vers la page éducative correspondante.
 *
 * @module components/visualizations/ArchitectureDiagram
 */

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ArchBlock {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  path: string;
  group: "input" | "process" | "output" | "training";
}

const BLOCK_DEFS: {
  id: string;
  color: string;
  path: string;
  group: "input" | "process" | "output" | "training";
}[] = [
  {
    id: "tokenizer",
    color: "#10b981",
    path: "/training/tokenization",
    group: "input",
  },
  {
    id: "embedding",
    color: "#06b6d4",
    path: "/training/embedding",
    group: "input",
  },
  {
    id: "positional",
    color: "#06b6d4",
    path: "/training/positional-encoding",
    group: "input",
  },
  {
    id: "attention",
    color: "#3b82f6",
    path: "/training/attention",
    group: "process",
  },
  {
    id: "ffn",
    color: "#3b82f6",
    path: "/training/feedforward",
    group: "process",
  },
  {
    id: "output",
    color: "#f59e0b",
    path: "/generation/softmax",
    group: "output",
  },
  { id: "loss", color: "#ef4444", path: "/training/loss", group: "training" },
  {
    id: "backprop",
    color: "#ef4444",
    path: "/training/backpropagation",
    group: "training",
  },
  {
    id: "optimizer",
    color: "#ef4444",
    path: "/training/optimizer",
    group: "training",
  },
];

export default function ArchitectureDiagram() {
  const navigate = useNavigate();
  const { t } = useTranslation("components");

  const BLOCKS: ArchBlock[] = BLOCK_DEFS.map((def) => ({
    ...def,
    label: t(`visualizations.architectureDiagram.blocks.${def.id}.label`),
    sublabel: t(`visualizations.architectureDiagram.blocks.${def.id}.sublabel`),
  }));

  const blockW = 140;
  const blockH = 50;
  const gapX = 20;
  const gapY = 20;

  // Layout : 3 lignes
  const rows = [
    BLOCKS.filter((b) => b.group === "input"),
    BLOCKS.filter((b) => b.group === "process"),
    [
      ...BLOCKS.filter((b) => b.group === "output"),
      ...BLOCKS.filter((b) => b.group === "training"),
    ],
  ];

  const maxCols = Math.max(...rows.map((r) => r.length));
  const svgWidth = maxCols * (blockW + gapX) + 40;
  const svgHeight = rows.length * (blockH + gapY + 20) + 40;

  const getBlockPos = (rowIdx: number, colIdx: number, rowLen: number) => {
    const totalWidth = rowLen * blockW + (rowLen - 1) * gapX;
    const offsetX = (svgWidth - totalWidth) / 2;
    return {
      x: offsetX + colIdx * (blockW + gapX),
      y: 20 + rowIdx * (blockH + gapY + 20),
    };
  };

  return (
    <div className="overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="mx-auto"
      >
        <defs>
          <marker
            id="arrowHead"
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#4b5563" />
          </marker>
        </defs>

        {/* Flèches entre les lignes */}
        {rows.slice(0, -1).map((row, rowIdx) => {
          const nextRow = rows[rowIdx + 1];
          const fromX = svgWidth / 2;
          const fromY = getBlockPos(rowIdx, 0, row.length).y + blockH;
          const toY = getBlockPos(rowIdx + 1, 0, nextRow.length).y;
          return (
            <line
              key={`arrow-${rowIdx}`}
              x1={fromX}
              y1={fromY + 4}
              x2={fromX}
              y2={toY - 4}
              stroke="#4b5563"
              strokeWidth={2}
              markerEnd="url(#arrowHead)"
            />
          );
        })}

        {/* Blocs */}
        {rows.map((row, rowIdx) =>
          row.map((block, colIdx) => {
            const pos = getBlockPos(rowIdx, colIdx, row.length);
            return (
              <g
                key={block.id}
                className="cursor-pointer"
                onClick={() => navigate(block.path)}
              >
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={blockW}
                  height={blockH}
                  rx={8}
                  fill="#1f2937"
                  stroke={block.color}
                  strokeWidth={1.5}
                  className="hover:opacity-80 transition-opacity"
                />
                <text
                  x={pos.x + blockW / 2}
                  y={pos.y + 20}
                  textAnchor="middle"
                  fill="#e5e7eb"
                  className="text-[11px] font-semibold"
                >
                  {block.label}
                </text>
                <text
                  x={pos.x + blockW / 2}
                  y={pos.y + 36}
                  textAnchor="middle"
                  fill="#9ca3af"
                  className="text-[9px]"
                >
                  {block.sublabel}
                </text>
              </g>
            );
          }),
        )}

        {/* Labels de groupe */}
        {[
          {
            label: t("visualizations.architectureDiagram.groupLabels.input"),
            y: 10,
            color: "#10b981",
          },
          {
            label: t("visualizations.architectureDiagram.groupLabels.process"),
            y: 10 + blockH + gapY + 20,
            color: "#3b82f6",
          },
          {
            label: t("visualizations.architectureDiagram.groupLabels.output"),
            y: 10 + 2 * (blockH + gapY + 20),
            color: "#f59e0b",
          },
        ].map((group, i) => (
          <text
            key={i}
            x={10}
            y={group.y}
            fill={group.color}
            className="text-[9px] font-semibold"
          >
            {group.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
