import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface AnimatedPieChartProps {
  data: ChartData[];
  centerLabel?: string;
  centerValue?: string;
}

const RADIAN = Math.PI / 180;

const AnimatedPieChart = ({ data, centerLabel, centerValue }: AnimatedPieChartProps) => {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-3 py-2 rounded-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-primary font-semibold">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative w-full h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
  key={`cell-${index}`}
  fill={entry.color || getChartColor(index)}
  stroke="transparent"
  style={{
    filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.3))',
  }}
/>

            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      {centerLabel && centerValue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimated ? 1 : 0 }}
          transition={{ delay: 0.8 }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <p className="text-2xl font-bold text-foreground">{centerValue}</p>
          <p className="text-xs text-muted-foreground">{centerLabel}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnimatedPieChart;

// Color palette for charts
export const chartColors = {
  primary: '#D4AF37',
  accent: '#14B8A6',
  info: '#0EA5E9',
  warning: '#F59E0B',
  success: '#22C55E',
  muted: '#64748B',
  purple: '#8B5CF6',
  pink: '#EC4899',
};

export const getChartColor = (index: number): string => {
  const colors = Object.values(chartColors);
  return colors[index % colors.length];
};
