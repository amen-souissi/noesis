/**
 * Tests pour PlaygroundData.
 * Vérifie : le bouton de données d'exemple, le chargement auto des liens,
 * le toggle par config, et l'affichage des fichiers liés.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlaygroundData from "@/components/playground/PlaygroundData";

const mockLoadSampleData = vi.fn();
const mockGetDataFiles = vi.fn();
const mockGetCorpus = vi.fn();
const mockLinkDataToConfig = vi.fn();
const mockToggleDataForConfig = vi.fn();
const mockUnlinkDataFromConfig = vi.fn();
const mockGetConfig = vi.fn();

vi.mock("@/api/data", () => ({
  getDataFiles: (...args: unknown[]) => mockGetDataFiles(...args),
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
  toggleFile: vi.fn(),
  getCorpus: (...args: unknown[]) => mockGetCorpus(...args),
  loadSampleData: (...args: unknown[]) => mockLoadSampleData(...args),
  linkDataToConfig: (...args: unknown[]) => mockLinkDataToConfig(...args),
  unlinkDataFromConfig: (...args: unknown[]) =>
    mockUnlinkDataFromConfig(...args),
  toggleDataForConfig: (...args: unknown[]) => mockToggleDataForConfig(...args),
}));

vi.mock("@/api/config", () => ({
  getConfig: (...args: unknown[]) => mockGetConfig(...args),
  getConfigs: vi.fn(),
  createConfig: vi.fn(),
  updateConfig: vi.fn(),
  deleteConfig: vi.fn(),
  getPresets: vi.fn(),
  validateConfig: vi.fn(),
  duplicateConfig: vi.fn(),
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const EMPTY_CORPUS = {
  text: "",
  total_chars: 0,
  unique_chars: 0,
  file_count: 0,
  full_text: "",
};

describe("PlaygroundData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDataFiles.mockResolvedValue({ data: { results: [] } });
    mockGetCorpus.mockResolvedValue({ data: EMPTY_CORPUS });
    mockGetConfig.mockResolvedValue({
      data: { training_data_links: [] },
    });
    mockLoadSampleData.mockResolvedValue({
      data: { id: "1", name: "Données d'exemple", char_count: 500 },
    });
    mockLinkDataToConfig.mockResolvedValue({});
    mockToggleDataForConfig.mockResolvedValue({
      data: { linked: true, is_active: true },
    });
    mockUnlinkDataFromConfig.mockResolvedValue({});
  });

  it("affiche le bouton de données d'exemple", async () => {
    renderWithRouter(<PlaygroundData configId="cfg-1" />);
    await waitFor(() => {
      expect(screen.getByText(/Charger les données d'exemple/)).toBeTruthy();
    });
  });

  it("appelle loadSampleData au clic sur le bouton", async () => {
    renderWithRouter(<PlaygroundData configId="cfg-1" />);
    await waitFor(() => {
      expect(screen.getByText(/Charger les données d'exemple/)).toBeTruthy();
    });

    fireEvent.click(screen.getByText(/Charger les données d'exemple/));
    await waitFor(() => {
      expect(mockLoadSampleData).toHaveBeenCalledTimes(1);
    });
  });

  it("affiche le contexte éducatif", async () => {
    renderWithRouter(<PlaygroundData configId="cfg-1" />);
    await waitFor(() => {
      expect(screen.getByText(/Les données d'entraînement/)).toBeTruthy();
    });
  });

  it("recharge les données après chargement de l'exemple", async () => {
    renderWithRouter(<PlaygroundData configId="cfg-1" />);
    await waitFor(() => {
      expect(screen.getByText(/Charger les données d'exemple/)).toBeTruthy();
    });

    fireEvent.click(screen.getByText(/Charger les données d'exemple/));
    await waitFor(() => {
      // loadData() should have been called again (initial + after sample)
      expect(mockGetDataFiles).toHaveBeenCalledTimes(2);
    });
  });

  it("affiche une erreur si le chargement échoue", async () => {
    mockLoadSampleData.mockRejectedValue(new Error("Network error"));

    renderWithRouter(<PlaygroundData configId="cfg-1" />);
    await waitFor(() => {
      expect(screen.getByText(/Charger les données d'exemple/)).toBeTruthy();
    });

    fireEvent.click(screen.getByText(/Charger les données d'exemple/));
    await waitFor(() => {
      expect(screen.getByText(/Erreur lors du chargement/)).toBeTruthy();
    });
  });

  // ── Tests self-fetching links ─────────────────────────

  it("récupère les liens depuis getConfig", async () => {
    renderWithRouter(<PlaygroundData configId="cfg-1" />);
    await waitFor(() => {
      expect(mockGetConfig).toHaveBeenCalledWith("cfg-1");
    });
  });

  it("affiche les fichiers liés à la config", async () => {
    const fileId = "file-abc";
    mockGetDataFiles.mockResolvedValue({
      data: {
        results: [
          { id: fileId, name: "train.txt", file_size: 500, char_count: 100 },
        ],
      },
    });
    mockGetConfig.mockResolvedValue({
      data: {
        training_data_links: [{ id: fileId, is_active: true }],
      },
    });
    mockGetCorpus.mockResolvedValue({
      data: {
        ...EMPTY_CORPUS,
        file_count: 1,
        total_chars: 100,
        unique_chars: 20,
      },
    });

    renderWithRouter(<PlaygroundData configId="cfg-1" />);
    await waitFor(() => {
      expect(screen.getByText("train.txt")).toBeTruthy();
    });
  });

  it("n'affiche pas les fichiers non liés", async () => {
    mockGetDataFiles.mockResolvedValue({
      data: {
        results: [
          { id: "file-1", name: "linked.txt", file_size: 100, char_count: 50 },
          {
            id: "file-2",
            name: "unlinked.txt",
            file_size: 200,
            char_count: 80,
          },
        ],
      },
    });
    mockGetConfig.mockResolvedValue({
      data: {
        training_data_links: [{ id: "file-1", is_active: false }],
      },
    });

    renderWithRouter(<PlaygroundData configId="cfg-1" />);
    await waitFor(() => {
      expect(screen.getByText("linked.txt")).toBeTruthy();
    });
    expect(screen.queryByText("unlinked.txt")).toBeNull();
  });

  it("appelle toggleDataForConfig au clic sur le toggle", async () => {
    const fileId = "file-toggle";
    mockGetDataFiles.mockResolvedValue({
      data: {
        results: [
          { id: fileId, name: "toggle.txt", file_size: 100, char_count: 50 },
        ],
      },
    });
    mockGetConfig.mockResolvedValue({
      data: {
        training_data_links: [{ id: fileId, is_active: false }],
      },
    });

    renderWithRouter(<PlaygroundData configId="cfg-1" />);
    await waitFor(() => {
      expect(screen.getByText("toggle.txt")).toBeTruthy();
    });

    // Click toggle button (title contains "Activer")
    const toggleBtn = screen.getByTitle(/Activer pour l'entraînement/);
    fireEvent.click(toggleBtn);
    await waitFor(() => {
      expect(mockToggleDataForConfig).toHaveBeenCalledWith("cfg-1", fileId);
    });
  });

  it("affiche le corpus actif quand il y a des données", async () => {
    mockGetCorpus.mockResolvedValue({
      data: {
        text: "Le chat mange",
        total_chars: 500,
        unique_chars: 20,
        file_count: 1,
        full_text: "Le chat mange",
      },
    });
    mockGetConfig.mockResolvedValue({
      data: { training_data_links: [] },
    });

    renderWithRouter(<PlaygroundData configId="cfg-1" />);
    await waitFor(() => {
      expect(screen.getByText("Corpus actif")).toBeTruthy();
      expect(screen.getByText("500")).toBeTruthy();
    });
  });

  it("affiche un message quand aucune donnée active", async () => {
    renderWithRouter(<PlaygroundData configId="cfg-1" />);
    await waitFor(() => {
      expect(screen.getByText(/Aucune donnée active/)).toBeTruthy();
    });
  });
});
