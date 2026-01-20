// Mock data for development - simulates API responses

import type {
  User,
  UserProfile,
  Goal,
  Investment,
  Transaction,
  PortfolioSummary,
  Recommendation,
  AllocationRecommendation,
  SimulationResult,
} from './api';

export const mockUser: User = {
  id: '1',
  email: 'alex.morgan@example.com',
  first_name: 'Alex',
  last_name: 'Morgan',
  created_at: '2024-01-15T10:00:00Z',
};

export const mockUserProfile: UserProfile = {
  ...mockUser,
  phone: '+1 (555) 123-4567',
  avatar_url: undefined,
  risk_profile: {
    risk_tolerance: 'moderate',
    investment_horizon: '10-15 years',
    financial_goals: ['Retirement', 'Wealth Building', 'Emergency Fund'],
  },
  investment_experience: 'intermediate',
  annual_income: 120000,
};

export const mockGoals: Goal[] = [
  {
    id: '1',
    name: 'Retirement Fund',
    target_amount: 1000000,
    current_amount: 285000,
    deadline: '2045-01-01',
    category: 'retirement',
    priority: 'high',
    status: 'on_track',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Dream Home Down Payment',
    target_amount: 100000,
    current_amount: 45000,
    deadline: '2027-06-01',
    category: 'house',
    priority: 'high',
    status: 'on_track',
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: '3',
    name: 'Emergency Fund',
    target_amount: 30000,
    current_amount: 28500,
    deadline: '2025-03-01',
    category: 'emergency',
    priority: 'medium',
    status: 'on_track',
    created_at: '2024-01-20T10:00:00Z',
  },
  {
    id: '4',
    name: 'Kids College Fund',
    target_amount: 200000,
    current_amount: 35000,
    deadline: '2040-09-01',
    category: 'education',
    priority: 'medium',
    status: 'at_risk',
    created_at: '2024-03-01T10:00:00Z',
  },
  {
    id: '5',
    name: 'Europe Vacation',
    target_amount: 15000,
    current_amount: 8200,
    deadline: '2025-07-01',
    category: 'travel',
    priority: 'low',
    status: 'on_track',
    created_at: '2024-04-01T10:00:00Z',
  },
];

export const mockInvestments: Investment[] = [
  {
    id: '1',
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    type: 'etf',
    quantity: 150,
    purchase_price: 215.50,
    current_price: 268.45,
    purchase_date: '2023-06-15',
    gain_loss: 7942.50,
    gain_loss_percentage: 24.58,
  },
  {
    id: '2',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    quantity: 50,
    purchase_price: 165.00,
    current_price: 192.75,
    purchase_date: '2023-08-01',
    gain_loss: 1387.50,
    gain_loss_percentage: 16.82,
  },
  {
    id: '3',
    symbol: 'BND',
    name: 'Vanguard Total Bond Market ETF',
    type: 'bond',
    quantity: 100,
    purchase_price: 74.25,
    current_price: 72.80,
    purchase_date: '2023-09-10',
    gain_loss: -145.00,
    gain_loss_percentage: -1.95,
  },
  {
    id: '4',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'stock',
    quantity: 30,
    purchase_price: 310.00,
    current_price: 378.50,
    purchase_date: '2023-05-20',
    gain_loss: 2055.00,
    gain_loss_percentage: 22.10,
  },
  {
    id: '5',
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    type: 'etf',
    quantity: 80,
    purchase_price: 385.00,
    current_price: 462.30,
    purchase_date: '2023-07-01',
    gain_loss: 6184.00,
    gain_loss_percentage: 20.08,
  },
  {
    id: '6',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    quantity: 0.5,
    purchase_price: 42000.00,
    current_price: 67500.00,
    purchase_date: '2024-01-15',
    gain_loss: 12750.00,
    gain_loss_percentage: 60.71,
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'buy',
    symbol: 'VTI',
    amount: 5362.50,
    quantity: 20,
    price: 268.125,
    date: '2024-11-15T14:30:00Z',
    status: 'completed',
  },
  {
    id: '2',
    type: 'dividend',
    symbol: 'AAPL',
    amount: 48.00,
    date: '2024-11-10T09:00:00Z',
    status: 'completed',
  },
  {
    id: '3',
    type: 'deposit',
    amount: 5000.00,
    date: '2024-11-01T10:00:00Z',
    status: 'completed',
  },
  {
    id: '4',
    type: 'sell',
    symbol: 'NVDA',
    amount: 8450.00,
    quantity: 10,
    price: 845.00,
    date: '2024-10-28T11:15:00Z',
    status: 'completed',
  },
  {
    id: '5',
    type: 'buy',
    symbol: 'MSFT',
    amount: 3785.00,
    quantity: 10,
    price: 378.50,
    date: '2024-10-20T15:45:00Z',
    status: 'completed',
  },
];

