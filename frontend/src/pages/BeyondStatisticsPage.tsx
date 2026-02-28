/**
 * Aller plus loin : au-delà de la statistique
 *
 * Section conclusive du parcours éducatif. Explore les questions profondes
 * sur la nature des LLM : mots inconnus, programmes encodés dans les poids,
 * grokking, émergence, et interprétabilité mécaniste.
 *
 * @module pages/BeyondStatisticsPage
 */

import { useProgress } from "@/hooks/useProgress";
import { Link } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

/* ─── Données pour le graphique du Grokking ─── */
const GROKKING_DATA = [
  // Phase 1 : mémorisation — loss entraînement descend, test stagne à 0
  { step: 0, train: 50, test: 5 },
  { step: 500, train: 85, test: 5 },
  { step: 1000, train: 95, test: 6 },
  { step: 1500, train: 99, test: 5 },
  { step: 2000, train: 100, test: 6 },
  { step: 2500, train: 100, test: 5 },
  { step: 3000, train: 100, test: 7 },
  { step: 3500, train: 100, test: 6 },
  { step: 4000, train: 100, test: 8 },
  { step: 4500, train: 100, test: 7 },
  // Phase 2 : grokking — test monte brutalement
  { step: 5000, train: 100, test: 10 },
  { step: 5200, train: 100, test: 25 },
  { step: 5400, train: 100, test: 55 },
  { step: 5500, train: 100, test: 78 },
  { step: 5600, train: 100, test: 92 },
  { step: 5800, train: 100, test: 97 },
  { step: 6000, train: 100, test: 99 },
  { step: 6500, train: 100, test: 100 },
  { step: 7000, train: 100, test: 100 },
];

