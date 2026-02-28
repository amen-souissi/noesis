import api from "./client";
import type { ModelConfig } from "@/types/config";

export const getConfigs = () =>
  api.get<{ results: ModelConfig[] }>("/configs/");
export const getConfig = (id: string) =>
  api.get<ModelConfig>(`/configs/${id}/`);
export const createConfig = (data: Partial<ModelConfig>) =>
  api.post<ModelConfig>("/configs/", data);
export const updateConfig = (id: string, data: Partial<ModelConfig>) =>
  api.patch<ModelConfig>(`/configs/${id}/`, data);
export const deleteConfig = (id: string) => api.delete(`/configs/${id}/`);
export const getPresets = () => api.get<ModelConfig[]>("/configs/presets/");
export const validateConfig = (id: string) =>
  api.post<{ valid: boolean; errors: string[] }>(`/configs/${id}/validate/`);
export const duplicateConfig = (id: string) =>
  api.post<ModelConfig>(`/configs/${id}/duplicate/`);
