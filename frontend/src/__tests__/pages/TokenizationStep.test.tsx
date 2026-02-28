/**
 * Tests d'intégration pour TokenizationStep.
 * Vérifie que la page de tokenisation s'affiche correctement.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TokenizationStep from "@/pages/training-steps/TokenizationStep";

// Mock useProgress
vi.mock("@/hooks/useProgress", () => ({
  useProgress: vi.fn(),
}));

describe("TokenizationStep", () => {
  function renderPage() {
    return render(
      <MemoryRouter>
        <TokenizationStep />
      </MemoryRouter>,
    );
  }

  it("affiche le titre", () => {
    renderPage();
    expect(screen.getByText("Tokenisation")).toBeTruthy();
  });

  it("affiche le sous-titre", () => {
    renderPage();
    expect(screen.getByText("Du texte aux nombres")).toBeTruthy();
  });

  it("affiche les caractères de l'exemple", () => {
    const { container } = renderPage();
    // Le TokenGrid affiche des caractères dans des div avec title "X" → ID Y
    const charCells = container.querySelectorAll('[title*="→ ID"]');
    expect(charCells.length).toBeGreaterThan(0);
  });

  it("affiche les IDs des tokens", () => {
    renderPage();
    // Le step number badge affiche "Étape 1 sur 8"
    expect(screen.getByText(/Étape 1 sur 8/)).toBeTruthy();
  });

  it("contient une section d'explication", () => {
    const { container } = renderPage();
    // Vérifie que le texte contient des mots clés de l'explication
    expect(container.textContent).toContain("vocabulaire");
  });
});
