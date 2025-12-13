import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface DataPoint {
  date: string;
  value: number;
  benchmark?: number;
}

interface AnimatedLineChartProps {
  data: DataPoint[];
  showBenchmark?: boolean;
  showArea?: boolean;
  height?: number;
}

const AnimatedLineChart = ({
  data,
  showBenchmark = false,
  showArea = true,
  height = 300,
}: AnimatedLineChartProps) => {
  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-4 py-3 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <p className="font-semibold text-primary">
              Portfolio: {formatValue(payload[0].value)}
            </p>
            {showBenchmark && payload[1] && (
              <p className="text-sm text-accent">
                Benchmark: {formatValue(payload[1].value)}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const ChartComponent = showArea ? AreaChart : LineChart;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(217 33% 20%)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }}
            tickFormatter={formatValue}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          {showArea ? (
            <>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#D4AF37"
                strokeWidth={2}
                fill="url(#colorValue)"
                animationDuration={1500}
                animationEasing="ease-out"
              />
              {showBenchmark && (
                <Area
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#14B8A6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#colorBenchmark)"
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              )}
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#D4AF37"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: '#D4AF37',
                  stroke: '#1a1f2e',
                  strokeWidth: 2,
                }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              {showBenchmark && (
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#14B8A6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              )}
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default AnimatedLineChart;
