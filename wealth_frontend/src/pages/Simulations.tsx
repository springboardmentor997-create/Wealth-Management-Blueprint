import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGoals, Goal } from '@/hooks/useGoals';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  CartesianGrid
} from 'recharts';
import { Play, TrendingUp, Clock, DollarSign, Loader2, Check, ChevronsUpDown } from 'lucide-react';

const Simulations = () => {
  const { goals, loading } = useGoals();
  const { toast } = useToast();
  
  // Simulation State
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  
  // Parameters
  const [initialAmount, setInitialAmount] = useState(10000);
  const [targetAmount, setTargetAmount] = useState(100000);
  const [years, setYears] = useState(10);
  const [returnRate, setReturnRate] = useState(8);
  const [monthlyContribution, setMonthlyContribution] = useState(2500);
  const [inflationRate, setInflationRate] = useState(3);
  
  // UI State
  const [openCombobox, setOpenCombobox] = useState(false);
  const [comboboxSearch, setComboboxSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [projectionData, setProjectionData] = useState<any[]>([]);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Select first goal by default if available and nothing selected
    if (goals.length > 0 && !selectedGoalId && !isCustom && !customName) {
      handleGoalSelect(goals[0]);
    }
  }, [goals]);

  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoalId(goal.id);
    setCustomName('');
    setIsCustom(false);
    
    // Pre-fill parameters
    setInitialAmount(Number(goal.current_amount));
    setTargetAmount(Number(goal.target_amount));
    setMonthlyContribution(Number(goal.monthly_contribution));
    
    // Calculate years
    const targetDate = new Date(goal.target_date);
    const now = new Date();
    const diffYears = Math.max(1, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365)));
    setYears(diffYears);
    
    setOpenCombobox(false);
  };

  const handleCustomSelect = (name: string) => {
    setCustomName(name);
    setSelectedGoalId('');
    setIsCustom(true);
    setOpenCombobox(false);
    // Keep current parameters or reset? Keeping current allows "edit based on previous"
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const runSimulation = async () => {
    if (!selectedGoalId && !isCustom) return;
    
    setIsRunning(true);
    let result;

    if (!isCustom && selectedGoalId) {
        // Run against existing goal (preserves ID in backend if needed)
        // We pass the potentially modified parameters
        result = await apiClient.runSimulation(selectedGoalId, {
            annual_return: returnRate,
            inflation_rate: inflationRate,
            additional_contribution: monthlyContribution,
            years_to_simulate: years
        });
    } else {
        // Run ad-hoc
        result = await apiClient.runAdhocSimulation({
            initial_amount: initialAmount,
            target_amount: targetAmount,
            annual_return: returnRate,
            inflation_rate: inflationRate,
            additional_contribution: monthlyContribution,
            years_to_simulate: years
        });
    }

    const { data, error } = result;

    if (error) {
      toast({
        title: "Simulation failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
      setIsRunning(false);
      return;
    }
    
    // Backend returns data directly (not nested under results)
    if (!data || !data.projection_data) {
      toast({
        title: "Simulation failed",
        description: "No data returned from server. Please check your inputs or try again later.",
        variant: "destructive",
      });
      setIsRunning(false);
      return;
    }
    
    setProjectionData(data.projection_data);
    setSimulationResult(data);
    setShowResults(true);
    setIsRunning(false);
  };

  const finalModerate = simulationResult ? simulationResult.projected_value : 0;
  const willReachGoal = simulationResult ? simulationResult.goal_achievement_percentage >= 100 : false;

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">What-If Simulations</h1>
          <p className="text-muted-foreground">Explore different scenarios for your financial goals</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Simulation Parameters</CardTitle>
              <CardDescription>Adjust variables to see projected outcomes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Goal Selection / Custom Entry */}
              <div className="space-y-2">
                <Label>Select Goal or Type Custom Name</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between"
                    >
                      {isCustom 
                        ? (customName || "Select goal...")
                        : (selectedGoalId ? goals.find((g) => g.id === selectedGoalId)?.title : "Select goal...")}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search or type new goal..." onValueChange={setComboboxSearch} />
                      <CommandList>
                        <CommandEmpty>
                            <div 
                                className="py-2 px-4 text-sm cursor-pointer hover:bg-accent flex items-center gap-2"
                                onClick={() => handleCustomSelect(comboboxSearch)}
                            >
                                <TrendingUp className="h-4 w-4" />
                                Simulate "{comboboxSearch}"
                            </div>
                        </CommandEmpty>
                        <CommandGroup heading="Existing Goals">
                          {goals.map((goal) => (
                            <CommandItem
                              key={goal.id}
                              value={goal.title}
                              onSelect={() => handleGoalSelect(goal)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedGoalId === goal.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {goal.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Dynamic Inputs */}
              {(selectedGoalId || isCustom) && (
                <>
                  <div className="space-y-2">
                    <Label>Initial Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={initialAmount}
                        onChange={(e) => setInitialAmount(Number(e.target.value))}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Amount (Optional)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(Number(e.target.value))}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Years to Simulate</Label>
                    <div className="relative">
                       <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                       <Input
                        type="number"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        className="pl-8"
                       />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Monthly Contribution</Label>
                      <span className="text-sm font-medium">{formatCurrency(monthlyContribution)}</span>
                    </div>
                    <Slider
                      value={[monthlyContribution]}
                      min={0}
                      max={50000}
                      step={500}
                      onValueChange={(vals) => setMonthlyContribution(vals[0])}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Expected Return Rate</Label>
                      <span className="text-sm font-medium">{returnRate}%</span>
                    </div>
                    <Slider
                      value={[returnRate]}
                      min={2}
                      max={15}
                      step={0.5}
                      onValueChange={(vals) => setReturnRate(vals[0])}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Inflation Rate</Label>
                      <span className="text-sm font-medium">{inflationRate}%</span>
                    </div>
                    <Slider
                      value={[inflationRate]}
                      min={0}
                      max={10}
                      step={0.5}
                      onValueChange={(vals) => setInflationRate(vals[0])}
                    />
                  </div>

                  <Button className="w-full" onClick={runSimulation} disabled={isRunning}>
                    {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                    Run Simulation
                  </Button>
                </>
              )}
            </CardContent>
          </Card>


          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {(selectedGoalId || isCustom) && showResults ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Projected Growth</CardTitle>
                    <CardDescription>
                      Projected value over time based on {returnRate}% annual return
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectionData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorConservative" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorModerate" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorAggressive" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="year" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            tickFormatter={(value) => 
                              new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: "compact",
                                maximumFractionDigits: 1
                              }).format(value)
                            } 
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))' }}
                            formatter={(value: number) => formatCurrency(value)}
                            labelStyle={{ color: 'hsl(var(--foreground))', marginBottom: '4px', fontWeight: 'bold' }}
                          />
                          <Legend iconType="circle" />
                          <Area 
                            type="monotone" 
                            dataKey="aggressive" 
                            name="Aggressive" 
                            stroke="#22c55e" 
                            fillOpacity={1} 
                            fill="url(#colorAggressive)" 
                            strokeWidth={2}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="moderate" 
                            name="Moderate" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorModerate)" 
                            strokeWidth={2}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="conservative" 
                            name="Conservative" 
                            stroke="#ef4444" 
                            fillOpacity={1} 
                            fill="url(#colorConservative)" 
                            strokeWidth={2}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="target" 
                            name="Target" 
                            stroke="#94a3b8" 
                            fill="none" 
                            strokeDasharray="5 5" 
                            strokeWidth={2} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">Projected Value</p>
                      </div>
                      <p className="text-2xl font-bold">{formatCurrency(finalModerate)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium">Time Horizon</p>
                      </div>
                      <p className="text-2xl font-bold">
                        {projectionData.length > 0 ? projectionData.length - 1 : 0} Years
                      </p>
                    </CardContent>
                  </Card>
                  <Card className={willReachGoal ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className={willReachGoal ? "h-4 w-4 text-green-600" : "h-4 w-4 text-red-600"} />
                        <p className="text-sm font-medium">Goal Status</p>
                      </div>
                      <p className={cn("text-lg font-bold", willReachGoal ? "text-green-700" : "text-red-700")}>
                        {willReachGoal ? "On Track" : "Shortfall"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed rounded-xl p-12 text-center">
                <div className="space-y-3">
                  <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">
                    "Ready to Simulate"
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Select a goal or type a custom scenario name, then run the simulation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export default Simulations;
