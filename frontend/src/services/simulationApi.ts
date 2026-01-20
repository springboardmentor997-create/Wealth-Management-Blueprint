import { apiFetch } from "./api";

/* ===============================
   TYPES
================================ */
export type SimulationParams = {
  initialInvestment: number;
  monthlyContribution: number;
  annualReturn: number;
  inflationRate: number;
  years: number;
};

export type SimulationTimelinePoint = {
  year: number;
  value: number;
  contributed: number;
};

export type SimulationResult = {
  projectedValue: number;
  contributed: number;
  confidence: number;
  timeline: SimulationTimelinePoint[];
};

/* ===============================
   API
================================ */
export const simulationApi = {
  run: (params: SimulationParams) =>
    apiFetch<SimulationResult>("/simulations/run", {
      method: "POST",
      body: JSON.stringify(params),
    }),
};
