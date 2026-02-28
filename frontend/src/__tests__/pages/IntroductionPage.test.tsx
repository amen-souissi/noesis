/**
 * Tests d'intégration pour IntroductionPage.
 * Vérifie que la page d'introduction s'affiche correctement.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import IntroductionPage from "@/pages/IntroductionPage";

// Mock useProgress
vi.mock("@/hooks/useProgress", () => ({
  useProgress: vi.fn(),
}));

describe("IntroductionPage", () => {
  function renderPage() {
    return render(
      <MemoryRouter>
        <IntroductionPage />
      </MemoryRouter>,
    );
  }

  it("affiche le titre principal", () => {
    renderPage();
    // Le titre est split: "Qu'est-ce qu'un " + <span>LLM</span> + " ?"
    expect(screen.getByText("LLM")).toBeTruthy();
    expect(screen.getByText(/Qu'est-ce qu'un/)).toBeTruthy();
  });

  it("affiche les 3 analogies", () => {
    renderPage();
    expect(screen.getByText(/Il apprend par l'exemple/)).toBeTruthy();
    expect(screen.getByText(/Il prédit le mot suivant/)).toBeTruthy();
    expect(screen.getByText(/Il ne comprend pas vraiment/)).toBeTruthy();
  });

  it("affiche la phrase exemple", () => {
    renderPage();
    expect(screen.getByText(/Le chat/)).toBeTruthy();
  });

  it("affiche les deux phases", () => {
    const { container } = renderPage();
    // Check that the text exists somewhere in the DOM
    expect(container.textContent).toContain("Entraînement");
    expect(container.textContent).toContain("Génération");
  });

  it("contient des liens de navigation", () => {
    renderPage();
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});
