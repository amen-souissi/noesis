/**
 * Tests pour PlaygroundChat.
 * Vérifie les contrôles d'échantillonnage et le lien vers la leçon.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlaygroundChat from "@/components/playground/PlaygroundChat";

vi.mock("@/api/generation", () => ({
  getChatSessions: vi.fn().mockResolvedValue({ data: [] }),
  getChatMessages: vi.fn().mockResolvedValue({ data: [] }),
  sendChatMessage: vi.fn().mockResolvedValue({
    data: {
      id: "1",
      session_id: "s1",
      role: "assistant",
      content: "ok",
      created_at: new Date().toISOString(),
    },
  }),
  deleteChatSession: vi.fn(),
}));

vi.mock("@/stores/chatStore", () => ({
  useChatStore: vi.fn(() => ({
    sessionId: null,
    messages: [],
    isGenerating: false,
    setSession: vi.fn(),
    setMessages: vi.fn(),
    addMessage: vi.fn(),
    setGenerating: vi.fn(),
    clear: vi.fn(),
  })),
}));

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("PlaygroundChat", () => {
  it("affiche le bouton Réglages", () => {
    renderWithRouter(<PlaygroundChat />);
    expect(screen.getByText("Réglages")).toBeTruthy();
  });

  it("affiche les contrôles d'échantillonnage quand Réglages est ouvert", () => {
    renderWithRouter(<PlaygroundChat />);
    fireEvent.click(screen.getByText("Réglages"));
    expect(screen.getByText("Stratégie")).toBeTruthy();
  });

  it("affiche le sélecteur avec les 4 stratégies", () => {
    const { container } = renderWithRouter(<PlaygroundChat />);
    fireEvent.click(screen.getByText("Réglages"));
    const select = container.querySelector("select");
    expect(select).toBeTruthy();
    const options = select!.querySelectorAll("option");
    expect(options.length).toBe(4);
    expect(options[0].value).toBe("greedy");
    expect(options[1].value).toBe("temperature");
    expect(options[2].value).toBe("top_k");
    expect(options[3].value).toBe("top_p");
  });

  it("masque le slider température quand greedy est sélectionné", () => {
    const { container } = renderWithRouter(<PlaygroundChat />);
    fireEvent.click(screen.getByText("Réglages"));

    // Par défaut, température est visible (strategy=temperature)
    expect(screen.getByText("Créativité")).toBeTruthy();

    // Sélectionner greedy
    const select = container.querySelector("select")!;
    fireEvent.change(select, { target: { value: "greedy" } });

    // Créativité ne devrait plus être visible
    expect(screen.queryByText("Créativité")).toBeNull();
  });

  it("affiche le slider Top-K quand top_k est sélectionné", () => {
    const { container } = renderWithRouter(<PlaygroundChat />);
    fireEvent.click(screen.getByText("Réglages"));

    const select = container.querySelector("select")!;
    fireEvent.change(select, { target: { value: "top_k" } });

    // Le label du slider Top-K doit être visible (en plus de l'option du select)
    const matches = screen.getAllByText(/Top-K/);
    expect(matches.length).toBeGreaterThanOrEqual(2); // option + label slider
  });

  it("affiche le slider Top-P quand top_p est sélectionné", () => {
    const { container } = renderWithRouter(<PlaygroundChat />);
    fireEvent.click(screen.getByText("Réglages"));

    const select = container.querySelector("select")!;
    fireEvent.change(select, { target: { value: "top_p" } });

    const matches = screen.getAllByText(/Top-P/);
    expect(matches.length).toBeGreaterThanOrEqual(2); // option + label slider
  });

  it("affiche un lien vers la leçon Échantillonnage", () => {
    const { container } = renderWithRouter(<PlaygroundChat />);
    fireEvent.click(screen.getByText("Réglages"));

    const link = container.querySelector('a[href="/generation/sampling"]');
    expect(link).toBeTruthy();
  });
});
