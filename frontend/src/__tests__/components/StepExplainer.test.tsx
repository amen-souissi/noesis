/**
 * Tests pour StepExplainer.
 * Vérifie la structure du layout éducatif.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StepExplainer from "@/components/educational/StepExplainer";

// Mock useProgress to avoid side effects
vi.mock("@/hooks/useProgress", () => ({
  useProgress: vi.fn(),
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("StepExplainer", () => {
  const defaultProps = {
    sectionId: "training/tokenization",
    phase: "training" as const,
    stepNumber: 1,
    totalSteps: 8,
    title: "Tokenisation",
    subtitle: "Du texte aux nombres",
    exampleContext: "Le texte est converti en nombres.",
    explanation: <p>Explication test</p>,
  };

  it("affiche le titre et sous-titre", () => {
    renderWithRouter(<StepExplainer {...defaultProps} />);
    expect(screen.getByText("Tokenisation")).toBeTruthy();
    expect(screen.getByText("Du texte aux nombres")).toBeTruthy();
  });

  it("affiche le numéro d'étape", () => {
    renderWithRouter(<StepExplainer {...defaultProps} />);
    // "Étape 1 sur 8" est dans le DOM
    expect(screen.getByText(/Étape 1 sur 8/)).toBeTruthy();
  });

  it("affiche l'explication", () => {
    renderWithRouter(<StepExplainer {...defaultProps} />);
    expect(screen.getByText("Explication test")).toBeTruthy();
  });

  it("affiche la section calcul si fournie", () => {
    renderWithRouter(
      <StepExplainer
        {...defaultProps}
        calculation={<div>Calcul concret</div>}
      />,
    );
    expect(screen.getByText("Calcul concret")).toBeTruthy();
  });

  it("affiche la visualisation si fournie", () => {
    renderWithRouter(
      <StepExplainer {...defaultProps} visualization={<div>Viz test</div>} />,
    );
    expect(screen.getByText("Viz test")).toBeTruthy();
  });

  it("affiche le contexte exemple", () => {
    renderWithRouter(<StepExplainer {...defaultProps} />);
    expect(screen.getByText("Le texte est converti en nombres.")).toBeTruthy();
  });

  it("affiche le lien doc si docSlug fourni", () => {
    renderWithRouter(<StepExplainer {...defaultProps} docSlug="tokenizer" />);
    expect(screen.getByText(/Documentation/)).toBeTruthy();
  });
});
