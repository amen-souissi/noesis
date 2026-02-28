/**
 * Liste des instances LLM du Playground.
 *
 * Vue initiale : affiche les configs existantes sous forme de cartes,
 * permet d'en créer une nouvelle, sélectionner ou supprimer une existante.
 *
 * @module components/playground/InstanceList
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Cpu, Circle, Rocket, BookOpen, Trash2 } from "lucide-react";
import { useModelRegistryStore } from "@/stores/modelRegistryStore";
import { createConfig, deleteConfig } from "@/api/config";
import type { ModelConfig } from "@/types/config";

const STATUS_COLORS: Record<string, string> = {
  idle: "text-gray-500",
  ready: "text-green-400",
  training: "text-blue-400",
  paused: "text-amber-400",
};

function extractError(e: unknown, t: (key: string) => string): string {
  const data = (e as any)?.response?.data;
  if (!data) return t("playground.instanceList.networkError");
  if (typeof data === "string") return data;
  if (data.error) return data.error;
  if (data.detail) return data.detail;
  // DRF field errors: { name: ["msg"], ... }
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key]) && data[key].length > 0) {
      return `${key}: ${data[key][0]}`;
    }
  }
  return t("playground.instanceList.createError");
}

export default function InstanceList() {
  const { t } = useTranslation("components");
  const {
    configs,
    activeModels,
    setActiveConfigId,
    refreshConfigs,
    refreshModels,
    unloadModel,
  } = useModelRegistryStore();

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    refreshConfigs();
    refreshModels();
  }, [refreshConfigs, refreshModels]);

  function getModelStatus(configId: string) {
    const active = activeModels.find((m) => m.config_id === configId);
    return active?.status ?? "idle";
  }

  function getModelParams(configId: string) {
    const active = activeModels.find((m) => m.config_id === configId);
    return active?.total_parameters ?? 0;
  }

  function isLoaded(configId: string) {
    return activeModels.some((m) => m.config_id === configId);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setError(null);
    try {
      const res = await createConfig({ name: newName.trim() });
      await refreshConfigs();
      setActiveConfigId(res.data.id);
      setCreating(false);
      setNewName("");
    } catch (e: unknown) {
      setError(extractError(e, t));
    }
  }

  async function handleDelete(e: React.MouseEvent, config: ModelConfig) {
    e.stopPropagation();
    if (deleting) return;
    setDeleting(config.id);
    setError(null);
    try {
      // Unload from memory first if loaded
      if (isLoaded(config.id)) {
        await unloadModel(config.id);
      }
      await deleteConfig(config.id);
      await refreshConfigs();
    } catch (err: unknown) {
      setError(extractError(err, t));
    } finally {
      setDeleting(null);
    }
  }

  function handleSelect(config: ModelConfig) {
    setActiveConfigId(config.id);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {t("playground.instanceList.title")}
            </h1>
            <p className="text-gray-400 text-sm">
              {t("playground.instanceList.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Contexte éducatif */}
      <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 text-sm text-blue-200">
        <BookOpen className="w-4 h-4 inline mr-2" />
        {t("playground.instanceList.educationalContext")}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Liste des instances */}
      {configs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {configs.map((config) => {
            const status = getModelStatus(config.id);
            const params = getModelParams(config.id);
            const isDeleting = deleting === config.id;
            return (
              <div
                key={config.id}
                className="relative bg-gray-800/50 rounded-lg p-4 border border-gray-800 hover:border-primary-500/50 hover:bg-gray-800/80 transition-all group cursor-pointer"
                onClick={() => handleSelect(config)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
                    <span className="font-medium text-white">
                      {config.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center gap-1 text-xs ${STATUS_COLORS[status]}`}
                    >
                      <Circle className="w-2 h-2 fill-current" />
                      {t(`playground.instanceList.statusLabels.${status}`, {
                        defaultValue: t(
                          "playground.instanceList.statusLabels.idle",
                        ),
                      })}
                    </span>
                    {!config.is_preset && (
                      <button
                        onClick={(e) => handleDelete(e, config)}
                        disabled={isDeleting}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        title={t("playground.instanceList.deleteInstance")}
                        aria-label={t("playground.instanceList.deleteLabel", {
                          name: config.name,
                        })}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div className="flex items-center gap-3">
                    <span>
                      {t(
                        `playground.instanceList.tokenizerLabels.${config.tokenizer_type}`,
                        { defaultValue: config.tokenizer_type },
                      )}
                    </span>
                    <span>
                      {t("playground.instanceList.layers", {
                        count: config.n_layers,
                      })}
                    </span>
                    <span>d={config.d_model}</span>
                  </div>
                  {params > 0 && (
                    <div>
                      {t("playground.instanceList.parameters", {
                        count: Number((params / 1000).toFixed(1)),
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Cpu className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">
            {t("playground.instanceList.noInstances")}
          </p>
          <p className="text-sm text-gray-500">
            {t("playground.instanceList.noInstancesHint")}
          </p>
        </div>
      )}

      {/* Bouton créer / formulaire */}
      {creating ? (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-800 space-y-3">
          <label className="text-sm text-gray-300">
            {t("playground.instanceList.instanceNameLabel")}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder={t("playground.instanceList.namePlaceholder")}
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-primary-500 outline-none"
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="btn-primary px-4 py-2 text-sm"
            >
              {t("playground.instanceList.create")}
            </button>
            <button
              onClick={() => {
                setCreating(false);
                setNewName("");
                setError(null);
              }}
              className="btn-secondary px-4 py-2 text-sm"
            >
              {t("playground.instanceList.cancel")}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 btn-primary px-4 py-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          {t("playground.instanceList.newInstance")}
        </button>
      )}
    </div>
  );
}
