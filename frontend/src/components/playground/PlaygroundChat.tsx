/**
 * Onglet Chat du Playground.
 *
 * Interface de discussion avec le modèle entraîné,
 * enrichie de contexte éducatif sur la génération.
 *
 * @module components/playground/PlaygroundChat
 */

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Send,
  Trash2,
  MessageSquare,
  Loader2,
  Settings2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  getChatSessions,
  getChatMessages,
  sendChatMessage,
  deleteChatSession,
} from "@/api/generation";
import { Link } from "react-router-dom";
import { useChatStore } from "@/stores/chatStore";
import type { ChatSession, ChatMessage } from "@/types/config";
import VulgarizedTerm from "@/components/educational/VulgarizedTerm";

interface Props {
  configId?: string | null;
}

export default function PlaygroundChat({ configId }: Props) {
  const { t } = useTranslation("components");
  const {
    sessionId,
    messages,
    isGenerating,
    setSession,
    setMessages,
    addMessage,
    setGenerating,
    clear,
  } = useChatStore();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [input, setInput] = useState("");
  const [temperature, setTemperature] = useState(0.8);
  const [maxTokens, setMaxTokens] = useState(128);
  const [minNewTokens, setMinNewTokens] = useState(20);
  const [samplingStrategy, setSamplingStrategy] =
    useState<string>("temperature");
  const [topK, setTopK] = useState(10);
  const [topP, setTopP] = useState(0.9);
  const [showSettings, setShowSettings] = useState(false);
  const [showExplainer, setShowExplainer] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Reset chat state when switching LLM instance
    clear();
    loadSessions();
  }, [configId]);

  useEffect(() => {
    if (sessionId) loadMessages(sessionId);
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadSessions() {
    try {
      const res = await getChatSessions(configId ?? undefined);
      const s = res.data;
      setSessions(s);
      if (s.length > 0 && !sessionId) {
        setSession(s[0].session_id);
      }
    } catch {
      /* ignore */
    }
  }

  async function loadMessages(sid: string) {
    try {
      const res = await getChatMessages(sid);
      setMessages(res.data);
    } catch {
      /* ignore */
    }
  }

  function getSamplingParams() {
    return {
      temperature,
      max_tokens: maxTokens,
      min_new_tokens: minNewTokens,
      sampling_strategy: samplingStrategy,
      top_k: topK,
      top_p: topP,
      config_id: configId ?? undefined,
    };
  }

  async function handleNewSession() {
    // Send a first message to create a session
    const text = "Bonjour";
    setGenerating(true);
    try {
      const res = await sendChatMessage("new", text, getSamplingParams());
      const msg = res.data;
      await loadSessions();
      if (msg.session_id) {
        setSession(msg.session_id);
      }
    } catch {
      /* ignore */
    } finally {
      setGenerating(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || isGenerating) return;
    const text = input.trim();
    setInput("");

    // Optimistic add
    const tempMsg: ChatMessage = {
      id: String(Date.now()),
      session_id: sessionId ?? "",
      config: configId ?? null,
      user: null,
      role: "user",
      content: text,
      temperature_used: null,
      max_tokens_used: null,
      created_at: new Date().toISOString(),
    };
    addMessage(tempMsg);

    setGenerating(true);
    try {
      const res = await sendChatMessage(
        sessionId ?? "new",
        text,
        getSamplingParams(),
      );
      const msg = res.data;
      if (msg.session_id && !sessionId) {
        setSession(msg.session_id);
        await loadSessions();
      }
      addMessage(msg);
    } catch (err: unknown) {
      const data = (err as any)?.response?.data;
      const detail =
        data?.error || data?.detail || t("playground.chat.generationError");
      addMessage({
        id: String(Date.now() + 1),
        session_id: sessionId ?? "",
        config: configId ?? null,
        user: null,
        role: "assistant",
        content: detail,
        temperature_used: null,
        max_tokens_used: null,
        created_at: new Date().toISOString(),
      });
    } finally {
      setGenerating(false);
    }
  }

  async function handleDeleteSession(sid: string) {
    try {
      await deleteChatSession(sid);
      setSessions((prev) => prev.filter((s) => s.session_id !== sid));
      if (sessionId === sid) {
        clear();
      }
    } catch {
      /* ignore */
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="space-y-4">
      {/* Explainer banner */}
      {showExplainer && (
        <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-4 text-sm text-purple-200 relative">
          <button
            onClick={() => setShowExplainer(false)}
            className="absolute top-2 right-2 text-purple-400 hover:text-purple-300 text-lg leading-none"
            aria-label={t("playground.chat.close")}
          >
            &times;
          </button>
          <BookOpen className="w-4 h-4 inline mr-2" />
          <strong>{t("playground.chat.explainerTitle")}</strong>{" "}
          {t("playground.chat.explainerText")}{" "}
          {t("playground.chat.temperatureControl")}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[500px]">
        {/* Sessions sidebar */}
        <div className="space-y-2 overflow-y-auto">
          <button
            onClick={handleNewSession}
            className="btn-secondary w-full text-sm flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" /> {t("playground.chat.newConversation")}
          </button>
          {sessions.map((s) => (
            <div
              key={s.session_id}
              className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
                s.session_id === sessionId
                  ? "bg-primary-900/30 text-primary-300"
                  : "text-gray-400 hover:bg-gray-800/50"
              }`}
              onClick={() => setSession(s.session_id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">
                  {s.first_message
                    ? s.first_message.slice(0, 30)
                    : t("playground.chat.session")}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSession(s.session_id);
                }}
                className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className="lg:col-span-3 flex flex-col bg-gray-800/30 rounded-lg border border-gray-800 overflow-hidden">
          {/* Settings bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-800">
            <span className="text-sm text-gray-400">
              {sessionId
                ? t("playground.chat.session")
                : t("playground.chat.noSession")}
            </span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300"
            >
              <Settings2 className="w-4 h-4" />
              {t("playground.chat.settings")}
              {showSettings ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="px-4 py-3 bg-gray-900/50 border-b border-gray-800 space-y-3">
              {/* Stratégie d'échantillonnage */}
              <div className="flex items-center gap-4">
                <label className="text-xs text-gray-400 w-36 flex items-center gap-1">
                  {t("playground.chat.strategyLabel")}
                  <Link
                    to="/generation/sampling"
                    title={t("playground.chat.seeLesson")}
                    className="text-primary-400 hover:text-primary-300"
                  >
                    <BookOpen className="w-3 h-3" />
                  </Link>
                </label>
                <select
                  value={samplingStrategy}
                  onChange={(e) => setSamplingStrategy(e.target.value)}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-primary-500 outline-none"
                >
                  <option value="greedy">
                    {t("playground.chat.strategyOptions.greedy")}
                  </option>
                  <option value="temperature">
                    {t("playground.chat.strategyOptions.temperature")}
                  </option>
                  <option value="top_k">
                    {t("playground.chat.strategyOptions.topK")}
                  </option>
                  <option value="top_p">
                    {t("playground.chat.strategyOptions.topP")}
                  </option>
                </select>
              </div>

              {/* Température — masqué pour greedy */}
              {samplingStrategy !== "greedy" && (
                <div className="flex items-center gap-4">
                  <label className="text-xs text-gray-400 w-36">
                    <VulgarizedTerm termKey="temperature" showIcon={false}>
                      {t("playground.chat.creativityLabel")}
                    </VulgarizedTerm>
                    <span className="ml-2 text-primary-400">{temperature}</span>
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={2}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-500 w-20 text-right">
                    {temperature < 0.5
                      ? t("playground.chat.predictable")
                      : temperature < 1.2
                        ? t("playground.chat.balanced")
                        : t("playground.chat.creative")}
                  </span>
                </div>
              )}

              {/* Top-K — visible si top_k */}
              {samplingStrategy === "top_k" && (
                <div className="flex items-center gap-4">
                  <label className="text-xs text-gray-400 w-36">
                    Top-K
                    <span className="ml-2 text-primary-400">{topK}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-500 w-20 text-right">
                    {topK <= 5
                      ? t("playground.chat.topKRestricted")
                      : topK <= 20
                        ? t("playground.chat.topKModerate")
                        : t("playground.chat.topKLarge")}
                  </span>
                </div>
              )}

              {/* Top-P — visible si top_p */}
              {samplingStrategy === "top_p" && (
                <div className="flex items-center gap-4">
                  <label className="text-xs text-gray-400 w-36">
                    Top-P
                    <span className="ml-2 text-primary-400">
                      {topP.toFixed(1)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={topP}
                    onChange={(e) => setTopP(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-500 w-20 text-right">
                    {topP < 0.5
                      ? t("playground.chat.topPRestricted")
                      : topP < 0.85
                        ? t("playground.chat.topPModerate")
                        : t("playground.chat.topPLarge")}
                  </span>
                </div>
              )}

              {/* Longueur max */}
              <div className="flex items-center gap-4">
                <label className="text-xs text-gray-400 w-36">
                  <VulgarizedTerm termKey="max_gen_len" showIcon={false}>
                    {t("playground.chat.maxLength")}
                  </VulgarizedTerm>
                  <span className="ml-2 text-primary-400">{maxTokens}</span>
                </label>
                <input
                  type="range"
                  min={16}
                  max={512}
                  step={16}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="flex-1"
                />
              </div>

              {/* Longueur min (supprime EOS prématuré) */}
              <div className="flex items-center gap-4">
                <label className="text-xs text-gray-400 w-36">
                  {t("playground.chat.minLength")}
                  <span className="ml-2 text-primary-400">{minNewTokens}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={minNewTokens}
                  onChange={(e) => setMinNewTokens(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 w-20 text-right">
                  {minNewTokens === 0
                    ? t("playground.chat.minLengthFree")
                    : t("playground.chat.minLengthChars", {
                        count: minNewTokens,
                      })}
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("playground.chat.emptyMessage")}</p>
                <p className="text-xs mt-1">{t("playground.chat.emptyHint")}</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-primary-600/30 text-primary-100 rounded-br-none"
                      : "bg-gray-800 text-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-50">
                      {new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.role === "assistant" &&
                      msg.temperature_used != null && (
                        <span className="text-xs opacity-40">
                          T={msg.temperature_used.toFixed(1)}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-800">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("playground.chat.inputPlaceholder")}
                rows={1}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 resize-none focus:border-primary-500 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="btn-primary p-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
