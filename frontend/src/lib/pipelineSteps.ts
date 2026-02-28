/**
 * Définitions des étapes du parcours pédagogique.
 *
 * Chaque étape du pipeline (entraînement et génération) est définie ici
 * avec ses métadonnées : titre, sous-titre, route, icône, module backend associé.
 * Utilisé par la sidebar, la navigation prev/next, et le suivi de progression.
 *
 * @module lib/pipelineSteps
 */

import i18n from "@/i18n";
import type { CourseSection } from "@/types/progress";

/** Static section definitions (IDs, paths, groups, order) */
const SECTION_DEFS: Omit<CourseSection, "title" | "subtitle">[] = [
  // ─── Découvrir
  { id: "introduction", path: "/", group: "discover", order: 1 },

  // ─── Rappels Mathématiques
  {
    id: "math/vectors-matrices",
    path: "/math/vectors-matrices",
    group: "math",
    order: 2,
  },
  {
    id: "math/matrix-product",
    path: "/math/matrix-product",
    group: "math",
    order: 3,
  },
  {
    id: "math/special-functions",
    path: "/math/special-functions",
    group: "math",
    order: 4,
  },
  {
    id: "math/derivatives",
    path: "/math/derivatives",
    group: "math",
    order: 5,
  },

  // ─── Entraînement
  {
    id: "training/tokenization",
    path: "/training/tokenization",
    group: "training",
    order: 6,
    moduleSlug: "tokenizer",
  },
  {
    id: "training/embedding",
    path: "/training/embedding",
    group: "training",
    order: 7,
    moduleSlug: "embedding",
  },
  {
    id: "training/positional-encoding",
    path: "/training/positional-encoding",
    group: "training",
    order: 8,
    moduleSlug: "positional_encoding",
  },
  {
    id: "training/attention",
    path: "/training/attention",
    group: "training",
    order: 9,
    moduleSlug: "attention",
  },
  {
    id: "training/feedforward",
    path: "/training/feedforward",
    group: "training",
    order: 10,
    moduleSlug: "feedforward",
  },
  {
    id: "training/loss",
    path: "/training/loss",
    group: "training",
    order: 11,
    moduleSlug: "loss",
  },
  {
    id: "training/backpropagation",
    path: "/training/backpropagation",
    group: "training",
    order: 12,
    moduleSlug: "loss",
  },
  {
    id: "training/optimizer",
    path: "/training/optimizer",
    group: "training",
    order: 13,
    moduleSlug: "optimizer",
  },
  {
    id: "training/recap",
    path: "/training/recap",
    group: "training",
    order: 14,
  },

  // ─── Génération
  {
    id: "generation/prompt",
    path: "/generation/prompt",
    group: "generation",
    order: 15,
    moduleSlug: "tokenizer",
  },
  {
    id: "generation/forward-pass",
    path: "/generation/forward-pass",
    group: "generation",
    order: 16,
    moduleSlug: "transformer_block",
  },
  {
    id: "generation/softmax",
    path: "/generation/softmax",
    group: "generation",
    order: 17,
    moduleSlug: "generator",
  },
  {
    id: "generation/sampling",
    path: "/generation/sampling",
    group: "generation",
    order: 18,
    moduleSlug: "generator",
  },
  {
    id: "generation/autoregressive",
    path: "/generation/autoregressive",
    group: "generation",
    order: 19,
    moduleSlug: "generator",
  },

  // ─── Aller plus loin
  { id: "deeper/beyond", path: "/deeper/beyond", group: "deeper", order: 20 },

  // ─── Pratiquer
  { id: "playground", path: "/playground", group: "practice", order: 21 },

  // ─── Référence
  { id: "docs", path: "/docs", group: "reference", order: 22 },
];

/** Build COURSE_SECTIONS with translated titles/subtitles */
function buildSections(): CourseSection[] {
  return SECTION_DEFS.map((def) => ({
    ...def,
    title: i18n.t(`sections.${def.id}.title`, { ns: "pipeline" }),
    subtitle: i18n.t(`sections.${def.id}.subtitle`, { ns: "pipeline" }),
  }));
}

/** Reactive getter — always returns current language */
export function getCOURSE_SECTIONS(): CourseSection[] {
  return buildSections();
}

/** Legacy export for backwards compatibility (reads at call time) */
export const COURSE_SECTIONS = new Proxy([] as CourseSection[], {
  get(target, prop) {
    const sections = buildSections();
    if (prop === "length") return sections.length;
    if (prop === Symbol.iterator)
      return sections[Symbol.iterator].bind(sections);
    if (typeof prop === "string" && !isNaN(Number(prop)))
      return sections[Number(prop)];
    if (prop === "map") return sections.map.bind(sections);
    if (prop === "filter") return sections.filter.bind(sections);
    if (prop === "find") return sections.find.bind(sections);
    if (prop === "findIndex") return sections.findIndex.bind(sections);
    if (prop === "forEach") return sections.forEach.bind(sections);
    if (prop === "some") return sections.some.bind(sections);
    if (prop === "every") return sections.every.bind(sections);
    if (prop === "reduce") return sections.reduce.bind(sections);
    if (prop === "indexOf") return sections.indexOf.bind(sections);
    if (prop === "slice") return sections.slice.bind(sections);
    if (prop === "concat") return sections.concat.bind(sections);
    if (prop === "flat") return sections.flat.bind(sections);
    if (prop === "flatMap") return sections.flatMap.bind(sections);
    return Reflect.get(target, prop);
  },
});

/** Nombre total de sections pour le calcul de progression */
export const TOTAL_SECTIONS = SECTION_DEFS.filter(
  (s) => s.group !== "reference",
).length;

/** Obtient une section par son ID */
export function getSectionById(id: string): CourseSection | undefined {
  return buildSections().find((s) => s.id === id);
}

/** Obtient la section précédente et suivante pour la navigation */
export function getAdjacentSections(currentId: string): {
  prev: CourseSection | null;
  next: CourseSection | null;
} {
  const sections = buildSections();
  const idx = sections.findIndex((s) => s.id === currentId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? sections[idx - 1] : null,
    next: idx < sections.length - 1 ? sections[idx + 1] : null,
  };
}

/** Obtient toutes les sections d'un groupe */
export function getSectionsByGroup(
  group: CourseSection["group"],
): CourseSection[] {
  return buildSections().filter((s) => s.group === group);
}

/** Labels des groupes (translated) */
export function getGroupLabel(group: CourseSection["group"]): string {
  return i18n.t(`groups.${group}`, { ns: "pipeline" });
}

/** Legacy GROUP_LABELS object (dynamic proxy) */
const ALL_GROUPS: CourseSection["group"][] = [
  "discover",
  "math",
  "training",
  "generation",
  "deeper",
  "practice",
  "reference",
];

export const GROUP_LABELS: Record<CourseSection["group"], string> = new Proxy(
  {} as Record<CourseSection["group"], string>,
  {
    get(_target, prop: string) {
      return i18n.t(`groups.${prop}`, { ns: "pipeline" });
    },
    ownKeys() {
      return ALL_GROUPS;
    },
    getOwnPropertyDescriptor(_target, prop: string) {
      if (ALL_GROUPS.includes(prop as CourseSection["group"])) {
        return {
          configurable: true,
          enumerable: true,
          value: i18n.t(`groups.${prop}`, { ns: "pipeline" }),
        };
      }
      return undefined;
    },
  },
);
