/**
 * Page d'introduction : "Qu'est-ce qu'un LLM ?"
 *
 * Point d'entrée du parcours éducatif. Présente les concepts de base
 * avec des analogies simples, le diagramme d'architecture interactif,
 * et l'exemple fil rouge "Le chat".
 *
 * @module pages/IntroductionPage
 */

import { Link } from "react-router-dom";
import {
  Brain,
  BookOpen,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Target,
  Shuffle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProgress } from "@/hooks/useProgress";
import ExampleSentenceBanner from "@/components/educational/ExampleSentenceBanner";
import ArchitectureDiagram from "@/components/visualizations/ArchitectureDiagram";

export default function IntroductionPage() {
  const { t } = useTranslation("pages");
  useProgress("introduction");

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Hero */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20">
          <Brain className="w-6 h-6 text-primary-400" />
          <span className="text-sm text-primary-300">
            {t("introduction.badge")}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-white">
          {t("introduction.title").split("LLM")[0]}
          <span className="text-primary-400">LLM</span>
          {t("introduction.title").split("LLM")[1] || ""} ?
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          {t("introduction.subtitle")}
        </p>
        <p className="text-sm text-gray-500 max-w-xl mx-auto italic">
          {t("introduction.italic")}
        </p>
      </div>

      {/* 3 Analogies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card border-amber-500/20">
          <Lightbulb className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="font-semibold text-white mb-2">
            {t("introduction.analogies.learnsByExample.title")}
          </h3>
          <p className="text-sm text-gray-400">
            {t("introduction.analogies.learnsByExample.description")}
          </p>
        </div>
        <div className="card border-blue-500/20">
          <Target className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="font-semibold text-white mb-2">
            {t("introduction.analogies.predictsNextWord.title")}
          </h3>
          <p className="text-sm text-gray-400">
            {t("introduction.analogies.predictsNextWord.description")}
          </p>
        </div>
        <div className="card border-purple-500/20">
          <Shuffle className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="font-semibold text-white mb-2">
            {t("introduction.analogies.doesNotUnderstand.title")}
          </h3>
          <p className="text-sm text-gray-400">
            {t("introduction.analogies.doesNotUnderstand.description")}
          </p>
        </div>
      </div>

      {/* Exemple fil rouge */}
      <ExampleSentenceBanner context={t("introduction.exampleContext")} />

      {/* Architecture */}
      <section className="card">
        <h2 className="text-lg font-semibold text-white mb-4">
          {t("introduction.architecture.title")}
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          {t("introduction.architecture.description")}
        </p>
        <ArchitectureDiagram />
      </section>

      {/* 2 phases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/training/tokenization"
          className="card border-green-500/20 hover:border-green-500/40 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-green-400" />
            <h2 className="text-lg font-semibold text-white">
              {t("introduction.phases.training.title")}
            </h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            {t("introduction.phases.training.description")}
          </p>
          <div className="flex items-center gap-2 text-green-400 text-sm group-hover:gap-3 transition-all">
            {t("introduction.phases.training.link")}{" "}
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          to="/generation/prompt"
          className="card border-purple-500/20 hover:border-purple-500/40 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">
              {t("introduction.phases.generation.title")}
            </h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            {t("introduction.phases.generation.description")}
          </p>
          <div className="flex items-center gap-2 text-purple-400 text-sm group-hover:gap-3 transition-all">
            {t("introduction.phases.generation.link")}{" "}
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Note pédagogique */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <p className="font-semibold text-amber-300 mb-1">
            {t("introduction.note.title")}
          </p>
          <p className="text-gray-400">{t("introduction.note.description")}</p>
        </div>
      </div>
    </div>
  );
}
