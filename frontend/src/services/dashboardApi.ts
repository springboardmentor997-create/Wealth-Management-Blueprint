import { goalsApi, Goal } from "./api";

export const getDashboardData = async () => {
  const res = await goalsApi.getAll();

  if (!res.data) return null;

  const goals: Goal[] = res.data;

  const totalInvested = goals.reduce(
    (sum, g) => sum + g.current_amount,
    0
  );

  const totalTarget = goals.reduce(
    (sum, g) => sum + g.target_amount,
    0
  );

  const completedGoals = goals.filter(
    (g) => g.current_amount >= g.target_amount
  ).length;

  return {
    goals,
    totalInvested,
    totalTarget,
    activeGoals: goals.length,
    completedGoals,
  };
};
