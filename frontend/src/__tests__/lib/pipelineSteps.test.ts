/**
 * Tests pour pipelineSteps.
 * Vérifie la cohérence des définitions de sections du cours.
 */

import { describe, it, expect } from "vitest";
import {
  COURSE_SECTIONS,
  TOTAL_SECTIONS,
  getSectionById,
  getAdjacentSections,
  getSectionsByGroup,
  GROUP_LABELS,
} from "@/lib/pipelineSteps";

describe("pipelineSteps", () => {
  it("a le bon nombre de sections", () => {
    expect(COURSE_SECTIONS.length).toBeGreaterThanOrEqual(15);
  });

  it("TOTAL_SECTIONS correspond aux sections navigables", () => {
    const navigable = COURSE_SECTIONS.filter((s) => s.group !== "reference");
    expect(TOTAL_SECTIONS).toBe(navigable.length);
  });

  it("chaque section a un id, title, path et group", () => {
    COURSE_SECTIONS.forEach((s) => {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.path).toBeTruthy();
      expect(s.group).toBeTruthy();
    });
  });

  it("les ids sont uniques", () => {
    const ids = COURSE_SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getSectionById retourne la bonne section", () => {
    const section = getSectionById("training/tokenization");
    expect(section).toBeTruthy();
    expect(section?.title).toBe("Tokenisation");
  });

  it("getSectionById retourne undefined pour un id inconnu", () => {
    expect(getSectionById("nonexistent")).toBeUndefined();
  });

  it("getAdjacentSections retourne prev et next", () => {
    const { prev, next } = getAdjacentSections("training/embedding");
    expect(prev).toBeTruthy();
    expect(prev?.id).toBe("training/tokenization");
    expect(next).toBeTruthy();
    expect(next?.id).toBe("training/positional-encoding");
  });

  it("getAdjacentSections retourne null prev pour la première section", () => {
    const { prev } = getAdjacentSections("introduction");
    expect(prev).toBeNull();
  });

  it("getSectionsByGroup retourne les sections du groupe", () => {
    const training = getSectionsByGroup("training");
    expect(training.length).toBe(9);
  });

  it("GROUP_LABELS a toutes les clés", () => {
    expect(GROUP_LABELS.discover).toBeTruthy();
    expect(GROUP_LABELS.training).toBeTruthy();
    expect(GROUP_LABELS.generation).toBeTruthy();
    expect(GROUP_LABELS.practice).toBeTruthy();
    expect(GROUP_LABELS.reference).toBeTruthy();
  });
});
