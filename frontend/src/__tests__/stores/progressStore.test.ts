import { describe, it, expect, beforeEach } from "vitest";
import { useProgressStore } from "@/stores/progressStore";

describe("progressStore", () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
  });

  it("démarre avec une progression vide", () => {
    const state = useProgressStore.getState();
    expect(state.visitedSections).toEqual([]);
    expect(state.currentSection).toBeNull();
    expect(state.getProgressPercent()).toBe(0);
  });

  it("markVisited ajoute une section", () => {
    useProgressStore.getState().markVisited("introduction");
    const state = useProgressStore.getState();
    expect(state.visitedSections).toContain("introduction");
  });

  it("markVisited ne duplique pas", () => {
    useProgressStore.getState().markVisited("introduction");
    useProgressStore.getState().markVisited("introduction");
    const state = useProgressStore.getState();
    expect(
      state.visitedSections.filter((s) => s === "introduction").length,
    ).toBe(1);
  });

  it("isVisited retourne correctement", () => {
    useProgressStore.getState().markVisited("training/tokenization");
    const state = useProgressStore.getState();
    expect(state.isVisited("training/tokenization")).toBe(true);
    expect(state.isVisited("training/embedding")).toBe(false);
  });

  it("setCurrentSection met à jour la section courante", () => {
    useProgressStore.getState().setCurrentSection("training/attention");
    expect(useProgressStore.getState().currentSection).toBe(
      "training/attention",
    );
  });

  it("getProgressPercent calcule correctement", () => {
    // Visiter 3 sections sur 15
    useProgressStore.getState().markVisited("introduction");
    useProgressStore.getState().markVisited("training/tokenization");
    useProgressStore.getState().markVisited("training/embedding");
    const percent = useProgressStore.getState().getProgressPercent();
    expect(percent).toBe(14); // 3/21 = 14.3% → arrondi 14%
  });

  it("reset remet tout à zéro", () => {
    useProgressStore.getState().markVisited("introduction");
    useProgressStore.getState().setCurrentSection("introduction");
    useProgressStore.getState().reset();
    const state = useProgressStore.getState();
    expect(state.visitedSections).toEqual([]);
    expect(state.currentSection).toBeNull();
  });
});
