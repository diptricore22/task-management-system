'use client';

import { useEffect, useCallback, useState } from 'react';
import { api } from '@/lib/api-client';
import { Notification, NotificationResponse } from '../types/notifications.types';

interface UseNotificationsReturn {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  unread_count: number;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => Promise<void>;
}

const INITIAL_LIMIT = 20;

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: INITIAL_LIMIT, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unread_count, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(INITIAL_LIMIT),
      });
      const response = await api.get<NotificationResponse>(`/notifications?${params.toString()}`);
      
      if (append) {
        setNotifications(prev => [...prev, ...response.notifications]);
      } else {
        setNotifications(response.notifications);
      }
      setPagination(response.pagination);
      setUnreadCount(response.unread_count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      fetchNotifications(pagination.page + 1, true);
    }
  }, [pagination.page, pagination.totalPages, fetchNotifications]);

  const refetch = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    pagination,
    loading,
    error,
    unread_count,
    hasMore: pagination.page < pagination.totalPages,
    loadMore,
    refetch,
  };
}
