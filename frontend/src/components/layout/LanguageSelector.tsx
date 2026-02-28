/**
 * Sélecteur de langue compact pour la sidebar.
 *
 * @module components/layout/LanguageSelector
 */

import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

const LANGUAGES = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1.5">
      <Languages className="w-3.5 h-3.5 text-gray-600" />
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
            i18n.language?.startsWith(lang.code)
              ? "bg-primary-600/20 text-primary-400 font-medium"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
