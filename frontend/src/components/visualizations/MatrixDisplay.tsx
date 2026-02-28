/**
 * Affichage d'une matrice de nombres avec labels de lignes/colonnes.
 *
 * Composant réutilisable pour les visualisations éducatives de matrices.
 * Supporte la coloration conditionnelle des cellules et le masquage.
 *
 * @module components/visualizations/MatrixDisplay
 */

interface MatrixDisplayProps {
  /** Données de la matrice (lignes × colonnes) */
  data: number[][];
  /** Labels des lignes */
  rowLabels?: string[];
  /** Labels des colonnes */
  colLabels?: string[];
  /** Titre au-dessus de la matrice */
  title?: string;
  /** Couleur des labels de lignes */
  rowLabelColor?: string;
  /** Couleur des labels de colonnes */
  colLabelColor?: string;
  /** Nombre de décimales */
  precision?: number;
  /** Fonction de couleur conditionnelle : (value, row, col) => className */
  cellColor?: (value: number, row: number, col: number) => string;
  /** Indices de lignes à mettre en surbrillance */
  highlightRows?: number[];
  /** Indices de colonnes à mettre en surbrillance */
  highlightCols?: number[];
  /** Cellules masquées (affichées en gris avec —) */
  maskedCells?: (row: number, col: number) => boolean;
  /** Compact mode (smaller text) */
  compact?: boolean;
  /** Shape label e.g. "(7 × 4)" */
  shape?: string;
}

export default function MatrixDisplay({
  data,
  rowLabels,
  colLabels,
  title,
  rowLabelColor = "text-primary-400",
  colLabelColor = "text-gray-500",
  precision = 2,
  cellColor,
  highlightRows,
  highlightCols,
  maskedCells,
  compact = false,
  shape,
}: MatrixDisplayProps) {
  const textSize = compact ? "text-[10px]" : "text-xs";
  const cellPad = compact ? "px-1 py-0.5" : "px-2 py-1";

  return (
    <div className="space-y-1">
      {(title || shape) && (
        <div className="flex items-center gap-2">
          {title && (
            <span className={`${textSize} font-semibold text-gray-300`}>
              {title}
            </span>
          )}
          {shape && <span className="text-[10px] text-gray-600">{shape}</span>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className={`${textSize} font-mono`}>
          {colLabels && (
            <thead>
              <tr>
                {rowLabels && <th className={cellPad} />}
                {colLabels.map((label, j) => (
                  <th
                    key={j}
                    className={`${cellPad} text-center font-normal ${
                      highlightCols?.includes(j)
                        ? "text-white bg-gray-800/50"
                        : colLabelColor
                    }`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {data.map((row, i) => {
              const isHighlightedRow = highlightRows?.includes(i);
              return (
                <tr
                  key={i}
                  className={isHighlightedRow ? "bg-gray-800/30" : ""}
                >
                  {rowLabels && (
                    <td
                      className={`${cellPad} text-right font-semibold ${
                        isHighlightedRow ? "text-white" : rowLabelColor
                      }`}
                    >
                      {rowLabels[i]}
                    </td>
                  )}
                  {row.map((value, j) => {
                    const isMasked = maskedCells?.(i, j);
                    const isHighlightedCol = highlightCols?.includes(j);
                    const customColor = cellColor?.(value, i, j);

                    if (isMasked) {
                      return (
                        <td
                          key={j}
                          className={`${cellPad} text-center text-gray-700`}
                        >
                          —
                        </td>
                      );
                    }

                    return (
                      <td
                        key={j}
                        className={`${cellPad} text-center ${
                          customColor
                            ? customColor
                            : isHighlightedRow || isHighlightedCol
                              ? "text-white"
                              : value > 0
                                ? "text-blue-300"
                                : value < 0
                                  ? "text-red-300"
                                  : "text-gray-500"
                        }`}
                      >
                        {value >= 0
                          ? value.toFixed(precision)
                          : value.toFixed(precision)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
