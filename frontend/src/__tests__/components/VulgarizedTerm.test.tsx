/**
 * Tests pour VulgarizedTerm.
 * Vérifie le rendu du terme vulgarisé, de l'infobulle et du fallback.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("VulgarizedTerm", () => {
  it("affiche le terme vulgarisé par défaut", () => {
    renderWithRouter(<VulgarizedTerm termKey="learning_rate" />);
    expect(screen.getByText(/Vitesse d'apprentissage/)).toBeTruthy();
  });

  it("affiche le children en override du terme vulgarisé", () => {
    renderWithRouter(
      <VulgarizedTerm termKey="learning_rate">le taux</VulgarizedTerm>,
    );
    expect(screen.getByText("le taux")).toBeTruthy();
  });

  it("affiche le fallback si la clé est inconnue", () => {
    renderWithRouter(<VulgarizedTerm termKey="unknown_term_xyz" />);
    expect(screen.getByText("unknown_term_xyz")).toBeTruthy();
  });

  it("affiche le fallback children si la clé est inconnue", () => {
    renderWithRouter(
      <VulgarizedTerm termKey="unknown_term_xyz">custom text</VulgarizedTerm>,
    );
    expect(screen.getByText("custom text")).toBeTruthy();
  });

  it("affiche le tooltip au hover", async () => {
    renderWithRouter(<VulgarizedTerm termKey="d_model" />);
    const term = screen.getByRole("term");
    fireEvent.mouseEnter(term);
    // Le tooltip devrait afficher le terme scientifique
    expect(screen.getByText("d_model")).toBeTruthy();
    expect(screen.getByText(/Taille des vecteurs internes/)).toBeTruthy();
  });

  it("masque le tooltip au mouse leave", () => {
    renderWithRouter(<VulgarizedTerm termKey="d_model" />);
    const term = screen.getByRole("term");
    fireEvent.mouseEnter(term);
    expect(screen.getByRole("tooltip")).toBeTruthy();
    fireEvent.mouseLeave(term);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("n'affiche pas l'icône quand showIcon=false", () => {
    const { container } = renderWithRouter(
      <VulgarizedTerm termKey="d_model" showIcon={false} />,
    );
    // L'icône HelpCircle a la classe w-3 h-3
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBe(0);
  });

  it("a un aria-label accessible", () => {
    renderWithRouter(<VulgarizedTerm termKey="learning_rate" />);
    const term = screen.getByRole("term");
    expect(term.getAttribute("aria-label")).toContain("Learning Rate");
  });

  it("affiche le lien vers la documentation dans le tooltip", () => {
    renderWithRouter(<VulgarizedTerm termKey="attention" />);
    const term = screen.getByRole("term");
    fireEvent.mouseEnter(term);
    expect(screen.getByText("Documentation complète")).toBeTruthy();
  });

  it("affiche le badge de catégorie dans le tooltip", () => {
    renderWithRouter(<VulgarizedTerm termKey="temperature" />);
    const term = screen.getByRole("term");
    fireEvent.mouseEnter(term);
    expect(screen.getByText("generation")).toBeTruthy();
  });
});
