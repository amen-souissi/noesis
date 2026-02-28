/**
 * Étape 1 : Tokenisation — Du texte aux nombres
 *
 * Page enrichie avec :
 * - Problématique : pourquoi un ordinateur ne peut pas lire du texte
 * - Analogie du dictionnaire
 * - Exemple concret avec "Le chat"
 * - Comparaison caractère vs sous-mot vs mot entier
 *
 * @module pages/training-steps/TokenizationStep
 */

import { useTranslation } from "react-i18next";
import StepExplainer from "@/components/educational/StepExplainer";
import ConcreteCalculation from "@/components/educational/ConcreteCalculation";
import DeepDiveSection from "@/components/educational/DeepDiveSection";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";
import TokenGrid from "@/components/visualizations/TokenGrid";
import AnimatedMathOperation from "@/components/visualizations/AnimatedMathOperation";
import {
  EXAMPLE_TOKENIZATION,
  EXAMPLE_ATTENTION_DETAILED,
} from "@/lib/exampleData";

/** Tokens « Le chat » — les 7 premiers, utilisés dans tout le pipeline */
const TOKS = EXAMPLE_ATTENTION_DETAILED.tokens;
const TOK_IDS = EXAMPLE_ATTENTION_DETAILED.tokenIds;

export default function TokenizationStep() {
  const { t } = useTranslation("pages");
  return (
    <StepExplainer
      sectionId="training/tokenization"
      phase="training"
      stepNumber={1}
      totalSteps={8}
      title={t("training.tokenization.title")}
      subtitle={t("training.tokenization.subtitle")}
      exampleContext={t("training.tokenization.exampleContext")}
      docSlug="tokenizer"
      explanation={
        <>
          {/* ─── Le problème ─── */}
          <div className="bg-red-900/15 border border-red-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-red-300 font-semibold text-sm">
              {t("training.tokenization.problem.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.tokenization.problem.description1")}
            </p>
            <p className="text-gray-300 text-sm">
              {t("training.tokenization.problem.description2")}
            </p>
          </div>

          {/* ─── L'idée ─── */}
          <p>
            {t("training.tokenization.explanation.before")}{" "}
            <VulgarizedTerm termKey="tokenizer">
              {t("training.tokenization.explanation.tokenization")}
            </VulgarizedTerm>{" "}
            {t("training.tokenization.explanation.middle")}{" "}
            <strong>{t("training.tokenization.explanation.vocab")}</strong> —{" "}
            {t("training.tokenization.explanation.dictDesc")}{" "}
            <strong>{t("training.tokenization.explanation.token")}</strong>
            {t("training.tokenization.explanation.after")}
          </p>

          {/* ─── Le tableau de correspondance ─── */}
          <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-amber-300 font-semibold text-sm">
              {t("training.tokenization.vocab.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.tokenization.vocab.description")}
            </p>
            <div className="bg-gray-900 rounded p-3 overflow-x-auto">
              <table className="text-xs font-mono w-full">
                <thead>
                  <tr className="text-gray-500">
                    <td className="pr-2 pb-1">
                      {t("training.tokenization.vocab.headers.character")}
                    </td>
                    {Object.entries(EXAMPLE_TOKENIZATION.vocab).map(
                      ([char]) => (
                        <td
                          key={char}
                          className="px-1.5 pb-1 text-center text-primary-400"
                        >
                          {char === " " ? "⎵" : char}
                        </td>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-white border-t border-gray-800">
                    <td className="pr-2 pt-1 text-gray-500">
                      {t("training.tokenization.vocab.headers.id")}
                    </td>
                    {Object.entries(EXAMPLE_TOKENIZATION.vocab).map(
                      ([char, id]) => (
                        <td
                          key={char}
                          className="px-1.5 pt-1 text-center text-amber-300"
                        >
                          {id}
                        </td>
                      ),
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-400 text-xs">
              {t("training.tokenization.vocab.note")}
            </p>
          </div>

          {/* ─── Tokens spéciaux BOS / EOS ─── */}
          <div className="bg-purple-900/15 border border-purple-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-purple-300 font-semibold text-sm">
              {t("training.tokenization.specialTokens.title")}
            </h4>
            <p className="text-gray-300 text-sm">
              {t("training.tokenization.specialTokens.description")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-900 rounded p-3 space-y-1">
                <p className="text-purple-300 font-mono text-xs font-bold">
                  <VulgarizedTerm termKey="bos_token">
                    &lt;BOS&gt;
                  </VulgarizedTerm>{" "}
                  — Beginning of Sentence
                </p>
                <p className="text-gray-400 text-xs">
                  {t("training.tokenization.specialTokens.bos.description")}
                </p>
              </div>
              <div className="bg-gray-900 rounded p-3 space-y-1">
                <p className="text-purple-300 font-mono text-xs font-bold">
                  <VulgarizedTerm termKey="eos_token">
                    &lt;EOS&gt;
                  </VulgarizedTerm>{" "}
                  — End of Sentence
                </p>
                <p className="text-gray-400 text-xs">
                  {t("training.tokenization.specialTokens.eos.description")}
                </p>
              </div>
            </div>
            <div className="bg-gray-900 rounded p-3 font-mono text-xs text-center space-y-1">
              <p className="text-gray-500">
                {t("training.tokenization.specialTokens.pseudocode")}
              </p>
              <p>
                <span className="text-purple-400">&lt;BOS&gt;</span> Le chat{" "}
                <span className="text-purple-400">&lt;EOS&gt;</span>{" "}
                <span className="text-purple-400">&lt;BOS&gt;</span>{" "}
                {t("training.tokenization.specialTokens.exampleSentence2")}{" "}
                <span className="text-purple-400">&lt;EOS&gt;</span>
              </p>
            </div>
            <p className="text-gray-500 text-xs">
              {t("training.tokenization.specialTokens.note")}
            </p>
          </div>

          {/* ─── Caractère vs sous-mot vs mot ─── */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <h4 className="text-gray-200 font-semibold text-sm">
              {t("training.tokenization.comparison.title")}
            </h4>
            <p className="text-gray-400 text-sm">
              {t("training.tokenization.comparison.description")}
            </p>
            <div className="space-y-3 mt-2">
              <div className="bg-gray-900 rounded p-3">
                <p className="text-primary-400 font-semibold text-xs mb-1">
                  {t("training.tokenization.comparison.charLevel.title")}
                </p>
                <p className="font-mono text-xs text-gray-300">
                  → [a, n, t, i, c, o, n, s, t, i, t, u, t, i, o, n, n, e, l, l,
                  e, m, e, n, t]
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {t("training.tokenization.comparison.charLevel.note")}
                </p>
              </div>
              <div className="bg-gray-900 rounded p-3">
                <p className="text-purple-400 font-semibold text-xs mb-1">
                  {t("training.tokenization.comparison.subword.title")}
                </p>
                <p className="font-mono text-xs text-gray-300">
                  → [anti, constitu, tion, nelle, ment]
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {t("training.tokenization.comparison.subword.note")}
                </p>
              </div>
              <div className="bg-gray-900 rounded p-3">
                <p className="text-green-400 font-semibold text-xs mb-1">
                  {t("training.tokenization.comparison.word.title")}
                </p>
                <p className="font-mono text-xs text-gray-300">
                  → [anticonstitutionnellement]
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {t("training.tokenization.comparison.word.note")}
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              {t("training.tokenization.comparison.conclusionBefore")}{" "}
              <strong>
                {t("training.tokenization.comparison.conclusionLevel")}
              </strong>
              {t("training.tokenization.comparison.conclusionAfter", {
                vocabSize: EXAMPLE_TOKENIZATION.vocabSize,
              })}
            </p>
          </div>
        </>
      }
      calculation={
        <div className="space-y-8">
          {/* ─── Exemple concret ─── */}
          <ConcreteCalculation
            title={t("training.tokenization.calculation.concreteTitle")}
            description={t(
              "training.tokenization.calculation.concreteDescription",
            )}
          >
            <div className="space-y-6">
              {/* Étape 1 : inventorier les caractères */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.tokenization.calculation.step1Title")}
                </h4>
                <div className="text-sm text-gray-400 space-y-2">
                  <p>
                    {t("training.tokenization.calculation.step1Description")}
                  </p>
                  <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                    <p>
                      {t("training.tokenization.calculation.step1TextLabel")} «{" "}
                      <span className="text-primary-400">Le chat</span> »
                    </p>
                    <p className="mt-2">
                      {t("training.tokenization.calculation.step1UniqueChars")}
                      <span className="text-amber-300 ml-2">⎵ L a c e h t</span>
                    </p>
                    <p className="mt-1">
                      →{" "}
                      {t("training.tokenization.calculation.step1VocabOf", {
                        vocabSize: EXAMPLE_TOKENIZATION.vocabSize,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Étape 2 : attribuer les IDs */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.tokenization.calculation.step2Title")}
                </h4>
                <div className="text-sm text-gray-400 space-y-2">
                  <p>
                    {t("training.tokenization.calculation.step2Description")}
                  </p>
                  <div className="bg-gray-900 rounded p-3 font-mono text-xs space-y-1">
                    {Object.entries(EXAMPLE_TOKENIZATION.vocab).map(
                      ([char, id]) => (
                        <p key={char}>
                          «{" "}
                          <span className="text-primary-400">
                            {char === " " ? "⎵" : char}
                          </span>{" "}
                          » → <strong className="text-white">{id}</strong>
                        </p>
                      ),
                    )}
                  </div>
                  <p className="text-gray-500 text-xs">
                    {t("training.tokenization.calculation.step2Note")}
                  </p>
                </div>
              </div>

              {/* Étape 3 : convertir la phrase — animé */}
              <div className="bg-gray-800/30 rounded-lg p-4 space-y-3 border border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">
                  {t("training.tokenization.calculation.step3Title")}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("training.tokenization.calculation.step3Description")}
                </p>
                <div className="bg-gray-900 rounded-lg p-4">
                  <AnimatedMathOperation totalSteps={TOKS.length} delay={800}>
                    {(step) => (
                      <div className="font-mono text-xs space-y-3">
                        {/* La phrase avec highlight du caractère actif */}
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-gray-500 mr-1">
                            {t("training.tokenization.calculation.textLabel")}
                          </span>
                          {TOKS.map((c, i) => {
                            const active = step === i;
                            const done = step > i || step === -1;
                            return (
                              <span
                                key={i}
                                className={`inline-block min-w-[1.5rem] text-center px-1.5 py-0.5 rounded transition-all duration-300 ${
                                  active
                                    ? "text-primary-300 ring-2 ring-primary-500/40 bg-primary-500/10 font-bold"
                                    : done
                                      ? "text-primary-400"
                                      : "text-gray-700"
                                }`}
                              >
                                {c}
                              </span>
                            );
                          })}
                        </div>

                        {/* Le lookup actif */}
                        {step >= 0 && (
                          <div className="flex items-center gap-3 ring-2 ring-amber-500/30 bg-amber-500/5 rounded p-2 transition-all duration-300">
                            <span className="text-primary-300 font-bold text-sm">
                              « {TOKS[step]} »
                            </span>
                            <span className="text-gray-600">
                              {t(
                                "training.tokenization.calculation.step3Lookup",
                              )}
                            </span>
                            <span className="text-amber-300 font-bold text-lg">
                              ID {TOK_IDS[step]}
                            </span>
                          </div>
                        )}

                        {/* La séquence résultat qui se construit */}
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-gray-500 mr-1">
                            {t("training.tokenization.calculation.idsLabel")}
                          </span>
                          <span className="text-gray-600">[</span>
                          {TOKS.map((_, i) => {
                            const active = step === i;
                            const done = step > i || step === -1;
                            const visible = done || active;
                            return (
                              <span key={i}>
                                <span
                                  className={`inline-block min-w-[1.5rem] text-center transition-all duration-300 ${
                                    active
                                      ? "text-amber-300 ring-2 ring-amber-500/40 bg-amber-500/10 rounded px-1 font-bold"
                                      : done
                                        ? "text-amber-400"
                                        : "text-gray-700"
                                  }`}
                                >
                                  {visible ? TOK_IDS[i] : "?"}
                                </span>
                                {i < TOKS.length - 1 && (
                                  <span className="text-gray-700">, </span>
                                )}
                              </span>
                            );
                          })}
                          <span className="text-gray-600">]</span>
                        </div>

                        {/* Message final */}
                        {(step >= TOKS.length - 1 || step === -1) && (
                          <p className="text-green-300 text-xs font-medium border-t border-gray-800 pt-2">
                            {t("training.tokenization.calculation.step3Final")}
                          </p>
                        )}
                      </div>
                    )}
                  </AnimatedMathOperation>
                </div>
              </div>
            </div>
          </ConcreteCalculation>

          {/* ─── Grille interactive ─── */}
          <ConcreteCalculation
            title={t("training.tokenization.calculation.gridTitle")}
            description={t("training.tokenization.calculation.gridDescription")}
          >
            <TokenGrid
              chars={EXAMPLE_TOKENIZATION.chars}
              ids={EXAMPLE_TOKENIZATION.ids}
              vocab={EXAMPLE_TOKENIZATION.vocab}
              showVocab
            />
          </ConcreteCalculation>

          {/* ─── En résumé ─── */}
          <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-4 space-y-3">
            <h4 className="text-green-300 font-semibold text-sm">
              {t("training.tokenization.summary.title")}
            </h4>

            {/* ENTRÉE */}
            <div className="bg-blue-900/20 border border-blue-800/30 rounded p-3">
              <p className="text-blue-300 font-semibold text-[10px] uppercase tracking-wide mb-2">
                ▸ {t("training.tokenization.summary.inputLabel")}
              </p>
              <div className="font-mono text-xs">
                <p>{t("training.tokenization.summary.inputText")}</p>
              </div>
            </div>

            <div className="text-center text-gray-600">↓</div>

            {/* OPÉRATION */}
            <div className="bg-gray-800/50 border border-gray-700 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-gray-300 font-semibold text-[10px] uppercase tracking-wide">
                  ▸ {t("training.tokenization.summary.operationLabel")}
                </p>
                <span className="text-blue-400 text-[10px] bg-blue-900/30 px-1.5 py-0.5 rounded">
                  {t("training.tokenization.summary.operationTag")}
                </span>
              </div>
              <div className="font-mono text-xs">
                <p className="text-gray-400">
                  {t("training.tokenization.summary.operationText")}
                </p>
              </div>
            </div>

            <div className="text-center text-gray-600">↓</div>

            {/* SORTIE */}
            <div className="bg-green-900/20 border border-green-800/30 rounded p-3">
              <p className="text-green-300 font-semibold text-[10px] uppercase tracking-wide mb-2">
                ▸ {t("training.tokenization.summary.outputLabel")}
              </p>
              <div className="font-mono text-xs">
                <p>
                  « <span className="text-primary-400">Le chat</span> » → [
                  <span className="text-amber-300">
                    {EXAMPLE_TOKENIZATION.ids.join(", ")}
                  </span>
                  ]
                </p>
              </div>
            </div>

            <p className="text-gray-500 text-xs">
              {t("training.tokenization.summary.note")}
            </p>
          </div>
        </div>
      }
      deepDive={
        <DeepDiveSection
          title={t("training.tokenization.deepDive.title")}
          docSlug="tokenizer"
        >
          <div className="text-sm text-gray-300 space-y-3">
            <p>{t("training.tokenization.deepDive.bpeIntro")}</p>
            <p>{t("training.tokenization.deepDive.bpePrinciple")}</p>
            <div className="bg-gray-900 rounded p-3 text-xs font-mono space-y-1">
              <p className="text-gray-500">
                {t("training.tokenization.deepDive.bpeStep0")}
              </p>
              <p>
                « chatton » → [c, h, a, t, t, o, n]{" "}
                <span className="text-gray-600">
                  {t("training.tokenization.deepDive.bpe7tokens")}
                </span>
              </p>
              <p className="text-gray-500 mt-2">
                {t("training.tokenization.deepDive.bpeMerge1")}
              </p>
              <p>
                « chatton » → [ch, a, t, t, o, n]{" "}
                <span className="text-gray-600">
                  {t("training.tokenization.deepDive.bpe6tokens")}
                </span>
              </p>
              <p className="text-gray-500 mt-2">
                {t("training.tokenization.deepDive.bpeMerge2")}
              </p>
              <p>
                « chatton » → [chat, t, on]{" "}
                <span className="text-gray-600">
                  {t("training.tokenization.deepDive.bpe3tokens")}
                </span>
              </p>
            </div>
            <p>{t("training.tokenization.deepDive.bpeResult")}</p>
            <p className="text-gray-500">
              {t("training.tokenization.deepDive.bpeNote")}
            </p>
          </div>
        </DeepDiveSection>
      }
    />
  );
}
