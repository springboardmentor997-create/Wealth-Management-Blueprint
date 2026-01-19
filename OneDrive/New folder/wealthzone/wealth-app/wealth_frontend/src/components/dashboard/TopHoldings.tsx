import { TrendingUp, TrendingDown } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { cn } from '@/lib/utils';

export function TopHoldings() {
  const { investments, loading } = usePortfolio();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
     return (
        <div className="rounded-xl bg-card border border-border p-6 animate-fade-in">
             <p className="text-muted-foreground">Loading...</p>
        </div>
     );
  }

  // Calculate generic derived fields
  const getChangePercent = (inv: any) => {
      if (!inv.cost_basis || inv.cost_basis === 0) return 0;
      return ((inv.current_value - inv.cost_basis) / inv.cost_basis) * 100;
  };

  const sortedInvestments = [...investments].sort((a, b) => b.current_value - a.current_value);

  return (
    <div className="rounded-xl bg-card border border-border p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Top Holdings</h3>
        <p className="text-sm text-muted-foreground">Your largest positions</p>
      </div>
      
      <div className="space-y-4">
        {sortedInvestments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No investments found.</p>
        ) : (
            sortedInvestments.slice(0, 5).map((investment) => {
              // investment is from API: snake_case
              const currentValue = investment.current_value || 0;
              const changePercent = getChangePercent(investment);
              const isPositive = changePercent >= 0;
              
              return (
                <div key={investment.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                      {investment.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{investment.symbol}</p>
                      <p className="text-xs text-muted-foreground">{investment.asset_type || 'Stock'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(currentValue)}</p>
                    <div className="flex items-center justify-end gap-1">
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3 text-success" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                      <span className={cn(
                        "text-xs font-medium",
                        isPositive ? "text-success" : "text-destructive"
                      )}>
                        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
