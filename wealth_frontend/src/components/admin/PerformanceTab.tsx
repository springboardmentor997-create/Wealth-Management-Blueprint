import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, TrendingUp, DollarSign, UserCheck, CheckCircle, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

// Fixed PerformanceTab with proper data fetching
export function PerformanceTab() {
  const { data: dashboardData, isLoading, isError, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => apiClient.getAdminDashboard().then(res => {
         if (res.error) throw res.error;
         return res.data;
    }),
    retry: 1
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
      return (
          <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  if (isError) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-destructive">
            <p>Failed to load performance data.</p>
            <p className="text-sm text-muted-foreground">{(error as Error)?.message || 'Unknown error'}</p>
        </div>
    );
  }

  const totalUsers = dashboardData?.total_users || 0;
  const totalGoals = dashboardData?.total_goals || 0;
  const goalsCompleted = dashboardData?.total_goals_completed || 0;
  const totalPortfolioValue = dashboardData?.total_portfolio_value || 0;
  const avgPortfolioValue = totalUsers > 0 ? totalPortfolioValue / totalUsers : 0;
  
  // Real historical data
  const userGrowthData = dashboardData?.user_growth || [];
  const goalPerformanceData = dashboardData?.goal_performance || [];

  const metrics = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      title: 'Active Users',
      value: totalUsers, // Using totalUsers as proxy since we don't track active session count yet
      icon: UserCheck,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
    },
    {
      title: 'Total Goals',
      value: totalGoals,
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      title: 'Goals Completed',
      value: goalsCompleted,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      title: 'Avg. Portfolio Value',
      value: formatCurrency(avgPortfolioValue),
      icon: DollarSign,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <div className={`p-2 rounded-full ${metric.bgColor}`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Cumulative users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {userGrowthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                      Not enough data
                  </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal Performance</CardTitle>
            <CardDescription>Active vs Completed goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
                {goalPerformanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={goalPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Legend />
                      <Bar dataKey="active" name="Active" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        Not enough data
                    </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
