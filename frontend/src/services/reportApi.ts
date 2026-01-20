import { apiFetch } from './api';

/* ================================
   TYPES
================================ */

export interface PortfolioSummary {
  total_value: number;
  total_invested: number;
  total_gain_loss: number;
  gain_loss_percentage: number;
  asset_allocation: Record<string, number>;
}

export interface Goal {
  name: string;
  current_amount: number;
  target_amount: number;
  status: 'on_track' | 'at_risk' | 'behind';
}

export interface ReportsSummaryResponse {
  portfolioSummary: PortfolioSummary;
  goals: Goal[];
}

/* ================================
   API
================================ */

export const reportApi = {
  getSummary: () =>
    apiFetch<ReportsSummaryResponse>('/reports/summary'),
};
