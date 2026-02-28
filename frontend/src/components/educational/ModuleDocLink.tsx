/**
 * Lien vers la documentation technique complète d'un module.
 *
 * @module components/educational/ModuleDocLink
 */

import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ModuleDocLinkProps {
  /** Slug du module (ex: "tokenizer", "attention") */
  slug: string;
  /** Texte du lien (défaut: "Documentation technique complète") */
  label?: string;
}

export default function ModuleDocLink({ slug, label }: ModuleDocLinkProps) {
  const { t } = useTranslation("components");
  const displayLabel = label ?? t("educational.moduleDocLink.defaultLabel");

  return (
    <Link
      to={`/docs/${slug}`}
      className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
    >
      <ExternalLink className="w-4 h-4" />
      {displayLabel}
    </Link>
  );
}
