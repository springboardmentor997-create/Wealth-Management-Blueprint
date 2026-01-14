import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ title, value, change, changeLabel, icon, className }: StatCardProps) {
  const isPositive = change !== undefined && change !== null && change >= 0;
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-card border border-border p-6 animate-fade-in",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title || 'N/A'}</p>
          <p className="text-2xl font-bold tracking-tight">{value || '$0'}</p>
          
          {change !== undefined && change !== null && !isNaN(change) && (
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={cn(
                "text-sm font-medium",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </span>
              {changeLabel && (
                <span className="text-sm text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
