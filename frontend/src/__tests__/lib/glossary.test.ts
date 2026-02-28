import { describe, it, expect } from "vitest";
import {
  GLOSSARY,
  getGlossaryEntry,
  getEntriesByCategory,
} from "@/lib/glossary";

describe("glossary", () => {
  it("contient au moins 20 termes", () => {
    expect(Object.keys(GLOSSARY).length).toBeGreaterThanOrEqual(20);
  });

  it("chaque entrée a tous les champs requis", () => {
    for (const [key, entry] of Object.entries(GLOSSARY)) {
      expect(entry.vulgarized, `${key}.vulgarized`).toBeTruthy();
      expect(entry.scientific, `${key}.scientific`).toBeTruthy();
      expect(entry.technicalFr, `${key}.technicalFr`).toBeTruthy();
      expect(entry.definition, `${key}.definition`).toBeTruthy();
      expect(entry.category, `${key}.category`).toMatch(
        /^(architecture|training|generation|data)$/,
      );
    }
  });

  it("getGlossaryEntry retourne une entrée valide", () => {
    const entry = getGlossaryEntry("learning_rate");
    expect(entry).toBeDefined();
    expect(entry!.vulgarized).toBe("Vitesse d'apprentissage");
    expect(entry!.scientific).toContain("Learning Rate");
  });

  it("getGlossaryEntry retourne undefined pour une clé inconnue", () => {
    expect(getGlossaryEntry("nonexistent_key")).toBeUndefined();
  });

  it("weight_decay a une entrée complète et correcte", () => {
    const entry = getGlossaryEntry("weight_decay");
    expect(entry).toBeDefined();
    expect(entry!.vulgarized).toContain("Régularisation");
    expect(entry!.scientific).toContain("Weight Decay");
    expect(entry!.definition).toContain("généralisation");
    expect(entry!.category).toBe("training");
  });

  it("lr_schedule a une entrée complète et correcte", () => {
    const entry = getGlossaryEntry("lr_schedule");
    expect(entry).toBeDefined();
    expect(entry!.vulgarized).toContain("apprentissage");
    expect(entry!.scientific).toContain("Schedule");
    expect(entry!.definition).toContain("grokking");
    expect(entry!.category).toBe("training");
  });

  it("getEntriesByCategory filtre correctement", () => {
    const training = getEntriesByCategory("training");
    expect(training.length).toBeGreaterThan(0);
    training.forEach(([, entry]) => {
      expect(entry.category).toBe("training");
    });

    const architecture = getEntriesByCategory("architecture");
    expect(architecture.length).toBeGreaterThan(0);
    architecture.forEach(([, entry]) => {
      expect(entry.category).toBe("architecture");
    });
  });

  it("les termes critiques sont présents", () => {
    const criticalKeys = [
      "learning_rate",
      "epochs",
      "batch_size",
      "d_model",
      "n_heads",
      "n_layers",
      "temperature",
      "loss",
      "tokenizer",
      "embedding",
      "attention",
      "softmax",
      "weight_decay",
      "lr_schedule",
    ];
    for (const key of criticalKeys) {
      expect(GLOSSARY[key], `Terme manquant: ${key}`).toBeDefined();
    }
  });
});
