export interface GenerationStep {
  token: string;
  candidates: { token: string; probability: number }[];
}

export const LANDING_PROMPT = "fonctionnent";

/** Alternatives plausibles par type de caract?re (pour le panneau de probabilit?s) */
const ALTERNATIVES: Record<string, [string, string]> = {
  " ": ["\n", ","],
  ",": [".", "!"],
  ".": [",", "!"],
  "'": ["e", "a"],
  a: ["e", "o"],
  b: ["d", "p"],
  c: ["k", "s"],
  d: ["e", "b"],
  e: ["a", "o"],
  f: ["t", "r"],
  g: ["h", "r"],
  h: ["n", "t"],
  i: ["e", "l"],
  j: ["i", "g"],
  k: ["c", "x"],
  l: ["i", "r"],
  m: ["n", "w"],
  n: ["m", "r"],
  o: ["e", "a"],
  p: ["b", "r"],
  q: ["g", "k"],
  r: ["n", "s"],
  s: ["c", "z"],
  t: ["c", "r"],
  u: ["o", "r"],
  v: ["w", "b"],
  w: ["v", "m"],
  x: ["k", "s"],
  y: ["i", "g"],
  z: ["s", "x"],
  "\u00e9": ["e", "i"], // �
  "\u00e8": ["e", "a"], // ?
  "\u00ea": ["e", "a"], // ?
  "\u00e0": ["a", "e"], // ?
  "\u00e2": ["a", "e"], // �
  "\u00ee": ["i", "e"], // �
  "\u00f4": ["o", "e"], // �
  "\u00fb": ["u", "o"], // ?
  "\u00e7": ["c", "s"], // �
};

function getAlternatives(char: string): [string, string] {
  return (
    ALTERNATIVES[char] ??
    ALTERNATIVES[char.toLowerCase()] ?? [
      String.fromCharCode((char.charCodeAt(0) % 26) + 97),
      String.fromCharCode(((char.charCodeAt(0) + 1) % 26) + 97),
    ]
  );
}

/**
 * G?n?re les ?tapes d'animation ? partir d'une cha?ne traduite.
 * Chaque caract?re devient un step avec 3 candidats pour un panneau de probabilit?s coh?rent.
 */
export function buildStepsFromString(text: string): GenerationStep[] {
  return [...text].map((char) => {
    const [alt1, alt2] = getAlternatives(char);
    const mainProb = 0.9;
    const p1 = 0.06;
    const p2 = 0.04;
    return {
      token: char,
      candidates: [
        { token: char, probability: mainProb },
        { token: alt1, probability: p1 },
        { token: alt2, probability: p2 },
      ],
    };
  });
}
