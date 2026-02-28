/**
 * Terrain de jeu interactif.
 *
 * Vue à deux niveaux :
 * 1. Liste d'instances LLM (si aucune sélectionnée)
 * 2. Onglets config/données/entraînement/chat (si une instance est sélectionnée)
 *
 * @module pages/PlaygroundPage
 */

import { useState, useEffect } from "react";
import {
  Settings,
  Database,
  Zap,
  MessageSquare,
  Rocket,
  ArrowLeft,
  Circle,
  Cpu,
  RefreshCw,
  Trash2,
  Loader2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProgress } from "@/hooks/useProgress";
import { useModelRegistryStore } from "@/stores/modelRegistryStore";
import { useTraining } from "@/hooks/useTraining";
import { deleteConfig } from "@/api/config";
import { initializeModel } from "@/api/training";
import { unloadModel } from "@/api/models";
import InstanceList from "@/components/playground/InstanceList";
import PlaygroundConfig from "@/components/playground/PlaygroundConfig";
import PlaygroundData from "@/components/playground/PlaygroundData";
import PlaygroundTraining from "@/components/playground/PlaygroundTraining";
import PlaygroundChat from "@/components/playground/PlaygroundChat";
import type { TFunction } from "i18next";

function getTabs(t: TFunction) {
  return [
    {
      id: "config" as const,
      label: t("playground.tabs.config.label"),
      icon: Settings,
      color: "text-blue-400 border-blue-400",
      description: t("playground.tabs.config.description"),
    },
    {
      id: "data" as const,
      label: t("playground.tabs.data.label"),
      icon: Database,
      color: "text-amber-400 border-amber-400",
      description: t("playground.tabs.data.description"),
    },
    {
      id: "train" as const,
      label: t("playground.tabs.train.label"),
      icon: Zap,
      color: "text-green-400 border-green-400",
      description: t("playground.tabs.train.description"),
    },
    {
      id: "chat" as const,
      label: t("playground.tabs.chat.label"),
      icon: MessageSquare,
      color: "text-purple-400 border-purple-400",
      description: t("playground.tabs.chat.description"),
    },
  ];
}

type TabId = "config" | "data" | "train" | "chat";

const STATUS_COLORS: Record<string, string> = {
  idle: "text-gray-500",
  ready: "text-green-400",
  training: "text-blue-400",
  paused: "text-amber-400",
};

