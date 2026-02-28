import api from "./client";
import type { TrainingData, Corpus } from "@/types/config";

export const getDataFiles = () =>
  api.get<{ results: TrainingData[] }>("/data/");
export const uploadFile = (file: File, name?: string, configId?: string) => {
  const form = new FormData();
  form.append("file", file);
  if (name) form.append("name", name);
  if (configId) form.append("config_id", configId);
  return api.post<TrainingData>("/data/upload/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const deleteFile = (id: string) => api.delete(`/data/${id}/`);
export const toggleFile = (id: string) =>
  api.patch<TrainingData>(`/data/${id}/toggle/`);
export const getCorpus = (configId?: string) =>
  api.get<Corpus>("/data/corpus/", {
    params: configId ? { config_id: configId } : {},
  });
export const loadSampleData = () => api.post<TrainingData>("/data/sample/");

// Per-config data linking
export const linkDataToConfig = (configId: string, dataId: string) =>
  api.post(`/configs/${configId}/data/${dataId}/`);
export const unlinkDataFromConfig = (configId: string, dataId: string) =>
  api.delete(`/configs/${configId}/data/${dataId}/`);
export const toggleDataForConfig = (configId: string, dataId: string) =>
  api.patch<{ linked: boolean; is_active: boolean }>(
    `/configs/${configId}/data/${dataId}/`,
  );
