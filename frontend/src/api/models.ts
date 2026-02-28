import api from "./client";
import type { SavedModel, CurrentModel, ActiveModel } from "@/types/model";

export const getModels = () => api.get<{ results: SavedModel[] }>("/models/");
export const saveModel = (
  name: string,
  configId: string,
  description?: string,
) =>
  api.post<SavedModel>("/models/save/", {
    name,
    config_id: configId,
    description,
  });
export const loadModel = (id: string) =>
  api.post<{
    message: string;
    config_id: string;
    total_parameters: number;
    vocab_size: number;
  }>(`/models/${id}/load/`);
export const deleteModel = (id: string) => api.delete(`/models/${id}/`);
export const getCurrentModel = (configId?: string) =>
  api.get<CurrentModel>(
    "/models/current/",
    configId ? { params: { config_id: configId } } : undefined,
  );
export const getActiveModels = () => api.get<ActiveModel[]>("/models/active/");
export const unloadModel = (configId: string) =>
  api.delete(`/models/active/${configId}/`);
