import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { AllocationChart } from '@/components/dashboard/AllocationChart';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { TopHoldings } from '@/components/dashboard/TopHoldings';
import { MarketOverview } from '@/components/dashboard/MarketOverview';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useGoals } from '@/hooks/useGoals';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Loader2,
  Plus,
  FileText,
  PieChart,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { summary, loading: portfolioLoading, refreshPortfolio } = usePortfolio();
  const { goals, loading: goalsLoading } = useGoals();
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalGoalProgress = goals?.reduce((acc, goal) => acc + (goal?.current_amount || 0), 0) || 0;
  const totalGoalTarget = goals?.reduce((acc, goal) => acc + (goal?.target_amount || 0), 0) || 0;
  const totalMonthlyContribution = goals?.reduce((acc, goal) => acc + (goal?.monthly_contribution || 0), 0) || 0;

  if (portfolioLoading || goalsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name?.split(' ')[0] || 'Member'}! Here's your wealth overview.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => navigate('/portfolio')} className="hidden md:flex">
              <Plus className="mr-2 h-4 w-4" /> Add Transaction
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/reports')}>
              <FileText className="mr-2 h-4 w-4" /> Reports
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Market Overview */}
        <MarketOverview />

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Portfolio Value"
            value={formatCurrency(summary?.total_value || 0)}
            change={summary?.monthly_growth_percentage || 0}
            changeLabel="this month"
            icon={<Wallet className="h-5 w-5" />}
          />
          <StatCard
            title="Total Gains"
            value={formatCurrency(summary?.total_gain_loss || 0)}
            change={summary?.total_cost_basis && summary?.total_cost_basis > 0 ? ((summary?.total_gain_loss || 0) / summary.total_cost_basis) * 100 : 0}
            changeLabel="all time"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="Goals Progress"
            value={formatCurrency(totalGoalProgress)}
            change={totalGoalTarget > 0 ? (totalGoalProgress / totalGoalTarget) * 100 : 0}
            changeLabel="of target"
            icon={<Target className="h-5 w-5" />}
          />
          <StatCard
            title="Monthly Investment"
            value={formatCurrency(totalMonthlyContribution)}
            icon={<DollarSign className="h-5 w-5" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PortfolioChart />
          </div>
          <AllocationChart />
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <GoalProgress goals={goals || []} />
          <TopHoldings />
          <RecentTransactions />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
