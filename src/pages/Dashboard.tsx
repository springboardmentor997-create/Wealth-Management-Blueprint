import { motion } from 'framer-motion';
import { TrendingUp, Target, PieChart, Wallet, ArrowUpRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard, GoalCard } from '@/components/ui/AnimatedCard';
import AnimatedLineChart from '@/components/charts/AnimatedLineChart';
import AnimatedPieChart from '@/components/charts/AnimatedPieChart';
import { mockGoals, mockPortfolioSummary, generatePerformanceData } from '@/services/mockData';
import { staggerContainer, staggerItem } from '@/components/layout/PageTransition';

const Dashboard = () => {
  const performanceData = generatePerformanceData(12);
  
  const allocationData = Object.entries(mockPortfolioSummary.asset_allocation).map(([name, percentage], index) => ({
    name,
    value: percentage,
    color: ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'][index % 5],
  }));

  const stats = [
    {
      icon: <Wallet className="w-5 h-5" />,
      label: 'Total Portfolio',
      value: mockPortfolioSummary.total_value,
      prefix: '$',
      change: mockPortfolioSummary.gain_loss_percentage,
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Total Gain',
      value: mockPortfolioSummary.total_gain_loss,
      prefix: '$',
      change: mockPortfolioSummary.gain_loss_percentage,
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Active Goals',
      value: mockGoals.filter(g => g.status !== 'behind').length,
      suffix: ` of ${mockGoals.length}`,
    },
    {
      icon: <PieChart className="w-5 h-5" />,
      label: 'Total Invested',
      value: mockPortfolioSummary.total_invested,
      prefix: '$',
    },
  ];

  return (
    <DashboardLayout>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={staggerItem}>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your financial overview.</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} delay={index * 0.1} />
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={staggerItem} className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Portfolio Performance</h2>
              <span className="text-sm text-muted-foreground">Last 12 months</span>
            </div>
            <AnimatedLineChart data={performanceData} showBenchmark height={300} />
          </motion.div>

          <motion.div variants={staggerItem} className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Asset Allocation</h2>
            <AnimatedPieChart
              data={allocationData}
              centerLabel="Total"
              centerValue={`$${(mockPortfolioSummary.total_value / 1000).toFixed(0)}K`}
            />
          </motion.div>
        </div>

        {/* Goals Section */}
        <motion.div variants={staggerItem}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Goals</h2>
            <a href="/goals" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockGoals.slice(0, 3).map((goal, index) => (
              <GoalCard
                key={goal.id}
                name={goal.name}
                current={goal.current_amount}
                target={goal.target_amount}
                deadline={goal.deadline}
                status={goal.status}
                category={goal.category}
                delay={index * 0.1}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
