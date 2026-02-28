import api from "./client";

export interface AttentionResult {
  layer: number;
  head: number;
  weights: number[][];
  tokens: string[];
}
export interface PerplexityResult {
  text: string;
  loss: number;
  perplexity: number;
}
export interface EmbeddingPoint {
  token: string;
  token_id: number;
  x: number;
  y: number;
}
export interface ParameterStat {
  module_name: string;
  param_count: number;
  weight_norm: number;
  gradient_norm: number | null;
  mean: number;
  std: number;
}
export interface WeightMatrix {
  module: string;
  param: string;
  shape: number[];
  rows: number;
  cols: number;
  values: number[][];
  min: number;
  max: number;
  mean: number;
  std: number;
}
export interface GenerationWeight {
  prompt: string;
  prompt_tokens: string[];
  generated_tokens: {
    token: string;
    token_id: number;
    probability: number;
    top_probs: { token: string; prob: number }[];
  }[];
  attention_snapshots: { layer: number; attention_to_context: number[] }[][];
  full_text: string;
}
export interface TokenizeResult {
  chars: string[];
  ids: number[];
  vocab: Record<string, number>;
  vocab_size: number;
  tokenizer_type: string;
}

export const getAttention = (text: string, configId?: string) =>
  api.post<{ attention: AttentionResult[] }>("/eval/attention/", {
    text,
    ...(configId && { config_id: configId }),
  });
export const getPerplexity = (text: string, configId?: string) =>
  api.post<PerplexityResult>("/eval/perplexity/", {
    text,
    ...(configId && { config_id: configId }),
  });
export const getEmbeddings = (configId?: string) =>
  api.get<{ embeddings: EmbeddingPoint[] }>(
    "/eval/embeddings/",
    configId ? { params: { config_id: configId } } : undefined,
  );
export const getParameters = (configId?: string) =>
  api.get<{ parameters: ParameterStat[]; total: number }>(
    "/eval/parameters/",
    configId ? { params: { config_id: configId } } : undefined,
  );
export const getWeightMatrices = (configId?: string) =>
  api.get<{ matrices: WeightMatrix[] }>(
    "/eval/weights/",
    configId ? { params: { config_id: configId } } : undefined,
  );
export const getGenerationWeights = (
  prompt: string,
  maxTokens?: number,
  temperature?: number,
) =>
  api.post<GenerationWeight>("/eval/generation-weights/", {
    prompt,
    max_tokens: maxTokens,
    temperature,
  });
export const tokenizeText = (text: string, configId?: string) =>
  api.post<TokenizeResult>("/eval/tokenize/", {
    text,
    ...(configId && { config_id: configId }),
  });
