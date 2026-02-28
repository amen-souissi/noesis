import { Link } from "react-router-dom";
import {
  Brain,
  BookOpen,
  Sparkles,
  Gamepad2,
  ArrowRight,
  Code2,
  Search,
  Cpu,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGenerationDemo } from "@/components/landing/GenerationDemo";
import type { TFunction } from "i18next";

function getFeatures(t: TFunction) {
  return [
    {
      icon: BookOpen,
      color: "text-green-400",
      bg: "bg-green-400/10",
      title: t("landing.features.training.title"),
      description: t("landing.features.training.description"),
    },
    {
      icon: Sparkles,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      title: t("landing.features.generation.title"),
      description: t("landing.features.generation.description"),
    },
    {
      icon: Gamepad2,
      color: "text-primary-400",
      bg: "bg-primary-400/10",
      title: t("landing.features.playground.title"),
      description: t("landing.features.playground.description"),
    },
  ];
}

function getScratchPoints(t: TFunction) {
  return [
    {
      icon: Code2,
      title: t("landing.scratch.point1.title"),
      description: t("landing.scratch.point1.description"),
    },
    {
      icon: Search,
      title: t("landing.scratch.point2.title"),
      description: t("landing.scratch.point2.description"),
    },
    {
      icon: Cpu,
      title: t("landing.scratch.point3.title"),
      description: t("landing.scratch.point3.description"),
    },
  ];
}

export default function LandingPage() {
  const { t } = useTranslation("pages");
  const { inlineTokens, probPanel } = useGenerationDemo(
    t("landing.heroAnimated"),
  );

  const FEATURES = getFeatures(t);
  const SCRATCH_POINTS = getScratchPoints(t);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/landing" className="flex items-center gap-2.5">
            <Brain className="w-7 h-7 text-primary-500" />
            <span className="text-lg font-bold text-white">Noesis</span>
          </Link>
          <Link
            to="/register"
            className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {t("landing.startButton")}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {t("landing.badge")}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-2">
            {t("landing.heroTitle")}
            <br />
            {t("landing.heroTitle2")}
            {inlineTokens}
          </h1>
          {probPanel}
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 mt-6 leading-relaxed">
            {t("landing.heroDescription")}
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-base"
          >
            {t("landing.startButtonWithArrow")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-6 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">
              {t("landing.features.sectionTitle")}
            </h2>
            <p className="text-gray-400">
              {t("landing.features.sectionSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}
                >
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built from scratch */}
      <section className="py-20 px-6 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">
              {t("landing.scratch.sectionTitle")}{" "}
              <span className="text-primary-400">
                {t("landing.scratch.sectionTitleHighlight")}
              </span>
            </h2>
            <p className="text-gray-400">
              {t("landing.scratch.sectionSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SCRATCH_POINTS.map((p) => (
              <div key={p.title} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <p.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 border-t border-gray-800/50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t("landing.cta.title")}
          </h2>
          <p className="text-gray-400 mb-8">{t("landing.cta.subtitle")}</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-lg font-medium transition-colors text-base"
          >
            {t("landing.cta.button")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">Noesis</span>
          </div>
          <p className="text-xs text-gray-700">{t("landing.footer.tagline")}</p>
        </div>
      </footer>
    </div>
  );
}
