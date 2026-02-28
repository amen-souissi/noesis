/**
 * Bannière affichant la phrase exemple fil rouge.
 *
 * Affichée en haut de chaque étape éducative pour rappeler que tous
 * les calculs sont basés sur "Le chat".
 *
 * @module components/educational/ExampleSentenceBanner
 */

import { MessageSquareQuote } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useExampleStore } from "@/stores/exampleStore";

interface ExampleSentenceBannerProps {
  /** Texte supplémentaire de contexte */
  context?: string;
}

export default function ExampleSentenceBanner({
  context,
}: ExampleSentenceBannerProps) {
  const { t } = useTranslation("components");
  const sentence = useExampleStore((s) => s.sentence);

  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-primary-500/5 border border-primary-500/20 rounded-lg">
      <MessageSquareQuote className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm text-gray-400">
          {t("educational.exampleSentenceBanner.label")}
        </p>
        <p className="text-lg font-medium text-primary-300 mt-1">
          « {sentence} »
        </p>
        {context && <p className="text-sm text-gray-400 mt-1">{context}</p>}
      </div>
    </div>
  );
}
