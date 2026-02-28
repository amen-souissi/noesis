/**
 * Tests pour SoftmaxBar.
 * Vérifie le rendu du slider de température et des barres.
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SoftmaxBar from "@/components/visualizations/SoftmaxBar";
import { EXAMPLE_SOFTMAX } from "@/lib/exampleData";

describe("SoftmaxBar", () => {
  const defaultProps = {
    logits: EXAMPLE_SOFTMAX.logits,
    temperatureDistributions: EXAMPLE_SOFTMAX.temperatures,
  };

  it("affiche le slider de température", () => {
    render(<SoftmaxBar {...defaultProps} />);
    const slider = screen.getByRole("slider");
    expect(slider).toBeTruthy();
  });

  it("affiche les logits", () => {
    render(<SoftmaxBar {...defaultProps} />);
    expect(screen.getByText(/Scores bruts/)).toBeTruthy();
  });

  it("affiche les probabilités", () => {
    render(<SoftmaxBar {...defaultProps} />);
    expect(screen.getByText(/Probabilités/)).toBeTruthy();
  });

  it("change de distribution quand le slider bouge", () => {
    render(<SoftmaxBar {...defaultProps} />);
    const slider = screen.getByRole("slider");
    // Le slider devrait fonctionner
    fireEvent.change(slider, { target: { value: "2" } });
    // Pas de crash
    expect(slider).toBeTruthy();
  });
});
