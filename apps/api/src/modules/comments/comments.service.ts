/**
 * Comments Module - Service Layer
 * Business logic for task comments and activity logs
 */

import { prisma } from '@/lib/prisma';
import { AppError } from '@/middlewares/error.middleware';
import type {
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentResponse,
  ActivityLogResponse,
  TaskActivityFeedResponse,
} from './comments.types';

const EDIT_WINDOW_MINUTES = 15;

export class CommentsService {
  /**
   * Create a new comment on a task
   * - Validate user is project member
   * - Validate task exists
   * - Create comment with timestamp
   */
  static async create(
    taskId: string,
    userId: string,
    data: CreateCommentRequest
  ): Promise<CommentResponse> {
    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task || task.deleted_at) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    // Check user is project member (except for global admins)
    const user = await prisma.user.findFirst({
      where: { id: userId, deleted_at: null },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isMember =
      user.role === 'ADMIN' ||
      (await prisma.projectMember.findFirst({
        where: {
          project_id: task.project_id,
          user_id: userId,
          deleted_at: null,
        },
      }));

    if (!isMember) {
      throw new AppError(
        'You are not a member of this project',
        403,
        'NOT_PROJECT_MEMBER'
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        task_id: taskId,
        author_id: userId,
        body: data.body.trim(),
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    return this.formatComment(comment);
  }

  /**
   * Get comments and activity logs for a task
   * Returns merged, chronologically sorted feed
   * Scoped to task's project members only
   */
  static async getByTaskId(
    taskId: string,
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<TaskActivityFeedResponse> {
    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task || task.deleted_at) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    // Check user is project member (except for global admins)
    const user = await prisma.user.findFirst({
      where: { id: userId, deleted_at: null },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isMember =
      user.role === 'ADMIN' ||
      (await prisma.projectMember.findFirst({
        where: {
          project_id: task.project_id,
          user_id: userId,
          deleted_at: null,
        },
      }));

    if (!isMember) {
      throw new AppError(
        'You are not a member of this project',
        403,
        'NOT_PROJECT_MEMBER'
      );
    }

    // Fetch comments (excluding deleted)
    const comments = await prisma.comment.findMany({
      where: {
        task_id: taskId,
        deleted_at: null,
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    // Fetch activity logs for this task
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        task_id: taskId,
        deleted_at: null,
      },
      include: {
        actor: {
          select: { id: true, name: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    // Format comments
    const formattedComments = comments.map((c) => this.formatComment(c));

    // Format activity logs
    const formattedActivity = activityLogs.map((a) =>
      this.formatActivityLog(a)
    );

    // Merge and sort chronologically
    const allItems = [...formattedComments, ...formattedActivity];
    allItems.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Apply pagination
    const total = allItems.length;
    const skip = (page - 1) * limit;
    const paginatedItems = allItems.slice(skip, skip + limit);
    const pages = Math.ceil(total / limit);

    return {
      feed: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  /**
   * Update a comment (edit) with 15-minute window enforcement
   * - Only author can edit
   * - Must be within 15 minutes of creation
   * - Sets edited_at timestamp
   */
  static async update(
    commentId: string,
    userId: string,
    data: UpdateCommentRequest
  ): Promise<CommentResponse> {
    // Verify comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    if (!comment || comment.deleted_at) {
      throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
    }

    // Check authorization (author only)
    if (comment.author_id !== userId) {
      throw new AppError(
        'Only comment author can edit',
        403,
        'UNAUTHORIZED'
      );
    }

    // Check 15-minute edit window
    const isEditWindowOpen = this.isEditWindowOpen(comment.created_at);

    if (!isEditWindowOpen) {
      throw new AppError(
        'Comment can no longer be edited (15-minute window closed)',
        400,
        'EDIT_WINDOW_CLOSED'
      );
    }

    // Update comment
    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: {
        body: data.body.trim(),
        edited_at: new Date(),
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    return this.formatComment(updated);
  }

  /**
   * Delete a comment (soft-delete)
   * - Author can delete their own comment anytime
   * - Admin can delete any comment
   */
  static async delete(commentId: string, userId: string): Promise<void> {
    // Verify comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.deleted_at) {
      throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
    }

    // Check user is author or admin
    const user = await prisma.user.findFirst({
      where: { id: userId, deleted_at: null },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isAuthorOrAdmin = comment.author_id === userId || user.role === 'ADMIN';

    if (!isAuthorOrAdmin) {
      throw new AppError(
        'Only comment author or admin can delete',
        403,
        'UNAUTHORIZED'
      );
    }

    // Soft-delete comment
    await prisma.comment.update({
      where: { id: commentId },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  /**
   * Check if a comment is still within 15-minute edit window
   */
  private static isEditWindowOpen(createdAt: Date): boolean {
    const now = new Date();
    const elapsedMs = now.getTime() - createdAt.getTime();
    const elapsedMinutes = elapsedMs / (1000 * 60);
    return elapsedMinutes < EDIT_WINDOW_MINUTES;
  }

  /**
   * Format a comment for API response
   */
  private static formatComment(comment: any): CommentResponse {
    const isEdited = comment.edited_at !== null;
    const now = new Date();
    const elapsedMs = now.getTime() - comment.created_at.getTime();
    const relativeTime = this.formatRelativeTime(elapsedMs);

    return {
      id: comment.id,
      type: 'comment',
      task_id: comment.task_id,
      author: comment.author,
      body: comment.body,
      created_at: comment.created_at.toISOString(),
      edited_at: isEdited ? comment.edited_at.toISOString() : null,
      timestamp_relative: relativeTime,
      is_edited: isEdited,
    };
  }

  /**
   * Format an activity log entry for API response
   */
  private static formatActivityLog(log: any): ActivityLogResponse {
    const now = new Date();
    const elapsedMs = now.getTime() - log.created_at.getTime();
    const relativeTime = this.formatRelativeTime(elapsedMs);

    // Human-readable action description
    const actionDescription = this.getActionDescription(log.action, log.payload);

    return {
      id: log.id,
      type: 'activity',
      task_id: log.task_id,
      actor: log.actor,
      action: log.action,
      action_description: actionDescription,
      created_at: log.created_at.toISOString(),
      timestamp_relative: relativeTime,
    };
  }

  /**
   * Format elapsed time as relative string (e.g., "2h ago")
   */
  private static formatRelativeTime(elapsedMs: number): string {
    const seconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;

    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  }

  /**
   * Get human-readable description of an action
   */
  private static getActionDescription(
    action: string,
    payload: any
  ): string {
    if (!payload) {
      return action.replace(/_/g, ' ');
    }

    const { actor_name, field, from_value, to_value } = payload;

    switch (action) {
      case 'status_changed':
        return `${actor_name} changed status from ${from_value} to ${to_value}`;
      case 'priority_changed':
        return `${actor_name} changed priority from ${from_value} to ${to_value}`;
      case 'assignee_changed':
        return `${actor_name} changed assignee to ${to_value}`;
      case 'due_date_changed':
        return `${actor_name} changed due date to ${to_value}`;
      case 'task_created':
        return `${actor_name} created this task`;
      default:
        return action.replace(/_/g, ' ');
    }
  }
}
