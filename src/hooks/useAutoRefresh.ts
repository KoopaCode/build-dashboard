import { useState, useEffect } from 'react';
import { Plugin } from '@/types/github';

export function useAutoRefresh(
  initialData: Plugin[],
  fetchFunction: () => Promise<Plugin[]>,
  interval: number = 30000 // 30 seconds default
) {
  const [data, setData] = useState<Plugin[]>(initialData);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const refreshData = async () => {
      try {
        const newData = await fetchFunction();
        setData(newData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    };

    const intervalId = setInterval(refreshData, interval);

    return () => clearInterval(intervalId);
  }, [fetchFunction, interval]);

  return { data, lastUpdated };
} 