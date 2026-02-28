import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Send,
  Trash2,
  MessageSquare,
  Loader2,
  Settings2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getChatSessions,
  getChatMessages,
  sendChatMessage,
  deleteChatSession,
} from "@/api/generation";
import { useChatStore } from "@/stores/chatStore";
import type { ChatSession, ChatMessage } from "@/types/config";

export default function ChatInterface() {
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
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Load messages when session changes
  useEffect(() => {
    if (sessionId) {
      getChatMessages(sessionId).then((res) => setMessages(res.data));
    }
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const res = await getChatSessions();
      setSessions(res.data);
    } catch {
      /* empty */
    }
  };

  const handleNewSession = () => {
    const newId = crypto.randomUUID();
    setSession(newId);
    setMessages([]);
    setInput("");
  };

  const handleSelectSession = async (session: ChatSession) => {
    if (isGenerating) return;
    setSession(session.session_id);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sid: string) => {
    e.stopPropagation();
    try {
      await deleteChatSession(sid);
      if (sessionId === sid) clear();
      setSessions((prev) => prev.filter((s) => s.session_id !== sid));
    } catch {
      /* empty */
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;

    let activeSession = sessionId;
    if (!activeSession) {
      activeSession = crypto.randomUUID();
      setSession(activeSession);
    }

    // Optimistic user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: activeSession,
      config: null,
      user: null,
      role: "user",
      content: trimmed,
      temperature_used: null,
      max_tokens_used: null,
      created_at: new Date().toISOString(),
    };
    addMessage(userMsg);
    setInput("");
    setGenerating(true);

    try {
      const res = await sendChatMessage(activeSession, trimmed, {
        temperature,
        max_tokens: maxTokens,
      });
      addMessage(res.data);
      loadSessions();
    } catch {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        session_id: activeSession,
        config: null,
        user: null,
        role: "assistant",
        content: "Error: failed to generate response.",
        temperature_used: null,
        max_tokens_used: null,
        created_at: new Date().toISOString(),
      };
      addMessage(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] -m-6">
      {/* Left sidebar - Session list */}
      <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={handleNewSession}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 && (
            <p className="text-gray-600 text-sm text-center mt-8">
              No sessions yet
            </p>
          )}
          {sessions.map((s) => (
            <div
              key={s.session_id}
              onClick={() => handleSelectSession(s)}
              className={`group flex items-start gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                sessionId === s.session_id
                  ? "bg-primary-600/20 text-primary-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {s.first_message || "New Session"}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {s.message_count} message{s.message_count !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={(e) => handleDeleteSession(e, s.session_id)}
                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-gray-950">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && !isGenerating && (
            <div className="flex flex-col items-center justify-center h-full text-gray-600">
              <MessageSquare className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm mt-1">
                Type a message to begin chatting with Noesis
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary-600 text-white rounded-br-md"
                    : "bg-gray-800 text-gray-100 rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </p>
                <p
                  className={`text-xs mt-1.5 ${
                    msg.role === "user" ? "text-primary-200" : "text-gray-500"
                  }`}
                >
                  {formatTime(msg.created_at)}
                  {msg.temperature_used != null && (
                    <span className="ml-2">t={msg.temperature_used}</span>
                  )}
                </p>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="px-6 py-3 border-t border-gray-800 bg-gray-900 grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                Temperature: {temperature.toFixed(2)}
              </label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>0 (precise)</span>
                <span>2 (creative)</span>
              </div>
            </div>
            <div>
              <label className="label">Max Tokens: {maxTokens}</label>
              <input
                type="range"
                min={16}
                max={512}
                step={16}
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>16</span>
                <span>512</span>
              </div>
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900">
          <div className="flex items-end gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="btn-secondary flex items-center gap-1 flex-shrink-0 mb-0.5"
              title="Generation settings"
            >
              <Settings2 className="w-4 h-4" />
              {showSettings ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronUp className="w-3 h-3" />
              )}
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="input flex-1 resize-none max-h-32"
              style={{ minHeight: "2.5rem" }}
              disabled={isGenerating}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className="btn-primary flex items-center gap-2 flex-shrink-0 mb-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