export default function BeyondStatisticsPage() {
  const { t } = useTranslation("pages");
  useProgress("deeper/beyond");

  return (
    <div className="space-y-10 max-w-4xl">
      {/* ─── Hero ─── */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Compass className="w-6 h-6 text-indigo-400" />
          <span className="text-sm text-indigo-300">{t("beyond.badge")}</span>
        </div>
        <h1 className="text-4xl font-bold text-white">
          {t("beyond.title")}{" "}
          <span className="text-indigo-400">{t("beyond.titleHighlight")}</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          {t("beyond.subtitle")}
        </p>
        <p className="text-sm text-gray-500 max-w-xl mx-auto italic">
          {t("beyond.italic")}
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 : LE PARADOXE DES MOTS INCONNUS                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">
          {t("beyond.unknownWords.sectionTitle")}
        </h2>

        <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-5 space-y-4">
          <h3 className="text-amber-300 font-semibold">
            {t("beyond.unknownWords.experiment.title")}
          </h3>
          <p className="text-gray-300 text-sm">
            {t("beyond.unknownWords.experiment.description1")}
          </p>
          <p className="text-gray-300 text-sm">
            {t("beyond.unknownWords.experiment.description2")}
          </p>

          <div className="bg-gray-900 rounded-lg p-4 space-y-3">
            <p className="text-gray-400 text-xs font-medium">
              {t("beyond.unknownWords.experiment.twoModelsLabel")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-950 rounded p-3 space-y-1">
                <p className="text-purple-400 font-mono text-xs font-bold">
                  {t("beyond.unknownWords.experiment.gptTitle")}
                </p>
                <p className="text-gray-500 text-xs italic">
                  {t("beyond.unknownWords.experiment.gptPrompt")}
                </p>
                <p className="text-gray-300 text-xs">
                  {t("beyond.unknownWords.experiment.gptResponse")}
                </p>
                <p className="text-green-400 text-[10px]">
                  {t("beyond.unknownWords.experiment.gptNote")}
                </p>
              </div>
              <div className="bg-gray-950 rounded p-3 space-y-1">
                <p className="text-amber-400 font-mono text-xs font-bold">
                  {t("beyond.unknownWords.experiment.miniTitle")}
                </p>
                <p className="text-gray-500 text-xs italic">
                  {t("beyond.unknownWords.experiment.miniPrompt")}
                </p>
                <p className="text-gray-300 text-xs">
                  {t("beyond.unknownWords.experiment.miniResponse")}
                </p>
                <p className="text-amber-400 text-[10px]">
                  {t("beyond.unknownWords.experiment.miniNote")}
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-sm font-medium">
            {t("beyond.unknownWords.experiment.conclusion")}
          </p>
        </div>

        {/* Tokenisation et mots inconnus */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 space-y-4">
          <h3 className="text-gray-200 font-semibold">
            {t("beyond.unknownWords.tokenization.title")}
          </h3>
          <p className="text-gray-400 text-sm">
            {t("beyond.unknownWords.tokenization.description")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gray-900 rounded p-3 space-y-2">
              <p className="text-amber-400 font-mono text-xs font-bold">
                {t("beyond.unknownWords.tokenization.charLevel.title")}
              </p>
              <div className="font-mono text-xs text-center">
                <span className="text-amber-300">K</span> ·{" "}
                <span className="text-amber-300">e</span> ·{" "}
                <span className="text-amber-300">r</span> ·{" "}
                <span className="text-amber-300">v</span> ·{" "}
                <span className="text-amber-300">a</span> ·{" "}
                <span className="text-amber-300">d</span> ·{" "}
                <span className="text-amber-300">a</span> ·{" "}
                <span className="text-amber-300">l</span> ·{" "}
                <span className="text-amber-300">e</span> ·{" "}
                <span className="text-amber-300">c</span>
              </div>
              <p className="text-gray-500 text-xs">
                {t("beyond.unknownWords.tokenization.charLevel.description")}
              </p>
            </div>
            <div className="bg-gray-900 rounded p-3 space-y-2">
              <p className="text-green-400 font-mono text-xs font-bold">
                {t("beyond.unknownWords.tokenization.bpe.title")}
              </p>
              <div className="font-mono text-xs text-center">
                <span className="text-green-300">Ker</span> ·{" "}
                <span className="text-green-300">vad</span> ·{" "}
                <span className="text-green-300">al</span> ·{" "}
                <span className="text-green-300">ec</span>
              </div>
              <p className="text-gray-500 text-xs">
                {t("beyond.unknownWords.tokenization.bpe.description")}
              </p>
            </div>
            <div className="bg-gray-900 rounded p-3 space-y-2">
              <p className="text-red-400 font-mono text-xs font-bold">
                {t("beyond.unknownWords.tokenization.wordLevel.title")}
              </p>
              <div className="font-mono text-xs text-center">
                <span className="text-red-300">&lt;UNK&gt;</span>
              </div>
              <p className="text-gray-500 text-xs">
                {t("beyond.unknownWords.tokenization.wordLevel.description")}
              </p>
            </div>
          </div>
        </div>

        {/* L'attention et le contexte */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 space-y-4">
          <h3 className="text-gray-200 font-semibold">
            {t("beyond.unknownWords.attention.title")}
          </h3>
          <p className="text-gray-400 text-sm">
            {t("beyond.unknownWords.attention.description")}
          </p>
          <div className="bg-gray-900 rounded p-4 text-xs space-y-2">
            <p className="font-mono">
              P(<span className="text-green-400">"Ker"</span> après "Demandez
              à",{" "}
              <span className="text-gray-500">
                {t("beyond.unknownWords.attention.probGeneral")}
              </span>
              ) →{" "}
              <span className="text-red-400">
                {t("beyond.unknownWords.attention.probLow")}
              </span>
              <span className="text-gray-600">
                {" "}
                {t("beyond.unknownWords.attention.probLowNote")}
              </span>
            </p>
            <p className="font-mono">
              P(<span className="text-green-400">"Ker"</span> après "Demandez
              à",{" "}
              <span className="text-primary-400">
                {t("beyond.unknownWords.attention.probContext")}
              </span>
              ) →{" "}
              <span className="text-green-400">
                {t("beyond.unknownWords.attention.probHigh")}
              </span>
              <span className="text-gray-600">
                {" "}
                {t("beyond.unknownWords.attention.probHighNote")}
              </span>
            </p>
          </div>
          <p className="text-gray-400 text-sm">
            {t("beyond.unknownWords.attention.conclusion")}
          </p>
        </div>

        {/* Structure, pas les mots */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 space-y-3">
          <h3 className="text-gray-200 font-semibold">
            {t("beyond.unknownWords.structure.title")}
          </h3>
          <p className="text-gray-400 text-sm">
            {t("beyond.unknownWords.structure.description1")}
          </p>
          <p className="text-gray-400 text-sm">
            {t("beyond.unknownWords.structure.description2")}
          </p>
          <p className="text-gray-500 text-sm italic">
            {t("beyond.unknownWords.structure.description3")}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 : LA RÉVÉLATION                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      <section className="space-y-6">
        <div className="bg-gradient-to-b from-purple-900/30 to-indigo-900/30 border border-purple-700/40 rounded-xl p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-purple-200">
              {t("beyond.programs.sectionTitle")}
            </h2>
          </div>

          <div className="bg-gray-900/60 rounded-lg p-5 space-y-3">
            <h3 className="text-purple-300 font-semibold text-sm">
              {t("beyond.programs.question.title")}
            </h3>
            <p className="text-gray-300 text-sm">
              {t("beyond.programs.question.description")}
            </p>
          </div>

          <div className="bg-gray-900/60 rounded-lg p-5 space-y-3">
            <h3 className="text-purple-300 font-semibold text-sm">
              {t("beyond.programs.insight.title")}
            </h3>
            <p className="text-gray-300 text-sm">
              {t("beyond.programs.insight.description")}
            </p>
            <div className="bg-gray-950 rounded p-4 font-mono text-xs space-y-3">
              <div>
                <p className="text-gray-500">
                  {t("beyond.programs.insight.weightsAreNotComment")}
                </p>
                <p className="text-red-400/70 mt-1">
                  {t("beyond.programs.insight.weightsAreNotExample")}
                </p>
                <p className="text-gray-600 text-[10px]">
                  {t("beyond.programs.insight.weightsAreNotNote")}
                </p>
              </div>
              <div>
                <p className="text-gray-500">
                  {t("beyond.programs.insight.weightsAreComment")}
                </p>
                <p className="text-green-400 mt-1">
                  {t("beyond.programs.insight.weightsAreLine1")}
                </p>
                <p className="text-green-400">
                  {t("beyond.programs.insight.weightsAreLine2")}
                </p>
                <p className="text-green-400">
                  {t("beyond.programs.insight.weightsAreLine3")}
                </p>
                <p className="text-green-400">
                  {t("beyond.programs.insight.weightsAreLine4")}
                </p>
                <p className="text-gray-600 text-[10px] mt-1">
                  {t("beyond.programs.insight.weightsAreNote")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/60 rounded-lg p-5 space-y-3">
            <h3 className="text-purple-300 font-semibold text-sm">
              {t("beyond.programs.analogy.title")}
            </h3>
            <p className="text-gray-400 text-sm">
              {t("beyond.programs.analogy.description1")}
            </p>
            <p className="text-gray-400 text-sm">
              {t("beyond.programs.analogy.description2")}
            </p>
          </div>

          {/* Q/K/V */}
          <div className="bg-gray-900/60 rounded-lg p-5 space-y-3">
            <h3 className="text-purple-300 font-semibold text-sm">
              {t("beyond.programs.qkv.title")}
            </h3>
            <p className="text-gray-400 text-sm">
              {t("beyond.programs.qkv.description")}
            </p>
            <div className="bg-gray-950 rounded p-4 text-xs text-center space-y-1 font-mono">
              <p>
                {t("beyond.programs.qkv.line1_pre")}{" "}
                <span className="text-primary-300">Q</span> ={" "}
                {t("beyond.programs.qkv.line1_post")}
              </p>
              <p className="text-gray-600">
                {t("beyond.programs.qkv.similarity")}
              </p>
              <p>
                {t("beyond.programs.qkv.line2_pre")}{" "}
                <span className="text-amber-300">K</span> ={" "}
                {t("beyond.programs.qkv.line2_post")}
              </p>
              <p className="text-gray-600">↓</p>
              <p>
                {t("beyond.programs.qkv.line3_pre")}{" "}
                <span className="text-green-400">
                  {t("beyond.programs.qkv.line3_highlight")}
                </span>
              </p>
            </div>
          </div>

          {/* Superposition */}
          <div className="bg-gray-900/60 rounded-lg p-5 space-y-3">
            <h3 className="text-purple-300 font-semibold text-sm">
              {t("beyond.programs.superposition.title")}
            </h3>
            <p className="text-gray-400 text-sm">
              {t("beyond.programs.superposition.description")}
            </p>
            <div className="bg-gray-950 rounded p-4 font-mono text-xs space-y-1">
              <p className="text-gray-500">
                {t("beyond.programs.superposition.comment")}
              </p>
              <p>
                {t("beyond.programs.superposition.contributes")}{" "}
                <span className="text-blue-400">+0.3</span>{" "}
                {t("beyond.programs.superposition.toConcept")}{" "}
                <span className="text-blue-300">
                  {t("beyond.programs.superposition.animal")}
                </span>
              </p>
              <p>
                {t("beyond.programs.superposition.contributes")}{" "}
                <span className="text-pink-400">-0.1</span>{" "}
                {t("beyond.programs.superposition.toConcept")}{" "}
                <span className="text-pink-300">
                  {t("beyond.programs.superposition.feminine")}
                </span>
              </p>
              <p>
                {t("beyond.programs.superposition.contributes")}{" "}
                <span className="text-amber-400">+0.7</span>{" "}
                {t("beyond.programs.superposition.toConcept")}{" "}
                <span className="text-amber-300">
                  {t("beyond.programs.superposition.subject")}
                </span>
              </p>
              <p>
                {t("beyond.programs.superposition.contributes")}{" "}
                <span className="text-green-400">+0.2</span>{" "}
                {t("beyond.programs.superposition.toConcept")}{" "}
                <span className="text-green-300">
                  {t("beyond.programs.superposition.recent")}
                </span>
              </p>
              <p className="text-gray-600">
                {t("beyond.programs.superposition.andMore")}
              </p>
            </div>
            <p className="text-gray-400 text-sm">
              {t("beyond.programs.superposition.conclusion")}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 : DE LA MÉMORISATION À LA COMPRÉHENSION             */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">
          {t("beyond.grokking.sectionTitle")}
        </h2>
        <p className="text-gray-400">{t("beyond.grokking.description")}</p>

        {/* Le grokking */}
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-5 space-y-4">
          <h3 className="text-blue-300 font-semibold">
            {t("beyond.grokking.chartTitle")}
          </h3>
          <p
            className="text-gray-400 text-sm"
            dangerouslySetInnerHTML={{
              __html: t("beyond.grokking.chartIntro"),
            }}
          />
          <div className="bg-gray-900 rounded-lg p-4 space-y-3">
            <p className="text-gray-400 text-xs font-medium text-center mb-2">
              {t("beyond.grokking.chartAccuracyLabel")}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={GROKKING_DATA}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <defs>
                  <linearGradient id="gradTrain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradTest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="step"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  tickFormatter={(v: number) => `${v / 1000}k`}
                  label={{
                    value: t("beyond.grokking.chartXAxisLabel"),
                    position: "insideBottom",
                    offset: -2,
                    fill: "#6b7280",
                    fontSize: 10,
                  }}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  domain={[0, 100]}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  labelFormatter={(v: number) =>
                    t("beyond.grokking.chartStepLabel", { step: v })
                  }
                  formatter={(v: number, name: string) => [
                    `${v}%`,
                    name === "train"
                      ? t("beyond.grokking.chartTrainLabel")
                      : t("beyond.grokking.chartTestNeverSeen"),
                  ]}
                />
                <ReferenceLine
                  x={5000}
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  label={{
                    value: "grokking",
                    fill: "#818cf8",
                    fontSize: 10,
                    position: "top",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="train"
                  stroke="#f59e0b"
                  fill="url(#gradTrain)"
                  strokeWidth={2}
                  name="train"
                />
                <Area
                  type="monotone"
                  dataKey="test"
                  stroke="#22c55e"
                  fill="url(#gradTest)"
                  strokeWidth={2}
                  name="test"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-6 justify-center text-[10px]">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 bg-amber-500 rounded" />{" "}
                {t("beyond.grokking.chartTrainLegend")}
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 bg-green-500 rounded" />{" "}
                {t("beyond.grokking.chartTestLegend")}
              </span>
            </div>
            <p
              className="text-gray-500 text-xs"
              dangerouslySetInnerHTML={{
                __html: t("beyond.grokking.chartExplanation"),
              }}
            />
          </div>

          <div className="bg-gray-900 rounded-lg p-4 space-y-2">
            <p className="text-gray-400 text-sm font-medium">
              {t("beyond.grokking.weightsReorgTitle")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-950 rounded p-3">
                <p className="text-red-400 font-semibold mb-1">
                  {t("beyond.grokking.phase1.title")}
                </p>
                <div className="font-mono text-gray-500 space-y-0.5">
                  <p>
                    "1+2" → 3{" "}
                    <span className="text-gray-700">
                      ({t("beyond.grokking.phase1.seen")})
                    </span>
                  </p>
                  <p>
                    "3+4" → 7{" "}
                    <span className="text-gray-700">
                      ({t("beyond.grokking.phase1.seen")})
                    </span>
                  </p>
                  <p>
                    "5+6" → ??{" "}
                    <span className="text-red-500">
                      ({t("beyond.grokking.phase1.neverSeen")})
                    </span>
                  </p>
                </div>
                <p className="text-gray-600 mt-1">
                  {t("beyond.grokking.phase1.note")}
                </p>
              </div>
              <div className="bg-gray-950 rounded p-3">
                <p className="text-green-400 font-semibold mb-1">
                  {t("beyond.grokking.phase2.title")}
                </p>
                <div className="font-mono text-gray-500 space-y-0.5">
                  <p>extract(a) → 5</p>
                  <p>extract(b) → 6</p>
                  <p>
                    addition(5, 6) →{" "}
                    <span className="text-green-400">11 ✓</span>
                  </p>
                </div>
                <p className="text-gray-600 mt-1">
                  {t("beyond.grokking.phase2.note")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Les conditions */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 space-y-4">
          <h3 className="text-gray-200 font-semibold">
            {t("beyond.grokking.conditions.title")}
          </h3>
          <div className="space-y-3">
            {(
              ["condition1", "condition2", "condition3", "condition4"] as const
            ).map((key, i) => (
              <div key={key} className="flex items-start gap-3">
                <span className="text-amber-400 font-mono text-xs font-bold mt-0.5">
                  {i + 1}.
                </span>
                <div>
                  <p className="text-gray-300 text-sm font-medium">
                    {t(`beyond.grokking.conditions.${key}.title`)}
                  </p>
                  <p
                    className="text-gray-500 text-xs"
                    dangerouslySetInnerHTML={{
                      __html: t(
                        `beyond.grokking.conditions.${key}.description`,
                      ),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 4 : L'ÉMERGENCE                                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">
          {t("beyond.emergence.sectionTitle")}
        </h2>
        <p className="text-gray-400">{t("beyond.emergence.description")}</p>

        {/* Progression scale */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 space-y-4">
          <h3 className="text-gray-200 font-semibold">
            {t("beyond.emergence.progression.title")}
          </h3>
          <div className="space-y-3">
            {(
              [
                {
                  key: "level1",
                  barW: "w-12",
                  barColor: "bg-red-500/60",
                  labelColor: "text-red-400",
                },
                {
                  key: "level2",
                  barW: "w-24",
                  barColor: "bg-amber-500/60",
                  labelColor: "text-amber-400",
                },
                {
                  key: "level3",
                  barW: "w-40",
                  barColor: "bg-blue-500/60",
                  labelColor: "text-blue-400",
                },
                {
                  key: "level4",
                  barW: "w-full",
                  barColor: "bg-purple-500/60",
                  labelColor: "text-purple-400",
                },
              ] as const
            ).map(({ key, barW, barColor, labelColor }) => (
              <div key={key} className="flex items-start gap-4">
                <div className="w-28 flex-shrink-0 text-right">
                  <p className="text-gray-500 font-mono text-xs">
                    {t(`beyond.emergence.progression.${key}.params`)}
                  </p>
                  <p className="text-gray-600 text-[10px]">
                    {t(`beyond.emergence.progression.${key}.model`)}
                  </p>
                </div>
                <div className="flex-1 bg-gray-900 rounded p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`h-2 ${barW} ${barColor} rounded`} />
                    <span className={`${labelColor} text-xs font-semibold`}>
                      {t(`beyond.emergence.progression.${key}.label`)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {t(`beyond.emergence.progression.${key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 rounded p-3 text-center">
            <p
              className="text-gray-400 text-xs"
              dangerouslySetInnerHTML={{
                __html: t("beyond.emergence.progression.threshold"),
              }}
            />
          </div>
        </div>

        {/* Our model */}
        <div className="bg-primary-900/15 border border-primary-800/30 rounded-lg p-5 space-y-3">
          <h3 className="text-primary-300 font-semibold">
            {t("beyond.emergence.ourModel.title")}
          </h3>
          <p className="text-gray-400 text-sm">
            {t("beyond.emergence.ourModel.description1")}
          </p>
          <p
            className="text-gray-400 text-sm"
            dangerouslySetInnerHTML={{
              __html: t("beyond.emergence.ourModel.description2"),
            }}
          />
          <p
            className="text-gray-500 text-xs"
            dangerouslySetInnerHTML={{
              __html: t("beyond.emergence.ourModel.description3"),
            }}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 5 : LE COÛT DE L'ÉCHELLE                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">
          {t("beyond.cost.sectionTitle")}
        </h2>
        <p
          className="text-gray-400"
          dangerouslySetInnerHTML={{ __html: t("beyond.cost.description") }}
        />

        {/* Les données */}
        <div className="bg-amber-900/15 border border-amber-800/30 rounded-lg p-5 space-y-4">
          <h3 className="text-amber-300 font-semibold">
            {t("beyond.cost.data.title")}
          </h3>
          <p
            className="text-gray-400 text-sm"
            dangerouslySetInnerHTML={{
              __html: t("beyond.cost.data.description"),
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(["tokens", "rawData", "preparation"] as const).map((key) => (
              <div
                key={key}
                className="bg-gray-900 rounded p-3 space-y-1 text-center"
              >
                <p className="text-amber-300 font-mono text-lg font-bold">
                  {t(`beyond.cost.data.${key}.value`)}
                </p>
                <p className="text-gray-400 text-xs font-medium">
                  {t(`beyond.cost.data.${key}.label`)}
                </p>
                <p className="text-gray-600 text-[10px]">
                  {t(`beyond.cost.data.${key}.detail`)}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 rounded-lg p-4 space-y-2">
            <p className="text-gray-400 text-xs font-medium">
              {t("beyond.cost.data.sourcesTitle")}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {(
                [
                  { key: "webCrawl", color: "text-blue-400" },
                  { key: "books", color: "text-green-400" },
                  { key: "code", color: "text-purple-400" },
                  { key: "conversations", color: "text-amber-400" },
                ] as const
              ).map(({ key, color }) => (
                <div key={key} className="bg-gray-950 rounded p-2 text-center">
                  <p className={`${color} font-semibold`}>
                    {t(`beyond.cost.data.sources.${key}.title`)}
                  </p>
                  <p className="text-gray-600 text-[10px]">
                    {t(`beyond.cost.data.sources.${key}.detail`)}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-[10px]">
              {t("beyond.cost.data.sourcesNote")}
            </p>
          </div>
        </div>

        {/* L'infrastructure */}
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-5 space-y-4">
          <h3 className="text-blue-300 font-semibold">
            {t("beyond.cost.infrastructure.title")}
          </h3>
          <p
            className="text-gray-400 text-sm"
            dangerouslySetInnerHTML={{
              __html: t("beyond.cost.infrastructure.description"),
            }}
          />
          <div className="bg-gray-900 rounded-lg p-4 space-y-3">
            <div className="space-y-2">
              {(
                [
                  { key: "mini", color: "text-gray-400" },
                  { key: "gpt2", color: "text-amber-400" },
                  { key: "llama", color: "text-blue-400" },
                  { key: "gpt4", color: "text-purple-400" },
                ] as const
              ).map(({ key, color }) => (
                <div key={key} className="flex items-center gap-3 text-xs">
                  <span
                    className={`w-32 font-mono font-semibold ${color} flex-shrink-0`}
                  >
                    {t(`beyond.cost.infrastructure.rows.${key}.model`)}
                  </span>
                  <span className="w-16 text-gray-500 text-right flex-shrink-0">
                    {t(`beyond.cost.infrastructure.rows.${key}.params`)}
                  </span>
                  <span className="w-32 text-gray-500 flex-shrink-0">
                    {t(`beyond.cost.infrastructure.rows.${key}.gpu`)}
                  </span>
                  <span className="w-20 text-gray-500 flex-shrink-0">
                    {t(`beyond.cost.infrastructure.rows.${key}.time`)}
                  </span>
                  <span className="text-green-400 font-mono font-semibold">
                    {t(`beyond.cost.infrastructure.rows.${key}.cost`)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-[10px]">
              {t("beyond.cost.infrastructure.tableNote")}
            </p>
          </div>
          <p
            className="text-gray-400 text-sm"
            dangerouslySetInnerHTML={{
              __html: t("beyond.cost.infrastructure.gpuNote"),
            }}
          />
        </div>

        {/* L'entraînement vs l'inférence */}
        <div className="bg-purple-900/15 border border-purple-800/30 rounded-lg p-5 space-y-4">
          <h3 className="text-purple-300 font-semibold">
            {t("beyond.cost.trainingVsInference.title")}
          </h3>
          <p
            className="text-gray-400 text-sm"
            dangerouslySetInnerHTML={{
              __html: t("beyond.cost.trainingVsInference.description"),
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded p-4 space-y-2">
              <p className="text-red-400 font-semibold text-sm">
                {t("beyond.cost.trainingVsInference.trainingTitle")}
              </p>
              <ul className="text-gray-500 text-xs space-y-1 list-disc list-inside">
                {(["item1", "item2", "item3", "item4", "item5"] as const).map(
                  (key) => (
                    <li key={key}>
                      {t(
                        `beyond.cost.trainingVsInference.trainingItems.${key}`,
                      )}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="bg-gray-900 rounded p-4 space-y-2">
              <p className="text-green-400 font-semibold text-sm">
                {t("beyond.cost.trainingVsInference.inferenceTitle")}
              </p>
              <ul className="text-gray-500 text-xs space-y-1 list-disc list-inside">
                {(["item1", "item2", "item3", "item4", "item5"] as const).map(
                  (key) => (
                    <li key={key}>
                      {t(
                        `beyond.cost.trainingVsInference.inferenceItems.${key}`,
                      )}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
          <p
            className="text-gray-400 text-sm"
            dangerouslySetInnerHTML={{
              __html: t("beyond.cost.trainingVsInference.conclusion"),
            }}
          />
        </div>

        {/* Les défis */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 space-y-4">
          <h3 className="text-gray-200 font-semibold">
            {t("beyond.cost.challenges.title")}
          </h3>
          <div className="space-y-3">
            {(
              [
                "challenge1",
                "challenge2",
                "challenge3",
                "challenge4",
                "challenge5",
              ] as const
            ).map((key, i) => (
              <div key={key} className="flex items-start gap-3">
                <span className="text-red-400 font-mono text-xs font-bold mt-0.5">
                  {i + 1}.
                </span>
                <div>
                  <p className="text-gray-300 text-sm font-medium">
                    {t(`beyond.cost.challenges.${key}.title`)}
                  </p>
                  <p
                    className="text-gray-500 text-xs"
                    dangerouslySetInnerHTML={{
                      __html: t(`beyond.cost.challenges.${key}.description`),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pont vers notre modèle */}
        <div className="bg-primary-900/15 border border-primary-800/30 rounded-lg p-5 space-y-3">
          <h3 className="text-primary-300 font-semibold">
            Notre modèle : l'entraînement en miniature
          </h3>
          <p className="text-gray-400 text-sm">
            Notre MiniLLM s'entraîne en{" "}
            <strong>quelques minutes sur un CPU</strong> — pas besoin de cluster
            ni de budget. Le mécanisme est exactement le même (forward → loss →
            backward → update), mais à une échelle 1 000 000× plus petite.
          </p>
          <div className="bg-gray-900 rounded p-3 font-mono text-xs text-center space-y-1">
            <p>
              <span className="text-gray-500">Notre modèle :</span>{" "}
              <span className="text-primary-400">~50k poids</span> ×{" "}
              <span className="text-primary-400">~5 min</span> ×{" "}
              <span className="text-primary-400">1 CPU</span> ={" "}
              <span className="text-green-400">gratuit</span>
            </p>
            <p>
              <span className="text-gray-500">GPT-4 (estimé) :</span>{" "}
              <span className="text-purple-400">~1.8T poids</span> ×{" "}
              <span className="text-purple-400">~3 mois</span> ×{" "}
              <span className="text-purple-400">25 000 GPU</span> ={" "}
              <span className="text-red-400">~100M $</span>
            </p>
          </div>
          <p className="text-gray-500 text-xs">
            C'est l'avantage d'un modèle éducatif : on peut expérimenter,
            casser, recommencer — sans conséquence. Les vrais modèles n'ont pas
            ce luxe.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SECTION 6 : LA RECHERCHE                                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">
          {t("beyond.interpretability.sectionTitle")}
        </h2>
        <p className="text-gray-400">
          {t("beyond.interpretability.description")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-4 space-y-2">
            <h4 className="text-indigo-300 font-semibold text-sm">
              {t("beyond.interpretability.circuits.inductionHead.title")}
            </h4>
            <p className="text-gray-400 text-xs">
              {t("beyond.interpretability.circuits.inductionHead.description")}
            </p>
          </div>
          <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-4 space-y-2">
            <h4 className="text-indigo-300 font-semibold text-sm">
              {t("beyond.interpretability.circuits.indirectObject.title")}
            </h4>
            <p className="text-gray-400 text-xs">
              {t("beyond.interpretability.circuits.indirectObject.description")}
            </p>
          </div>
          <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-4 space-y-2">
            <h4 className="text-indigo-300 font-semibold text-sm">
              {t("beyond.interpretability.circuits.booleanLogic.title")}
            </h4>
            <p className="text-gray-400 text-xs">
              {t("beyond.interpretability.circuits.booleanLogic.description")}
            </p>
          </div>
          <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-4 space-y-2">
            <h4 className="text-indigo-300 font-semibold text-sm">
              Le Grokking observé
            </h4>
            <p className="text-gray-400 text-xs">
              Les chercheurs ont vu que pendant le grokking, les poids se
              réorganisent : les circuits de mémorisation sont progressivement
              remplacés par des circuits algorithmiques utilisant des fonctions
              périodiques (sinus/cosinus). Le modèle « invente » les
              mathématiques.
            </p>
          </div>
        </div>

        {/* Le rêve */}
        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/30 rounded-lg p-5 space-y-3">
          <h3 className="text-indigo-200 font-semibold">Le rêve ultime</h3>
          <p className="text-gray-400 text-sm">
            Si on pouvait entièrement décompiler un LLM, on pourrait :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-gray-900/60 rounded p-3 text-center">
              <p className="text-green-400 font-semibold mb-1">Vérifier</p>
              <p className="text-gray-500">
                Garantir que le modèle ne ment pas, ne fabrique pas de faits, ne
                contient pas de biais dangereux.
              </p>
            </div>
            <div className="bg-gray-900/60 rounded p-3 text-center">
              <p className="text-blue-400 font-semibold mb-1">Corriger</p>
              <p className="text-gray-500">
                Modifier un circuit spécifique sans réentraîner tout le modèle.
                Chirurgie de précision sur les poids.
              </p>
            </div>
            <div className="bg-gray-900/60 rounded p-3 text-center">
              <p className="text-purple-400 font-semibold mb-1">Comprendre</p>
              <p className="text-gray-500">
                Savoir <em>comment</em> le modèle raisonne, pas juste{" "}
                <em>ce qu'il</em> produit. Transformer la boîte noire en boîte
                de verre.
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-xs text-center">
            On n'en est pas encore là — mais chaque circuit déchiffré nous en
            rapproche.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* CONCLUSION                                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      <section className="bg-gradient-to-b from-purple-900/20 to-gray-900/50 border border-purple-800/30 rounded-xl p-8 space-y-6 text-center">
        <h2 className="text-2xl font-bold text-white">
          {t("beyond.closing.title")}
        </h2>
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-gray-300">{t("beyond.closing.description")}</p>
        </div>

        <div className="pt-4">
          <Link
            to="/playground"
            className="inline-flex items-center gap-2 btn-primary px-6 py-3"
          >
            {t("beyond.closing.playgroundCta")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
