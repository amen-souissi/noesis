/**
 * Section "Approfondir" dépliable avec formules KaTeX.
 *
 * Permet d'afficher du contenu mathématique avancé sans surcharger
 * la vue principale. Le contenu se déplie avec une animation.
 *
 * @example
 * ```tsx
 * <DeepDiveSection
 *   title="La formule mathématique"
 *   formulas={[
 *     { name: "Softmax", latex: "P(x_i) = \\frac{e^{x_i}}{\\sum_j e^{x_j}}", explanation: "..." }
 *   ]}
 * />
 * ```
 *
 * @module components/educational/DeepDiveSection
 */

import { useState } from "react";
import { ChevronRight, GraduationCap, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import katex from "katex";

interface Formula {
  name: string;
  latex: string;
  explanation: string;
}

interface DeepDiveSectionProps {
  /** Titre de la section (défaut: "Approfondir") */
  title?: string;
  /** Formules LaTeX à afficher */
  formulas?: Formula[];
  /** Slug du module de documentation technique associé */
  docSlug?: string;
  /** Contenu texte additionnel */
  children?: React.ReactNode;
}

function renderLatex(latex: string): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: true,
    });
  } catch {
    return `<code>${latex}</code>`;
  }
}

export default function DeepDiveSection({
  title,
  formulas,
  docSlug,
  children,
}: DeepDiveSectionProps) {
  const { t } = useTranslation("components");
  const [isOpen, setIsOpen] = useState(false);
  const displayTitle = title ?? t("educational.deepDiveSection.defaultTitle");

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900/50 hover:bg-gray-900 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <GraduationCap className="w-5 h-5 text-purple-400 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-300 flex-1">
          {displayTitle}
        </span>
        <ChevronRight
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="px-4 py-4 space-y-4 border-t border-gray-800 bg-gray-950/50">
          {formulas?.map((formula, i) => (
            <div
              key={i}
              className="border-l-2 border-purple-600/50 pl-4 space-y-2"
            >
              <h4 className="text-sm font-semibold text-gray-300">
                {formula.name}
              </h4>
              <div
                className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-center"
                dangerouslySetInnerHTML={{ __html: renderLatex(formula.latex) }}
              />
              <p className="text-sm text-gray-400 leading-relaxed">
                {formula.explanation}
              </p>
            </div>
          ))}
          {children}

          {docSlug && (
            <Link
              to={`/docs/${docSlug}`}
              className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-800 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              {t("educational.deepDiveSection.fullDocLink")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
