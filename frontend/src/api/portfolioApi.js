import client from './client';

// 1. Get Portfolio Summary (FIXED URL)
export const getPortfolioSummary = async () => {
  // 👇 Changed from '/portfolio/summary' to '/portfolio/list' to match Python
  return await client.get('/portfolio/list');
};

// 2. Add New Investment
export const addInvestment = async (data) => {
  return await client.post('/portfolio/add', data);
};

// 3. Delete Investment
export const deleteInvestment = async (id) => {
  return await client.delete(`/portfolio/${id}`);
};

// 4. Sync Live Prices
export const syncPrices = async () => {
  return await client.post('/portfolio/sync-prices');
};

// 5. Search Assets
export const searchAssets = async (query) => {
  return await client.get(`/portfolio/search-assets?q=${query}`);
};