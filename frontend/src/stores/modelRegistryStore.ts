import { create } from "zustand";
import type { ActiveModel } from "@/types/model";
import type { ModelConfig } from "@/types/config";
import { getActiveModels, unloadModel as apiUnloadModel } from "@/api/models";
import { getConfigs } from "@/api/config";

interface ModelRegistryState {
  /** Models currently loaded in backend memory */
  activeModels: ActiveModel[];
  /** All available configs (from DB) */
  configs: ModelConfig[];
  /** Currently selected config_id in the Playground */
  activeConfigId: string | null;

  setActiveConfigId: (id: string | null) => void;
  refreshModels: () => Promise<void>;
  refreshConfigs: () => Promise<void>;
  unloadModel: (configId: string) => Promise<void>;
}

export const useModelRegistryStore = create<ModelRegistryState>((set, get) => ({
  activeModels: [],
  configs: [],
  activeConfigId: null,

  setActiveConfigId: (activeConfigId) => set({ activeConfigId }),

  refreshModels: async () => {
    try {
      const res = await getActiveModels();
      set({ activeModels: res.data });
    } catch {
      /* ignore */
    }
  },

  refreshConfigs: async () => {
    try {
      const res = await getConfigs();
      const configs = res.data.results;
      set({ configs });
    } catch {
      /* ignore */
    }
  },

  unloadModel: async (configId) => {
    try {
      await apiUnloadModel(configId);
      await get().refreshModels();
    } catch {
      /* ignore */
    }
  },
}));
