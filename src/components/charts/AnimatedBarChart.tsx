import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
  target?: number;
}

interface AnimatedBarChartProps {
  data: DataPoint[];
  showTarget?: boolean;
  height?: number;
  horizontal?: boolean;
}

const AnimatedBarChart = ({
  data,
  showTarget = false,
  height = 300,
  horizontal = false,
}: AnimatedBarChartProps) => {
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
              Current: {formatValue(payload[0].value)}
            </p>
            {showTarget && payload[1] && (
              <p className="text-sm text-muted-foreground">
                Target: {formatValue(payload[1].value)}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (value: number, target?: number) => {
    if (!target) return '#D4AF37';
    const progress = (value / target) * 100;
    if (progress >= 100) return '#22C55E';
    if (progress >= 70) return '#D4AF37';
    if (progress >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          barCategoryGap="20%"
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity={1} />
              <stop offset="100%" stopColor="#B8860B" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(217 33% 20%)"
            horizontal={!horizontal}
            vertical={horizontal}
          />
          {horizontal ? (
            <>
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }}
                tickFormatter={formatValue}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }}
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="name"
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
            </>
          )}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(217 33% 15%)' }} />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.value, entry.target)}
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(212, 175, 55, 0.3))',
                }}
              />
            ))}
          </Bar>
          {showTarget && (
            <Bar
              dataKey="target"
              fill="transparent"
              stroke="hsl(215 20% 55%)"
              strokeWidth={2}
              strokeDasharray="4 4"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default AnimatedBarChart;
