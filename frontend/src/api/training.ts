import api from "./client";
import type { TrainingStatus, TrainingRun } from "@/types/training";

export const initializeModel = (configId: string) =>
  api.post<{ status: string; vocab_size: number; total_parameters: number }>(
    "/training/initialize/",
    { config_id: configId },
  );
export const startTraining = (
  configId: string,
  numEpochs?: number,
  continueTraining?: boolean,
) =>
  api.post<{
    run_id: string;
    total_epochs: number;
    vocab_size: number;
    total_parameters: number;
  }>("/training/start/", {
    config_id: configId,
    num_epochs: numEpochs,
    continue_training: continueTraining,
  });
export const stopTraining = (configId?: string) =>
  api.post("/training/stop/", configId ? { config_id: configId } : {});
export const pauseTraining = (configId?: string) =>
  api.post("/training/pause/", configId ? { config_id: configId } : {});
export const resumeTraining = (configId?: string) =>
  api.post("/training/resume/", configId ? { config_id: configId } : {});
export const getTrainingStatus = (configId?: string) =>
  api.get<TrainingStatus>(
    "/training/status/",
    configId ? { params: { config_id: configId } } : undefined,
  );
export const getTrainingHistory = (configId?: string) =>
  api.get<{ results: TrainingRun[] }>(
    "/training/history/",
    configId ? { params: { config_id: configId } } : undefined,
  );
export const getTrainingRun = (id: string) =>
  api.get<TrainingRun>(`/training/history/${id}/`);
