/**
 * Onglet Configuration du Playground.
 *
 * Édite directement la config de l'instance sélectionnée (configId).
 * Plus de sidebar de sélection — l'instance est choisie depuis InstanceList.
 *
 * @module components/playground/PlaygroundConfig
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  AlertCircle,
  Loader2,
  Settings,
  ChevronRight,
  Shield,
  Sparkles,
  Zap,
  Save,
  Info,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getConfig,
  updateConfig,
  validateConfig,
  getPresets,
} from "@/api/config";
import type { ModelConfig } from "@/types/config";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";

/** Mapping entre clé de config et route de la leçon correspondante */
const PARAM_TO_LESSON: Record<string, { path: string; labelKey: string }> = {
  d_model: {
    path: "/training/embedding",
    labelKey: "playground.config.lessonLabels.embedding",
  },
  n_heads: {
    path: "/training/attention",
    labelKey: "playground.config.lessonLabels.attention",
  },
  n_layers: {
    path: "/training/attention",
    labelKey: "playground.config.lessonLabels.attention",
  },
  d_ff: {
    path: "/training/feedforward",
    labelKey: "playground.config.lessonLabels.feedForward",
  },
  seq_len: {
    path: "/training/positional-encoding",
    labelKey: "playground.config.lessonLabels.positionalEncoding",
  },
  batch_size: {
    path: "/training/loss",
    labelKey: "playground.config.lessonLabels.lossCalculation",
  },
  learning_rate: {
    path: "/training/optimizer",
    labelKey: "playground.config.lessonLabels.optimizer",
  },
  max_epochs: {
    path: "/training/loss",
    labelKey: "playground.config.lessonLabels.lossCalculation",
  },
  grad_clip: {
    path: "/training/backpropagation",
    labelKey: "playground.config.lessonLabels.backpropagation",
  },
  beta1: {
    path: "/training/optimizer",
    labelKey: "playground.config.lessonLabels.optimizer",
  },
  beta2: {
    path: "/training/optimizer",
    labelKey: "playground.config.lessonLabels.optimizer",
  },
  epsilon: {
    path: "/training/optimizer",
    labelKey: "playground.config.lessonLabels.optimizer",
  },
  weight_decay: {
    path: "/training/optimizer",
    labelKey: "playground.config.lessonLabels.optimizer",
  },
  lr_schedule: {
    path: "/training/optimizer",
    labelKey: "playground.config.lessonLabels.optimizer",
  },
  temperature: {
    path: "/generation/softmax",
    labelKey: "playground.config.lessonLabels.softmaxTemperature",
  },
  max_gen_len: {
    path: "/generation/autoregressive",
    labelKey: "playground.config.lessonLabels.autoregressiveLoop",
  },
};

/** Mapping entre clé de config et clé glossaire */
const GLOSSARY_MAP: Record<string, string> = {
  d_model: "d_model",
  n_heads: "n_heads",
  n_layers: "n_layers",
  d_ff: "d_ff",
  seq_len: "seq_len",
  vocab_size: "vocab_size",
  batch_size: "batch_size",
  max_epochs: "epochs",
  learning_rate: "learning_rate",
  grad_clip: "grad_clip",
  seed: "seed",
  beta1: "beta1",
  beta2: "beta2",
  epsilon: "epsilon",
  weight_decay: "weight_decay",
  lr_schedule: "lr_schedule",
  max_gen_len: "max_gen_len",
  temperature: "temperature",
};

interface FieldDef {
  key: keyof ModelConfig;
  type: "number" | "text";
  step?: number;
  min?: number;
  max?: number;
}

const CATEGORY_DEFS: {
  nameKey: string;
  icon: React.ElementType;
  color: string;
  fields: FieldDef[];
}[] = [
  {
    nameKey: "architecture",
    icon: Settings,
    color: "text-blue-400",
    fields: [
      { key: "d_model", type: "number", min: 1 },
      { key: "n_heads", type: "number", min: 1 },
      { key: "n_layers", type: "number", min: 1 },
      { key: "d_ff", type: "number", min: 1 },
      { key: "seq_len", type: "number", min: 1 },
      { key: "vocab_size", type: "number", min: 1 },
    ],
  },
  {
    nameKey: "training",
    icon: Zap,
    color: "text-green-400",
    fields: [
      { key: "batch_size", type: "number", min: 1 },
      { key: "max_epochs", type: "number", min: 1 },
      { key: "learning_rate", type: "number", step: 0.0001, min: 0 },
      { key: "grad_clip", type: "number", step: 0.1, min: 0 },
      { key: "seed", type: "number", min: 0 },
    ],
  },
  {
    nameKey: "optimizer",
    icon: Shield,
    color: "text-amber-400",
    fields: [
      { key: "beta1", type: "number", step: 0.01, min: 0, max: 1 },
      { key: "beta2", type: "number", step: 0.001, min: 0, max: 1 },
      { key: "epsilon", type: "number", step: 1e-9, min: 0 },
      { key: "weight_decay", type: "number", step: 0.001, min: 0 },
    ],
  },
  {
    nameKey: "generation",
    icon: Sparkles,
    color: "text-purple-400",
    fields: [
      { key: "max_gen_len", type: "number", min: 1 },
      { key: "temperature", type: "number", step: 0.1, min: 0 },
    ],
  },
];

