'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { ActivityFeedItem as ActivityItem } from '../types/dashboard.types';

export interface ActivityFeedItemProps {
  activity: ActivityItem;
}

/**
 * ActivityFeedItem Component
 * Single activity item showing actor, action, and timestamp
 * With clickable links to tasks and projects
 */
export function ActivityFeedItem({ activity }: ActivityFeedItemProps) {
  const { actor, action, task, project, created_at } = activity;

  return (
    <div className="flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {actor.avatar ? (
          <img
            src={actor.avatar}
            alt={actor.name}
            className="w-10 h-10 rounded-full"
          />
        ) : (
         <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm">
            {actor.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium text-slate-900 dark:text-white">{actor.name}</span>
          {' '}{action}{' '}
          {task && (
            <Link
              href={`/projects/${project?.id || '#'}`}
              className="font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
              {task.title}
            </Link>
          )}
          {project && !task && (
            <Link
              href={`/projects/${project.id}`}
              className="font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
              {project.name}
            </Link>
          )}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
