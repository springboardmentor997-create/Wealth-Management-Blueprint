// Mock data for the Wealth Management application

export interface User {
  id: number;
  name: string;
  email: string;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  kycStatus: 'unverified' | 'verified';
  createdAt: string;
}

export interface Goal {
  id: number;
  userId: number;
  goalType: 'retirement' | 'home' | 'education' | 'custom';
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
}

export interface Investment {
  id: number;
  userId: number;
  assetType: 'stock' | 'etf' | 'mutual_fund' | 'bond' | 'cash';
  symbol: string;
  name: string;
  units: number;
  avgBuyPrice: number;
  costBasis: number;
  currentValue: number;
  lastPrice: number;
  change: number;
  changePercent: number;
}

export interface Transaction {
  id: number;
  userId: number;
  symbol: string;
  type: 'buy' | 'sell' | 'dividend' | 'contribution' | 'withdrawal';
  quantity: number;
  price: number;
  fees: number;
  executedAt: string;
}

export const mockUser: User = {
  id: 1,
  name: "Alex Morgan",
  email: "alex.morgan@email.com",
  riskProfile: 'moderate',
  kycStatus: 'verified',
  createdAt: "2024-01-15",
};

export const mockGoals: Goal[] = [
  {
    id: 1,
    userId: 1,
    goalType: 'retirement',
    title: 'Early Retirement Fund',
    targetAmount: 1500000,
    currentAmount: 342500,
    targetDate: '2045-01-01',
    monthlyContribution: 2500,
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    userId: 1,
    goalType: 'home',
    title: 'Dream Home Down Payment',
    targetAmount: 150000,
    currentAmount: 67500,
    targetDate: '2027-06-01',
    monthlyContribution: 3000,
    status: 'active',
    createdAt: '2024-02-01',
  },
  {
    id: 3,
    userId: 1,
    goalType: 'education',
    title: 'Kids College Fund',
    targetAmount: 200000,
    currentAmount: 45000,
    targetDate: '2038-09-01',
    monthlyContribution: 800,
    status: 'active',
    createdAt: '2024-03-10',
  },
];

export const mockInvestments: Investment[] = [
  {
    id: 1,
    userId: 1,
    assetType: 'stock',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    units: 50,
    avgBuyPrice: 165.50,
    costBasis: 8275,
    currentValue: 9750,
    lastPrice: 195.00,
    change: 2.35,
    changePercent: 1.22,
  },
  {
    id: 2,
    userId: 1,
    assetType: 'etf',
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    units: 45,
    avgBuyPrice: 380.00,
    costBasis: 17100,
    currentValue: 19575,
    lastPrice: 435.00,
    change: 1.85,
    changePercent: 0.43,
  },
  {
    id: 3,
    userId: 1,
    assetType: 'stock',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    units: 30,
    avgBuyPrice: 290.00,
    costBasis: 8700,
    currentValue: 12600,
    lastPrice: 420.00,
    change: 5.20,
    changePercent: 1.25,
  },
  {
    id: 4,
    userId: 1,
    assetType: 'etf',
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market',
    units: 60,
    avgBuyPrice: 200.00,
    costBasis: 12000,
    currentValue: 14400,
    lastPrice: 240.00,
    change: -0.80,
    changePercent: -0.33,
  },
  {
    id: 5,
    userId: 1,
    assetType: 'mutual_fund',
    symbol: 'VFIAX',
    name: 'Vanguard 500 Index Fund',
    units: 25,
    avgBuyPrice: 410.00,
    costBasis: 10250,
    currentValue: 11500,
    lastPrice: 460.00,
    change: 1.10,
    changePercent: 0.24,
  },
  {
    id: 6,
    userId: 1,
    assetType: 'bond',
    symbol: 'BND',
    name: 'Vanguard Total Bond Market',
    units: 100,
    avgBuyPrice: 72.00,
    costBasis: 7200,
    currentValue: 7350,
    lastPrice: 73.50,
    change: 0.15,
    changePercent: 0.20,
  },
];

export const mockTransactions: Transaction[] = [
  { id: 1, userId: 1, symbol: 'AAPL', type: 'buy', quantity: 10, price: 172.50, fees: 0, executedAt: '2024-12-10' },
  { id: 2, userId: 1, symbol: 'VOO', type: 'buy', quantity: 5, price: 432.00, fees: 0, executedAt: '2024-12-08' },
  { id: 3, userId: 1, symbol: 'MSFT', type: 'dividend', quantity: 0, price: 18.50, fees: 0, executedAt: '2024-12-05' },
  { id: 4, userId: 1, symbol: 'VTI', type: 'buy', quantity: 10, price: 238.50, fees: 0, executedAt: '2024-12-01' },
  { id: 5, userId: 1, symbol: 'AAPL', type: 'buy', quantity: 15, price: 165.00, fees: 0, executedAt: '2024-11-28' },
];

export const portfolioSummary = {
  totalValue: 75175,
  totalCostBasis: 63525,
  totalGain: 11650,
  totalGainPercent: 18.34,
  dayChange: 285.50,
  dayChangePercent: 0.38,
};

export const allocationData = [
  { name: 'Stocks', value: 48, color: 'hsl(var(--chart-1))' },
  { name: 'ETFs', value: 35, color: 'hsl(var(--chart-2))' },
  { name: 'Mutual Funds', value: 10, color: 'hsl(var(--chart-3))' },
  { name: 'Bonds', value: 7, color: 'hsl(var(--chart-4))' },
];

export const performanceData = [
  { month: 'Jul', value: 62000 },
  { month: 'Aug', value: 64500 },
  { month: 'Sep', value: 63200 },
  { month: 'Oct', value: 67800 },
  { month: 'Nov', value: 71200 },
  { month: 'Dec', value: 75175 },
];
