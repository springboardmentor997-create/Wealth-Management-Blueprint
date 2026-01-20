import apiClient from './client'

export const addToWatchlist = (payload) => 
  apiClient.post('/watchlist/add', payload)

export const getWatchlist = () => 
  apiClient.get('/watchlist/all')

export const getWatchlistItem = (id) => 
  apiClient.get(`/watchlist/${id}`)

export const updateWatchlistItem = (id, payload) => 
  apiClient.patch(`/watchlist/${id}`, payload)

export const removeFromWatchlist = (id) => 
  apiClient.delete(`/watchlist/${id}`)

export const getWatchlistStats = () => 
  apiClient.get('/watchlist/summary/stats')
