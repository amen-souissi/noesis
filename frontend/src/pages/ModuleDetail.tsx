import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Code2,
  Lightbulb,
  Boxes,
  Table2,
  GitBranch,
  GraduationCap,
  Braces,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getModuleDetail, getModules } from "@/api/docs";
import type {
  ModuleDetail as ModuleDetailType,
  ModuleSummary,
} from "@/types/docs";
import katex from "katex";

export default function ModuleDetail() {
  const { t } = useTranslation("pages");
  const { slug } = useParams<{ slug: string }>();
  const [module, setModule] = useState<ModuleDetailType | null>(null);
  const [allModules, setAllModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    Promise.all([getModuleDetail(slug), getModules()])
      .then(([detailRes, modsRes]) => {
        setModule(detailRes.data);
        setAllModules(modsRes.data.sort((a, b) => a.order - b.order));
      })
      .catch(() => setError(t("moduleDetail.errors.loadFailed")))
      .finally(() => setLoading(false));
  }, [slug, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-lg">
          {error ?? t("moduleDetail.errors.notFound")}
        </p>
        <Link
          to="/docs"
          className="btn-secondary inline-flex items-center gap-2 mt-4"
        >
          <ArrowLeft className="w-4 h-4" />{" "}
          {t("moduleDetail.backToDocumentation")}
        </Link>
      </div>
    );
  }

  // Find previous / next modules
  const currentIndex = allModules.findIndex((m) => m.slug === slug);
  const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const nextModule =
    currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;

  // Render LaTeX safely
  const renderLatex = (latex: string): string => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: true,
      });
    } catch {
      return `<code>${latex}</code>`;
    }
  };

  const keyShapeEntries = Object.entries(module.key_shapes);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          to="/docs"
          className="hover:text-primary-400 transition-colors flex items-center gap-1"
        >
          <BookOpen className="w-4 h-4" />
          {t("moduleDetail.breadcrumb")}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-300">{module.name}</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{module.name}</h1>
        <div className="flex items-center gap-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400">
            {module.category}
          </span>
          <span className="text-sm text-gray-500 font-mono">
            {module.source_file}
          </span>
        </div>
      </div>

      {/* Purpose */}
      <section className="card">
        <div className="flex items-center gap-2 mb-3">
          <Boxes className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-200">
            {t("moduleDetail.purpose")}
          </h2>
        </div>
        <p className="text-gray-300 leading-relaxed">{module.purpose}</p>
      </section>

      {/* Class Interface */}
      {module.class_interface && (
        <section className="card">
          <div className="flex items-center gap-2 mb-4">
            <Braces className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-200">
              {t("moduleDetail.classInterface")}
            </h2>
          </div>

          {/* Class header */}
          <div className="bg-gray-950 rounded-lg p-4 mb-4 font-mono text-sm">
            <span className="text-purple-400">class</span>{" "}
            <span className="text-yellow-300">
              {module.class_interface.class_name}
            </span>
            {module.class_interface.parent_class && (
              <>
                <span className="text-gray-500">(</span>
                <span className="text-blue-400">
                  {module.class_interface.parent_class}
                </span>
                <span className="text-gray-500">)</span>
              </>
            )}
            <span className="text-gray-500">:</span>
          </div>

          {/* Constructor */}
          {module.class_interface.constructor.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                {t("moduleDetail.constructor")}
              </h3>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-2 text-gray-500 font-medium">
                        {t("moduleDetail.headers.parameter")}
                      </th>
                      <th className="text-left p-2 text-gray-500 font-medium">
                        {t("moduleDetail.headers.type")}
                      </th>
                      <th className="text-left p-2 text-gray-500 font-medium">
                        {t("moduleDetail.headers.description")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {module.class_interface.constructor.map((param) => (
                      <tr
                        key={param.name}
                        className="border-b border-gray-800/50"
                      >
                        <td className="p-2 font-mono text-xs text-yellow-300">
                          {param.name}
                        </td>
                        <td className="p-2 font-mono text-xs text-blue-400">
                          {param.type}
                        </td>
                        <td className="p-2 text-xs text-gray-300">
                          {param.description}
                          {param.default && (
                            <span className="text-gray-500 ml-1">
                              ({t("moduleDetail.headers.default")}:{" "}
                              {param.default})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Methods */}
          {module.class_interface.methods.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                {t("moduleDetail.methods")}
              </h3>
              <div className="space-y-3">
                {module.class_interface.methods.map((method) => (
                  <div key={method.name} className="bg-gray-950 rounded-lg p-3">
                    <code className="text-xs text-green-400 font-mono">
                      {method.signature}
                    </code>
                    <p className="text-xs text-gray-400 mt-1">
                      {method.description}
                    </p>
                    {method.returns && (
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="text-gray-600">&rarr;</span>{" "}
                        {method.returns}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Properties */}
          {module.class_interface.properties.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                {t("moduleDetail.properties")}
              </h3>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-2 text-gray-500 font-medium">
                        {t("moduleDetail.headers.name")}
                      </th>
                      <th className="text-left p-2 text-gray-500 font-medium">
                        {t("moduleDetail.headers.type")}
                      </th>
                      <th className="text-left p-2 text-gray-500 font-medium">
                        {t("moduleDetail.headers.description")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {module.class_interface.properties.map((prop) => (
                      <tr
                        key={prop.name}
                        className="border-b border-gray-800/50"
                      >
                        <td className="p-2 font-mono text-xs text-primary-400">
                          {prop.name}
                        </td>
                        <td className="p-2 font-mono text-xs text-blue-400">
                          {prop.type}
                        </td>
                        <td className="p-2 text-xs text-gray-300">
                          {prop.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Math Formulas */}
      {module.math_formulas.length > 0 && (
        <section className="card">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-primary-500 text-xl font-serif italic">
              f
            </span>
            <h2 className="text-lg font-semibold text-gray-200">
              {t("moduleDetail.mathFormulas")}
            </h2>
          </div>
          <div className="space-y-6">
            {module.math_formulas.map((formula, i) => (
              <div key={i} className="border-l-2 border-primary-600 pl-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  {formula.name}
                </h3>
                <div
                  className="bg-gray-950 rounded-lg p-4 mb-2 overflow-x-auto text-center"
                  dangerouslySetInnerHTML={{
                    __html: renderLatex(formula.latex),
                  }}
                />
                <p className="text-sm text-gray-400">{formula.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key Shapes */}
      {keyShapeEntries.length > 0 && (
        <section className="card">
          <div className="flex items-center gap-2 mb-4">
            <Table2 className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-200">
              {t("moduleDetail.keyShapes")}
            </h2>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-3 text-gray-400 font-medium">
                    {t("moduleDetail.headers.tensor")}
                  </th>
                  <th className="text-left p-3 text-gray-400 font-medium">
                    {t("moduleDetail.headers.shape")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {keyShapeEntries.map(([name, shape]) => (
                  <tr key={name} className="border-b border-gray-800/50">
                    <td className="p-3 font-mono text-xs text-primary-400">
                      {name}
                    </td>
                    <td className="p-3 font-mono text-xs text-gray-300">
                      {shape}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Code Example */}
      {module.code_example && (
        <section className="card">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-200">
              {t("moduleDetail.codeExample")}
            </h2>
          </div>
          <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">
            {module.code_example}
          </pre>
        </section>
      )}

      {/* Data Flow */}
      {module.data_flow && (
        <section className="card">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-200">
              {t("moduleDetail.dataFlow")}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-950 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">
                {t("moduleDetail.receivesFrom")}
              </p>
              <p className="text-sm text-gray-300">
                {module.data_flow.receives_from}
              </p>
              {module.data_flow.previous && (
                <Link
                  to={`/docs/${module.data_flow.previous}`}
                  className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 mt-2 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  {t("moduleDetail.goToModule")}
                </Link>
              )}
            </div>
            <div className="bg-gray-950 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">
                {t("moduleDetail.sendsTo")}
              </p>
              <p className="text-sm text-gray-300">
                {module.data_flow.sends_to}
              </p>
              {module.data_flow.next && (
                <Link
                  to={`/docs/${module.data_flow.next}`}
                  className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 mt-2 transition-colors"
                >
                  {t("moduleDetail.goToModule")}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Educational Notes */}
      {module.educational_notes && (
        <section className="card">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-gray-200">
              {t("moduleDetail.educationalNotes")}
            </h2>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {module.educational_notes}
            </p>
          </div>
        </section>
      )}

      {/* Related Lessons */}
      {module.related_lessons && module.related_lessons.length > 0 && (
        <section className="card">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-gray-200">
              {t("moduleDetail.relatedLessons")}
            </h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            {t("moduleDetail.relatedLessonsDescription")}
          </p>
          <div className="grid gap-3">
            {module.related_lessons.map((lesson, i) => (
              <Link
                key={i}
                to={lesson.path}
                className="flex items-center gap-4 bg-gray-950 rounded-lg p-4 hover:bg-gray-900 transition-colors group"
              >
                <span
                  className={`
                  inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold
                  ${
                    lesson.phase === "training"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-purple-500/20 text-purple-400"
                  }
                `}
                >
                  {lesson.step}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-200 group-hover:text-primary-400 transition-colors">
                    {lesson.title}
                  </p>
                  {lesson.note && (
                    <p className="text-xs text-gray-500 mt-1">{lesson.note}</p>
                  )}
                </div>
                <span
                  className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${
                    lesson.phase === "training"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-purple-500/10 text-purple-400"
                  }
                `}
                >
                  {lesson.phase === "training"
                    ? t("moduleDetail.trainingPhase")
                    : t("moduleDetail.generationPhase")}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Previous / Next Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        {prevModule ? (
          <Link
            to={`/docs/${prevModule.slug}`}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <div className="text-left">
              <p className="text-xs text-gray-500">
                {t("moduleDetail.previous")}
              </p>
              <p className="text-sm">{prevModule.name}</p>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextModule ? (
          <Link
            to={`/docs/${nextModule.slug}`}
            className="btn-secondary flex items-center gap-2"
          >
            <div className="text-right">
              <p className="text-xs text-gray-500">{t("moduleDetail.next")}</p>
              <p className="text-sm">{nextModule.name}</p>
            </div>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
