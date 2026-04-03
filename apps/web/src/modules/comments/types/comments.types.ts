'use client';

/**
 * Comments & Activity Feed Module - Type Definitions
 * Mirrors backend comment and activity log structures
 */

export interface CommentAuthor {
  id: string;
  name: string;
}

export interface CommentItem {
  id: string;
  type: 'comment';
  task_id: string;
  author: CommentAuthor;
  body: string;
  created_at: string;
  edited_at: string | null;
  timestamp_relative: string;
  is_edited: boolean;
}

export interface ActivityActor {
  id: string;
  name: string;
}

export interface ActivityLogItem {
  id: string;
  type: 'activity';
  task_id: string;
  actor: ActivityActor;
  action: string;
  action_description: string;
  created_at: string;
  timestamp_relative: string;
}

export type MergedFeedItem = CommentItem | ActivityLogItem;

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TaskActivityFeedResponse {
  feed: MergedFeedItem[];
  pagination: PaginationInfo;
}

export interface CreateCommentRequest {
  body: string; // Required, 1-5000 chars
}

export interface UpdateCommentRequest {
  body: string; // Required, 1-5000 chars
}
