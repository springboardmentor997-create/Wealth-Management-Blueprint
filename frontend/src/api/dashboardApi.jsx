import apiClient from './client'

export const getSummary = () => apiClient.get('/dashboard/summary').then(r => r.data)

export const getPerformance = () => apiClient.get('/dashboard/performance').then(r => r.data)

export const getPortfolioReport = () => apiClient.get('/reports/portfolio').then(r => r.data)
