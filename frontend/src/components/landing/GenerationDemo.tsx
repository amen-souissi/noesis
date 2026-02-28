import { useState, useEffect, useRef, useMemo } from "react";
import {
  buildStepsFromString,
  type GenerationStep,
} from "@/lib/landingAnimationData";

type Phase = "waiting" | "generating" | "done";

const displayToken = (t: string) =>
  t === " " ? "\u00A0" : t === "\n" ? "\\n" : t;

export function useGenerationDemo(animatedText: string) {
  const steps = useMemo(
    () => buildStepsFromString(animatedText),
    [animatedText],
  );
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [stepIdx, setStepIdx] = useState(-1);
  const [showingProbs, setShowingProbs] = useState(false);
  const [generatedTokens, setGeneratedTokens] = useState<string[]>([]);
  const [currentProbs, setCurrentProbs] = useState<GenerationStep | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Start generation after each cycle
  useEffect(() => {
    setPhase("waiting");
    setStepIdx(-1);
    setShowingProbs(false);
    setGeneratedTokens([]);
    setCurrentProbs(null);

    timerRef.current = setTimeout(() => {
      setPhase("generating");
      setStepIdx(0);
      setShowingProbs(true);
      setCurrentProbs(steps[0]);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [cycle, steps]);

  // Step through generation
  useEffect(() => {
    if (phase !== "generating" || stepIdx < 0) return;

    if (showingProbs) {
      timerRef.current = setTimeout(() => {
        setGeneratedTokens((prev) => [...prev, steps[stepIdx].token]);
        setShowingProbs(false);
      }, 500);
    } else {
      timerRef.current = setTimeout(() => {
        const next = stepIdx + 1;
        if (next >= steps.length) {
          setPhase("done");
          setCurrentProbs(null);
        } else {
          setStepIdx(next);
          setCurrentProbs(steps[next]);
          setShowingProbs(true);
        }
      }, 120);
    }

    return () => clearTimeout(timerRef.current);
  }, [phase, stepIdx, showingProbs, steps]);

  // Auto-loop
  useEffect(() => {
    if (phase !== "done") return;
    const loopTimer = setTimeout(() => setCycle((c) => c + 1), 3000);
    return () => clearTimeout(loopTimer);
  }, [phase]);

  const inlineTokens = (
    <>
      {generatedTokens.map((token, i) => (
        <span
          key={`${cycle}-${i}`}
          className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400 animate-fade-in"
        >
          {token}
        </span>
      ))}
      {phase === "generating" && (
        <span className="inline-block w-0.5 h-[0.7em] bg-primary-400 ml-px animate-pulse align-baseline" />
      )}
    </>
  );

  const probPanel = (
    <div
      className="mt-4 mx-auto max-w-xs transition-opacity duration-200"
      style={{ opacity: currentProbs ? 1 : 0, minHeight: 56 }}
    >
      <div className="space-y-0.5">
        {(currentProbs?.candidates ?? []).map((c, i) => {
          const isSelected = c.token === currentProbs?.token;
          return (
            <div
              key={`${cycle}-${stepIdx}-${i}`}
              className="flex items-center gap-2"
            >
              <span
                className={`font-mono text-xs w-5 text-center ${
                  isSelected ? "text-primary-400 font-bold" : "text-gray-600"
                }`}
              >
                {displayToken(c.token)}
              </span>
              <div className="flex-1 h-2.5 bg-gray-800/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isSelected
                      ? "bg-gradient-to-r from-primary-600 to-primary-400"
                      : "bg-gray-700/50"
                  }`}
                  style={{
                    width: showingProbs ? `${c.probability * 100}%` : "0%",
                  }}
                />
              </div>
              <span
                className={`text-[10px] font-mono w-8 text-right ${
                  isSelected ? "text-primary-400" : "text-gray-700"
                }`}
              >
                {(c.probability * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return { inlineTokens, probPanel };
}
