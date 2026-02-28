/**
 * Carte affichant un calcul concret avec les données de l'exemple.
 *
 * Utilisée dans chaque étape du pipeline pour montrer les vrais nombres
 * issus du traitement de "Le chat".
 *
 * @example
 * ```tsx
 * <ConcreteCalculation title="Tokenisation">
 *   <TokenGrid chars={chars} ids={ids} />
 * </ConcreteCalculation>
 * ```
 *
 * @module components/educational/ConcreteCalculation
 */

import { Calculator } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConcreteCalculationProps {
  /** Titre du calcul */
  title: string;
  /** Description courte optionnelle */
  description?: string;
  /** Contenu du calcul (visualisation, tableau, etc.) */
  children: React.ReactNode;
}

export default function ConcreteCalculation({
  title,
  description,
  children,
}: ConcreteCalculationProps) {
  const { t } = useTranslation("components");

  return (
    <div className="card border-primary-600/30">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-5 h-5 text-primary-500" />
        <h3 className="text-sm font-semibold text-gray-300">
          {t("educational.concreteCalculation.prefix", { title })}
        </h3>
      </div>
      {description && (
        <p className="text-sm text-gray-400 mb-4">{description}</p>
      )}
      <div className="bg-gray-950/50 rounded-lg p-4 overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