export const mockPortfolioSummary: PortfolioSummary = {
  total_value: 156847.25,
  total_invested: 126673.50,
  total_gain_loss: 30173.75,
  gain_loss_percentage: 23.82,
  asset_allocation: {
    'Stocks': 35,
    'ETFs': 45,
    'Bonds': 8,
    'Crypto': 7,
    'Cash': 5,
  },
  performance_history: [
    { date: '2024-01', value: 98500 },
    { date: '2024-02', value: 102300 },
    { date: '2024-03', value: 108750 },
    { date: '2024-04', value: 105200 },
    { date: '2024-05', value: 115600 },
    { date: '2024-06', value: 122400 },
    { date: '2024-07', value: 128900 },
    { date: '2024-08', value: 125300 },
    { date: '2024-09', value: 138700 },
    { date: '2024-10', value: 145200 },
    { date: '2024-11', value: 152400 },
    { date: '2024-12', value: 156847 },
  ],
};

export const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    type: 'buy',
    symbol: 'SCHD',
    name: 'Consider adding dividend ETF for income',
    reason: 'Based on your moderate risk profile and income goals, adding a dividend-focused ETF could enhance portfolio income while maintaining diversification.',
    confidence: 0.85,
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: '2',
    type: 'rebalance',
    name: 'Rebalance bond allocation',
    reason: 'Your bond allocation has drifted below target. Consider increasing fixed income to maintain your risk-adjusted returns.',
    confidence: 0.78,
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: '3',
    type: 'hold',
    symbol: 'VTI',
    name: 'Maintain core ETF position',
    reason: 'VTI continues to provide excellent broad market exposure aligned with your long-term goals.',
    confidence: 0.92,
    created_at: '2024-12-01T10:00:00Z',
  },
];

export const mockAllocationRecommendation: AllocationRecommendation = {
  current_allocation: {
    'US Stocks': 35,
    'ETFs': 45,
    'Bonds': 8,
    'Crypto': 7,
    'Cash': 5,
  },
  recommended_allocation: {
    'US Stocks': 30,
    'ETFs': 40,
    'International': 10,
    'Bonds': 12,
    'Crypto': 5,
    'Cash': 3,
  },
  adjustments: [
    { asset_class: 'Bonds', current: 8, recommended: 12, action: 'Increase by 4%' },
    { asset_class: 'International', current: 0, recommended: 10, action: 'Add new allocation' },
    { asset_class: 'Crypto', current: 7, recommended: 5, action: 'Reduce by 2%' },
    { asset_class: 'US Stocks', current: 35, recommended: 30, action: 'Reduce by 5%' },
  ],
};

export const mockSimulationResult: SimulationResult = {
  id: '1',
  params: {
    initial_investment: 50000,
    monthly_contribution: 1000,
    years: 20,
    risk_level: 'medium',
    inflation_rate: 2.5,
  },
  projected_value: 687542,
  best_case: 892450,
  worst_case: 485320,
  timeline: Array.from({ length: 21 }, (_, i) => ({
    year: i,
    value: 50000 * Math.pow(1.08, i) + (1000 * 12 * ((Math.pow(1.08, i) - 1) / 0.08)),
    contributions: 50000 + (1000 * 12 * i),
  })),
  created_at: '2024-12-01T10:00:00Z',
};

// Generate performance data
export const generatePerformanceData = (months: number = 12) => {
  const data = [];
  let value = 100000;
  const now = new Date();
  
  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    value = value * (1 + (Math.random() * 0.08 - 0.02));
    data.push({
      date: date.toISOString().slice(0, 7),
      value: Math.round(value),
      benchmark: Math.round(100000 * Math.pow(1.005, months - i)),
    });
  }
  
  return data;
};