interface Props {
  configId?: string | null;
}

export default function PlaygroundConfig({ configId }: Props) {
  const { t } = useTranslation("components");
  const [presets, setPresets] = useState<ModelConfig[]>([]);
  const [form, setForm] = useState<Partial<ModelConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors?: string[];
  } | null>(null);
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    architecture: true,
  });
  const [needsReinit, setNeedsReinit] = useState(false);

  const CATEGORIES = CATEGORY_DEFS.map((cat) => ({
    ...cat,
    name: t(`playground.config.categories.${cat.nameKey}`),
  }));

  // Original config from DB — used to detect changes that need re-init
  const [originalConfig, setOriginalConfig] = useState<Partial<ModelConfig>>(
    {},
  );

  useEffect(() => {
    if (!configId) return;
    setLoading(true);
    setNeedsReinit(false);
    Promise.all([getConfig(configId), getPresets()])
      .then(([cfgRes, presRes]) => {
        setForm(cfgRes.data);
        setOriginalConfig(cfgRes.data);
        setPresets(presRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [configId]);

  // Keys that require re-initialization when changed
  const REINIT_KEYS: (keyof ModelConfig)[] = [
    "tokenizer_type",
    "d_model",
    "n_heads",
    "n_layers",
    "d_ff",
    "seq_len",
  ];

  async function handleSave() {
    if (!configId) return;
    setSaving(true);
    setSaved(false);
    try {
      const res = await updateConfig(configId, form);
      const newData = res.data;
      // Detect if architecture/tokenizer changed vs what's running
      const changed = REINIT_KEYS.some(
        (k) =>
          originalConfig[k] !== undefined && originalConfig[k] !== newData[k],
      );
      setForm(newData);
      setOriginalConfig(newData);
      setValidationResult(null);
      setNeedsReinit(changed);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  async function handleValidate() {
    if (!configId) return;
    setValidating(true);
    try {
      const res = await validateConfig(configId);
      setValidationResult(res.data);
    } catch {
      setValidationResult({
        valid: false,
        errors: [t("playground.config.validationError")],
      });
    } finally {
      setValidating(false);
    }
  }

  function handleLoadPreset(preset: ModelConfig) {
    const { id, name, created_at, updated_at, is_preset, ...config } = preset;
    setForm((prev) => ({ ...prev, ...config }));
    setValidationResult(null);
    setSaved(false);
  }

  function updateField(key: keyof ModelConfig, value: string) {
    const numVal = Number(value);
    setForm((prev) => ({ ...prev, [key]: isNaN(numVal) ? value : numVal }));
    setSaved(false);
  }

  function toggleCategory(key: string) {
    setExpandedCats((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tip éducatif */}
      <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 text-sm text-blue-300">
        <Info className="w-4 h-4 inline mr-1" />
        {t("playground.config.educationalTip")}
      </div>

      {/* Préréglages rapides */}
      {presets.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">
            {t("playground.config.applyPreset")}
          </span>
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => handleLoadPreset(p)}
              className="px-3 py-1 rounded-full text-xs bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Sélecteur de Tokenizer */}
      <div className="border border-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-400" />
          <span className="font-medium text-gray-200">
            {t("playground.config.tokenizerLabel")}
          </span>
          <Link
            to="/training/tokenization"
            title={t("playground.config.seeLesson", { lesson: "Tokenisation" })}
            className="text-primary-400 hover:text-primary-300 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </Link>
        </div>
        <select
          value={form.tokenizer_type ?? "character"}
          onChange={(e) => {
            setForm((prev) => ({
              ...prev,
              tokenizer_type: e.target.value as ModelConfig["tokenizer_type"],
            }));
            setSaved(false);
          }}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-primary-500 outline-none"
        >
          <option value="character">
            {t("playground.config.tokenizerOptions.character")}
          </option>
          <option value="gpt4">
            {t("playground.config.tokenizerOptions.gpt4")}
          </option>
          <option value="claude">
            {t("playground.config.tokenizerOptions.claude")}
          </option>
        </select>
        {form.tokenizer_type && form.tokenizer_type !== "character" && (
          <div className="bg-blue-900/20 border border-blue-800/30 rounded p-2 text-xs text-blue-300">
            <Info className="w-3 h-3 inline mr-1" />
            {t("playground.config.bpeInfo")}
          </div>
        )}
      </div>

      {/* Catégories */}
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isExpanded = expandedCats[cat.nameKey] ?? false;
        return (
          <div
            key={cat.nameKey}
            className="border border-gray-800 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleCategory(cat.nameKey)}
              className="w-full flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
              <Icon className={`w-4 h-4 ${cat.color}`} />
              <span className="font-medium text-gray-200">{cat.name}</span>
              <ChevronRight
                className={`w-4 h-4 text-gray-500 ml-auto transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
            {isExpanded && (
              <div className="p-4 space-y-3">
                {cat.fields.map((field) => {
                  const glossaryKey = GLOSSARY_MAP[field.key];
                  const lesson = PARAM_TO_LESSON[field.key];
                  return (
                    <div key={field.key} className="flex items-center gap-3">
                      <label className="w-48 flex-shrink-0 text-sm flex items-center gap-1.5">
                        {glossaryKey ? (
                          <VulgarizedTerm termKey={glossaryKey} />
                        ) : (
                          <span className="text-gray-300">{field.key}</span>
                        )}
                        {lesson && (
                          <Link
                            to={lesson.path}
                            title={t("playground.config.seeLesson", {
                              lesson: t(lesson.labelKey),
                            })}
                            className="text-primary-400 hover:text-primary-300 transition-colors flex-shrink-0"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </label>
                      <input
                        type={field.type}
                        value={String(form[field.key] ?? "")}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        step={field.step}
                        min={field.min}
                        max={field.max}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-white text-sm focus:border-primary-500 outline-none"
                      />
                    </div>
                  );
                })}
                {cat.nameKey === "training" && (
                  <div className="flex items-center gap-3">
                    <label className="w-48 flex-shrink-0 text-sm flex items-center gap-1.5">
                      <VulgarizedTerm termKey="lr_schedule" />
                      <Link
                        to="/training/optimizer"
                        title={t("playground.config.seeLesson", {
                          lesson: "Optimiseur",
                        })}
                        className="text-primary-400 hover:text-primary-300 transition-colors flex-shrink-0"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </Link>
                    </label>
                    <select
                      value={form.lr_schedule ?? "constant"}
                      onChange={(e) => {
                        setForm((prev) => ({
                          ...prev,
                          lr_schedule: e.target
                            .value as ModelConfig["lr_schedule"],
                        }));
                        setSaved(false);
                      }}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-white text-sm focus:border-primary-500 outline-none"
                    >
                      <option value="constant">
                        {t("playground.config.lrScheduleOptions.constant")}
                      </option>
                      <option value="cosine">
                        {t("playground.config.lrScheduleOptions.cosine")}
                      </option>
                      <option value="cosine_restarts">
                        {t(
                          "playground.config.lrScheduleOptions.cosineRestarts",
                        )}
                      </option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Validation result */}
      {validationResult && (
        <div
          className={`p-3 rounded-lg text-sm ${
            validationResult.valid
              ? "bg-green-900/20 border border-green-800/30 text-green-300"
              : "bg-red-900/20 border border-red-800/30 text-red-300"
          }`}
        >
          {validationResult.valid ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> {t("playground.config.configValid")}
            </span>
          ) : (
            <div className="space-y-1">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />{" "}
                {t("playground.config.errorsLabel")}
              </span>
              <ul className="list-disc list-inside ml-4">
                {validationResult.errors?.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Warning: re-init needed */}
      {needsReinit && (
        <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-3 text-sm text-amber-300 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 flex-shrink-0" />
          {t("playground.config.reinitWarning")}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? t("playground.config.saved") : t("playground.config.save")}
        </button>
        <button
          onClick={handleValidate}
          disabled={validating}
          className="btn-secondary flex items-center gap-2"
        >
          {validating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {t("playground.config.validate")}
        </button>
      </div>
    </div>
  );
}
