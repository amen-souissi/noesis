/**
 * Barre de sélection du modèle actif dans le Playground.
 *
 * Affiche la liste des configs disponibles, l'état en mémoire
 * (idle, ready, training, paused) et permet de basculer entre modèles.
 *
 * @module components/playground/ModelSwitcher
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Cpu, Trash2, Circle } from "lucide-react";
import { useModelRegistryStore } from "@/stores/modelRegistryStore";

const STATUS_COLORS: Record<string, string> = {
  idle: "text-gray-500",
  ready: "text-green-400",
  training: "text-blue-400",
  paused: "text-amber-400",
};

export default function ModelSwitcher() {
  const { t } = useTranslation("components");
  const {
    configs,
    activeModels,
    activeConfigId,
    setActiveConfigId,
    refreshModels,
    refreshConfigs,
    unloadModel,
  } = useModelRegistryStore();

  useEffect(() => {
    refreshConfigs();
    refreshModels();
  }, [refreshConfigs, refreshModels]);

  // Refresh active models periodically while training
  useEffect(() => {
    const interval = setInterval(refreshModels, 5000);
    return () => clearInterval(interval);
  }, [refreshModels]);

  function getModelStatus(configId: string) {
    const active = activeModels.find((m) => m.config_id === configId);
    return active?.status ?? "idle";
  }

  function getModelParams(configId: string) {
    const active = activeModels.find((m) => m.config_id === configId);
    return active?.total_parameters ?? 0;
  }

  function getModelLoss(configId: string) {
    const active = activeModels.find((m) => m.config_id === configId);
    return active?.last_loss ?? null;
  }

  function isLoaded(configId: string) {
    return activeModels.some((m) => m.config_id === configId);
  }

  return (
    <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-800">
      <Cpu className="w-4 h-4 text-gray-400 flex-shrink-0" />

      <select
        value={activeConfigId ?? ""}
        onChange={(e) => setActiveConfigId(e.target.value || null)}
        className="bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white flex-1 max-w-xs focus:border-primary-500 outline-none"
        aria-label={t("playground.modelSwitcher.selectModel")}
      >
        <option value="">{t("playground.modelSwitcher.chooseModel")}</option>
        {configs.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name || `Config #${c.id.slice(0, 8)}`}
          </option>
        ))}
      </select>

      {/* Status indicator */}
      {activeConfigId && (
        <div className="flex items-center gap-4 text-xs">
          <span
            className={`flex items-center gap-1 ${STATUS_COLORS[getModelStatus(activeConfigId)]}`}
          >
            <Circle className="w-2 h-2 fill-current" />
            {t(
              `playground.instanceList.statusLabels.${getModelStatus(activeConfigId)}`,
              { defaultValue: t("playground.instanceList.statusLabels.idle") },
            )}
          </span>

          {isLoaded(activeConfigId) && getModelParams(activeConfigId) > 0 && (
            <span className="text-gray-400">
              {(getModelParams(activeConfigId) / 1000).toFixed(1)}k params
            </span>
          )}

          {getModelLoss(activeConfigId) != null && (
            <span className="text-gray-400">
              Loss: {getModelLoss(activeConfigId)!.toFixed(4)}
            </span>
          )}

          {isLoaded(activeConfigId) && (
            <button
              onClick={() => unloadModel(activeConfigId)}
              className="text-gray-500 hover:text-red-400 transition-colors"
              title={t("playground.modelSwitcher.unloadTitle")}
              aria-label={t("playground.modelSwitcher.unloadLabel")}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
