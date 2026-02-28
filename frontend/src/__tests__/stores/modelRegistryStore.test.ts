import { describe, it, expect, vi, beforeEach } from "vitest";
import { useModelRegistryStore } from "@/stores/modelRegistryStore";

const mockGetActiveModels = vi.fn();
const mockUnloadModel = vi.fn();
const mockGetConfigs = vi.fn();

vi.mock("@/api/models", () => ({
  getActiveModels: (...args: unknown[]) => mockGetActiveModels(...args),
  unloadModel: (...args: unknown[]) => mockUnloadModel(...args),
}));

vi.mock("@/api/config", () => ({
  getConfigs: (...args: unknown[]) => mockGetConfigs(...args),
}));

describe("modelRegistryStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useModelRegistryStore.setState({
      activeModels: [],
      configs: [],
      activeConfigId: null,
    });
  });

  it("démarre avec un état vide", () => {
    const state = useModelRegistryStore.getState();
    expect(state.activeModels).toEqual([]);
    expect(state.configs).toEqual([]);
    expect(state.activeConfigId).toBeNull();
  });

  it("setActiveConfigId met à jour le modèle actif", () => {
    useModelRegistryStore.getState().setActiveConfigId("abc-123");
    expect(useModelRegistryStore.getState().activeConfigId).toBe("abc-123");
  });

  it("refreshModels charge les modèles actifs", async () => {
    const models = [
      {
        config_id: "c1",
        is_ready: true,
        status: "ready",
        is_active: true,
        total_parameters: 1000,
        last_loss: 2.5,
      },
    ];
    mockGetActiveModels.mockResolvedValue({ data: models });

    await useModelRegistryStore.getState().refreshModels();
    expect(useModelRegistryStore.getState().activeModels).toEqual(models);
    expect(mockGetActiveModels).toHaveBeenCalledTimes(1);
  });

  it("refreshModels gère les erreurs silencieusement", async () => {
    mockGetActiveModels.mockRejectedValue(new Error("Network error"));
    await useModelRegistryStore.getState().refreshModels();
    expect(useModelRegistryStore.getState().activeModels).toEqual([]);
  });

  it("refreshConfigs charge les configs sans auto-sélection", async () => {
    const configs = [
      { id: "cfg-1", name: "Config 1" },
      { id: "cfg-2", name: "Config 2" },
    ];
    mockGetConfigs.mockResolvedValue({ data: { results: configs } });

    await useModelRegistryStore.getState().refreshConfigs();
    const state = useModelRegistryStore.getState();
    expect(state.configs).toEqual(configs);
    expect(state.activeConfigId).toBeNull();
  });

  it("refreshConfigs ne change pas la sélection si déjà définie", async () => {
    useModelRegistryStore.setState({ activeConfigId: "cfg-2" });
    const configs = [{ id: "cfg-1", name: "Config 1" }];
    mockGetConfigs.mockResolvedValue({ data: { results: configs } });

    await useModelRegistryStore.getState().refreshConfigs();
    expect(useModelRegistryStore.getState().activeConfigId).toBe("cfg-2");
  });

  it("unloadModel appelle l'API et rafraîchit", async () => {
    mockUnloadModel.mockResolvedValue({});
    mockGetActiveModels.mockResolvedValue({ data: [] });

    await useModelRegistryStore.getState().unloadModel("cfg-1");
    expect(mockUnloadModel).toHaveBeenCalledWith("cfg-1");
    expect(mockGetActiveModels).toHaveBeenCalled();
  });
});
