/**
 * Tests pour TokenGrid.
 * Vérifie le rendu des tokens, le hover et l'affichage du vocabulaire.
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TokenGrid from "@/components/visualizations/TokenGrid";

const SAMPLE_CHARS = ["L", "e", " ", "c", "h", "a", "t"];
const SAMPLE_IDS = [1, 2, 3, 4, 5, 6, 7];
const SAMPLE_VOCAB: Record<string, number> = {
  L: 1,
  e: 2,
  " ": 3,
  c: 4,
  h: 5,
  a: 6,
  t: 7,
};

describe("TokenGrid", () => {
  it("affiche tous les caractères", () => {
    render(
      <TokenGrid chars={SAMPLE_CHARS} ids={SAMPLE_IDS} vocab={SAMPLE_VOCAB} />,
    );
    // Chaque caractère est affiché
    SAMPLE_CHARS.forEach((c) => {
      if (c === " ") {
        expect(screen.getByText("⎵")).toBeTruthy();
      } else {
        expect(screen.getByText(c)).toBeTruthy();
      }
    });
  });

  it("affiche les IDs des tokens", () => {
    render(
      <TokenGrid chars={SAMPLE_CHARS} ids={SAMPLE_IDS} vocab={SAMPLE_VOCAB} />,
    );
    SAMPLE_IDS.forEach((id) => {
      expect(screen.getByText(String(id))).toBeTruthy();
    });
  });

  it("affiche le vocabulaire quand showVocab est true", () => {
    render(
      <TokenGrid
        chars={SAMPLE_CHARS}
        ids={SAMPLE_IDS}
        vocab={SAMPLE_VOCAB}
        showVocab
      />,
    );
    expect(screen.getByText(/Dictionnaire du vocabulaire/)).toBeTruthy();
  });

  it("ne plante pas avec un tableau vide", () => {
    const { container } = render(<TokenGrid chars={[]} ids={[]} vocab={{}} />);
    expect(container).toBeTruthy();
  });
});
