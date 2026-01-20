import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { PieChart, TrendingUp, Target } from 'lucide-react';

import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassButton from '@/components/ui/GlassButton';
import AnimatedPieChart from '@/components/charts/AnimatedPieChart';
import AnimatedLineChart from '@/components/charts/AnimatedLineChart';
import AnimatedBarChart from '@/components/charts/AnimatedBarChart';

import {
  reportApi,
  PortfolioSummary,
  Goal,
} from '@/services/reportApi';

import {
  staggerContainer,
  staggerItem,
} from '@/components/layout/PageTransition';

const Reports = () => {
  const reportRef = useRef<HTMLDivElement>(null);

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedReport, setSelectedReport] =
    useState<'portfolio' | 'performance' | 'goals'>('portfolio');

  /* ================================
     LOAD DATA
  ================================ */
  useEffect(() => {
    const loadReports = async () => {
      const res = await reportApi.getSummary();
      if (!res.data) return;

      const { portfolioSummary, goals: apiGoals } = res.data;

      setPortfolio({
        total_value: Number(portfolioSummary.total_value ?? 0),
        total_invested: Number(portfolioSummary.total_invested ?? 0),
        total_gain_loss: Number(portfolioSummary.total_gain_loss ?? 0),
        gain_loss_percentage: Number(
          portfolioSummary.gain_loss_percentage ?? 0
        ),
        asset_allocation: portfolioSummary.asset_allocation ?? {},
      });

      setGoals(
        apiGoals.map((g: any) => ({
          name: g.name,
          current_amount: Number(g.current_amount ?? 0),
          target_amount: Number(
            g.target_amount ?? g.targetAmount ?? g.amount ?? 0
          ),
          status:
            g.status === 'at_risk'
              ? 'at_risk'
              : g.status === 'behind'
              ? 'behind'
              : 'on_track',
        }))
      );
    };

    loadReports();
  }, []);

  if (!portfolio) {
    return (
      <DashboardLayout>
        <div className="p-6 text-muted-foreground">
          Loading reports…
        </div>
      </DashboardLayout>
    );
  }

  /* ================================
     CALCULATIONS
  ================================ */

  const totalGoalAmount = goals.reduce(
    (sum, g) =>
      sum +
      (g.target_amount > 0 ? g.target_amount : g.current_amount),
    0
  );

  const allocationData = Object.entries(
    portfolio.asset_allocation
  ).map(([name, value], index) => ({
    name,
    value,
    color: [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ][index % 5],
  }));

  const goalsChartData = goals.map((g) => ({
    name: g.name,
    value: g.current_amount,
    target: g.target_amount,
  }));

  const performanceBase =
    portfolio.total_value > 0
      ? portfolio.total_value
      : totalGoalAmount;

  const performanceData = Array.from({ length: 6 }).map((_, i) => ({
    date: `Month ${i + 1}`,
    value: Math.round(performanceBase * (0.85 + i * 0.03)),
  }));

  /* ================================
     EXPORT CSV
  ================================ */
  const exportCSV = () => {
    let csv = '';

    csv += 'PORTFOLIO SUMMARY\n';
    csv += 'Metric,Value\n';
    csv += `Total Value,${portfolio.total_value}\n`;
    csv += `Total Invested,${portfolio.total_invested}\n`;
    csv += `Gain/Loss,${portfolio.total_gain_loss}\n`;
    csv += `Gain/Loss %,${portfolio.gain_loss_percentage}\n\n`;

    csv += 'ASSET ALLOCATION\n';
    csv += 'Asset,Value\n';
    Object.entries(portfolio.asset_allocation).forEach(
      ([asset, value]) => {
        csv += `${asset},${value}\n`;
      }
    );
    csv += '\n';

    csv += 'GOALS\n';
    csv += 'Name,Current Amount,Target Amount,Status\n';
    goals.forEach((g) => {
      csv += `${g.name},${g.current_amount},${g.target_amount},${g.status}\n`;
    });
    csv += '\n';

    csv += 'PERFORMANCE\n';
    csv += 'Month,Value\n';
    performanceData.forEach((p) => {
      csv += `${p.date},${p.value}\n`;
    });

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'wealthtrack_report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ================================
     EXPORT PDF (SAFE)
  ================================ */
  const exportPDF = () => {
    if (!reportRef.current) return;

    const originalTitle = document.title;
    document.title = 'WealthTrack_Report';

    const printContents = reportRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `
      <html>
        <head>
          <title>WealthTrack Report</title>
          <style>
            body {
              background: #fff;
              color: #000;
              font-family: Arial, sans-serif;
            }
            .glass-card {
              border: 1px solid #ddd;
              padding: 16px;
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `;

    window.print();

    document.body.innerHTML = originalContents;
    document.title = originalTitle;
    window.location.reload();
  };

  /* ================================
     UI
  ================================ */
  return (
    <DashboardLayout>
      <motion.div
        ref={reportRef}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* HEADER */}
        <motion.div
          variants={staggerItem}
          className="flex justify-between items-center"
        >
          <h1 className="text-3xl font-bold">Reports</h1>
          <div className="flex gap-2">
            <GlassButton onClick={exportCSV}>
              Export CSV
            </GlassButton>
            <GlassButton onClick={exportPDF}>
              Export PDF
            </GlassButton>
          </div>
        </motion.div>

        {/* TABS */}
        <motion.div variants={staggerItem} className="flex gap-3">
          {[
            { id: 'portfolio', label: 'Portfolio', icon: PieChart },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'goals', label: 'Goals', icon: Target },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() =>
                setSelectedReport(
                  id as 'portfolio' | 'performance' | 'goals'
                )
              }
              className={`px-4 py-2 rounded-xl flex gap-2 items-center ${
                selectedReport === id
                  ? 'bg-primary text-primary-foreground'
                  : 'glass-card'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </motion.div>

        {/* PORTFOLIO */}
        {selectedReport === 'portfolio' && (
          <div className="glass-card p-6">
            <AnimatedPieChart
              data={allocationData}
              centerLabel="Total"
              centerValue={`₹${(
                portfolio.total_value > 0
                  ? portfolio.total_value
                  : totalGoalAmount
              ).toLocaleString()}`}
            />
          </div>
        )}

        {/* PERFORMANCE */}
        {selectedReport === 'performance' && (
          <div className="glass-card p-6">
            <AnimatedLineChart
              data={performanceData}
              height={350}
            />
          </div>
        )}

        {/* GOALS */}
        {selectedReport === 'goals' && (
          <>
            <div className="glass-card p-6">
              <AnimatedBarChart
                data={goalsChartData}
                showTarget
                height={350}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {(['on_track', 'at_risk', 'behind'] as const).map((s) => (
                <div key={s} className="glass-card p-4 text-center">
                  <p className="text-2xl font-bold">
                    {goals.filter((g) => g.status === s).length}
                  </p>
                  <p className="text-muted-foreground">{s}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Reports;
