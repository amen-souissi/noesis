/**
 * Tests pour ModelSwitcher.
 * Vérifie le sélecteur de modèle, l'affichage du statut et le bouton de déchargement.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ModelSwitcher from "@/components/playground/ModelSwitcher";
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

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("ModelSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetActiveModels.mockResolvedValue({ data: [] });
    mockGetConfigs.mockResolvedValue({ data: { results: [] } });
    useModelRegistryStore.setState({
      activeModels: [],
      configs: [],
      activeConfigId: null,
    });
  });

  it("affiche le sélecteur de modèle", async () => {
    renderWithRouter(<ModelSwitcher />);
    expect(screen.getByLabelText("Sélectionner un modèle")).toBeTruthy();
  });

  it("affiche les configs dans le sélecteur", async () => {
    useModelRegistryStore.setState({
      configs: [
        { id: "c1", name: "Mon modèle" } as any,
        { id: "c2", name: "Autre modèle" } as any,
      ],
    });

    renderWithRouter(<ModelSwitcher />);
    expect(screen.getByText("Mon modèle")).toBeTruthy();
    expect(screen.getByText("Autre modèle")).toBeTruthy();
  });

  it("affiche le statut du modèle actif", async () => {
    useModelRegistryStore.setState({
      configs: [{ id: "c1", name: "Test" } as any],
      activeModels: [
        {
          config_id: "c1",
          is_ready: true,
          status: "ready",
          is_active: true,
          total_parameters: 5000,
          last_loss: null,
        },
      ],
      activeConfigId: "c1",
    });

    renderWithRouter(<ModelSwitcher />);
    expect(screen.getByText("Prêt")).toBeTruthy();
    expect(screen.getByText("5.0k params")).toBeTruthy();
  });

  it("affiche le statut training", async () => {
    useModelRegistryStore.setState({
      configs: [{ id: "c1", name: "Test" } as any],
      activeModels: [
        {
          config_id: "c1",
          is_ready: true,
          status: "training",
          is_active: true,
          total_parameters: 2000,
          last_loss: 3.14,
        },
      ],
      activeConfigId: "c1",
    });

    renderWithRouter(<ModelSwitcher />);
    expect(screen.getByText("Entraînement")).toBeTruthy();
    expect(screen.getByText("Loss: 3.1400")).toBeTruthy();
  });

  it("change le modèle actif au changement du sélecteur", async () => {
    useModelRegistryStore.setState({
      configs: [
        { id: "c1", name: "Config 1" } as any,
        { id: "c2", name: "Config 2" } as any,
      ],
      activeConfigId: "c1",
    });

    renderWithRouter(<ModelSwitcher />);
    const select = screen.getByLabelText(
      "Sélectionner un modèle",
    ) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "c2" } });

    expect(useModelRegistryStore.getState().activeConfigId).toBe("c2");
  });

  it("affiche le bouton de déchargement pour un modèle chargé", async () => {
    useModelRegistryStore.setState({
      configs: [{ id: "c1", name: "Test" } as any],
      activeModels: [
        {
          config_id: "c1",
          is_ready: true,
          status: "ready",
          is_active: true,
          total_parameters: 1000,
          last_loss: null,
        },
      ],
      activeConfigId: "c1",
    });

    renderWithRouter(<ModelSwitcher />);
    expect(screen.getByLabelText("Décharger le modèle")).toBeTruthy();
  });

  it("n'affiche pas le bouton de déchargement pour un modèle non chargé", async () => {
    useModelRegistryStore.setState({
      configs: [{ id: "c1", name: "Test" } as any],
      activeModels: [],
      activeConfigId: "c1",
    });

    renderWithRouter(<ModelSwitcher />);
    expect(screen.queryByLabelText("Décharger le modèle")).toBeNull();
  });
});
