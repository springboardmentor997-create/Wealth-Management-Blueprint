import client from './client';

// Get all goals
export const getGoals = async () => {
  return await client.get('/goals/all');
};

// Create a new goal
export const createGoal = async (data) => {
  // Expected data: { title, target_amount, current_amount, target_date }
  return client.post('/goals/create', data);
};

// Delete a goal
export const deleteGoal = async (id) => {
  return await client.delete(`/goals/${id}`);
};