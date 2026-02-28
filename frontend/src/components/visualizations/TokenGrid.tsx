/**
 * Grille interactive montrant le mapping token → ID de token.
 *
 * Supporte les tokens caractère (CharTokenizer) et les sous-mots (TiktokenTokenizer).
 * Chaque token est affiché dans une cellule adaptée à sa longueur.
 * Au hover, la cellule se surbrille et toutes les occurrences du même token
 * sont mises en évidence. L'ID correspondant est affiché en dessous.
 *
 * @module components/visualizations/TokenGrid
 */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

interface TokenGridProps {
  /** Liste des tokens */
  chars: string[];
  /** IDs correspondants */
  ids: number[];
  /** Vocabulaire token → ID */
  vocab?: Record<string, number>;
  /** Afficher le vocabulaire complet à côté */
  showVocab?: boolean;
}

export default function TokenGrid({
  chars,
  ids,
  vocab,
  showVocab = false,
}: TokenGridProps) {
  const { t } = useTranslation("components");
  const [hoveredChar, setHoveredChar] = useState<string | null>(null);

  // Detect if we have multi-char tokens (BPE/subword mode)
  const isSubword = useMemo(() => chars.some((c) => c.length > 1), [chars]);

  // Cell style: fixed width for single chars, flexible for subwords
  const cellClass = isSubword ? "px-2 py-1.5 min-w-[36px]" : "w-9 h-9";

  /** Render a token, replacing spaces with ⎵ */
  const renderToken = (token: string) => {
    if (token === " ") return "⎵";
    // Show leading/trailing spaces as ⎵ for visibility
    return token.replace(/ /g, "⎵");
  };

  return (
    <div className="space-y-4">
      {/* Grille principale */}
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-0">
          {/* Ligne tokens */}
          <div className="flex gap-0.5 flex-wrap">
            {chars.map((char, i) => {
              const isHighlighted =
                hoveredChar !== null && char === hoveredChar;
              return (
                <div
                  key={i}
                  className={`
                    flex items-center justify-center rounded text-sm font-mono cursor-pointer
                    transition-all duration-150 border whitespace-nowrap
                    ${cellClass}
                    ${
                      isHighlighted
                        ? "bg-primary-500/30 border-primary-500 text-white scale-110 z-10"
                        : "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                    }
                  `}
                  onMouseEnter={() => setHoveredChar(char)}
                  onMouseLeave={() => setHoveredChar(null)}
                  title={`"${renderToken(char)}" → ID ${ids[i]}`}
                >
                  {renderToken(char)}
                </div>
              );
            })}
          </div>
          {/* Flèches */}
          <div className="flex gap-0.5 flex-wrap">
            {chars.map((char, i) => (
              <div
                key={i}
                className={`flex items-center justify-center h-4 text-gray-600 text-xs ${
                  isSubword ? "px-2 min-w-[36px]" : "w-9"
                }`}
              >
                ↓
              </div>
            ))}
          </div>
          {/* Ligne IDs */}
          <div className="flex gap-0.5 flex-wrap">
            {ids.map((id, i) => {
              const isHighlighted =
                hoveredChar !== null && chars[i] === hoveredChar;
              return (
                <div
                  key={i}
                  className={`
                    flex items-center justify-center rounded text-xs font-mono
                    transition-all duration-150 border
                    ${cellClass}
                    ${
                      isHighlighted
                        ? "bg-green-500/30 border-green-500 text-green-300 scale-110 z-10"
                        : "bg-gray-900 border-gray-800 text-green-400"
                    }
                  `}
                  onMouseEnter={() => setHoveredChar(chars[i])}
                  onMouseLeave={() => setHoveredChar(null)}
                >
                  {id}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vocabulaire complet */}
      {showVocab && vocab && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">
            {t("visualizations.tokenGrid.vocabDictionary", {
              count: Object.keys(vocab).length,
            })}
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {Object.entries(vocab)
              .sort(([, a], [, b]) => a - b)
              .map(([char, id]) => {
                const isHighlighted = hoveredChar === char;
                return (
                  <div
                    key={char}
                    className={`
                      inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono
                      transition-all duration-150 border cursor-pointer
                      ${
                        isHighlighted
                          ? "bg-primary-500/20 border-primary-500 text-white"
                          : "bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800"
                      }
                    `}
                    onMouseEnter={() => setHoveredChar(char)}
                    onMouseLeave={() => setHoveredChar(null)}
                  >
                    <span className="text-gray-300 whitespace-nowrap">
                      {renderToken(char)}
                    </span>
                    <span className="text-gray-600">→</span>
                    <span className="text-green-400">{id}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Info de survol */}
      {hoveredChar !== null &&
        (() => {
          const tokenDisplay = renderToken(hoveredChar);
          const count = chars.filter((c) => c === hoveredChar).length;
          const id = vocab?.[hoveredChar] ?? ids[chars.indexOf(hoveredChar)];
          const hoverText = t("visualizations.tokenGrid.hoverInfo", {
            token: tokenDisplay,
            count,
            id,
          });
          const parts = hoverText.split(tokenDisplay);
          const countStr = String(count);
          const idStr = String(id);
          return (
            <div className="text-center text-sm text-gray-400">{hoverText}</div>
          );
        })()}
    </div>
  );
}
