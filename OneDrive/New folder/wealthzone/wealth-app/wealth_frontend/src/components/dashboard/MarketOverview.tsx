
import { useMarket } from '@/hooks/useMarket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MarketOverview() {
  const { indices, loading } = useMarket();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24 p-4 flex flex-col justify-between">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="flex justify-between items-end">
                <div className="h-8 w-32 bg-muted rounded" />
                <div className="h-6 w-16 bg-muted rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      {indices.map((index) => (
        <Card key={index.symbol}>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{index.name}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(index.price)}
                </h3>
              </div>
              <div className={cn(
                "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                index.change >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {index.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {index.change_percent.toFixed(2)}%
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
