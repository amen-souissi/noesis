/**
 * Tests pour PlaygroundConfig.
 * Vérifie les liens vers les leçons et le sélecteur de tokenizer.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlaygroundConfig from "@/components/playground/PlaygroundConfig";

// Mock API calls — factory is hoisted, so config must be inlined
vi.mock("@/api/config", () => {
  const cfg = {
    id: "1",
    name: "Test Config",
    d_model: 64,
    n_heads: 4,
    n_layers: 2,
    d_ff: 256,
    seq_len: 64,
    vocab_size: 50,
    batch_size: 16,
    learning_rate: 0.001,
    max_epochs: 100,
    grad_clip: 1.0,
    beta1: 0.9,
    beta2: 0.999,
    epsilon: 1e-8,
    weight_decay: 0.0,
    lr_schedule: "constant",
    max_gen_len: 200,
    temperature: 0.8,
    tokenizer_type: "character",
    seed: 42,
    log_every: 10,
  };
  return {
    getConfig: vi.fn().mockResolvedValue({ data: cfg }),
    getPresets: vi.fn().mockResolvedValue({ data: [] }),
    updateConfig: vi.fn().mockResolvedValue({ data: cfg }),
    validateConfig: vi.fn(),
  };
});

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("PlaygroundConfig", () => {
  it("affiche les catégories de configuration", async () => {
    renderWithRouter(<PlaygroundConfig configId="1" />);
    await waitFor(() => {
      expect(screen.getByText("Architecture du modèle")).toBeTruthy();
    });
    expect(screen.getByText("Entraînement")).toBeTruthy();
    expect(screen.getByText("Optimiseur")).toBeTruthy();
    expect(screen.getByText("Génération")).toBeTruthy();
  });

  it("affiche des icônes BookOpen pour les liens vers les leçons", async () => {
    const { container } = renderWithRouter(<PlaygroundConfig configId="1" />);
    await waitFor(() => {
      expect(screen.getByText("Architecture du modèle")).toBeTruthy();
    });

    const lessonLinks = container.querySelectorAll('a[title*="Voir la leçon"]');
    expect(lessonLinks.length).toBeGreaterThan(0);
  });

  it("les liens pointent vers les bonnes leçons", async () => {
    const { container } = renderWithRouter(<PlaygroundConfig configId="1" />);
    await waitFor(() => {
      expect(screen.getByText("Architecture du modèle")).toBeTruthy();
    });

    const embeddingLink = container.querySelector(
      'a[href="/training/embedding"]',
    );
    expect(embeddingLink).toBeTruthy();

    const attentionLink = container.querySelector(
      'a[href="/training/attention"]',
    );
    expect(attentionLink).toBeTruthy();
  });

  it("affiche le tip éducatif", async () => {
    renderWithRouter(<PlaygroundConfig configId="1" />);
    await waitFor(() => {
      expect(screen.getByText(/Survolez les noms des paramètres/)).toBeTruthy();
    });
  });

  it("la section Entraînement contient le sélecteur lr_schedule après expansion", async () => {
    const { container } = renderWithRouter(<PlaygroundConfig configId="1" />);
    await waitFor(() => {
      expect(screen.getByText("Entraînement")).toBeTruthy();
    });

    // Expand the Training category
    const trainingButton = screen.getByText("Entraînement").closest("button")!;
    trainingButton.click();

    await waitFor(() => {
      // lr_schedule select should appear with the 3 options
      const select = container.querySelector(
        "select",
      ) as HTMLSelectElement | null;
      // There are 2 selects: tokenizer + lr_schedule
      const selects = container.querySelectorAll("select");
      const lrSelect = Array.from(selects).find((s) =>
        Array.from(s.options).some((o) => o.value === "cosine_restarts"),
      );
      expect(lrSelect).toBeTruthy();
      expect(lrSelect!.value).toBe("constant");
    });
  });

  it("la section Optimiseur contient weight_decay après expansion", async () => {
    const { container } = renderWithRouter(<PlaygroundConfig configId="1" />);
    await waitFor(() => {
      expect(screen.getByText("Optimiseur")).toBeTruthy();
    });

    // Expand the Optimizer category
    const optimizerButton = screen.getByText("Optimiseur").closest("button")!;
    optimizerButton.click();

    await waitFor(() => {
      // weight_decay field should now be visible via its glossary term
      const optimizerLinks = container.querySelectorAll(
        'a[href="/training/optimizer"]',
      );
      // beta1, beta2, epsilon, weight_decay = at least 4 optimizer links
      expect(optimizerLinks.length).toBeGreaterThanOrEqual(4);
    });
  });
});
