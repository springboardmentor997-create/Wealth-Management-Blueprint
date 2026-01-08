import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

export interface Investment {
  id: string;
  symbol: string;
  asset_type: string;
  units: number;
  avg_buy_price: number;
  cost_basis: number;
  current_value: number;
  last_price: number;
  last_price_at: string;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: string;
  quantity: number;
  price: number;
  fees: number;
  executed_at: string;
}

export interface PortfolioSummary {
  total_value: number;
  total_cost_basis: number;
  total_gain_loss: number;
  monthly_growth_percentage: number;
}

export interface PortfolioHistoryPoint {
  name: string;
  value: number;
}

export function usePortfolio() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [history, setHistory] = useState<PortfolioHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    setLoading(true);
    const [invRes, transRes, sumRes, histRes] = await Promise.all([
      apiClient.getInvestments(),
      apiClient.getTransactions(),
      apiClient.getPortfolioSummary(),
      apiClient.getPortfolioHistory('6mo'),
    ]);

    if (invRes.data) setInvestments(invRes.data);
    if (transRes.data) setTransactions(transRes.data);
    if (sumRes.data) setSummary(sumRes.data);
    if (histRes.data) setHistory(histRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const addInvestment = async (data: any) => {
    const { data: newInv, error } = await apiClient.addInvestment(data);

    if (newInv) {
      fetchPortfolio();
    }
    return { error };
  };

  return {
    investments,
    transactions,
    summary,
    history,
    loading,
    addInvestment,
    refreshPortfolio: fetchPortfolio,
  };
}
