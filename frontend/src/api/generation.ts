import api from "./client";
import type { ChatSession, ChatMessage } from "@/types/config";

export interface SamplingParams {
  temperature?: number;
  max_tokens?: number;
  sampling_strategy?: string;
  top_k?: number;
  top_p?: number;
  min_new_tokens?: number;
  config_id?: string;
}

export const generateText = (prompt: string, params?: SamplingParams) =>
  api.post<{
    prompt: string;
    generated_text: string;
    generated_length: number;
  }>("/generate/", { prompt, ...params });

export const getChatSessions = (configId?: string) =>
  api.get<ChatSession[]>("/chat/sessions/", {
    params: configId ? { config_id: configId } : {},
  });
export const getChatMessages = (sessionId: string) =>
  api.get<ChatMessage[]>(`/chat/${sessionId}/`);
export const deleteChatSession = (sessionId: string) =>
  api.delete(`/chat/${sessionId}/`);
export const sendChatMessage = (
  sessionId: string,
  content: string,
  params?: SamplingParams,
) =>
  sessionId === "new"
    ? api.post<ChatMessage>("/chat/messages/", { content, ...params })
    : api.post<ChatMessage>(`/chat/${sessionId}/messages/`, {
        content,
        ...params,
      });
