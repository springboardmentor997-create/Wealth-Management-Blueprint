import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, ArrowUpDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard, InvestmentCard } from '@/components/ui/AnimatedCard';
import AnimatedPieChart from '@/components/charts/AnimatedPieChart';
import AnimatedLineChart from '@/components/charts/AnimatedLineChart';
import { mockInvestments, mockPortfolioSummary, generatePerformanceData } from '@/services/mockData';
import { staggerContainer, staggerItem } from '@/components/layout/PageTransition';

type SortKey = 'value' | 'change' | 'name';

const Portfolio = () => {
  const [sortBy, setSortBy] = useState<SortKey>('value');
  const [filterType, setFilterType] = useState<string>('all');

  const performanceData = generatePerformanceData(12);
  
  const allocationData = Object.entries(mockPortfolioSummary.asset_allocation).map(([name, percentage], index) => ({
    name,
    value: percentage,
    color: ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'][index % 5],
  }));

  const investmentTypes = ['all', ...new Set(mockInvestments.map(i => i.type))];

  const filteredInvestments = mockInvestments
    .filter(i => filterType === 'all' || i.type === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return (b.current_price * b.quantity) - (a.current_price * a.quantity);
        case 'change':
          return b.gain_loss_percentage - a.gain_loss_percentage;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const totalValue = mockInvestments.reduce((acc, i) => acc + (i.current_price * i.quantity), 0);
  const totalGain = mockInvestments.reduce((acc, i) => acc + i.gain_loss, 0);

  const stats = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: 'Total Value',
      value: totalValue,
      prefix: '$',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Total Gain',
      value: totalGain,
      prefix: '$',
      change: mockPortfolioSummary.gain_loss_percentage,
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Holdings',
      value: mockInvestments.length,
    },
    {
      icon: <TrendingDown className="w-5 h-5" />,
      label: 'Best Performer',
      value: Math.max(...mockInvestments.map(i => i.gain_loss_percentage)).toFixed(1),
      suffix: '%',
      change: Math.max(...mockInvestments.map(i => i.gain_loss_percentage)),
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
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-1">Manage and track your investments.</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} delay={index * 0.1} />
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={staggerItem} className="lg:col-span-2 glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Performance History</h2>
            <AnimatedLineChart data={performanceData} showArea height={300} />
          </motion.div>

          <motion.div variants={staggerItem} className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">Allocation</h2>
            <AnimatedPieChart
              data={allocationData}
              centerLabel="Assets"
              centerValue={mockInvestments.length.toString()}
            />
          </motion.div>
        </div>

        {/* Filters & Sort */}
        <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {investmentTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  filterType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'glass-card hover:bg-accent/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="value">Sort by Value</option>
              <option value="change">Sort by Change</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </motion.div>

        {/* Holdings List */}
        <motion.div layout className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredInvestments.map((investment, index) => (
              <motion.div
                key={investment.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <InvestmentCard
                  symbol={investment.symbol}
                  name={investment.name}
                  type={investment.type}
                  value={investment.current_price * investment.quantity}
                  change={investment.gain_loss}
                  changePercent={investment.gain_loss_percentage}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Portfolio;
