import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Loader2, ArrowRight, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getModules, getDataFlow } from "@/api/docs";
import type { ModuleSummary, DataFlow } from "@/types/docs";

/* ────────── Category color mapping ────────── */
const categoryColors: Record<string, { bg: string; text: string }> = {
  embedding: { bg: "bg-blue-500/20", text: "text-blue-400" },
  attention: { bg: "bg-purple-500/20", text: "text-purple-400" },
  feedforward: { bg: "bg-amber-500/20", text: "text-amber-400" },
  normalization: { bg: "bg-green-500/20", text: "text-green-400" },
  transformer: { bg: "bg-red-500/20", text: "text-red-400" },
  output: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
  training: { bg: "bg-orange-500/20", text: "text-orange-400" },
  tokenizer: { bg: "bg-pink-500/20", text: "text-pink-400" },
};

function getCategoryStyle(category: string) {
  const lower = category.toLowerCase();
  for (const key of Object.keys(categoryColors)) {
    if (lower.includes(key)) return categoryColors[key];
  }
  return { bg: "bg-gray-500/20", text: "text-gray-400" };
}

/* ────────── SVG Data Flow Diagram ────────── */
function FlowDiagram({ flow }: { flow: DataFlow }) {
  const { nodes, edges } = flow;

  // Compute SVG viewBox based on node positions
  const padding = 100;
  const nodeWidth = 160;
  const nodeHeight = 48;
  const minX = Math.min(...nodes.map((n) => n.x)) - padding;
  const minY = Math.min(...nodes.map((n) => n.y)) - padding;
  const maxX = Math.max(...nodes.map((n) => n.x)) + nodeWidth + padding;
  const maxY = Math.max(...nodes.map((n) => n.y)) + nodeHeight + padding;

  // Build a lookup for node positions
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      className="w-full"
      style={{ maxHeight: 420 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
        </marker>
      </defs>

      {/* Edges */}
      {edges.map((edge, i) => {
        const from = nodeMap.get(edge.from);
        const to = nodeMap.get(edge.to);
        if (!from || !to) return null;

        const x1 = from.x + nodeWidth / 2;
        const y1 = from.y + nodeHeight;
        const x2 = to.x + nodeWidth / 2;
        const y2 = to.y;

        // Curved path
        const midY = (y1 + y2) / 2;
        const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

        return (
          <g key={i}>
            <path
              d={d}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
              opacity={0.6}
            />
            {edge.label && (
              <text
                x={(x1 + x2) / 2}
                y={midY - 6}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="10"
                fontFamily="monospace"
              >
                {edge.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => (
        <g key={node.id}>
          <rect
            x={node.x}
            y={node.y}
            width={nodeWidth}
            height={nodeHeight}
            rx={12}
            fill="#1f2937"
            stroke="#374151"
            strokeWidth="1.5"
          />
          <text
            x={node.x + nodeWidth / 2}
            y={node.y + nodeHeight / 2 + 4}
            textAnchor="middle"
            fill="#e5e7eb"
            fontSize="12"
            fontWeight="600"
            fontFamily="system-ui, sans-serif"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ────────── Main Page ────────── */
export default function DocumentationHub() {
  const { t } = useTranslation("pages");
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [flow, setFlow] = useState<DataFlow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getModules(), getDataFlow()])
      .then(([modRes, flowRes]) => {
        setModules(modRes.data);
        setFlow(flowRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Sort modules by order
  const sorted = [...modules].sort((a, b) => a.order - b.order);

  // Unique categories for filter reference
  const categories = [...new Set(sorted.map((m) => m.category))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-primary-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">{t("docs.title")}</h1>
          <p className="text-sm text-gray-500">{t("docs.subtitle")}</p>
        </div>
      </div>

      {/* Data Flow Diagram */}
      {flow && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">
            {t("docs.dataFlow.title")}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {t("docs.dataFlow.description")}
          </p>
          <div className="bg-gray-950 rounded-lg p-4 overflow-auto">
            <FlowDiagram flow={flow} />
          </div>
        </div>
      )}

      {/* Category legend */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const style = getCategoryStyle(cat);
          return (
            <span
              key={cat}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
            >
              <Tag className="w-3 h-3" />
              {cat}
            </span>
          );
        })}
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((mod) => {
          const style = getCategoryStyle(mod.category);
          return (
            <Link
              key={mod.slug}
              to={`/docs/${mod.slug}`}
              className="card group hover:border-primary-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-200 group-hover:text-primary-400 transition-colors">
                  {mod.name}
                </h3>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-primary-400 transition-colors flex-shrink-0 mt-1" />
              </div>

              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${style.bg} ${style.text}`}
              >
                {mod.category}
              </span>

              <p className="text-sm text-gray-400 leading-relaxed">
                {mod.short_description}
              </p>

              <p className="text-xs text-gray-600 mt-3 font-mono">
                {mod.source_file}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
