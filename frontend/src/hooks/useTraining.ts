import { useCallback, useEffect, useRef } from "react";
import { useTrainingStore } from "@/stores/trainingStore";
import { useWebSocket } from "./useWebSocket";
import { getTrainingStatus } from "@/api/training";
import type { TrainingMessage } from "@/types/training";

/**
 * Hook d'entraînement avec filtrage par config_id.
 *
 * Si configId est fourni, seuls les messages WebSocket de ce modèle
 * sont pris en compte. Sinon, tous les messages sont acceptés.
 *
 * Charge le status initial depuis l'API REST au mount pour synchroniser
 * l'état si l'entraînement était déjà en cours/en pause.
 */
export function useTraining(configId?: string) {
  const store = useTrainingStore();
  const configIdRef = useRef(configId);
  configIdRef.current = configId;

  // Fetch initial status from REST API on mount / configId change
  useEffect(() => {
    async function fetchInitialStatus() {
      try {
        const res = await getTrainingStatus(configId);
        const { status, loss_history } = res.data;
        if (status && status !== "idle") {
          store.setStatus(status);
        }
        if (loss_history && loss_history.length > 0) {
          store.setLossHistory(loss_history);
          store.setEpoch(loss_history.length, 0);
        }
      } catch {
        /* ignore — backend may be offline */
      }
    }
    fetchInitialStatus();
  }, [configId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMessage = useCallback(
    (data: TrainingMessage) => {
      // Filtrer par config_id si fourni
      if (
        configIdRef.current &&
        data.config_id &&
        data.config_id !== configIdRef.current
      ) {
        return;
      }

      if (data.type === "training.epoch_complete") {
        store.setEpoch(data.epoch ?? 0, data.total_epochs ?? 0);
        if (data.loss !== undefined) store.addLoss(data.loss);
        if (data.loss_history) store.setLossHistory(data.loss_history);
        if (data.elapsed_seconds) store.setElapsed(data.elapsed_seconds);
        if (data.weight_snapshot) store.setWeightSnapshot(data.weight_snapshot);
      } else if (data.type === "training.batch_complete") {
        store.setBatch(data.batch ?? 0, data.total_batches ?? 0);
        if (data.batch_loss !== undefined) store.setBatchLoss(data.batch_loss);
      } else if (data.type === "training.status_change") {
        store.setStatus(data.status ?? "idle");
      }
    },
    [store],
  );

  const { connected } = useWebSocket<TrainingMessage>(
    "ws/training/",
    handleMessage,
  );

  return { ...store, wsConnected: connected };
}
