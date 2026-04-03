'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { api } from '@/lib/api-client';
import { NotificationResponse } from '../types/notifications.types';

interface UseNotificationPollingReturn {
  unread_count: number;
}

const POLL_INTERVAL = 30000; // 30 seconds

export function useNotificationPolling(): UseNotificationPollingReturn {
  const [unread_count, setUnreadCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const polls = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '1',
      });
      const response = await api.get<NotificationResponse>(`/notifications?${params.toString()}`);
      setUnreadCount(response.unread_count);
    } catch (err) {
      // Silently fail, polling will retry
      console.debug('Notification polling error:', err);
    }
  }, []);

  // Handle page visibility changes (pause polling when page is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        // Resume polling when page becomes visible
        polls(); // Fresh poll on resume
        intervalRef.current = setInterval(polls, POLL_INTERVAL);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [polls]);

  // Initial poll and set up interval
  useEffect(() => {
    polls(); // Initial fetch
    if (!document.hidden) {
      intervalRef.current = setInterval(polls, POLL_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [polls]);

  return { unread_count };
}
