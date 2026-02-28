export interface SavedModel {
  id: string;
  name: string;
  description: string;
  config: string;
  weights_path: string;
  total_parameters: number;
  final_loss: number | null;
  epochs_trained: number;
  training_duration_seconds: number | null;
  vocab_json: Record<string, number>;
  created_at: string;
}

export interface CurrentModel {
  loaded: boolean;
  total_parameters?: number;
  vocab_size?: number;
  d_model?: number;
  n_heads?: number;
  n_layers?: number;
  d_ff?: number;
  seq_len?: number;
}

export interface ActiveModel {
  config_id: string;
  is_ready: boolean;
  status: "idle" | "ready" | "training" | "paused";
  is_active: boolean;
  total_parameters: number;
  last_loss: number | null;
}
