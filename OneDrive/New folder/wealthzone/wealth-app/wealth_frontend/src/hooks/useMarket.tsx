
import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { useToast } from './use-toast';

export interface MarketIndex {
  name: string;
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
}

export interface MarketNews {
  id: number;
  title: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export function useMarket() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [news, setNews] = useState<MarketNews[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const [indicesRes, newsRes] = await Promise.all([
        apiClient.getMarketIndices(),
        apiClient.getMarketNews()
      ]);

      if (indicesRes.error) throw indicesRes.error;
      if (newsRes.error) throw newsRes.error;

      setIndices(indicesRes.data || []);
      setNews(newsRes.data || []);
    } catch (error: any) {
      console.error('Error fetching market data:', error);
      // Don't show toast on every error to avoid spamming, maybe just log it
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      // Only poll if the document is visible
      if (!document.hidden) {
         fetchMarketData();
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { indices, news, loading, refresh: fetchMarketData };
}
