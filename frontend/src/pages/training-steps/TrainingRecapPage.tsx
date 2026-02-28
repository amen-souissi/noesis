/**
 * Récapitulatif de l'entraînement — Le pipeline complet, étape par étape
 *
 * Page de conclusion qui trace le chemin COMPLET d'un token
 * à travers le pipeline d'entraînement, avec les calculs concrets
 * sur l'exemple "Le chat".
 *
 * Objectifs pédagogiques :
 * - Visualiser la séquence mathématique complète (input → output)
 * - Identifier ce que le modèle apprend à chaque étape
 * - Comprendre la boucle d'entraînement (forward → loss → backward → update)
 *
 * @module pages/training-steps/TrainingRecapPage
 */

import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useProgressStore } from "@/stores/progressStore";

/** Badge numéroté pour chaque étape du récapitulatif */
function StepBadge({
  step,
  color,
  title,
  subtitle,
}: {
  step: number;
  color: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${color}`}
      >
        {step}
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-100">{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

/** Flèche de liaison entre les étapes */
function PipelineArrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-2">
      <div className="w-0.5 h-4 bg-gray-700" />
      <div className="text-[10px] text-gray-500 px-2 py-0.5 bg-gray-900 rounded border border-gray-800">
        {label}
      </div>
      <div className="w-0.5 h-4 bg-gray-700" />
      <div className="text-gray-600">▼</div>
    </div>
  );
}

export default function TrainingRecapPage() {
  const { t } = useTranslation("pages");
  const markVisited = useProgressStore((s) => s.markVisited);
  useEffect(() => {
    markVisited("training/recap");
  }, [markVisited]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* ─── En-tête ─── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/30 border border-primary-800/30 text-xs text-primary-300">
          {t("training.recap.badge")}
        </div>
        <h1 className="text-2xl font-bold text-gray-100">
          {t("training.recap.heading")}
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">
          {t("training.recap.description")}
        </p>
      </div>

      {/* ─── L'input : les données d'entraînement ─── */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 space-y-3">
        <h2 className="text-sm font-bold text-gray-200">
          {t("training.recap.input.title")}
        </h2>
        <p className="text-gray-400 text-sm">
          {t("training.recap.input.description")}
        </p>
        <div className="bg-gray-900 rounded-lg p-4 text-center">
          <p className="text-xl font-mono text-primary-400 tracking-wider">
            Le chat
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {t("training.recap.input.exerciseCount")}
          </p>
        </div>
        <p className="text-gray-400 text-xs">
          {t("training.recap.input.note")}
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ═══ PRÉPARATION DES DONNÉES ═══════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-200">
          {t("training.recap.dataPreparation.title")}
        </h2>
        <p className="text-gray-400 text-sm">
          {t("training.recap.dataPreparation.description")}
        </p>

        {/* Input/target shift */}
        <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
          <p className="text-gray-500 font-mono">
            # {t("training.recap.dataPreparation.shiftComment")}
          </p>
          <div className="overflow-x-auto">
            <table className="mx-auto text-center font-mono">
              <thead>
                <tr className="text-gray-500">
                  <td className="px-1.5 py-1">
                    {t("training.recap.dataPreparation.tableHeaders.position")}
                  </td>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <td key={i} className="px-1.5 py-1">
                      {i}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-1.5 py-1 text-blue-400">
                    {t("training.recap.dataPreparation.tableHeaders.input")}
                  </td>
                  {["L", "e", "⎵", "c", "h", "a"].map((c, i) => (
                    <td key={i} className="px-1.5 py-1 text-white">
                      {c}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-1.5 py-1 text-green-400">
                    {t("training.recap.dataPreparation.tableHeaders.target")}
                  </td>
                  {["e", "⎵", "c", "h", "a", "t"].map((c, i) => (
                    <td key={i} className="px-1.5 py-1 text-green-400">
                      {c}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-500 text-center">
            {t("training.recap.dataPreparation.pairCount")}
          </p>
        </div>

        {/* Windows and batches */}
        <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
          <p className="text-gray-500 font-mono">
            # {t("training.recap.dataPreparation.windowsComment")}
          </p>
          <div className="font-mono text-gray-400 space-y-1">
            <p>{t("training.recap.dataPreparation.batchDetails.windows")}</p>
            <p>
              {t("training.recap.dataPreparation.batchDetails.pairsPerWindow")}
            </p>
            <p>{t("training.recap.dataPreparation.batchDetails.totalPairs")}</p>
          </div>
        </div>

        {/* Batching */}
        <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
          <p className="text-gray-500 font-mono">
            # {t("training.recap.dataPreparation.batchComment")}
          </p>
          <div className="font-mono text-gray-400 space-y-1">
            <p>{t("training.recap.dataPreparation.batchDetails.parallel")}</p>
            <p>
              {t(
                "training.recap.dataPreparation.batchDetails.predictionsPerStep",
              )}
            </p>
          </div>
        </div>

        {/* Visual flow */}
        <div className="bg-gray-950 rounded p-4">
          <p className="text-gray-500 text-xs mb-3 font-semibold">
            Flow de préparation des données :
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
            <div className="px-3 py-2 bg-gray-800 rounded border border-gray-700 text-gray-300 text-center">
              <div>
                {t("training.recap.dataPreparation.flowLabels.rawText")}
              </div>
              <div className="text-[10px] text-gray-600">10 000 chars</div>
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-2 bg-blue-900/30 rounded border border-blue-800/30 text-blue-300 text-center">
              <div>
                {t("training.recap.dataPreparation.flowLabels.tokenization")}
              </div>
              <div className="text-[10px] text-gray-600">10 000 IDs</div>
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-2 bg-purple-900/30 rounded border border-purple-800/30 text-purple-300 text-center">
              <div>
                {t("training.recap.dataPreparation.flowLabels.windows")}
              </div>
              <div className="text-[10px] text-gray-600">156 × 64</div>
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-2 bg-amber-900/30 rounded border border-amber-800/30 text-amber-300 text-center">
              <div>
                {t("training.recap.dataPreparation.flowLabels.batches")}
              </div>
              <div className="text-[10px] text-gray-600">16 fenêtres/batch</div>
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-2 bg-green-900/30 rounded border border-green-800/30 text-green-300 text-center">
              <div>
                {t("training.recap.dataPreparation.flowLabels.training")}
              </div>
              <div className="text-[10px] text-gray-600">1 batch = 1 pas</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ═══ BATCH SIZE ET EPOCHS ══════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-200">
          {t("training.recap.batchSizeAndEpochs.title")}
        </h2>

        {/* Why not everything at once */}
        <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
          <p className="text-gray-300 font-semibold">
            {t("training.recap.batchSizeAndEpochs.whyNotAll.title")}
          </p>
          <p className="text-gray-400">
            {t("training.recap.batchSizeAndEpochs.whyNotAll.description")}
          </p>
          <p className="text-gray-400">
            {t("training.recap.batchSizeAndEpochs.whyNotAll.comparison")}
          </p>
        </div>

        {/* Batch size impact on learning quality */}
        <div className="bg-gray-900 rounded p-3 text-xs space-y-3">
          <p className="text-gray-300 font-semibold">
            {t("training.recap.batchSizeAndEpochs.batchSizeImpact.title")}
          </p>
          <p className="text-gray-400">
            {t("training.recap.batchSizeAndEpochs.batchSizeImpact.description")}
          </p>
          <div className="space-y-2">
            <div className="bg-red-900/10 border border-red-800/20 rounded p-2 space-y-1">
              <p className="text-red-300 font-semibold text-[10px] uppercase tracking-wide">
                {t(
                  "training.recap.batchSizeAndEpochs.batchSizeImpact.small.label",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.batchSizeAndEpochs.batchSizeImpact.small.description",
                )}
              </p>
              <p className="text-gray-500">
                {t(
                  "training.recap.batchSizeAndEpochs.batchSizeImpact.small.result",
                )}
              </p>
            </div>
            <div className="bg-amber-900/10 border border-amber-800/20 rounded p-2 space-y-1">
              <p className="text-amber-300 font-semibold text-[10px] uppercase tracking-wide">
                {t(
                  "training.recap.batchSizeAndEpochs.batchSizeImpact.medium.label",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.batchSizeAndEpochs.batchSizeImpact.medium.description",
                )}
              </p>
              <p className="text-gray-500">
                {t(
                  "training.recap.batchSizeAndEpochs.batchSizeImpact.medium.result",
                )}
              </p>
            </div>
            <div className="bg-blue-900/10 border border-blue-800/20 rounded p-2 space-y-1">
              <p className="text-blue-300 font-semibold text-[10px] uppercase tracking-wide">
                {t(
                  "training.recap.batchSizeAndEpochs.batchSizeImpact.large.label",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.batchSizeAndEpochs.batchSizeImpact.large.description",
                )}
              </p>
              <p className="text-gray-500">
                {t(
                  "training.recap.batchSizeAndEpochs.batchSizeImpact.large.result",
                )}
              </p>
            </div>
          </div>
          <p className="text-gray-500">
            {t("training.recap.batchSizeAndEpochs.batchSizeImpact.analogy")}
          </p>
        </div>

        {/* Epochs */}
        <div className="bg-gray-900 rounded p-3 text-xs space-y-2">
          <p className="text-gray-300 font-semibold">
            {t("training.recap.batchSizeAndEpochs.epochs.title")}
          </p>
          <p className="text-gray-400">
            {t("training.recap.batchSizeAndEpochs.epochs.description")}
          </p>
          <div className="font-mono text-gray-400 space-y-1">
            <p>{t("training.recap.batchSizeAndEpochs.epochs.epoch1")}</p>
            <p>{t("training.recap.batchSizeAndEpochs.epochs.epoch2")}</p>
            <p>{t("training.recap.batchSizeAndEpochs.epochs.epoch3")}</p>
            <p className="text-gray-600">
              {t("training.recap.batchSizeAndEpochs.epochs.warning")}
            </p>
          </div>
        </div>

        {/* Random sampling */}
        <div className="bg-purple-900/10 border border-purple-800/20 rounded-lg p-4 text-xs space-y-3">
          <p className="text-purple-300 font-semibold">
            {t("training.recap.batchSizeAndEpochs.randomSampling.title")}
          </p>
          <p className="text-gray-400">
            {t("training.recap.batchSizeAndEpochs.randomSampling.description")}
          </p>
          <div className="space-y-2">
            <div className="bg-red-900/10 border border-red-800/20 rounded p-2 space-y-1">
              <p className="text-red-300 font-semibold text-[10px] uppercase tracking-wide">
                {t(
                  "training.recap.batchSizeAndEpochs.randomSampling.sequential.label",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.batchSizeAndEpochs.randomSampling.sequential.description",
                )}
              </p>
              <p className="font-mono text-gray-500">
                {t(
                  "training.recap.batchSizeAndEpochs.randomSampling.sequential.result",
                )}
              </p>
            </div>
            <div className="bg-green-900/10 border border-green-800/20 rounded p-2 space-y-1">
              <p className="text-green-300 font-semibold text-[10px] uppercase tracking-wide">
                {t(
                  "training.recap.batchSizeAndEpochs.randomSampling.random.label",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.batchSizeAndEpochs.randomSampling.random.description",
                )}
              </p>
              <p className="font-mono text-gray-500">
                {t(
                  "training.recap.batchSizeAndEpochs.randomSampling.random.result",
                )}
              </p>
            </div>
          </div>
          <p className="text-gray-500">
            {t("training.recap.batchSizeAndEpochs.randomSampling.note")}
          </p>
        </div>

        {/* 7-step summary */}
        <div className="bg-gray-950 rounded p-4 text-xs space-y-2">
          <p className="text-gray-300 font-semibold">
            {t("training.recap.batchSizeAndEpochs.processSteps.title")}
          </p>
          <ol className="list-decimal list-inside text-gray-400 space-y-1 font-mono">
            <li>{t("training.recap.batchSizeAndEpochs.processSteps.step1")}</li>
            <li>{t("training.recap.batchSizeAndEpochs.processSteps.step2")}</li>
            <li>{t("training.recap.batchSizeAndEpochs.processSteps.step3")}</li>
            <li>{t("training.recap.batchSizeAndEpochs.processSteps.step4")}</li>
            <li>{t("training.recap.batchSizeAndEpochs.processSteps.step5")}</li>
            <li>{t("training.recap.batchSizeAndEpochs.processSteps.step6")}</li>
            <li>{t("training.recap.batchSizeAndEpochs.processSteps.step7")}</li>
          </ol>
        </div>
      </div>

      <PipelineArrow label={t("training.recap.pipelineArrowLabel")} />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ═══ LE PIPELINE : 8 ÉTAPES ═══════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════ */}

      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 space-y-3">
        <StepBadge
          step={1}
          color="bg-blue-900 text-blue-300"
          title={t("training.recap.steps.tokenization.title")}
          subtitle={t("training.recap.steps.tokenization.subtitle")}
        />
        <p className="text-gray-400 text-sm">
          {t("training.recap.steps.tokenization.description")}
        </p>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-500">« Le cha »</span>
          <span className="text-gray-600">→</span>
          <span className="text-blue-300">[12, 7, 0, 5, 10, 3]</span>
        </div>
        <Link
          to="/training/tokenization"
          className="text-primary-400 hover:underline text-xs"
        >
          {t("training.recap.steps.tokenization.link")}
        </Link>
      </div>

      <PipelineArrow label="IDs → vecteurs" />

      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 space-y-3">
        <StepBadge
          step={2}
          color="bg-purple-900 text-purple-300"
          title={t("training.recap.steps.embedding.title")}
          subtitle={t("training.recap.steps.embedding.subtitle")}
        />
        <p className="text-gray-400 text-sm">
          {t("training.recap.steps.embedding.description")}
        </p>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-500">6 IDs</span>
          <span className="text-gray-600">→ lookup W_emb →</span>
          <span className="text-purple-300">matrice 6 × 64</span>
        </div>
        <Link
          to="/training/embedding"
          className="text-primary-400 hover:underline text-xs"
        >
          {t("training.recap.steps.embedding.link")}
        </Link>
      </div>

      <PipelineArrow label="+ position" />

      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 space-y-3">
        <StepBadge
          step={3}
          color="bg-teal-900 text-teal-300"
          title={t("training.recap.steps.positionalEncoding.title")}
          subtitle={t("training.recap.steps.positionalEncoding.subtitle")}
        />
        <p className="text-gray-400 text-sm">
          {t("training.recap.steps.positionalEncoding.description")}
        </p>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-500">6 × 64</span>
          <span className="text-gray-600">→ + PE(pos) →</span>
          <span className="text-teal-300">6 × 64</span>
          <span className="text-gray-600">
            (même forme, info position ajoutée)
          </span>
        </div>
        <Link
          to="/training/positional-encoding"
          className="text-primary-400 hover:underline text-xs"
        >
          {t("training.recap.steps.positionalEncoding.link")}
        </Link>
      </div>

      <PipelineArrow label="→ attention" />

      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 space-y-3">
        <StepBadge
          step={4}
          color="bg-orange-900 text-orange-300"
          title={t("training.recap.steps.attention.title")}
          subtitle={t("training.recap.steps.attention.subtitle")}
        />
        <p className="text-gray-400 text-sm">
          {t("training.recap.steps.attention.description")}
        </p>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-500">6 × 64</span>
          <span className="text-gray-600">
            → multi-head attention + résiduelle →
          </span>
          <span className="text-orange-300">6 × 64</span>
        </div>
        <Link
          to="/training/attention"
          className="text-primary-400 hover:underline text-xs"
        >
          {t("training.recap.steps.attention.link")}
        </Link>
      </div>

      <PipelineArrow label="→ FFN" />

      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 space-y-3">
        <StepBadge
          step={5}
          color="bg-pink-900 text-pink-300"
          title={t("training.recap.steps.feedforward.title")}
          subtitle={t("training.recap.steps.feedforward.subtitle")}
        />
        <p className="text-gray-400 text-sm">
          {t("training.recap.steps.feedforward.description")}
        </p>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-500">6 × 64</span>
          <span className="text-gray-600">→ FFN + résiduelle →</span>
          <span className="text-pink-300">6 × 64</span>
        </div>
        <Link
          to="/training/feed-forward"
          className="text-primary-400 hover:underline text-xs"
        >
          {t("training.recap.steps.feedforward.link")}
        </Link>
      </div>

      <PipelineArrow label={t("training.recap.steps.layerRepeat")} />

      <div className="bg-blue-900/10 border border-blue-800/20 rounded-lg p-3">
        <div className="bg-gray-950 rounded p-2 font-mono text-[10px] text-gray-500 text-center">
          emb+pos → [Att₁+FFN₁] → [Att₂+FFN₂] → [Att₃+FFN₃] → [Att₄+FFN₄] →
          sortie
        </div>
      </div>

      <PipelineArrow label="→ probabilités → erreur" />

      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 space-y-3">
        <StepBadge
          step={6}
          color="bg-red-900 text-red-300"
          title={t("training.recap.steps.loss.title")}
          subtitle={t("training.recap.steps.loss.subtitle")}
        />
        <p className="text-gray-400 text-sm">
          {t("training.recap.steps.loss.description")}
        </p>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-500">P(t|Le cha) = 42%</span>
          <span className="text-gray-600">→ −log(0.42) =</span>
          <span className="text-red-300">loss = 0.87</span>
        </div>
        <Link
          to="/training/loss"
          className="text-primary-400 hover:underline text-xs"
        >
          {t("training.recap.steps.loss.link")}
        </Link>
      </div>

      <PipelineArrow label="→ gradients (à rebours)" />

      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 space-y-3">
        <StepBadge
          step={7}
          color="bg-yellow-900 text-yellow-300"
          title={t("training.recap.steps.backpropagation.title")}
          subtitle={t("training.recap.steps.backpropagation.subtitle")}
        />
        <p className="text-gray-400 text-sm">
          {t("training.recap.steps.backpropagation.description")}
        </p>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-500">loss = 0.87</span>
          <span className="text-gray-600">→ chaîne de dérivation →</span>
          <span className="text-yellow-300">~200k gradients</span>
        </div>
        <Link
          to="/training/backpropagation"
          className="text-primary-400 hover:underline text-xs"
        >
          {t("training.recap.steps.backpropagation.link")}
        </Link>
      </div>

      <PipelineArrow label="→ mise à jour des poids" />

      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-5 space-y-3">
        <StepBadge
          step={8}
          color="bg-green-900 text-green-300"
          title={t("training.recap.steps.optimizer.title")}
          subtitle={t("training.recap.steps.optimizer.subtitle")}
        />
        <p className="text-gray-400 text-sm">
          {t("training.recap.steps.optimizer.description")}
        </p>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-gray-500">~200k gradients</span>
          <span className="text-gray-600">→ Adam →</span>
          <span className="text-green-300">~200k poids corrigés</span>
        </div>
        <Link
          to="/training/optimizer"
          className="text-primary-400 hover:underline text-xs"
        >
          {t("training.recap.steps.optimizer.link")}
        </Link>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ═══ LA BOUCLE D'ENTRAÎNEMENT ═══════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="bg-primary-900/15 border border-primary-800/30 rounded-lg p-5 space-y-4">
        <h2 className="text-primary-300 font-bold text-sm">
          {t("training.recap.trainingLoop.title")}
        </h2>
        <p className="text-gray-300 text-sm">
          {t("training.recap.trainingLoop.description")}
        </p>
        <div className="bg-gray-950 rounded p-4">
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs font-mono">
            <div className="px-3 py-2 bg-blue-900/30 rounded border border-blue-800/30 text-blue-300">
              {t("training.recap.trainingLoop.labels.forwardPass")}
              <div className="text-[10px] text-gray-500">
                {t("training.recap.trainingLoop.labels.forwardSteps")}
              </div>
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-2 bg-red-900/30 rounded border border-red-800/30 text-red-300">
              {t("training.recap.trainingLoop.labels.loss")}
              <div className="text-[10px] text-gray-500">
                {t("training.recap.trainingLoop.labels.lossStep")}
              </div>
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-2 bg-yellow-900/30 rounded border border-yellow-800/30 text-yellow-300">
              {t("training.recap.trainingLoop.labels.backprop")}
              <div className="text-[10px] text-gray-500">
                {t("training.recap.trainingLoop.labels.backpropStep")}
              </div>
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-2 bg-green-900/30 rounded border border-green-800/30 text-green-300">
              {t("training.recap.trainingLoop.labels.update")}
              <div className="text-[10px] text-gray-500">
                {t("training.recap.trainingLoop.labels.updateStep")}
              </div>
            </div>
            <span className="text-gray-600">→</span>
            <span className="text-gray-500 text-[10px]">
              {t("training.recap.trainingLoop.labels.restart")}
            </span>
          </div>
        </div>
        <div className="bg-gray-950 rounded p-4 font-mono text-xs space-y-1">
          <p>{t("training.recap.trainingLoop.evolution.iter1")}</p>
          <p>{t("training.recap.trainingLoop.evolution.iter100")}</p>
          <p>{t("training.recap.trainingLoop.evolution.iter500")}</p>
          <p>{t("training.recap.trainingLoop.evolution.iter2000")}</p>
          <p>{t("training.recap.trainingLoop.evolution.iter5000")}</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ═══ CE QUE LE MODÈLE APPREND ═══════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="bg-amber-900/10 border border-amber-800/30 rounded-lg p-5 space-y-4">
        <h2 className="text-amber-300 font-bold text-sm">
          {t("training.recap.whatModelLearns.title")}
        </h2>
        <p className="text-gray-400 text-sm">
          {t("training.recap.whatModelLearns.description")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gray-950 rounded p-3 space-y-1">
            <p className="text-purple-300 font-semibold text-xs">
              {t("training.recap.whatModelLearns.embeddingMatrix.title")}
            </p>
            <p className="text-gray-400 text-xs">
              {t("training.recap.whatModelLearns.embeddingMatrix.description")}
            </p>
          </div>
          <div className="bg-gray-950 rounded p-3 space-y-1">
            <p className="text-orange-300 font-semibold text-xs">
              {t("training.recap.whatModelLearns.attentionMatrices.title")}
            </p>
            <p className="text-gray-400 text-xs">
              {t(
                "training.recap.whatModelLearns.attentionMatrices.description",
              )}
            </p>
          </div>
          <div className="bg-gray-950 rounded p-3 space-y-1">
            <p className="text-pink-300 font-semibold text-xs">
              {t("training.recap.whatModelLearns.ffnMatrices.title")}
            </p>
            <p className="text-gray-400 text-xs">
              {t("training.recap.whatModelLearns.ffnMatrices.description")}
            </p>
          </div>
          <div className="bg-gray-950 rounded p-3 space-y-1">
            <p className="text-blue-300 font-semibold text-xs">
              {t("training.recap.whatModelLearns.outputLayer.title")}
            </p>
            <p className="text-gray-400 text-xs">
              {t("training.recap.whatModelLearns.outputLayer.description")}
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ═══ INVENTAIRE DES PARAMÈTRES APPRIS ═════════════════════ */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="bg-amber-900/10 border border-amber-800/30 rounded-lg p-5 space-y-4">
        <h2 className="text-amber-300 font-bold text-sm">
          {t("training.recap.parametersInventory.title")}
        </h2>
        <p className="text-gray-400 text-sm">
          {t("training.recap.parametersInventory.description")}
        </p>

        {/* Embedding */}
        <div className="space-y-2">
          <h3 className="text-purple-300 font-semibold text-xs uppercase tracking-wide">
            {t("training.recap.parametersInventory.embedding.label")}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="p-1.5 text-left">Matrice</th>
                  <th className="p-1.5 text-left">Taille</th>
                  <th className="p-1.5 text-right">Paramètres</th>
                  <th className="p-1.5 text-left">Rôle</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-gray-800/30">
                  <td className="p-1.5 text-amber-300">W_emb</td>
                  <td className="p-1.5 text-gray-400">16 × 64</td>
                  <td className="p-1.5 text-white text-right">1 024</td>
                  <td className="p-1.5 text-gray-400 font-sans">
                    {t("training.recap.parametersInventory.embedding.wEmb")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Attention — par couche */}
        <div className="space-y-2">
          <h3 className="text-orange-300 font-semibold text-xs uppercase tracking-wide">
            {t("training.recap.parametersInventory.attention.label")}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="p-1.5 text-left">
                    {t(
                      "training.recap.parametersInventory.attention.tableHeaders.matrix",
                    )}
                  </th>
                  <th className="p-1.5 text-left">
                    {t(
                      "training.recap.parametersInventory.attention.tableHeaders.sizePerHead",
                    )}
                  </th>
                  <th className="p-1.5 text-right">
                    {t(
                      "training.recap.parametersInventory.attention.tableHeaders.perLayer",
                    )}
                  </th>
                  <th className="p-1.5 text-right">
                    {t(
                      "training.recap.parametersInventory.attention.tableHeaders.times4",
                    )}
                  </th>
                  <th className="p-1.5 text-left">
                    {t(
                      "training.recap.parametersInventory.attention.tableHeaders.role",
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-gray-800/30">
                  <td className="p-1.5 text-amber-300">W_Q</td>
                  <td className="p-1.5 text-gray-400">64 × 16</td>
                  <td className="p-1.5 text-gray-400 text-right">4 096</td>
                  <td className="p-1.5 text-white text-right">16 384</td>
                  <td className="p-1.5 text-gray-400 font-sans">
                    {t("training.recap.parametersInventory.attention.wqRole")}
                  </td>
                </tr>
                <tr className="border-b border-gray-800/30">
                  <td className="p-1.5 text-amber-300">W_K</td>
                  <td className="p-1.5 text-gray-400">64 × 16</td>
                  <td className="p-1.5 text-gray-400 text-right">4 096</td>
                  <td className="p-1.5 text-white text-right">16 384</td>
                  <td className="p-1.5 text-gray-400 font-sans">
                    {t("training.recap.parametersInventory.attention.wkRole")}
                  </td>
                </tr>
                <tr className="border-b border-gray-800/30">
                  <td className="p-1.5 text-amber-300">W_V</td>
                  <td className="p-1.5 text-gray-400">64 × 16</td>
                  <td className="p-1.5 text-gray-400 text-right">4 096</td>
                  <td className="p-1.5 text-white text-right">16 384</td>
                  <td className="p-1.5 text-gray-400 font-sans">
                    {t("training.recap.parametersInventory.attention.wvRole")}
                  </td>
                </tr>
                <tr className="border-b border-gray-800/30">
                  <td className="p-1.5 text-amber-300">W_O</td>
                  <td className="p-1.5 text-gray-400">64 × 64</td>
                  <td className="p-1.5 text-gray-400 text-right">4 096</td>
                  <td className="p-1.5 text-white text-right">16 384</td>
                  <td className="p-1.5 text-gray-400 font-sans">
                    {t("training.recap.parametersInventory.attention.woRole")}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-700">
                  <td className="p-1.5 text-gray-500 font-sans" colSpan={3}>
                    {t("training.recap.parametersInventory.attention.subtotal")}
                  </td>
                  <td className="p-1.5 text-amber-300 font-bold text-right">
                    65 536
                  </td>
                  <td className="p-1.5"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* FFN — par couche */}
        <div className="space-y-2">
          <h3 className="text-pink-300 font-semibold text-xs uppercase tracking-wide">
            {t("training.recap.parametersInventory.ffn.label")}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="p-1.5 text-left">
                    {t(
                      "training.recap.parametersInventory.ffn.tableHeaders.matrix",
                    )}
                  </th>
                  <th className="p-1.5 text-left">
                    {t(
                      "training.recap.parametersInventory.ffn.tableHeaders.size",
                    )}
                  </th>
                  <th className="p-1.5 text-right">
                    {t(
                      "training.recap.parametersInventory.ffn.tableHeaders.perLayer",
                    )}
                  </th>
                  <th className="p-1.5 text-right">
                    {t(
                      "training.recap.parametersInventory.ffn.tableHeaders.times4",
                    )}
                  </th>
                  <th className="p-1.5 text-left">
                    {t(
                      "training.recap.parametersInventory.ffn.tableHeaders.role",
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-gray-800/30">
                  <td className="p-1.5 text-amber-300">W₁</td>
                  <td className="p-1.5 text-gray-400">64 × 256</td>
                  <td className="p-1.5 text-gray-400 text-right">16 384</td>
                  <td className="p-1.5 text-white text-right">65 536</td>
                  <td className="p-1.5 text-gray-400 font-sans">
                    {t("training.recap.parametersInventory.ffn.w1Role")}
                  </td>
                </tr>
                <tr className="border-b border-gray-800/30">
                  <td className="p-1.5 text-amber-300">b₁</td>
                  <td className="p-1.5 text-gray-400">256</td>
                  <td className="p-1.5 text-gray-400 text-right">256</td>
                  <td className="p-1.5 text-white text-right">1 024</td>
                  <td className="p-1.5 text-gray-400 font-sans">
                    {t("training.recap.parametersInventory.ffn.b1Role")}
                  </td>
                </tr>
                <tr className="border-b border-gray-800/30">
                  <td className="p-1.5 text-amber-300">W₂</td>
                  <td className="p-1.5 text-gray-400">256 × 64</td>
                  <td className="p-1.5 text-gray-400 text-right">16 384</td>
                  <td className="p-1.5 text-white text-right">65 536</td>
                  <td className="p-1.5 text-gray-400 font-sans">
                    {t("training.recap.parametersInventory.ffn.w2Role")}
                  </td>
                </tr>
                <tr className="border-b border-gray-800/30">
                  <td className="p-1.5 text-amber-300">b₂</td>
                  <td className="p-1.5 text-gray-400">64</td>
                  <td className="p-1.5 text-gray-400 text-right">64</td>
                  <td className="p-1.5 text-white text-right">256</td>
                  <td className="p-1.5 text-gray-400 font-sans">
                    {t("training.recap.parametersInventory.ffn.b2Role")}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-700">
                  <td className="p-1.5 text-gray-500 font-sans" colSpan={3}>
                    {t("training.recap.parametersInventory.ffn.subtotal")}
                  </td>
                  <td className="p-1.5 text-pink-300 font-bold text-right">
                    132 352
                  </td>
                  <td className="p-1.5"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Couche de sortie */}
        <div className="space-y-2">
          <h3 className="text-red-300 font-semibold text-xs uppercase tracking-wide">
            {t("training.recap.parametersInventory.output.label")}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="p-1.5 text-left">Matrice</th>
                  <th className="p-1.5 text-left">Taille</th>
                  <th className="p-1.5 text-right">Paramètres</th>
                  <th className="p-1.5 text-left">Rôle</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-gray-800/30">
                  <td className="p-1.5 text-amber-300">W_out</td>
                  <td className="p-1.5 text-gray-400">64 × 16</td>
                  <td className="p-1.5 text-white text-right">1 024</td>
                  <td className="p-1.5 text-gray-400 font-sans">
                    {t("training.recap.parametersInventory.output.wOutRole")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-semibold text-sm">
              {t("training.recap.parametersInventory.total.title")}
            </span>
            <span className="text-amber-300 font-bold text-lg font-mono">
              199 936
            </span>
          </div>
          <div className="font-mono text-xs space-y-1 text-gray-500">
            <p>
              Embedding : <span className="text-gray-400">1 024</span>
            </p>
            <p>
              Attention × 4 : <span className="text-gray-400">65 536</span>{" "}
              <span className="text-gray-600">(16 384 / couche)</span>
            </p>
            <p>
              FFN × 4 : <span className="text-gray-400">132 352</span>{" "}
              <span className="text-gray-600">(33 088 / couche)</span>
            </p>
            <p>
              Sortie : <span className="text-gray-400">1 024</span>
            </p>
            <div className="border-t border-gray-800 pt-1 mt-1">
              <p className="text-amber-300">
                Total = 1 024 + 65 536 + 132 352 + 1 024 ={" "}
                <strong>199 936</strong>
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-xs">
            {t("training.recap.parametersInventory.total.note")}
          </p>
        </div>

        {/* Visualisation : ce qui est appris vs fixe */}
        <div className="bg-gray-950 rounded-lg p-4 space-y-2">
          <p className="text-gray-400 text-xs font-semibold mb-2">
            {t("training.recap.parametersInventory.learnedVsFixed.title")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="space-y-1.5">
              <p className="text-amber-400 font-semibold text-[10px] uppercase tracking-wide">
                {t(
                  "training.recap.parametersInventory.learnedVsFixed.learnedLabel",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.parametersInventory.learnedVsFixed.learnedItems.wEmb",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.parametersInventory.learnedVsFixed.learnedItems.wqkv",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.parametersInventory.learnedVsFixed.learnedItems.wO",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.parametersInventory.learnedVsFixed.learnedItems.ffn",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.parametersInventory.learnedVsFixed.learnedItems.wOut",
                )}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-blue-400 font-semibold text-[10px] uppercase tracking-wide">
                {t(
                  "training.recap.parametersInventory.learnedVsFixed.fixedLabel",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.parametersInventory.learnedVsFixed.fixedItems.tokenization",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.parametersInventory.learnedVsFixed.fixedItems.pe",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.parametersInventory.learnedVsFixed.fixedItems.softmax",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.parametersInventory.learnedVsFixed.fixedItems.relu",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.parametersInventory.learnedVsFixed.fixedItems.loss",
                )}
              </p>
              <p className="text-gray-400">
                {t(
                  "training.recap.parametersInventory.learnedVsFixed.fixedItems.backprop",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ═══ CONCEPTS CLÉS À RETENIR ════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="bg-green-900/15 border border-green-800/30 rounded-lg p-5 space-y-4">
        <h2 className="text-green-300 font-bold text-sm">
          {t("training.recap.keyConcepts.title")}
        </h2>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <span className="text-green-400 font-bold">1.</span>
            <div>
              <strong>{t("training.recap.keyConcepts.concept1.bold")}</strong>
              <p className="text-gray-500 text-xs mt-0.5">
                {t("training.recap.keyConcepts.concept1.detail")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 font-bold">2.</span>
            <div>
              <strong>{t("training.recap.keyConcepts.concept2.bold")}</strong>
              <p className="text-gray-500 text-xs mt-0.5">
                {t("training.recap.keyConcepts.concept2.detail")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 font-bold">3.</span>
            <div>
              <strong>{t("training.recap.keyConcepts.concept3.bold")}</strong>
              <p className="text-gray-500 text-xs mt-0.5">
                {t("training.recap.keyConcepts.concept3.detail")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 font-bold">4.</span>
            <div>
              <strong>{t("training.recap.keyConcepts.concept4.bold")}</strong>
              <p className="text-gray-500 text-xs mt-0.5">
                {t("training.recap.keyConcepts.concept4.detail")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 font-bold">5.</span>
            <div>
              <strong>{t("training.recap.keyConcepts.concept5.bold")}</strong>
              <p className="text-gray-500 text-xs mt-0.5">
                {t("training.recap.keyConcepts.concept5.detail")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Navigation ─── */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <Link
          to="/training/optimizer"
          className="text-sm text-gray-400 hover:text-primary-300 transition-colors"
        >
          {t("training.recap.navigation.previous")}
        </Link>
        <Link
          to="/generation/prompt"
          className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium"
        >
          {t("training.recap.navigation.next")}
        </Link>
      </div>
    </div>
  );
}
