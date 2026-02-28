import { describe, it, expect } from "vitest";
import {
  EXAMPLE_SENTENCE,
  EXAMPLE_TOKENIZATION,
  EXAMPLE_EMBEDDINGS,
  EXAMPLE_POSITIONAL,
  EXAMPLE_ATTENTION,
  EXAMPLE_LOSS,
  EXAMPLE_SOFTMAX,
  EXAMPLE_GENERATION,
} from "@/lib/exampleData";

describe("exampleData", () => {
  describe("tokenization", () => {
    it("la phrase correspond aux caractères", () => {
      expect(EXAMPLE_TOKENIZATION.chars.join("")).toBe(EXAMPLE_SENTENCE);
    });

    it("chaque caractère a un ID", () => {
      expect(EXAMPLE_TOKENIZATION.ids.length).toBe(
        EXAMPLE_TOKENIZATION.chars.length,
      );
    });

    it("les IDs correspondent au vocabulaire", () => {
      for (let i = 0; i < EXAMPLE_TOKENIZATION.chars.length; i++) {
        const char = EXAMPLE_TOKENIZATION.chars[i];
        const expectedId = EXAMPLE_TOKENIZATION.vocab[char];
        expect(EXAMPLE_TOKENIZATION.ids[i]).toBe(expectedId);
      }
    });

    it("vocabSize correspond au nombre de caractères uniques", () => {
      const uniqueChars = new Set(EXAMPLE_TOKENIZATION.chars);
      expect(EXAMPLE_TOKENIZATION.vocabSize).toBe(uniqueChars.size);
    });
  });

  describe("embeddings", () => {
    it("chaque sample a un vecteur de longueur cohérente", () => {
      const vecLen = EXAMPLE_EMBEDDINGS.samples[0].vector.length;
      EXAMPLE_EMBEDDINGS.samples.forEach((s) => {
        expect(s.vector.length).toBe(vecLen);
      });
    });

    it("les IDs des samples correspondent au vocabulaire", () => {
      EXAMPLE_EMBEDDINGS.samples.forEach((s) => {
        expect(EXAMPLE_TOKENIZATION.vocab[s.char]).toBe(s.id);
      });
    });
  });

  describe("positional encoding", () => {
    it("les valeurs sin et cos ont la bonne taille", () => {
      expect(EXAMPLE_POSITIONAL.sinValues.length).toBe(
        EXAMPLE_POSITIONAL.positions.length,
      );
      expect(EXAMPLE_POSITIONAL.cosValues.length).toBe(
        EXAMPLE_POSITIONAL.positions.length,
      );
    });

    it("sin(0) = 0 et cos(0) = 1 pour toutes les dimensions", () => {
      EXAMPLE_POSITIONAL.sinValues[0].forEach((v) =>
        expect(v).toBeCloseTo(0, 1),
      );
      EXAMPLE_POSITIONAL.cosValues[0].forEach((v) =>
        expect(v).toBeCloseTo(1, 1),
      );
    });
  });

  describe("attention", () => {
    it("la matrice est carrée (tokens × tokens)", () => {
      const n = EXAMPLE_ATTENTION.tokens.length;
      expect(EXAMPLE_ATTENTION.weights.length).toBe(n);
      EXAMPLE_ATTENTION.weights.forEach((row) => {
        expect(row.length).toBe(n);
      });
    });

    it("chaque ligne somme approximativement à 1", () => {
      EXAMPLE_ATTENTION.weights.forEach((row) => {
        const sum = row.reduce((a, b) => a + b, 0);
        expect(sum).toBeCloseTo(1, 1);
      });
    });

    it("le masque causal est respecté (pas de poids futurs)", () => {
      const n = EXAMPLE_ATTENTION.tokens.length;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          expect(EXAMPLE_ATTENTION.weights[i][j]).toBe(0);
        }
      }
    });
  });

  describe("loss", () => {
    it("les probabilités des prédictions somment à ~1", () => {
      const sum = EXAMPLE_LOSS.predictions.reduce(
        (a, b) => a + b.probability,
        0,
      );
      expect(sum).toBeCloseTo(1, 0);
    });

    it("le loss est -log(P correcte)", () => {
      const correctProb = EXAMPLE_LOSS.predictions.find(
        (p) => p.isCorrect,
      )!.probability;
      expect(EXAMPLE_LOSS.lossValue).toBeCloseTo(-Math.log(correctProb), 1);
    });
  });

  describe("softmax temperatures", () => {
    it("les probabilités à chaque température somment à ~1", () => {
      for (const [, probs] of Object.entries(EXAMPLE_SOFTMAX.temperatures)) {
        const sum = probs.reduce(
          (a: number, b: { prob: number }) => a + b.prob,
          0,
        );
        expect(sum).toBeCloseTo(1, 1);
      }
    });

    it("la température basse concentre plus la probabilité sur le top token", () => {
      const lowTemp = EXAMPLE_SOFTMAX.temperatures[0.3];
      const highTemp = EXAMPLE_SOFTMAX.temperatures[1.5];
      expect(lowTemp[0].prob).toBeGreaterThan(highTemp[0].prob);
    });
  });

  describe("generation", () => {
    it("chaque étape ajoute un caractère", () => {
      for (let i = 1; i < EXAMPLE_GENERATION.steps.length; i++) {
        const prev = EXAMPLE_GENERATION.steps[i - 1];
        const curr = EXAMPLE_GENERATION.steps[i];
        expect(curr.input).toBe(prev.input + prev.predicted);
      }
    });

    it("les probabilités sont entre 0 et 1", () => {
      EXAMPLE_GENERATION.steps.forEach((step) => {
        expect(step.probability).toBeGreaterThan(0);
        expect(step.probability).toBeLessThanOrEqual(1);
      });
    });
  });
});