export default function PlaygroundPage() {
  const { t } = useTranslation("pages");
  useProgress("playground");
  const [activeTab, setActiveTab] = useState<TabId>("config");
  const [modelAction, setModelAction] = useState<
    "initializing" | "reinitializing" | "deleting" | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeConfigId = useModelRegistryStore((s) => s.activeConfigId);
  const setActiveConfigId = useModelRegistryStore((s) => s.setActiveConfigId);
  const configs = useModelRegistryStore((s) => s.configs);
  const activeModels = useModelRegistryStore((s) => s.activeModels);
  const refreshConfigs = useModelRegistryStore((s) => s.refreshConfigs);
  const refreshModels = useModelRegistryStore((s) => s.refreshModels);

  // Training hook — owned here so wsConnected is available in the header
  const training = useTraining(activeConfigId ?? undefined);

  // Sync with backend on mount and config change
  useEffect(() => {
    refreshModels();
    refreshConfigs();
  }, [activeConfigId, refreshModels, refreshConfigs]);

  // Periodic refresh while on the page
  useEffect(() => {
    const interval = setInterval(refreshModels, 5000);
    return () => clearInterval(interval);
  }, [refreshModels]);

  // Si aucune instance sélectionnée → afficher la liste
  if (!activeConfigId) {
    return <InstanceList />;
  }

  const TABS = getTabs(t);
  const currentTab = TABS.find((tab) => tab.id === activeTab)!;
  const currentConfig = configs.find((c) => c.id === activeConfigId);
  const activeModel = activeModels.find((m) => m.config_id === activeConfigId);
  const modelStatus = activeModel?.status ?? "idle";
  const isModelReady = activeModel?.is_ready ?? false;
  const totalParams = activeModel?.total_parameters ?? 0;
  const lastLoss = activeModel?.last_loss ?? null;
  const isPreset = currentConfig?.is_preset ?? false;
  const busy = modelAction !== null;

  const STATUS_LABELS: Record<string, string> = {
    idle: t("playground.status.idle"),
    ready: t("playground.status.ready"),
    training: t("playground.status.training"),
    paused: t("playground.status.paused"),
  };

  async function handleInitModel() {
    if (!activeConfigId) return;
    setModelAction("initializing");
    setActionError(null);
    try {
      await initializeModel(activeConfigId);
      await refreshModels();
    } catch (e: any) {
      setActionError(
        e?.response?.data?.error || t("playground.errors.initFailed"),
      );
    } finally {
      setModelAction(null);
    }
  }

  async function handleReinitModel() {
    if (!activeConfigId) return;
    setModelAction("reinitializing");
    setActionError(null);
    try {
      await unloadModel(activeConfigId);
      await initializeModel(activeConfigId);
      await refreshModels();
    } catch (e: any) {
      setActionError(
        e?.response?.data?.error || t("playground.errors.reinitFailed"),
      );
      await refreshModels();
    } finally {
      setModelAction(null);
    }
  }

  async function handleDeleteConfig() {
    if (!activeConfigId || isPreset) return;
    setModelAction("deleting");
    setActionError(null);
    try {
      if (activeModel) {
        await unloadModel(activeConfigId);
      }
      await deleteConfig(activeConfigId);
      await refreshConfigs();
      setActiveConfigId(null);
    } catch (e: any) {
      setActionError(
        e?.response?.data?.error || t("playground.errors.deleteFailed"),
      );
      setModelAction(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header — sticky, flush with scroll viewport top */}
      <div className="sticky top-0 z-20 bg-gray-950 -mx-6 px-6 pb-3 pt-4 border-b border-gray-800/50 space-y-3">
        {/* Ligne 1 : Titre + retour */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">
              {currentConfig?.name ?? t("playground.defaultTitle")}
            </h1>
          </div>
          <button
            onClick={() => setActiveConfigId(null)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("playground.backButton")}
          </button>
        </div>

        {/* Ligne 2 : Statut du modèle + WS + actions */}
        <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-4 py-2.5 border border-gray-800">
          {/* Statut modèle */}
          <span
            className={`flex items-center gap-1.5 text-sm ${STATUS_COLORS[modelStatus]}`}
          >
            <Circle className="w-2.5 h-2.5 fill-current" />
            {STATUS_LABELS[modelStatus] ?? t("playground.status.default")}
          </span>

          {/* Params */}
          {totalParams > 0 && (
            <>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-400">
                {(totalParams / 1000).toFixed(1)}k params
              </span>
            </>
          )}

          {/* Loss */}
          {lastLoss != null && (
            <>
              <span className="text-gray-700">·</span>
              <span className="text-xs text-gray-400">
                Loss: {lastLoss.toFixed(4)}
              </span>
            </>
          )}

          {/* WS status */}
          <span className="text-gray-700">·</span>
          <span
            className={`flex items-center gap-1 text-xs ${training.wsConnected ? "text-green-400" : "text-red-400"}`}
          >
            {training.wsConnected ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            {training.wsConnected
              ? t("playground.ws.connected")
              : t("playground.ws.disconnected")}
          </span>

          {/* Actions — alignées à droite */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Initialiser (si pas chargé) */}
            {!isModelReady && modelStatus === "idle" && (
              <button
                onClick={handleInitModel}
                disabled={busy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 border border-primary-500/30 transition-colors disabled:opacity-50"
              >
                {modelAction === "initializing" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Cpu className="w-3.5 h-3.5" />
                )}
                {modelAction === "initializing"
                  ? t("playground.actions.initializing")
                  : t("playground.actions.initialize")}
              </button>
            )}

            {/* Ré-initialiser (si chargé) */}
            {isModelReady && (
              <button
                onClick={handleReinitModel}
                disabled={busy || modelStatus === "training"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-amber-300 hover:bg-amber-500/10 border border-gray-700 hover:border-amber-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t("playground.actions.reinitializeTooltip")}
              >
                {modelAction === "reinitializing" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {t("playground.actions.reinitialize")}
              </button>
            )}

            {/* Supprimer (seulement pour les non-presets) */}
            {!isPreset && (
              <button
                onClick={handleDeleteConfig}
                disabled={busy || modelStatus === "training"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 border border-gray-700 hover:border-red-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t("playground.actions.deleteTooltip")}
              >
                {modelAction === "deleting" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                {t("playground.actions.delete")}
              </button>
            )}
          </div>
        </div>

        {/* Erreur */}
        {actionError && (
          <p className="text-xs text-red-400 px-1">{actionError}</p>
        )}

        {/* Ligne 3 : Tabs */}
        <nav className="flex gap-1 border-b border-gray-800">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? `${tab.color} bg-gray-800/30`
                    : "text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab description */}
      <p className="text-sm text-gray-500 mt-6">{currentTab.description}</p>

      {/* Tab content */}
      <div className="min-h-[400px] mt-6">
        {activeTab === "config" && (
          <PlaygroundConfig configId={activeConfigId} />
        )}
        {activeTab === "data" && (
          <PlaygroundData
            configId={activeConfigId}
            onDataChanged={refreshConfigs}
          />
        )}
        {activeTab === "train" && (
          <PlaygroundTraining configId={activeConfigId} training={training} />
        )}
        {activeTab === "chat" && <PlaygroundChat configId={activeConfigId} />}
      </div>
    </div>
  );
}
