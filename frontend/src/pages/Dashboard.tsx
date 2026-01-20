import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, Target, CheckCircle } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/AnimatedCard";
import AnimatedLineChart from "@/components/charts/AnimatedLineChart";
import AnimatedPieChart, {
  getChartColor,
} from "@/components/charts/AnimatedPieChart";

import { goalsApi, Goal } from "@/services/api";
import {
  staggerContainer,
  staggerItem,
} from "@/components/layout/PageTransition";

const Dashboard = () => {
  const {
    data: goals = [],
    isLoading,
    isError,
  } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await goalsApi.getAll();
      return res.data ?? [];
    },
  });

  /* ================================
     LOADING STATE
  ================================ */
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card h-28 animate-pulse" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  /* ================================
     ERROR STATE
  ================================ */
  if (isError) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-red-400">
          Failed to load dashboard data
        </div>
      </DashboardLayout>
    );
  }

  /* ================================
     CALCULATIONS
  ================================ */
  const totalGoals = goals.length;

  const completedGoals = goals.filter(
    (g) => g.current_amount >= g.target_amount
  ).length;

  const totalTarget = goals.reduce(
    (sum, g) => sum + g.target_amount,
    0
  );

  const totalCurrent = goals.reduce(
    (sum, g) => sum + g.current_amount,
    0
  );

  /* ================================
     CHART DATA
  ================================ */

  // Line chart (growth)
  const performanceData = Array.from({ length: 12 }, (_, i) => ({
    date: `Month ${i + 1}`,
    value: Math.round((totalCurrent / 12) * (i + 1)),
  }));

  // Pie chart (allocation) — FIXED COLORS ✅
  const allocationData = goals
    .map((goal, index) => ({
      name: goal.name, // ✅ correct backend field
      value:
        goal.current_amount > 0
          ? goal.current_amount
          : goal.target_amount,
      color: getChartColor(index), // ✅ unique color per goal
    }))
    .filter((g) => g.value > 0);

  /* ================================
     STATS
  ================================ */
  const stats = [
    {
      icon: <Target className="w-5 h-5" />,
      label: "Total Goals",
      value: totalGoals,
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      label: "Completed",
      value: completedGoals,
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Total Target",
      value: totalTarget,
      prefix: "₹",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Saved",
      value: totalCurrent,
      prefix: "₹",
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
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your financial progress
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} delay={i * 0.1} />
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              Target Growth
            </h2>
            <AnimatedLineChart data={performanceData} />
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">
              Allocation
            </h2>
            <AnimatedPieChart data={allocationData} />
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
