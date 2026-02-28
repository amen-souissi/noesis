/**
 * Composant inline pour afficher un terme technique vulgarisé.
 *
 * Affiche le terme accessible par défaut. Au hover, une infobulle montre :
 * - Le terme scientifique anglais
 * - Le terme technique français
 * - Une définition courte
 * - Un lien vers la documentation si disponible
 *
 * @example
 * ```tsx
 * <VulgarizedTerm termKey="learning_rate" />
 * // Affiche "Vitesse d'apprentissage" avec infobulle "Learning Rate"
 *
 * <VulgarizedTerm termKey="d_model">la taille des vecteurs</VulgarizedTerm>
 * // Affiche "la taille des vecteurs" avec infobulle de d_model
 * ```
 *
 * @module components/educational/VulgarizedTerm
 */

import { useState, useRef, useEffect } from "react";
import { HelpCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getGlossaryEntry } from "@/lib/glossary";

interface VulgarizedTermProps {
  /** Clé dans le registre glossaire (ex: "learning_rate") */
  termKey: string;
  /** Texte alternatif à afficher (par défaut : entry.vulgarized) */
  children?: React.ReactNode;
  /** Afficher l'icône d'aide (défaut: true) */
  showIcon?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  architecture: "text-blue-400",
  training: "text-green-400",
  generation: "text-purple-400",
  data: "text-amber-400",
};

export default function VulgarizedTerm({
  termKey,
  children,
  showIcon = true,
}: VulgarizedTermProps) {
  const { t } = useTranslation("components");
  const entry = getGlossaryEntry(termKey);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<"above" | "below">("above");
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (showTooltip && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // Si pas assez de place au-dessus, afficher en dessous
      setTooltipPos(rect.top < 200 ? "below" : "above");
    }
  }, [showTooltip]);

  if (!entry) {
    // Fallback si le terme n'est pas dans le glossaire
    return <span className="text-gray-300">{children ?? termKey}</span>;
  }

  const displayText = children ?? entry.vulgarized;

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center gap-0.5 cursor-help group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={0}
      role="term"
      aria-label={`${entry.vulgarized} — ${entry.scientific}`}
    >
      <span className="border-b border-dashed border-gray-500 text-gray-200 hover:text-primary-300 transition-colors">
        {displayText}
      </span>
      {showIcon && (
        <HelpCircle className="w-3 h-3 text-gray-600 group-hover:text-primary-400 transition-colors flex-shrink-0" />
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div
          className={`absolute z-50 w-72 p-3 rounded-lg bg-gray-800 border border-gray-700 shadow-xl
            ${tooltipPos === "above" ? "bottom-full mb-2" : "top-full mt-2"}
            left-1/2 -translate-x-1/2`}
          role="tooltip"
        >
          {/* Flèche */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 border-gray-700 rotate-45
              ${
                tooltipPos === "above"
                  ? "bottom-0 translate-y-1 border-r border-b"
                  : "top-0 -translate-y-1 border-l border-t"
              }`}
          />

          {/* Contenu */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-sm">
                {entry.scientific}
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded ${CATEGORY_COLORS[entry.category]} bg-gray-900`}
              >
                {entry.category}
              </span>
            </div>
            <p className="text-xs text-gray-400 italic">{entry.technicalFr}</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              {entry.definition}
            </p>
            {entry.docSlug && (
              <Link
                to={`/docs/${entry.docSlug}`}
                className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
                {t("educational.vulgarizedTerm.fullDocumentation")}
              </Link>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
