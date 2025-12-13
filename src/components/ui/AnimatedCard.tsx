import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  onClick?: () => void;
}

const AnimatedCard = ({
  children,
  className,
  delay = 0,
  hover = true,
  onClick,
}: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={cn(
        'glass-card p-6 transition-shadow duration-300',
        hover && 'cursor-pointer hover:shadow-lg hover:shadow-primary/10',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;

// Stat Card Component
interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  change?: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
}

export const StatCard = ({
  icon,
  label,
  value,
  change,
  prefix = '',
  suffix = '',
  delay = 0,
}: StatCardProps) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <AnimatedCard delay={delay} className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">{icon}</div>
        {change !== undefined && (
          <span
            className={cn(
              'text-sm font-medium px-2 py-1 rounded-full',
              isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            )}
          >
            {isPositive ? '+' : ''}
            {change.toFixed(2)}%
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold font-display">
        {prefix}
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix}
      </p>
    </AnimatedCard>
  );
};

// Goal Progress Card
interface GoalCardProps {
  name: string;
  current: number;
  target: number;
  deadline: string;
  status: 'on_track' | 'at_risk' | 'behind';
  category: string;
  delay?: number;
  onClick?: () => void;
}

export const GoalCard = ({
  name,
  current,
  target,
  deadline,
  status,
  category,
  delay = 0,
  onClick,
}: GoalCardProps) => {
  const progress = Math.min((current / target) * 100, 100);
  const remaining = target - current;

  const statusColors = {
    on_track: 'bg-success/10 text-success',
    at_risk: 'bg-warning/10 text-warning',
    behind: 'bg-destructive/10 text-destructive',
  };

  const statusLabels = {
    on_track: 'On Track',
    at_risk: 'At Risk',
    behind: 'Behind',
  };

  return (
    <AnimatedCard delay={delay} onClick={onClick} className="group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground">{category}</p>
        </div>
        <span className={cn('text-xs font-medium px-2 py-1 rounded-full', statusColors[status])}>
          {statusLabels[status]}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress.toFixed(1)}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: delay + 0.3, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            ${current.toLocaleString()} / ${target.toLocaleString()}
          </span>
          <span className="text-muted-foreground">by {new Date(deadline).toLocaleDateString()}</span>
        </div>
      </div>
    </AnimatedCard>
  );
};

// Investment Card with sliding animation
interface InvestmentCardProps {
  symbol: string;
  name: string;
  type: string;
  value: number;
  change: number;
  changePercent: number;
  delay?: number;
}

export const InvestmentCard = ({
  symbol,
  name,
  type,
  value,
  change,
  changePercent,
  delay = 0,
}: InvestmentCardProps) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
      className="glass-card p-4 flex items-center gap-4 cursor-pointer group transition-all hover:border-primary/30"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center font-bold text-primary-foreground text-lg">
        {symbol.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
            {symbol}
          </h4>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {type}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{name}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold">${value.toLocaleString()}</p>
        <p
          className={cn(
            'text-sm font-medium',
            isPositive ? 'text-success' : 'text-destructive'
          )}
        >
          {isPositive ? '+' : ''}
          {changePercent.toFixed(2)}%
        </p>
      </div>
    </motion.div>
  );
};
