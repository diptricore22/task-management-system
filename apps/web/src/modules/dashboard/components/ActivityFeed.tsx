'use client';

import React from 'react';
import { ActivityFeedItem } from './ActivityFeedItem';
import type { ActivityFeedItem as ActivityItem } from '../types/dashboard.types';

export interface ActivityFeedProps {
  activities: ActivityItem[];
  hasMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
}

/**
 * ActivityFeed Component
 * Container for activity feed items with load more functionality
 */
export function ActivityFeed({ activities, hasMore, onLoadMore, loading }: ActivityFeedProps) {
  if (loading && activities.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {activities.map((activity) => (
          <ActivityFeedItem key={activity.id} activity={activity} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
