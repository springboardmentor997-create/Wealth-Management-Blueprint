// frontend/src/services/portfolioApi.ts
import { apiFetch } from "./api";

/* ================================
   TYPES
================================ */
export interface PortfolioAsset {
  _id: string;
  name: string;
  type: "stock" | "etf" | "crypto" | "bond";
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  createdAt?: string;
}

/* ================================
   PORTFOLIO API
================================ */
export const portfolioApi = {
  getAll: () =>
    apiFetch<PortfolioAsset[]>("/portfolio"),

  create: (data: {
    name: string;
    type: "stock" | "etf" | "crypto" | "bond";
    quantity: number;
    buyPrice: number;
    currentPrice: number;
  }) =>
    apiFetch<PortfolioAsset>("/portfolio", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/portfolio/${id}`, {
      method: "DELETE",
    }),
};
