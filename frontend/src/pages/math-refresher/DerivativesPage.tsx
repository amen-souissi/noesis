import { useTranslation } from "react-i18next";
import { useProgress } from "@/hooks/useProgress";
import { getAdjacentSections } from "@/lib/pipelineSteps";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AnimatedMathOperation from "@/components/visualizations/AnimatedMathOperation";

const SECTION_ID = "math/derivatives";

export default function DerivativesPage() {
  const { t } = useTranslation("pages");
  useProgress(SECTION_ID);
  const { prev, next } = getAdjacentSections(SECTION_ID);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-1">
          {t("math.derivatives.categoryLabel")}
        </p>
        <h1 className="text-2xl font-bold text-white mb-2">
          {t("math.derivatives.title")}
        </h1>
        <p className="text-gray-400">{t("math.derivatives.subtitle")}</p>
      </div>

      {/* Intuition de la dérivée */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.derivatives.derivative.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.derivatives.derivative.description1")}
        </p>
        <p className="text-sm text-gray-400">
          {t("math.derivatives.derivative.description2")}
        </p>
        <div className="bg-gray-800 rounded-lg p-5 text-sm space-y-3">
          <div className="flex items-center justify-center gap-4 text-center">
            <div>
              <div className="text-3xl mb-1">🏔️</div>
              <p className="text-xs text-gray-500">
                {t("math.derivatives.derivative.highError")}
              </p>
              <p className="text-xs text-red-400">
                {t("math.derivatives.derivative.strongDerivative")}
              </p>
              <p className="text-xs text-red-400">
                {t("math.derivatives.derivative.bigChange")}
              </p>
            </div>
            <div className="text-gray-600">→ → →</div>
            <div>
              <div className="text-3xl mb-1">⛰️</div>
              <p className="text-xs text-gray-500">
                {t("math.derivatives.derivative.mediumError")}
              </p>
              <p className="text-xs text-amber-400">
                {t("math.derivatives.derivative.moderateDerivative")}
              </p>
              <p className="text-xs text-amber-400">
                {t("math.derivatives.derivative.mediumChange")}
              </p>
            </div>
            <div className="text-gray-600">→ →</div>
            <div>
              <div className="text-3xl mb-1">🏞️</div>
              <p className="text-xs text-gray-500">
                {t("math.derivatives.derivative.minimalError")}
              </p>
              <p className="text-xs text-green-400">
                {t("math.derivatives.derivative.zeroDerivative")}
              </p>
              <p className="text-xs text-green-400">
                {t("math.derivatives.derivative.arrived")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exemple concret avec calcul */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.derivatives.example.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.derivatives.example.description")}
        </p>
        <div className="bg-gray-800/50 rounded-lg p-4 text-sm space-y-2">
          <div className="flex gap-3 items-start">
            <span className="text-white font-mono shrink-0">f(x)</span>
            <span className="text-gray-400">
              {t("math.derivatives.example.fxLabel")}
            </span>
          </div>
          <div className="flex gap-3 items-start">
            <span className="text-amber-400 font-mono shrink-0">2x</span>
            <span className="text-gray-400">
              {t("math.derivatives.example.derivLabel")}
            </span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-5 font-mono text-sm space-y-4">
          <AnimatedMathOperation totalSteps={4} delay={800}>
            {(step) => {
              const rows = [
                {
                  x: 0,
                  fx: 0,
                  deriv: "0",
                  derivColor: "text-green-400 font-bold",
                },
                { x: 1, fx: 1, deriv: "2", derivColor: "text-amber-400" },
                { x: 3, fx: 9, deriv: "6", derivColor: "text-amber-400" },
                {
                  x: 5,
                  fx: 25,
                  deriv: "10",
                  derivColor: "text-red-400 font-bold",
                },
              ];
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto text-center">
                    <div className="text-xs text-gray-500">x</div>
                    <div className="text-xs text-gray-500">f(x) = x²</div>
                    <div className="text-xs text-gray-500">
                      {t("math.derivatives.example.tableHeaderDeriv")}
                    </div>
                    {rows.map((r, i) => {
                      const visible = step === -1 || step >= i;
                      const active = step === i;
                      return (
                        <span
                          key={i}
                          className={`contents transition-all duration-300 ${!visible ? "opacity-0" : ""}`}
                        >
                          <div
                            className={
                              active
                                ? "text-blue-400 ring-2 ring-blue-500/40 bg-blue-500/10 rounded px-1"
                                : "text-blue-400"
                            }
                          >
                            {r.x}
                          </div>
                          <div className="text-white">{r.fx}</div>
                          <div
                            className={
                              active
                                ? `${r.derivColor} ring-2 ring-amber-500/40 bg-amber-500/10 rounded px-1`
                                : r.derivColor
                            }
                          >
                            {r.deriv}
                          </div>
                        </span>
                      );
                    })}
                  </div>
                  {step >= 0 && (
                    <div className="text-center text-xs text-gray-500 border-t border-gray-700 pt-2">
                      {t("math.derivatives.example.stepDetail", {
                        x: rows[step].x,
                      })}
                      <span className={rows[step].derivColor}>
                        {rows[step].deriv}
                      </span>
                      {step === 0 && t("math.derivatives.example.flatCurve")}
                      {step === 3 && t("math.derivatives.example.fasterThan")}
                    </div>
                  )}
                </div>
              );
            }}
          </AnimatedMathOperation>

          <div className="border-t border-gray-700 pt-3 text-xs text-gray-500 space-y-1.5">
            <p className="font-semibold text-gray-400">
              {t("math.derivatives.example.howToRead")}
            </p>
            <p>{t("math.derivatives.example.readNote")}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-5 font-mono text-sm space-y-3">
          <p className="text-xs text-gray-500">
            {t("math.derivatives.example.verification")}
          </p>
          <p className="text-xs text-gray-400 text-center">
            {t("math.derivatives.example.verificationNote")}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Petit pas */}
            <div className="space-y-2 text-center">
              <p className="text-xs text-green-400 font-semibold">
                {t("math.derivatives.example.smallStep")}
              </p>
              <div className="space-y-0.5 text-xs">
                <p>
                  f(<span className="text-blue-400">3</span>) ={" "}
                  <span className="text-white">9</span>
                </p>
                <p>
                  f(<span className="text-blue-400">3.01</span>) ={" "}
                  <span className="text-white">9.0601</span>
                </p>
                <p>
                  {t("math.derivatives.example.actual")} ={" "}
                  <span className="text-amber-400">0.0601</span>
                </p>
              </div>
              <div className="border-t border-gray-700 pt-1 text-xs">
                <p>
                  {t("math.derivatives.example.predicted")} : 0.01 × 6 ={" "}
                  <span className="text-green-400">0.06</span>
                </p>
                <p className="text-green-400">
                  {t("math.derivatives.example.accurate", { value: "0.0601" })}
                </p>
              </div>
            </div>

            {/* Grand pas */}
            <div className="space-y-2 text-center">
              <p className="text-xs text-red-400 font-semibold">
                {t("math.derivatives.example.bigStep")}
              </p>
              <div className="space-y-0.5 text-xs">
                <p>
                  f(<span className="text-blue-400">3</span>) ={" "}
                  <span className="text-white">9</span>
                </p>
                <p>
                  f(<span className="text-blue-400">4</span>) ={" "}
                  <span className="text-white">16</span>
                </p>
                <p>
                  {t("math.derivatives.example.actual")} ={" "}
                  <span className="text-amber-400">7</span>
                </p>
              </div>
              <div className="border-t border-gray-700 pt-1 text-xs">
                <p>
                  {t("math.derivatives.example.predicted")} : 1 × 6 ={" "}
                  <span className="text-red-400">6</span>
                </p>
                <p className="text-red-400">
                  {t("math.derivatives.example.inaccurate", { value: "7" })}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            {t("math.derivatives.example.precisionNote")}
          </p>
        </div>
      </section>

      {/* Dérivée partielle */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.derivatives.partialDerivative.title")}
        </h2>

        {/* Pourquoi */}
        <p className="text-sm text-gray-400">
          {t("math.derivatives.partialDerivative.whyDescription")}
        </p>
        <p className="text-sm text-gray-400">
          {t("math.derivatives.partialDerivative.solution")}
        </p>

        {/* Notation */}
        <div className="bg-gray-800/50 rounded-lg p-4 text-sm space-y-2">
          <p className="font-semibold text-gray-300">
            {t("math.derivatives.partialDerivative.notation")}
          </p>
          <p className="text-gray-400">
            {t("math.derivatives.partialDerivative.notationNote")}
          </p>
          <div className="bg-gray-800 rounded-lg p-3 font-mono text-xs text-center space-y-1">
            <p>
              <span className="text-amber-400">
                ∂erreur/∂w<sub>1</sub>
              </span>{" "}
              ={" "}
              {t("math.derivatives.partialDerivative.notationMeaning", {
                w: "w₁",
              })}
            </p>
          </div>
          <p className="text-xs text-gray-500">
            {t("math.derivatives.partialDerivative.notationExplained")}
          </p>
        </div>

        {/* Situation concrète */}
        <div className="bg-gray-800/50 rounded-lg p-4 text-sm space-y-3">
          <p className="font-semibold text-gray-300">
            {t("math.derivatives.partialDerivative.concreteTitle")}
          </p>
          <p className="text-gray-400">
            {t("math.derivatives.partialDerivative.concreteDescription")}
          </p>
          <div className="bg-gray-800 rounded-lg p-3 font-mono text-center">
            <span className="text-white">
              erreur(w<sub>1</sub>, w<sub>2</sub>) = w<sub>1</sub>² + 3 × w
              <sub>2</sub>
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {t("math.derivatives.partialDerivative.concreteNote")}
          </p>
        </div>

        {/* Question clé */}
        <div className="bg-gray-800 rounded-lg p-5 text-sm space-y-4">
          <p className="text-center text-gray-300">
            Si w<sub>1</sub> ={" "}
            <span className="text-blue-400 font-mono">2</span>, w<sub>2</sub> ={" "}
            <span className="text-blue-400 font-mono">1</span>,{" "}
            {t("math.derivatives.partialDerivative.errorEquals")}{" "}
            <span className="font-mono text-white">2² + 3×1 = 7</span>.
          </p>
          <p className="text-center text-gray-400 text-xs">
            {t("math.derivatives.partialDerivative.questionKey")}
          </p>
          {/* Rappel des règles */}
          <div className="bg-gray-900/50 rounded-lg p-4 text-xs space-y-2">
            <p className="text-gray-400 font-semibold">
              {t("math.derivatives.partialDerivative.rules.title")}
            </p>
            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="space-y-1">
                <p className="text-gray-500">
                  {t("math.derivatives.partialDerivative.rules.rule1Label")}
                </p>
                <p>
                  <span className="text-blue-400">x²</span> →{" "}
                  <span className="text-amber-400">2x</span>
                </p>
                <p className="text-gray-600">
                  {t("math.derivatives.partialDerivative.rules.rule1Desc")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500">
                  {t("math.derivatives.partialDerivative.rules.rule2Label")}
                </p>
                <p>
                  <span className="text-blue-400">3x</span> →{" "}
                  <span className="text-amber-400">3</span>
                </p>
                <p className="text-gray-600">
                  {t("math.derivatives.partialDerivative.rules.rule2Desc")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500">
                  {t("math.derivatives.partialDerivative.rules.rule3Label")}
                </p>
                <p>
                  <span className="text-blue-400">const</span> →{" "}
                  <span className="text-amber-400">0</span>
                </p>
                <p className="text-gray-600">
                  {t("math.derivatives.partialDerivative.rules.rule3Desc")}
                </p>
              </div>
            </div>
          </div>

          {/* Calcul détaillé */}
          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto font-mono">
            {/* Bouger w1 */}
            <div className="bg-gray-900/50 rounded-lg p-3 space-y-2 text-center">
              <p className="text-xs text-blue-400 font-semibold">
                {t("math.derivatives.partialDerivative.w1Title")}
              </p>
              <div className="text-xs space-y-1">
                <p className="text-gray-500">
                  erreur ={" "}
                  <span className="text-blue-400">
                    w<sub>1</sub>²
                  </span>{" "}
                  +{" "}
                  <span className="text-gray-600">
                    3×w<sub>2</sub>
                  </span>
                </p>
                <p className="text-gray-500">
                  {t("math.derivatives.partialDerivative.deriveEachPart")}
                </p>
                <p>
                  <span className="text-blue-400">
                    w<sub>1</sub>²
                  </span>{" "}
                  →{" "}
                  <span className="text-amber-400">
                    2×w<sub>1</sub>
                  </span>
                  <span className="text-gray-600 ml-2">
                    {t("math.derivatives.partialDerivative.rule1Ref")}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">
                    3×w<sub>2</sub>
                  </span>{" "}
                  → <span className="text-amber-400">0</span>
                  <span className="text-gray-600 ml-2">
                    {t("math.derivatives.partialDerivative.frozenConstRule3", {
                      w: "w₂",
                    })}
                  </span>
                </p>
              </div>
              <div className="border-t border-gray-700 pt-2 text-xs">
                <p>
                  ∂erreur/∂w<sub>1</sub> ={" "}
                  <span className="text-amber-400">
                    2×w<sub>1</sub>
                  </span>{" "}
                  + 0 ={" "}
                  <span className="text-amber-400">
                    2×w<sub>1</sub>
                  </span>
                </p>
                <p>
                  = 2×<span className="text-blue-400">2</span> ={" "}
                  <span className="text-amber-400 font-bold">4</span>
                </p>
              </div>
            </div>

            {/* Bouger w2 */}
            <div className="bg-gray-900/50 rounded-lg p-3 space-y-2 text-center">
              <p className="text-xs text-blue-400 font-semibold">
                {t("math.derivatives.partialDerivative.w2Title")}
              </p>
              <div className="text-xs space-y-1">
                <p className="text-gray-500">
                  erreur ={" "}
                  <span className="text-gray-600">
                    w<sub>1</sub>²
                  </span>{" "}
                  +{" "}
                  <span className="text-blue-400">
                    3×w<sub>2</sub>
                  </span>
                </p>
                <p className="text-gray-500">
                  {t("math.derivatives.partialDerivative.deriveEachPart")}
                </p>
                <p>
                  <span className="text-gray-600">
                    w<sub>1</sub>²
                  </span>{" "}
                  → <span className="text-amber-400">0</span>
                  <span className="text-gray-600 ml-2">
                    {t("math.derivatives.partialDerivative.frozenConstRule3", {
                      w: "w₁",
                    })}
                  </span>
                </p>
                <p>
                  <span className="text-blue-400">
                    3×w<sub>2</sub>
                  </span>{" "}
                  → <span className="text-amber-400">3</span>
                  <span className="text-gray-600 ml-2">
                    {t("math.derivatives.partialDerivative.rule2Ref")}
                  </span>
                </p>
              </div>
              <div className="border-t border-gray-700 pt-2 text-xs">
                <p>
                  ∂erreur/∂w<sub>2</sub> = 0 +{" "}
                  <span className="text-amber-400">3</span> ={" "}
                  <span className="text-amber-400 font-bold">3</span>
                </p>
              </div>
            </div>
          </div>

          {/* Vérification numérique */}
          <div className="border-t border-gray-700 pt-3 text-xs text-gray-500 space-y-2">
            <p className="font-semibold text-gray-400 text-center">
              {t("math.derivatives.partialDerivative.verificationTitle")}
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto font-mono text-center">
              <div className="space-y-0.5">
                <p>
                  erreur(<span className="text-blue-400">2</span>, 1) ={" "}
                  <span className="text-white">7</span>
                </p>
                <p>
                  erreur(<span className="text-blue-400">2.01</span>, 1) ={" "}
                  <span className="text-white">7.0401</span>
                </p>
                <p>
                  {t("math.derivatives.example.actual")} ={" "}
                  <span className="text-amber-400">+0.0401</span>
                </p>
                <p>
                  {t("math.derivatives.example.predicted")} : 0.01 ×{" "}
                  <span className="text-amber-400">4</span> ={" "}
                  <span className="text-green-400">0.04</span> ✓
                </p>
              </div>
              <div className="space-y-0.5">
                <p>
                  erreur(2, <span className="text-blue-400">1</span>) ={" "}
                  <span className="text-white">7</span>
                </p>
                <p>
                  erreur(2, <span className="text-blue-400">1.01</span>) ={" "}
                  <span className="text-white">7.03</span>
                </p>
                <p>
                  {t("math.derivatives.example.actual")} ={" "}
                  <span className="text-amber-400">+0.03</span>
                </p>
                <p>
                  {t("math.derivatives.example.predicted")} : 0.01 ×{" "}
                  <span className="text-amber-400">3</span> ={" "}
                  <span className="text-green-400">0.03</span> ✓
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-3 text-xs text-gray-500 text-center space-y-1">
            <p className="text-gray-400 font-semibold">
              {t("math.derivatives.partialDerivative.answer.title")}
            </p>
            <p>
              {t("math.derivatives.partialDerivative.answer.impact", {
                w: "w₁",
                val: "4",
              })}
              ,{" "}
              {t("math.derivatives.partialDerivative.answer.impact", {
                w: "w₂",
                val: "3",
              })}
            </p>
            <p>{t("math.derivatives.partialDerivative.answer.conclusion")}</p>
          </div>
        </div>
      </section>

      {/* Gradient */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.derivatives.gradient.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.derivatives.gradient.description")}
        </p>
        <div className="bg-gray-800 rounded-lg p-5 font-mono text-sm space-y-4">
          <div className="space-y-3 text-center text-xs">
            <div>
              <p className="text-gray-500 mb-1">
                {t("math.derivatives.gradient.twoWeights")}
              </p>
              <p>
                gradient = [∂erreur/∂w<sub>1</sub>, ∂erreur/∂w<sub>2</sub>] = [
                <span className="text-amber-400">4</span>,{" "}
                <span className="text-amber-400">3</span>]
              </p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">
                {t("math.derivatives.gradient.nWeights")}
              </p>
              <p>
                gradient = [∂erreur/∂w<sub>1</sub>, ∂erreur/∂w<sub>2</sub>, ...,
                ∂erreur/∂w<sub>N</sub>]
              </p>
              <p className="text-gray-600 mt-1">
                {t("math.derivatives.gradient.nWeightsNote")}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-3 space-y-1 text-xs text-gray-500 text-center">
            <p>{t("math.derivatives.gradient.says")}</p>
            <p>
              {t("math.derivatives.gradient.impactSentence", {
                w: "w₁",
                val: "4",
                desc: t("math.derivatives.gradient.correctALot"),
              })}
            </p>
            <p>
              {t("math.derivatives.gradient.impactSentence", {
                w: "w₂",
                val: "3",
                desc: t("math.derivatives.gradient.correctABitLess"),
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Descente de gradient */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.derivatives.gradientDescent.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.derivatives.gradientDescent.description")}
        </p>
        <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
          <li>{t("math.derivatives.gradientDescent.step1")}</li>
          <li>{t("math.derivatives.gradientDescent.step2")}</li>
          <li>{t("math.derivatives.gradientDescent.step3")}</li>
          <li>{t("math.derivatives.gradientDescent.step4")}</li>
        </ol>

        <div className="bg-gray-800 rounded-lg p-5 font-mono text-sm space-y-4">
          <p className="text-xs text-gray-500 text-center">
            {t("math.derivatives.gradientDescent.formula")}
          </p>
          <p className="text-center text-base">
            <span className="text-white">w</span>
            <sub className="text-gray-500">nouveau</sub> ={" "}
            <span className="text-blue-400">w</span>
            <sub className="text-gray-500">ancien</sub> −{" "}
            <span className="text-green-400">lr</span> ×{" "}
            <span className="text-amber-400">gradient</span>
          </p>

          <div className="border-t border-gray-700 pt-3">
            <p className="text-xs text-gray-500 mb-3 text-center">
              {t("math.derivatives.gradientDescent.exampleIntro")}
            </p>

            <AnimatedMathOperation totalSteps={2} delay={1200}>
              {(step) => {
                const weights = [
                  {
                    name: "a",
                    val: "5.0",
                    grad: "4.0",
                    corr: "−0.4",
                    newVal: "4.6",
                  },
                  {
                    name: "b",
                    val: "2.0",
                    grad: "3.0",
                    corr: "−0.3",
                    newVal: "1.7",
                  },
                ];
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-2 max-w-lg mx-auto text-center text-xs">
                      <div className="text-gray-500">
                        {t(
                          "math.derivatives.gradientDescent.tableHeaders.weight",
                        )}
                      </div>
                      <div className="text-gray-500">
                        {t(
                          "math.derivatives.gradientDescent.tableHeaders.value",
                        )}
                      </div>
                      <div className="text-gray-500">
                        {t(
                          "math.derivatives.gradientDescent.tableHeaders.gradient",
                        )}
                      </div>
                      <div className="text-gray-500">
                        {t(
                          "math.derivatives.gradientDescent.tableHeaders.correction",
                        )}
                      </div>
                      <div className="text-gray-500">
                        {t("math.derivatives.gradientDescent.tableHeaders.new")}
                      </div>
                      {weights.map((w, i) => {
                        const visible = step === -1 || step >= i;
                        const active = step === i;
                        return (
                          <span
                            key={i}
                            className={`contents transition-all duration-300 ${!visible ? "opacity-0" : ""}`}
                          >
                            <div
                              className={
                                active
                                  ? "text-blue-400 font-bold"
                                  : "text-blue-400"
                              }
                            >
                              {w.name}
                            </div>
                            <div className="text-white">{w.val}</div>
                            <div
                              className={
                                active
                                  ? "text-amber-400 ring-2 ring-amber-500/40 bg-amber-500/10 rounded px-1"
                                  : "text-amber-400"
                              }
                            >
                              {w.grad}
                            </div>
                            <div className="text-red-400">{w.corr}</div>
                            <div
                              className={
                                active
                                  ? "text-green-400 font-bold ring-2 ring-green-500/40 bg-green-500/10 rounded px-1"
                                  : "text-green-400"
                              }
                            >
                              {w.newVal}
                            </div>
                          </span>
                        );
                      })}
                    </div>
                    {step >= 0 && (
                      <div className="text-center text-xs text-gray-600 border-t border-gray-700 pt-2">
                        {weights[step].name} :{" "}
                        <span className="text-white">{weights[step].val}</span>{" "}
                        − <span className="text-green-400">0.1</span> ×{" "}
                        <span className="text-amber-400">
                          {weights[step].grad}
                        </span>{" "}
                        ={" "}
                        <span className="text-white">{weights[step].val}</span>{" "}
                        −{" "}
                        <span className="text-red-400">
                          {weights[step].corr.replace("−", "")}
                        </span>{" "}
                        ={" "}
                        <span className="text-green-400">
                          {weights[step].newVal}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }}
            </AnimatedMathOperation>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          {t("math.derivatives.gradientDescent.note")}
        </p>
      </section>

      {/* Taux d'apprentissage */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.derivatives.learningRate.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.derivatives.learningRate.description")}
        </p>
        <div className="bg-gray-800 rounded-lg p-5 text-sm space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <p className="text-red-400 font-semibold">
                {t("math.derivatives.learningRate.tooLarge.title")}
              </p>
              <div className="text-2xl">🏓</div>
              <p className="text-xs text-gray-500">
                {t("math.derivatives.learningRate.tooLarge.description")}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-green-400 font-semibold">
                {t("math.derivatives.learningRate.correct.title")}
              </p>
              <div className="text-2xl">🎯</div>
              <p className="text-xs text-gray-500">
                {t("math.derivatives.learningRate.correct.description")}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-amber-400 font-semibold">
                {t("math.derivatives.learningRate.tooSmall.title")}
              </p>
              <div className="text-2xl">🐌</div>
              <p className="text-xs text-gray-500">
                {t("math.derivatives.learningRate.tooSmall.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rétropropagation */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.derivatives.backpropagation.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.derivatives.backpropagation.description")}
        </p>
        <div className="bg-gray-800 rounded-lg p-5 text-sm space-y-4">
          <p className="text-xs text-gray-500 text-center">
            {t("math.derivatives.backpropagation.chainRule")}
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap font-mono">
            <div className="px-3 py-1.5 rounded bg-blue-500/10 text-blue-400 text-xs">
              {t("math.derivatives.backpropagation.input")}
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-1.5 rounded bg-green-500/10 text-green-400 text-xs">
              {t("math.derivatives.backpropagation.layer", { n: 1 })}
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-1.5 rounded bg-purple-500/10 text-purple-400 text-xs">
              {t("math.derivatives.backpropagation.layer", { n: 2 })}
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-1.5 rounded bg-amber-500/10 text-amber-400 text-xs">
              {t("math.derivatives.backpropagation.layer", { n: 3 })}
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-1.5 rounded bg-red-500/10 text-red-400 text-xs">
              {t("math.derivatives.backpropagation.error")}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap font-mono">
            <div className="px-3 py-1.5 rounded bg-blue-500/10 text-blue-400 text-xs">
              {t("math.derivatives.backpropagation.gradientLabel")}
            </div>
            <span className="text-gray-600">←</span>
            <div className="px-3 py-1.5 rounded bg-green-500/10 text-green-400 text-xs">
              {t("math.derivatives.backpropagation.gradientLabel")}
            </div>
            <span className="text-gray-600">←</span>
            <div className="px-3 py-1.5 rounded bg-purple-500/10 text-purple-400 text-xs">
              {t("math.derivatives.backpropagation.gradientLabel")}
            </div>
            <span className="text-gray-600">←</span>
            <div className="px-3 py-1.5 rounded bg-amber-500/10 text-amber-400 text-xs">
              {t("math.derivatives.backpropagation.gradientLabel")}
            </div>
            <span className="text-gray-600">←</span>
            <div className="px-3 py-1.5 rounded bg-red-500/10 text-red-400 text-xs">
              {t("math.derivatives.backpropagation.errorGradient")}
            </div>
          </div>

          <div className="border-t border-gray-700 pt-3 space-y-2 text-xs text-gray-500">
            <p className="font-semibold text-gray-400">
              {t("math.derivatives.backpropagation.chainRuleExplained")}
            </p>
            <p>{t("math.derivatives.backpropagation.chainRuleDescription")}</p>
            <p className="font-mono text-center text-gray-400">
              ∂Erreur/∂couche1 = ∂couche2/∂couche1 × ∂couche3/∂couche2 ×
              ∂Erreur/∂couche3
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {t("math.derivatives.backpropagation.note")}
        </p>
      </section>

      {/* Lien avec le pipeline */}
      <section className="card space-y-3">
        <h2 className="text-lg font-semibold text-white">
          {t("math.derivatives.pipelineLink.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.derivatives.pipelineLink.description")}
        </p>
        <ul className="text-sm text-gray-400 space-y-2">
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>
              <Link
                to="/training/loss"
                className="text-primary-400 hover:underline font-semibold"
              >
                {t("math.derivatives.pipelineLink.lossLink")}
              </Link>{" "}
              {t("math.derivatives.pipelineLink.lossDesc")}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>
              <Link
                to="/training/backpropagation"
                className="text-primary-400 hover:underline font-semibold"
              >
                {t("math.derivatives.pipelineLink.backpropLink")}
              </Link>{" "}
              {t("math.derivatives.pipelineLink.backpropDesc")}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>
              <Link
                to="/training/recap"
                className="text-primary-400 hover:underline font-semibold"
              >
                {t("math.derivatives.pipelineLink.recapLink")}
              </Link>{" "}
              {t("math.derivatives.pipelineLink.recapDesc")}
            </span>
          </li>
        </ul>
      </section>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        {prev ? (
          <Link
            to={prev.path}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {prev.title}
          </Link>
        ) : (
          <div />
        )}
        {next && (
          <Link
            to={next.path}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {next.title}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
