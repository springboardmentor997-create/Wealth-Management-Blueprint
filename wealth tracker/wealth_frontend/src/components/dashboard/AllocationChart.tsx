import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useMemo } from 'react';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function AllocationChart() {
  const { investments, loading } = usePortfolio();

  const data = useMemo(() => {
    if (!investments || investments.length === 0) return [];

    const totalValue = investments.reduce((sum, inv) => sum + (Number(inv.current_value) || 0), 0);
    if (totalValue === 0) return [];

    const groups: Record<string, number> = {};
    investments.forEach(inv => {
        // Normalize asset types to be title case and replace underscores
        let type = inv.asset_type || 'Stock'; 
        type = type.replace(/_/g, ' ');
        type = type.charAt(0).toUpperCase() + type.slice(1);
        
        if (!groups[type]) groups[type] = 0;
        groups[type] += (Number(inv.current_value) || 0);
    });

    return Object.entries(groups)
        .map(([name, value]) => ({
            name,
            value: Number(((value / totalValue) * 100).toFixed(1))
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);
  }, [investments]);

  if (loading) {
     return (
        <div className="rounded-xl bg-card border border-border p-6 animate-fade-in flex items-center justify-center">
             <p className="text-muted-foreground">Loading...</p>
        </div>
     );
  }

  return (
    <div className="rounded-xl bg-card border border-border p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Asset Allocation</h3>
        <p className="text-sm text-muted-foreground">Portfolio breakdown</p>
      </div>
      
      {data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              No assets to display
          </div>
      ) : (
      <div className="flex flex-col items-center gap-6">
        <div className="h-[200px] w-[200px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
                strokeWidth={0}
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg bg-popover border border-border px-3 py-2 shadow-lg">
                        <p className="text-sm font-medium">
                          {payload[0].name}: {payload[0].value}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full space-y-3">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-lg transition-colors border border-transparent hover:border-border/50">
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  className="h-3 w-3 rounded-full shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-foreground truncate" title={item.name}>
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-medium text-muted-foreground tabular-nums whitespace-nowrap">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}
