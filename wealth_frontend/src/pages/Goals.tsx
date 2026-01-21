import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoals, CreateGoalInput } from '@/hooks/useGoals';
import { Plus, Target, Home, GraduationCap, Sparkles, Calendar, DollarSign, Edit, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const goalIcons = {
  retirement: Target,
  home: Home,
  education: GraduationCap,
  custom: Sparkles,
};

const goalColors = {
  retirement: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  home: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  education: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  custom: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
};

const Goals = () => {
  const { goals, loading, createGoal, updateGoal, deleteGoal } = useGoals();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const filteredGoals = goals.filter(goal => 
    goal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    goal.goal_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateGoalInput & { current_amount?: number }>({
    title: '',
    goal_type: 'custom',
    target_amount: 0,
    current_amount: 0,
    monthly_contribution: 0,
    target_date: '',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateTimeLeft = (targetDate: string) => {
    const target = new Date(targetDate);
    const now = new Date();
    const years = target.getFullYear() - now.getFullYear();
    const months = target.getMonth() - now.getMonth();
    const totalMonths = years * 12 + months;
    
    if (totalMonths <= 0) return 'Past due';
    if (totalMonths < 12) return `${totalMonths} months`;
    return `${Math.floor(totalMonths / 12)} years, ${totalMonths % 12} months`;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.target_amount || !formData.target_date) return;
    
    setIsSubmitting(true);
    let error;

    if (editingGoalId) {
      const result = await updateGoal(editingGoalId, formData);
      error = result.error;
    } else {
      const result = await createGoal(formData);
      error = result.error;
    }

    setIsSubmitting(false);
    
    if (!error) {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setEditingGoalId(null);
    setFormData({
      title: '',
      goal_type: 'custom',
      target_amount: 0,
      current_amount: 0,
      monthly_contribution: 0,
      target_date: '',
    });
  };

  const handleEdit = (goal: any) => {
    setEditingGoalId(goal.id);
    setFormData({
      title: goal.title,
      goal_type: goal.goal_type,
      target_amount: Number(goal.target_amount),
      current_amount: Number(goal.current_amount),
      monthly_contribution: Number(goal.monthly_contribution),
      target_date: goal.target_date.split('T')[0], // Ensure date format YYYY-MM-DD
    });
    setIsDialogOpen(true);
  };

  const handleOpenDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteGoal(id);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financial Goals</h1>
            <p className="text-muted-foreground">Plan and track your wealth milestones</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleOpenDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => resetForm()}>
                <Plus className="h-4 w-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGoalId ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Goal Type</Label>
                  <Select 
                    value={formData.goal_type} 
                    onValueChange={(value: CreateGoalInput['goal_type']) => 
                      setFormData(prev => {
                        const newTitle = value === 'custom' ? '' : (value.charAt(0).toUpperCase() + value.slice(1) + ' Goal');
                        return { ...prev, goal_type: value, title: prev.title || newTitle };
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retirement">Retirement</SelectItem>
                      <SelectItem value="home">Home Purchase</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Goal Title</Label>
                  <Input 
                    placeholder="e.g., Early Retirement Fund" 
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Amount</Label>
                    <Input 
                      type="number" 
                      placeholder="500000" 
                      value={formData.target_amount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_amount: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target Date</Label>
                    <Input 
                      type="date" 
                      value={formData.target_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Contribution</Label>
                  <Input 
                    type="number" 
                    placeholder="2500" 
                    value={formData.monthly_contribution || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthly_contribution: Number(e.target.value) }))}
                  />
                </div>
                {editingGoalId && (
                  <div className="space-y-2">
                    <Label>Current Saved Amount</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={formData.current_amount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, current_amount: Number(e.target.value) }))}
                    />
                  </div>
                )}
                <Button 
                  className="w-full" 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.title || !formData.target_amount || !formData.target_date}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingGoalId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingGoalId ? 'Update Goal' : 'Create Goal'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No goals yet</h3>
            <p className="text-muted-foreground">Create your first financial goal to get started.</p>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-muted">
              <Target className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No matching goals</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </div>
        ) : (
          /* Goals Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGoals.map((goal) => {
              const Icon = goalIcons[goal.goal_type];
              const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
              const remaining = Number(goal.target_amount) - Number(goal.current_amount);

              return (
                <div 
                  key={goal.id} 
                  className="rounded-xl bg-card border border-border p-6 animate-fade-in hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl border",
                      goalColors[goal.goal_type]
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(goal)}>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button  
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  {/* Title & Status */}
                  <h3 className="text-lg font-semibold mb-1">{goal.title}</h3>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                    goal.status === 'active' ? 'bg-success/10 text-success' : 
                    goal.status === 'completed' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                  )}>
                    {goal.status}
                  </span>

                  {/* Progress */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold">{formatCurrency(Number(goal.current_amount))}</span>
                      <span className="text-sm text-muted-foreground">of {formatCurrency(Number(goal.target_amount))}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(remaining)} remaining
                    </p>
                  </div>

                  {/* Details */}
                  <div className="mt-6 pt-4 border-t border-border space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Time Left</span>
                      </div>
                      <span className="font-medium">{calculateTimeLeft(goal.target_date)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Monthly</span>
                      </div>
                      <span className="font-medium">{formatCurrency(Number(goal.monthly_contribution))}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Goals;
