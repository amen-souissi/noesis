import api from "./client";
import type { ModuleSummary, ModuleDetail, DataFlow } from "@/types/docs";

export const getModules = () => api.get<ModuleSummary[]>("/docs/modules/");
export const getModuleDetail = (slug: string) =>
  api.get<ModuleDetail>(`/docs/modules/${slug}/`);
export const getDataFlow = () => api.get<DataFlow>("/docs/flow/");
