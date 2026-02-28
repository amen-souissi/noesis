import { useTranslation } from "react-i18next";
import { useProgress } from "@/hooks/useProgress";
import { getAdjacentSections } from "@/lib/pipelineSteps";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AnimatedMathOperation from "@/components/visualizations/AnimatedMathOperation";

const SECTION_ID = "math/special-functions";

export default function SpecialFunctionsPage() {
  const { t } = useTranslation("pages");
  useProgress(SECTION_ID);
  const { prev, next } = getAdjacentSections(SECTION_ID);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-1">
          {t("math.specialFunctions.categoryLabel")}
        </p>
        <h1 className="text-2xl font-bold text-white mb-2">
          {t("math.specialFunctions.title")}
        </h1>
        <p className="text-gray-400">{t("math.specialFunctions.subtitle")}</p>
      </div>

      {/* Exponentielle — ANIMÉE */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.specialFunctions.exponential.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.specialFunctions.exponential.description")}
        </p>
        <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
          <AnimatedMathOperation totalSteps={4} delay={700}>
            {(step) => {
              const rows = [
                { input: "-2", output: "0.14" },
                { input: "0", output: "1.00" },
                { input: "1", output: "2.72" },
                { input: "3", output: "20.09" },
              ];
              return (
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 max-w-xs mx-auto">
                  {rows.map((r, i) => {
                    const visible = step === -1 || step >= i;
                    const active = step === i;
                    return (
                      <span
                        key={i}
                        className={`contents ${!visible ? "opacity-0" : ""} transition-all duration-300`}
                      >
                        <span
                          className={`text-right ${active ? "text-white" : "text-gray-500"} transition-colors duration-300`}
                        >
                          exp(
                          <span
                            className={
                              active
                                ? "text-blue-400 ring-2 ring-blue-500/40 bg-blue-500/10 rounded px-1"
                                : "text-blue-400"
                            }
                          >
                            {r.input}
                          </span>
                          )
                        </span>
                        <span
                          className={`transition-all duration-300 ${!visible ? "opacity-0" : ""}`}
                        >
                          ={" "}
                          <span
                            className={
                              active
                                ? "text-amber-400 font-bold"
                                : "text-amber-400"
                            }
                          >
                            {r.output}
                          </span>
                        </span>
                      </span>
                    );
                  })}
                </div>
              );
            }}
          </AnimatedMathOperation>
        </div>
        <p className="text-xs text-gray-500">
          {t("math.specialFunctions.exponential.note")}
        </p>
      </section>

      {/* Softmax — ANIMÉE */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.specialFunctions.softmax.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.specialFunctions.softmax.description")}
        </p>
        <div className="bg-gray-800 rounded-lg p-5 font-mono text-sm">
          <AnimatedMathOperation totalSteps={3} delay={1500}>
            {(step) => {
              const scores = [2.0, 1.0, 0.1];
              const exps = [7.39, 2.72, 1.11];
              const sum = 11.22;
              const probs = [0.66, 0.24, 0.1];
              return (
                <div className="space-y-4">
                  {/* Scores d'entrée (toujours visible) */}
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <span>
                      scores = [
                      {scores.map((s, i) => (
                        <span key={i}>
                          <span className="text-blue-400">{s}</span>
                          {i < scores.length - 1 && ", "}
                        </span>
                      ))}
                      ]
                    </span>
                  </div>

                  {/* Étape 1 : exp */}
                  <div
                    className={`transition-all duration-500 ${step === -1 || step >= 0 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
                  >
                    <p
                      className={`text-xs mb-2 ${step === 0 ? "text-white font-semibold" : "text-gray-500"}`}
                    >
                      {t("math.specialFunctions.softmax.step1")}
                    </p>
                    <div className="space-y-1 text-center">
                      {scores.map((s, i) => (
                        <p
                          key={i}
                          className={`transition-all duration-300 ${step === -1 || step >= 0 ? "opacity-100" : "opacity-0"}`}
                        >
                          exp(<span className="text-blue-400">{s}</span>) ={" "}
                          <span
                            className={
                              step === 0
                                ? "text-green-400 font-bold ring-2 ring-green-500/40 bg-green-500/10 rounded px-1"
                                : "text-green-400"
                            }
                          >
                            {exps[i]}
                          </span>
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Étape 2 : somme */}
                  <div
                    className={`transition-all duration-500 ${step === -1 || step >= 1 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
                  >
                    <p
                      className={`text-xs mb-2 ${step === 1 ? "text-white font-semibold" : "text-gray-500"}`}
                    >
                      {t("math.specialFunctions.softmax.step2")}
                    </p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <span>
                        {t("math.specialFunctions.labels.sum")} ={" "}
                        {exps.map((e, i) => (
                          <span key={i}>
                            <span className="text-green-400">{e}</span>
                            {i < exps.length - 1 && " + "}
                          </span>
                        ))}{" "}
                        ={" "}
                        <span
                          className={
                            step === 1
                              ? "text-white font-bold ring-2 ring-white/40 bg-white/5 rounded px-1"
                              : "text-white font-bold"
                          }
                        >
                          {sum}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Étape 3 : division */}
                  <div
                    className={`transition-all duration-500 ${step === -1 || step >= 2 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
                  >
                    <p
                      className={`text-xs mb-2 ${step === 2 ? "text-white font-semibold" : "text-gray-500"}`}
                    >
                      {t("math.specialFunctions.softmax.step3")}
                    </p>
                    <div className="space-y-1 text-center">
                      {exps.map((e, i) => (
                        <p key={i}>
                          <span className="text-green-400">{e}</span> /{" "}
                          <span className="text-white">{sum}</span> ={" "}
                          <span
                            className={
                              step === 2
                                ? "text-amber-400 font-bold ring-2 ring-amber-500/40 bg-amber-500/10 rounded px-1"
                                : "text-amber-400 font-bold"
                            }
                          >
                            {probs[i]}
                          </span>
                          {i === 0 && (
                            <span className="text-xs text-gray-600 ml-2">
                              {t("math.specialFunctions.labels.highest")}
                            </span>
                          )}
                          {i === 2 && (
                            <span className="text-xs text-gray-600 ml-2">
                              {t("math.specialFunctions.labels.lowest")}
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Résultat final */}
                  <div
                    className={`border-t border-gray-700 pt-3 transition-all duration-500 ${step === -1 || step >= 2 ? "opacity-100" : "opacity-0"}`}
                  >
                    <p className="text-xs text-gray-500 mb-2">
                      {t("math.specialFunctions.softmax.resultNote")}
                    </p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <span>
                        softmax([
                        {scores.map((s, i) => (
                          <span key={i}>
                            <span className="text-blue-400">{s}</span>
                            {i < scores.length - 1 && ", "}
                          </span>
                        ))}
                        ]) = [
                        {probs.map((p, i) => (
                          <span key={i}>
                            <span className="text-amber-400">{p}</span>
                            {i < probs.length - 1 && ", "}
                          </span>
                        ))}
                        ]
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-1">
                      0.66 + 0.24 + 0.10 = 1.00
                    </p>
                  </div>
                </div>
              );
            }}
          </AnimatedMathOperation>
        </div>
        <p className="text-xs text-gray-500">
          {t("math.specialFunctions.softmax.note")}
        </p>
      </section>

      {/* Logarithme — ANIMÉ */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">
          {t("math.specialFunctions.logarithm.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("math.specialFunctions.logarithm.description")}
        </p>
        <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
          <AnimatedMathOperation totalSteps={4} delay={700}>
            {(step) => {
              const rows = [
                {
                  input: "0.01",
                  output: "-4.61",
                  color: "text-red-400",
                  note: t("math.specialFunctions.logarithm.bigError"),
                },
                {
                  input: "0.10",
                  output: "-2.30",
                  color: "text-red-400",
                  note: "",
                },
                {
                  input: "0.50",
                  output: "-0.69",
                  color: "text-amber-400",
                  note: "",
                },
                {
                  input: "0.99",
                  output: "-0.01",
                  color: "text-green-400",
                  note: t("math.specialFunctions.logarithm.almostPerfect"),
                },
              ];
              return (
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 max-w-xs mx-auto">
                  {rows.map((r, i) => {
                    const visible = step === -1 || step >= i;
                    const active = step === i;
                    return (
                      <span
                        key={i}
                        className={`contents ${!visible ? "opacity-0" : ""} transition-all duration-300`}
                      >
                        <span
                          className={`text-right ${active ? "text-white" : "text-gray-500"} transition-colors duration-300`}
                        >
                          log(
                          <span
                            className={
                              active
                                ? "text-blue-400 ring-2 ring-blue-500/40 bg-blue-500/10 rounded px-1"
                                : "text-blue-400"
                            }
                          >
                            {r.input}
                          </span>
                          )
                        </span>
                        <span
                          className={`transition-all duration-300 ${!visible ? "opacity-0" : ""}`}
                        >
                          ={" "}
                          <span
                            className={
                              active ? `${r.color} font-bold` : r.color
                            }
                          >
                            {r.output}
                          </span>
                          {r.note && (
                            <span className="text-xs text-gray-600 ml-2">
                              {r.note}
                            </span>
                          )}
                        </span>
                      </span>
                    );
                  })}
                </div>
              );
            }}
          </AnimatedMathOperation>
        </div>
        <p className="text-xs text-gray-500">
          {t("math.specialFunctions.logarithm.note")}
        </p>
      </section>

      {/* Où c'est utilisé */}
      <section className="card space-y-3">
        <h2 className="text-lg font-semibold text-white">
          {t("math.specialFunctions.usedIn.title")}
        </h2>
        <ul className="text-sm text-gray-400 space-y-1.5">
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>
              <strong className="text-white">
                {t("math.specialFunctions.usedIn.attentionLabel")}
              </strong>{" "}
              : {t("math.specialFunctions.usedIn.attentionDesc")}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>
              <strong className="text-white">
                {t("math.specialFunctions.usedIn.generationLabel")}
              </strong>{" "}
              : {t("math.specialFunctions.usedIn.generationDesc")}
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>
              <strong className="text-white">
                {t("math.specialFunctions.usedIn.lossLabel")}
              </strong>{" "}
              : {t("math.specialFunctions.usedIn.lossDesc")}
            </span>
          </li>
        </ul>
      </section>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        {prev ? (
          <Link
            to={prev.path}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {prev.title}
          </Link>
        ) : (
          <div />
        )}
        {next && (
          <Link
            to={next.path}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {next.title}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
