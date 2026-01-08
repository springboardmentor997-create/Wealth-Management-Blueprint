import { ArrowUpRight, ArrowDownRight, Coins } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
  buy: { icon: ArrowUpRight, label: 'Buy', color: 'text-success bg-success/10' },
  sell: { icon: ArrowDownRight, label: 'Sell', color: 'text-destructive bg-destructive/10' },
  dividend: { icon: Coins, label: 'Dividend', color: 'text-warning bg-warning/10' },
  contribution: { icon: ArrowUpRight, label: 'Contribution', color: 'text-success bg-success/10' },
  withdrawal: { icon: ArrowDownRight, label: 'Withdrawal', color: 'text-destructive bg-destructive/10' },
  // Default fallback
  default: { icon: ArrowUpRight, label: 'Transaction', color: 'text-primary bg-primary/10' }
};

export function RecentTransactions() {
  const { transactions, loading } = usePortfolio();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-card border border-border p-6 h-[400px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <p className="text-sm text-muted-foreground">Latest activity</p>
      </div>
      
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent transactions found.
          </div>
        ) : (
          transactions.slice(0, 5).map((tx) => {
            const config = typeConfig[tx.type.toLowerCase()] || typeConfig['default'];
            const Icon = config.icon;
            const quantity = tx.quantity || 0;
            const price = tx.price || 0;
            const total = quantity > 0 ? quantity * price : price; // Fallback logic
            
            return (
              <div key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    config.color
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {config.label} {quantity > 0 && `• ${quantity} units`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(total)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.executed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
