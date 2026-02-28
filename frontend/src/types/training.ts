export interface TrainingStatus {
  status: "idle" | "running" | "paused";
  is_ready: boolean;
  loss_history: number[];
  model_loaded: boolean;
  total_parameters: number;
}

export interface TrainingRun {
  id: string;
  config: string;
  status: string;
  current_epoch: number;
  total_epochs: number;
  loss_history: number[];
  error_message: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface TrainingMessage {
  type: string;
  config_id?: string;
  epoch?: number;
  total_epochs?: number;
  batch?: number;
  total_batches?: number;
  batch_loss?: number;
  loss?: number;
  loss_history?: number[];
  elapsed_seconds?: number;
  status?: string;
  message?: string;
  weight_snapshot?: WeightSnapshot[];
}

export interface WeightSnapshot {
  module: string;
  param: string;
  rows: number;
  cols: number;
  values: number[][];
  min: number;
  max: number;
}
