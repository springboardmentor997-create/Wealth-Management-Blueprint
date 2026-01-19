import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  goal_type: 'retirement' | 'home' | 'education' | 'custom';
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  target_date: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface CreateGoalInput {
  title: string;
  goal_type: 'retirement' | 'home' | 'education' | 'custom';
  target_amount: number;
  current_amount?: number;
  monthly_contribution: number;
  target_date: string;
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGoals = async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await apiClient.getGoals();

      if (error) throw error;
      
      setGoals(Array.isArray(data) ? data as Goal[] : []);
    } catch (error: any) {
      if (error.message !== 'Invalid authentication credentials') {
        toast({
          title: 'Error fetching goals',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (input: CreateGoalInput) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await apiClient.createGoal({
        title: input.title,
        goal_type: input.goal_type,
        target_amount: input.target_amount,
        current_amount: input.current_amount || 0,
        monthly_contribution: input.monthly_contribution,
        target_date: input.target_date,
      });

      if (error) throw error;

      setGoals((prev) => [data as Goal, ...prev]);
      toast({
        title: 'Goal created',
        description: 'Your financial goal has been added.',
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error creating goal',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const updateGoal = async (id: string, updates: Partial<CreateGoalInput & { status: string }>) => {
    try {
      const { data, error } = await apiClient.updateGoal(id, updates);

      if (error) throw error;

      setGoals((prev) => prev.map((g) => (g.id === id ? (data as Goal) : g)));
      toast({
        title: 'Goal updated',
        description: 'Your goal has been updated.',
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error updating goal',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await apiClient.deleteGoal(id);

      if (error) {
        // If the goal is not found (404), it's already deleted from the backend.
        // We should update the UI to reflect this.
        if (error.message.includes('not found') || error.message.includes('404')) {
          setGoals((prev) => prev.filter((g) => g.id !== id));
          toast({
             title: 'Goal moved',
             description: 'This goal has already been removed.',
          });
          return { error: null };
        }
        throw error;
      }

      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast({
        title: 'Goal deleted',
        description: 'Your goal has been removed.',
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Error deleting goal',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  return {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals,
  };
}
