/**
 * Sidebar de navigation type "table des matières de cours".
 *
 * Remplace la navigation dashboard par un parcours pédagogique structuré
 * avec progression, groupes de sections, et indicateurs de visite.
 *
 * @module components/layout/Sidebar
 */

import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Brain,
  CheckCircle2,
  Circle,
  Lightbulb,
  Calculator,
  BookOpen,
  Sparkles,
  Compass,
  Gamepad2,
  FileText,
  LogOut,
  User,
} from "lucide-react";
import { useProgressStore } from "@/stores/progressStore";
import { useAuthStore } from "@/stores/authStore";
import LearningProgress from "./LearningProgress";
import LanguageSelector from "./LanguageSelector";
import { getSectionsByGroup, getGroupLabel } from "@/lib/pipelineSteps";
import type { CourseSection } from "@/types/progress";

const GROUP_ICONS: Record<CourseSection["group"], typeof Brain> = {
  discover: Lightbulb,
  math: Calculator,
  training: BookOpen,
  generation: Sparkles,
  deeper: Compass,
  practice: Gamepad2,
  reference: FileText,
};

const GROUP_COLORS: Record<CourseSection["group"], string> = {
  discover: "text-amber-400",
  math: "text-rose-400",
  training: "text-green-400",
  generation: "text-purple-400",
  deeper: "text-indigo-400",
  practice: "text-primary-400",
  reference: "text-gray-500",
};

const GROUPS: CourseSection["group"][] = [
  "discover",
  "math",
  "training",
  "generation",
  "deeper",
  "practice",
  "reference",
];

export default function Sidebar() {
  const { t } = useTranslation();
  const isVisited = useProgressStore((s) => s.isVisited);
  const currentSection = useProgressStore((s) => s.currentSection);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/landing");
  };

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 overflow-hidden">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <Brain className="w-8 h-8 text-primary-500" />
        <div>
          <h1 className="text-lg font-bold text-white">{t("app.name")}</h1>
          <p className="text-xs text-gray-500">{t("app.tagline")}</p>
        </div>
      </div>

      {/* Barre de progression */}
      <LearningProgress />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {GROUPS.map((group) => {
          const sections = getSectionsByGroup(group);
          const GroupIcon = GROUP_ICONS[group];
          const groupColor = GROUP_COLORS[group];

          return (
            <div key={group} className="mb-3">
              {/* Label du groupe */}
              <div
                className={`flex items-center gap-2 px-2 py-1.5 text-xs font-semibold ${groupColor}`}
              >
                <GroupIcon className="w-3.5 h-3.5" />
                {getGroupLabel(group)}
              </div>

              {/* Liens */}
              <div className="space-y-0.5">
                {sections.map((section) => {
                  const visited = isVisited(section.id);
                  const isCurrent = currentSection === section.id;

                  return (
                    <NavLink
                      key={section.id}
                      to={section.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isActive || isCurrent
                            ? "bg-primary-600/20 text-primary-400"
                            : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                        }`
                      }
                    >
                      {/* Indicateur de progression */}
                      {visited ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-gray-700 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="block truncate">{section.title}</span>
                        {group !== "reference" && (
                          <span className="block text-[10px] text-gray-600 truncate">
                            {section.subtitle}
                          </span>
                        )}
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer — language + user + logout */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-400 truncate">
              {user?.username ?? "—"}
            </span>
          </div>
          <LanguageSelector />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          {t("nav.logout")}
        </button>
      </div>
    </aside>
  );
}
