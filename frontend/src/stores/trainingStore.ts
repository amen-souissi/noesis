import { create } from "zustand";
import type { WeightSnapshot } from "@/types/training";

interface TrainingState {
  status: string;
  epoch: number;
  totalEpochs: number;
  batch: number;
  totalBatches: number;
  batchLoss: number;
  lossHistory: number[];
  elapsed: number;
  weightSnapshot: WeightSnapshot[] | null;

  setStatus: (s: string) => void;
  setEpoch: (e: number, total: number) => void;
  setBatch: (b: number, total: number) => void;
  setBatchLoss: (l: number) => void;
  addLoss: (l: number) => void;
  setLossHistory: (h: number[]) => void;
  setElapsed: (e: number) => void;
  setWeightSnapshot: (ws: WeightSnapshot[]) => void;
  reset: () => void;
}

export const useTrainingStore = create<TrainingState>((set) => ({
  status: "idle",
  epoch: 0,
  totalEpochs: 0,
  batch: 0,
  totalBatches: 0,
  batchLoss: 0,
  lossHistory: [],
  elapsed: 0,
  weightSnapshot: null,

  setStatus: (status) => set({ status }),
  setEpoch: (epoch, totalEpochs) => set({ epoch, totalEpochs }),
  setBatch: (batch, totalBatches) => set({ batch, totalBatches }),
  setBatchLoss: (batchLoss) => set({ batchLoss }),
  addLoss: (l) => set((s) => ({ lossHistory: [...s.lossHistory, l] })),
  setLossHistory: (lossHistory) => set({ lossHistory }),
  setElapsed: (elapsed) => set({ elapsed }),
  setWeightSnapshot: (weightSnapshot) => set({ weightSnapshot }),
  reset: () =>
    set({
      status: "idle",
      epoch: 0,
      totalEpochs: 0,
      batch: 0,
      totalBatches: 0,
      batchLoss: 0,
      lossHistory: [],
      elapsed: 0,
      weightSnapshot: null,
    }),
}));
