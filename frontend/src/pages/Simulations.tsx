import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  RotateCcw,
  TrendingUp,
  Calendar,
  DollarSign,
  Percent,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import DashboardLayout from "@/components/layout/DashboardLayout";
import AnimatedLineChart from "@/components/charts/AnimatedLineChart";
import GlassButton from "@/components/ui/GlassButton";
import { Slider } from "@/components/ui/slider";
import {
  staggerContainer,
  staggerItem,
} from "@/components/layout/PageTransition";

import {
  simulationApi,
  SimulationParams,
  SimulationResult,
} from "@/services/simulationApi";

const Simulations = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  const [params, setParams] = useState<SimulationParams>({
    initialInvestment: 100000,
    monthlyContribution: 2000,
    annualReturn: 8,
    inflationRate: 3,
    years: 20,
  });

  /* ===============================
     RUN SIMULATION
  ================================ */
  const runSimulation = useMutation({
    mutationFn: () => simulationApi.run(params),
    onSuccess: (res) => {
      if (res.data) {
        setSimulation(res.data);
        setShowResults(true);
      }
      setIsRunning(false);
    },
    onError: () => {
      setIsRunning(false);
    },
  });

  const handleRun = () => {
    setIsRunning(true);
    setShowResults(false);
    runSimulation.mutate();
  };

  const handleReset = () => {
    setParams({
      initialInvestment: 100000,
      monthlyContribution: 2000,
      annualReturn: 8,
      inflationRate: 3,
      years: 20,
    });
    setShowResults(false);
    setSimulation(null);
  };

  /* ===============================
     DERIVED DATA
  ================================ */
  const chartData =
    simulation?.timeline.map((p) => ({
      date: `Year ${p.year}`,
      value: p.value,
      benchmark: p.contributed,
    })) ?? [];

  const projectedValue = simulation?.projectedValue ?? 0;
  const totalGrowth =
    simulation && simulation.contributed > 0
      ? ((simulation.projectedValue - simulation.contributed) /
          simulation.contributed) *
        100
      : 0;

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
          <h1 className="text-2xl lg:text-3xl font-bold">
            Investment Simulations
          </h1>
          <p className="text-muted-foreground">
            Project your wealth growth over time
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <motion.div variants={staggerItem} className="glass-card p-6 space-y-5">
            <h2 className="text-lg font-semibold">Parameters</h2>

            <SliderBlock
              label="Initial Investment"
              value={params.initialInvestment}
              min={10000}
              max={500000}
              step={5000}
              onChange={(v) =>
                setParams((p) => ({ ...p, initialInvestment: v }))
              }
            />

            <SliderBlock
              label="Monthly Contribution"
              value={params.monthlyContribution}
              min={0}
              max={10000}
              step={100}
              onChange={(v) =>
                setParams((p) => ({ ...p, monthlyContribution: v }))
              }
            />

            <SliderBlock
              label="Annual Return (%)"
              value={params.annualReturn}
              min={1}
              max={15}
              step={0.5}
              onChange={(v) =>
                setParams((p) => ({ ...p, annualReturn: v }))
              }
            />

            <SliderBlock
              label="Inflation Rate (%)"
              value={params.inflationRate}
              min={0}
              max={10}
              step={0.5}
              onChange={(v) =>
                setParams((p) => ({ ...p, inflationRate: v }))
              }
            />

            <SliderBlock
              label="Years"
              value={params.years}
              min={5}
              max={40}
              step={1}
              onChange={(v) => setParams((p) => ({ ...p, years: v }))}
            />

            <div className="flex gap-3 pt-3">
              <GlassButton
                className="flex-1"
                isLoading={isRunning}
                onClick={handleRun}
                leftIcon={<Play className="w-4 h-4" />}
              >
                Run
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={handleReset}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Reset
              </GlassButton>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            variants={staggerItem}
            className="lg:col-span-2 space-y-6"
          >
            {showResults && simulation ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    icon={DollarSign}
                    label="Projected Value"
                    value={`₹${projectedValue.toLocaleString()}`}
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Total Growth"
                    value={`${totalGrowth.toFixed(1)}%`}
                  />
                  <StatCard
                    icon={Calendar}
                    label="Time Period"
                    value={`${params.years} years`}
                  />
                  <StatCard
                    icon={Percent}
                    label="Confidence"
                    value={`${simulation.confidence}%`}
                  />
                </div>

                {/* Chart */}
                <div className="glass-card p-6">
                  <AnimatedLineChart
                    data={chartData}
                    showBenchmark
                    showArea
                    height={350}
                  />
                </div>
              </>
            ) : (
              <div className="glass-card p-12 text-center">
                <TrendingUp className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Adjust parameters and click Run
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Simulations;

/* ===============================
   SMALL COMPONENTS
================================ */
const SliderBlock = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) => (
  <div>
    <label className="text-sm text-muted-foreground">
      {label}: {value}
    </label>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v)}
    />
  </div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className="glass-card p-4">
    <Icon className="w-5 h-5 mb-2 text-primary" />
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);
