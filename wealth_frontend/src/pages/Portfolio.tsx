import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Plus, ArrowUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Portfolio = () => {
  const { investments, summary, loading, addInvestment } = usePortfolio();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    asset_type: 'stock',
    units: '',
    avg_buy_price: '',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const assetTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      stock: 'bg-chart-1/10 text-chart-1',
      etf: 'bg-chart-2/10 text-chart-2',
      mutual_fund: 'bg-chart-3/10 text-chart-3',
      bond: 'bg-chart-4/10 text-chart-4',
      cash: 'bg-muted text-muted-foreground',
    };
    return (
      <span className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        colors[type] || colors.cash
      )}>
        {type.replace('_', ' ')}
      </span>
    );
  };

  const handleAddInvestment = async () => {
    await addInvestment({
      symbol: formData.symbol,
      asset_type: formData.asset_type,
      units: parseFloat(formData.units),
      avg_buy_price: parseFloat(formData.avg_buy_price),
    });
    setIsDialogOpen(false);
    setFormData({ symbol: '', asset_type: 'stock', units: '', avg_buy_price: '' });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
            <p className="text-muted-foreground">Manage your investments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Investment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Investment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Symbol</Label>
                  <Input 
                    placeholder="AAPL" 
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={formData.asset_type} 
                    onValueChange={(val) => setFormData({...formData, asset_type: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="etf">ETF</SelectItem>
                      <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                      <SelectItem value="bond">Bond</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Units</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={formData.units}
                      onChange={(e) => setFormData({...formData, units: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Avg Price</Label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={formData.avg_buy_price}
                      onChange={(e) => setFormData({...formData, avg_buy_price: e.target.value})}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleAddInvestment}>Add Investment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-card border border-border p-5">
              <p className="text-sm text-muted-foreground mb-1">Total Value</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.total_value)}</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-5">
              <p className="text-sm text-muted-foreground mb-1">Cost Basis</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.total_cost_basis)}</p>
            </div>
            <div className="rounded-xl bg-card border border-border p-5">
              <p className="text-sm text-muted-foreground mb-1">Total Gain/Loss</p>
              <div className="flex items-center gap-2">
                <p className={cn("text-2xl font-bold", summary.total_gain_loss >= 0 ? "text-success" : "text-destructive")}>
                  {summary.total_gain_loss >= 0 ? '+' : ''}{formatCurrency(summary.total_gain_loss)}
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-card border border-border p-5">
              <p className="text-sm text-muted-foreground mb-1">Monthly Growth</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-success">+{summary.monthly_growth_percentage}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Holdings Table */}
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    Asset <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold text-right">Shares</TableHead>
                <TableHead className="font-semibold text-right">Avg Cost</TableHead>
                <TableHead className="font-semibold text-right">Current Price</TableHead>
                <TableHead className="font-semibold text-right">Value</TableHead>
                <TableHead className="font-semibold text-right">Gain/Loss</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No investments found. Add your first investment to get started.
                  </TableCell>
                </TableRow>
              ) : (
                investments.map((inv) => {
                  const gainLoss = (inv.current_value || 0) - (inv.cost_basis || 0);
                  const gainLossPercent = inv.cost_basis ? (gainLoss / inv.cost_basis) * 100 : 0;
                  
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.symbol}</TableCell>
                      <TableCell>{assetTypeBadge(inv.asset_type)}</TableCell>
                      <TableCell className="text-right">{inv.units}</TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.avg_buy_price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.last_price || inv.avg_buy_price)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(inv.current_value || 0)}</TableCell>
                      <TableCell className="text-right">
                        <div className={cn("flex flex-col items-end", gainLoss >= 0 ? "text-success" : "text-destructive")}>
                          <span className="font-medium">
                            {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                          </span>
                          <span className="text-xs">
                            {gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
};

export default Portfolio;
