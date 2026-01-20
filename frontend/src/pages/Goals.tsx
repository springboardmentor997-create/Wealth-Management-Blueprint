import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Trash2,
  IndianRupee,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { GoalCard, StatCard } from "@/components/ui/AnimatedCard";
import AnimatedBarChart from "@/components/charts/AnimatedBarChart";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { goalsApi, Goal } from "@/services/api";
import { staggerContainer, staggerItem } from "@/components/layout/PageTransition";

/* ================================
   TYPES
================================ */
type GoalStatus = "on_track" | "at_risk" | "behind";
type FilterType = "all" | GoalStatus;

/* ================================
   COMPONENT
================================ */
const Goals = () => {
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<FilterType>("all");
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const [addAmountGoal, setAddAmountGoal] = useState<Goal | null>(null);
  const [amount, setAmount] = useState("");

  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    deadline: "",
  });

  /* ================================
     FETCH GOALS
  ================================ */
  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await goalsApi.getAll();
      return res.data ?? [];
    },
  });

  /* ================================
     CREATE GOAL
  ================================ */
  const createGoal = useMutation({
    mutationFn: () =>
      goalsApi.create({
        name: form.name,
        target_amount: Number(form.target_amount),
        current_amount: 0,
        deadline: form.deadline,
        category: "general",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setIsAddingGoal(false);
      setForm({ name: "", target_amount: "", deadline: "" });
    },
  });

  /* ================================
     UPDATE GOAL AMOUNT
  ================================ */
  const updateAmount = useMutation({
    mutationFn: ({ id, newAmount }: { id: string; newAmount: number }) =>
      goalsApi.update(id, { current_amount: newAmount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setAddAmountGoal(null);
      setAmount("");
    },
  });

  /* ================================
     DELETE GOAL
  ================================ */
  const deleteGoal = useMutation({
    mutationFn: (id: string) => goalsApi.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  /* ================================
     SMART STATUS LOGIC (STEP 6)
  ================================ */
  const getStatus = (goal: Goal): GoalStatus => {
    const progress =
      (goal.current_amount / goal.target_amount) * 100;

    const daysLeft =
      (new Date(goal.deadline).getTime() -
        new Date().getTime()) /
      (1000 * 60 * 60 * 24);

    if (progress >= 70 || goal.current_amount >= goal.target_amount) {
      return "on_track";
    }

    if (progress >= 30 && daysLeft <= 60) {
      return "at_risk";
    }

    return "behind";
  };

  const filteredGoals =
    filter === "all"
      ? goals
      : goals.filter((g) => getStatus(g) === filter);

  /* ================================
     CHART DATA
  ================================ */
  const chartData = goals.map((g) => ({
    name: g.name.length > 15 ? g.name.slice(0, 15) + "..." : g.name,
    value: g.current_amount,
    target: g.target_amount,
  }));

  /* ================================
     STATS
  ================================ */
  const stats = [
    {
      icon: <Target className="w-5 h-5" />,
      label: "Total Goals",
      value: goals.length,
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      label: "On Track",
      value: goals.filter((g) => getStatus(g) === "on_track").length,
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: "At Risk",
      value: goals.filter((g) => getStatus(g) === "at_risk").length,
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: "Behind",
      value: goals.filter((g) => getStatus(g) === "behind").length,
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Total Target",
      value: goals.reduce((s, g) => s + g.target_amount, 0),
      prefix: "₹",
    },
  ];

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All Goals" },
    { key: "on_track", label: "On Track" },
    { key: "at_risk", label: "At Risk" },
    { key: "behind", label: "Behind" },
  ];

  /* ================================
     UI
  ================================ */
  return (
    <DashboardLayout>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={staggerItem}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-2xl font-bold">Financial Goals</h1>
            <p className="text-muted-foreground">
              Track and update your savings goals
            </p>
          </div>

          <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
            <DialogTrigger asChild>
              <GlassButton leftIcon={<Plus className="w-4 h-4" />}>
                Add Goal
              </GlassButton>
            </DialogTrigger>

            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Create Goal</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <GlassInput
                  label="Goal Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
                <GlassInput
                  label="Target Amount"
                  type="number"
                  value={form.target_amount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      target_amount: e.target.value,
                    })
                  }
                />
                <GlassInput
                  label="Deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                />

                <GlassButton
                  className="w-full"
                  onClick={() => createGoal.mutate()}
                >
                  Create Goal
                </GlassButton>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.1} />
          ))}
        </motion.div>

        {/* Chart */}
        <motion.div variants={staggerItem} className="glass-card p-6">
          <AnimatedBarChart data={chartData} showTarget height={300} />
        </motion.div>

        {/* Filters */}
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "glass-card"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Goals Grid */}
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">
            Loading goals...
          </div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredGoals.map((goal) => (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="relative">
                    <GoalCard
                      name={goal.name}
                      current={goal.current_amount}
                      target={goal.target_amount}
                      deadline={goal.deadline}
                      status={getStatus(goal)}
                      category={goal.category}
                    />

                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => setAddAmountGoal(goal)}
                        title="Add Amount"
                      >
                        <IndianRupee className="w-4 h-4 text-green-400" />
                      </button>

                      <button
                        onClick={() => deleteGoal.mutate(goal._id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Add Amount Dialog */}
      <Dialog
        open={!!addAmountGoal}
        onOpenChange={() => setAddAmountGoal(null)}
      >
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Add Amount</DialogTitle>
          </DialogHeader>

          <GlassInput
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <GlassButton
            className="w-full"
            onClick={() =>
              addAmountGoal &&
              updateAmount.mutate({
                id: addAmountGoal._id,
                newAmount:
                  addAmountGoal.current_amount + Number(amount),
              })
            }
          >
            Update
          </GlassButton>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Goals;
