import { Target, Home, GraduationCap, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const goalIcons: Record<string, any> = {
  retirement: Target,
  home: Home,
  education: GraduationCap,
  custom: Sparkles,
};

const goalColors: Record<string, string> = {
  retirement: 'text-chart-2',
  home: 'text-chart-3',
  education: 'text-chart-4',
  custom: 'text-chart-5',
};

interface Goal {
  id: string;
  title: string;
  goal_type: string;
  target_amount: number;
  current_amount: number;
}

interface GoalProgressProps {
  goals: Goal[];
}

export function GoalProgress({ goals }: GoalProgressProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="rounded-xl bg-card border border-border p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Goal Progress</h3>
        <p className="text-sm text-muted-foreground">Track your financial goals</p>
      </div>
      
      <div className="space-y-5">
        {goals.map((goal) => {
          const Icon = goalIcons[goal.goal_type] || Sparkles;
          const progress = (goal.current_amount / goal.target_amount) * 100;
          
          return (
            <div key={goal.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg bg-secondary",
                    goalColors[goal.goal_type] || goalColors.custom
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
