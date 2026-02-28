/**
 * Diagramme SVG du réseau Feed-Forward.
 *
 * Illustre l'expansion (d_model → d_ff) puis la compression (d_ff → d_model)
 * avec la couche ReLU au milieu.
 *
 * @module components/visualizations/FFNDiagram
 */

import { useTranslation } from "react-i18next";

interface FFNDiagramProps {
  dModel?: number;
  dFF?: number;
}

export default function FFNDiagram({
  dModel = 64,
  dFF = 256,
}: FFNDiagramProps) {
  const { t } = useTranslation("components");
  const width = 600;
  const height = 200;
  const layerY = 100;

  // 3 couches : input (d_model), hidden (d_ff), output (d_model)
  const layers = [
    {
      x: 80,
      neurons: 6,
      label: `${t("visualizations.ffnDiagram.inputLayer")}\n(d_model=${dModel})`,
      color: "#3b82f6",
    },
    {
      x: 300,
      neurons: 12,
      label: `${t("visualizations.ffnDiagram.hiddenLayer")}\n(d_ff=${dFF})`,
      color: "#f59e0b",
    },
    {
      x: 520,
      neurons: 6,
      label: `${t("visualizations.ffnDiagram.outputLayer")}\n(d_model=${dModel})`,
      color: "#3b82f6",
    },
  ];

  const neuronRadius = 6;
  const neuronSpacing = 14;

  const getNeuronY = (layerIdx: number, neuronIdx: number) => {
    const count = layers[layerIdx].neurons;
    const totalHeight = (count - 1) * neuronSpacing;
    return layerY - totalHeight / 2 + neuronIdx * neuronSpacing;
  };

  return (
    <div className="overflow-x-auto">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto"
      >
        {/* Connexions entre couches */}
        {[0, 1].map((layerIdx) => {
          const from = layers[layerIdx];
          const to = layers[layerIdx + 1];
          return Array.from({ length: Math.min(from.neurons, 4) }).map((_, i) =>
            Array.from({ length: Math.min(to.neurons, 4) }).map((_, j) => (
              <line
                key={`${layerIdx}-${i}-${j}`}
                x1={from.x + neuronRadius}
                y1={getNeuronY(layerIdx, i)}
                x2={to.x - neuronRadius}
                y2={getNeuronY(layerIdx + 1, j)}
                stroke="#374151"
                strokeWidth={0.5}
                opacity={0.4}
              />
            )),
          );
        })}

        {/* Neurones */}
        {layers.map((layer, layerIdx) => (
          <g key={layerIdx}>
            {Array.from({ length: layer.neurons }).map((_, i) => (
              <circle
                key={i}
                cx={layer.x}
                cy={getNeuronY(layerIdx, i)}
                r={neuronRadius}
                fill={layer.color}
                opacity={0.8}
              />
            ))}
          </g>
        ))}

        {/* Labels */}
        {layers.map((layer, i) => (
          <g key={`label-${i}`}>
            <text
              x={layer.x}
              y={layerY + (layers[i].neurons * neuronSpacing) / 2 + 20}
              textAnchor="middle"
              className="text-[10px] fill-gray-400"
            >
              {layer.label.split("\n")[0]}
            </text>
            <text
              x={layer.x}
              y={layerY + (layers[i].neurons * neuronSpacing) / 2 + 32}
              textAnchor="middle"
              className="text-[9px] fill-gray-500 font-mono"
            >
              {layer.label.split("\n")[1]}
            </text>
          </g>
        ))}

        {/* ReLU label */}
        <g>
          <rect
            x={175}
            y={layerY - 14}
            width={46}
            height={28}
            rx={6}
            fill="#1f2937"
            stroke="#f59e0b"
            strokeWidth={1}
          />
          <text
            x={198}
            y={layerY + 4}
            textAnchor="middle"
            className="text-[10px] fill-amber-400 font-semibold"
          >
            ReLU
          </text>
        </g>

        {/* Flèches expansion / compression */}
        <text
          x={190}
          y={layerY - 24}
          textAnchor="middle"
          className="text-[9px] fill-green-400"
        >
          {t("visualizations.ffnDiagram.expansion", { factor: dFF / dModel })}
        </text>
        <text
          x={410}
          y={layerY - 24}
          textAnchor="middle"
          className="text-[9px] fill-blue-400"
        >
          {t("visualizations.ffnDiagram.compression", { factor: dFF / dModel })}
        </text>
      </svg>
    </div>
  );
}
