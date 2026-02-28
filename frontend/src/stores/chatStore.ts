import { create } from "zustand";
import type { ChatMessage } from "@/types/config";

interface ChatState {
  sessionId: string | null;
  messages: ChatMessage[];
  isGenerating: boolean;

  setSession: (id: string) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;
  setGenerating: (g: boolean) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  sessionId: null,
  messages: [],
  isGenerating: false,

  setSession: (sessionId) => set({ sessionId }),
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setGenerating: (isGenerating) => set({ isGenerating }),
  clear: () => set({ sessionId: null, messages: [], isGenerating: false }),
}));
