import { useState, useEffect } from 'react';
import { Plugin } from '@/types/github';

interface RefreshState {
  data: Plugin[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export function useAutoRefresh(
  initialData: Plugin[],
  interval: number = 10000 // Reduced to 10 seconds for more frequent updates
) {
  const [state, setState] = useState<RefreshState>({
    data: initialData,
    isLoading: false,
    error: null,
    lastUpdated: new Date().toISOString(),
  });

  const fetchUpdates = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch('/api/updates', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch updates');
      
      const { plugins, timestamp } = await response.json();
      
      setState({
        data: plugins,
        isLoading: false,
        error: null,
        lastUpdated: timestamp,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchUpdates();

    // Set up interval for subsequent fetches
    const intervalId = setInterval(fetchUpdates, interval);

    // Add event listeners for visibility and focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUpdates();
      }
    };

    const handleFocus = () => {
      fetchUpdates();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [interval]);

  return {
    ...state,
    refresh: fetchUpdates // Expose refresh function
  };
} 