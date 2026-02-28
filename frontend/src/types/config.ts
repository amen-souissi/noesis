export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  d_model: number;
  n_heads: number;
  n_layers: number;
  d_ff: number;
  seq_len: number;
  vocab_size: number;
  batch_size: number;
  learning_rate: number;
  max_epochs: number;
  grad_clip: number;
  beta1: number;
  beta2: number;
  epsilon: number;
  weight_decay: number;
  lr_schedule: "constant" | "cosine" | "cosine_restarts";
  tokenizer_type: "character" | "gpt4" | "claude";
  max_gen_len: number;
  temperature: number;
  sampling_strategy: "greedy" | "temperature" | "top_k" | "top_p";
  top_k: number;
  top_p: number;
  seed: number;
  log_every: number;
  is_preset: boolean;
  training_data: string[];
  training_data_ids: string[];
  training_data_links: { id: string; is_active: boolean }[];
  created_at: string;
  updated_at: string;
}

export interface TrainingData {
  id: string;
  name: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  extracted_text: string;
  char_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Corpus {
  text: string;
  total_chars: number;
  unique_chars: number;
  file_count: number;
  full_text: string;
}

export interface ChatSession {
  session_id: string;
  config_id: string | null;
  first_message: string;
  message_count: number;
  created_at: string | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  config: string | null;
  user: number | null;
  role: "user" | "assistant";
  content: string;
  temperature_used: number | null;
  max_tokens_used: number | null;
  created_at: string;
}
