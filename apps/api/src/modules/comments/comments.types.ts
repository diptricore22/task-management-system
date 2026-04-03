/**
 * Comments Module - Type Definitions
 */

export interface CreateCommentRequest {
  body: string; // Required, max 5000 chars
}

export interface UpdateCommentRequest {
  body: string; // Required, max 5000 chars
}

export interface CommentAuthor {
  id: string;
  name: string;
}

export interface CommentResponse {
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

export interface ActivityLogResponse {
  id: string;
  type: 'activity';
  task_id: string;
  actor: ActivityActor;
  action: string;
  action_description: string;
  created_at: string;
  timestamp_relative: string;
}

export type FeedItem = CommentResponse | ActivityLogResponse;

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TaskActivityFeedResponse {
  feed: FeedItem[];
  pagination: PaginationInfo;
}
