/**
 * Dashboard Module - Service Layer
 * Aggregation queries for dashboard endpoints - no N+1 queries
 */

import { prisma } from '@/lib/prisma';
import { AppError } from '@/middlewares/error.middleware';
import type {
  DashboardSummaryResponse,
  DashboardProjectsResponse,
  DashboardActivityResponse,
  DashboardAdminOverviewResponse,
  ProjectCard,
  HealthIndicator,
  ActivityFeedItem,
} from './dashboard.types';

export class DashboardService {
  /**
   * Get personal task summary for current user
   * Story 1: Personal Task Overview
   * - Overdue: tasks with due_date < today, status != DONE
   * - Due Today: tasks with due_date = today, status != DONE
   * - In Progress: tasks with status = IN_PROGRESS
   */
  static async getSummary(userId: string): Promise<DashboardSummaryResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [overdueTasks, dueTodayTasks, inProgressTasks] = await Promise.all([
      // Overdue: due_date < today AND status != DONE
      prisma.task.count({
        where: {
          assignee_id: userId,
          deleted_at: null,
          status: { not: 'DONE' },
          due_date: { lt: today },
        },
      }),

      // Due Today: due_date >= today AND due_date < tomorrow AND status != DONE
      prisma.task.count({
        where: {
          assignee_id: userId,
          deleted_at: null,
          status: { not: 'DONE' },
          due_date: { gte: today, lt: tomorrow },
        },
      }),

      // In Progress: status = IN_PROGRESS
      prisma.task.count({
        where: {
          assignee_id: userId,
          deleted_at: null,
          status: 'IN_PROGRESS',
        },
      }),
    ]);

    return {
      overdue_count: overdueTasks,
      due_today_count: dueTodayTasks,
      in_progress_count: inProgressTasks,
      overdue_empty: overdueTasks === 0,
    };
  }

  /**
   * Get project cards for projects user is member of
   * Story 2: Project Status Cards
   * - Include task counts by status
   * - Calculate % complete: (DONE count) / (total count) * 100
   * - Include last updated timestamp
   */
  static async getProjects(userId: string): Promise<DashboardProjectsResponse> {
    // Get all projects user is member of
    const projects = await prisma.project.findMany({
      where: {
        deleted_at: null,
        members: {
          some: {
            user_id: userId,
            deleted_at: null,
          },
        },
      },
      select: {
        id: true,
        name: true,
        color: true,
        updated_at: true,
        tasks: {
          where: { deleted_at: null },
          select: { id: true, status: true },
        },
      },
    });

    const projectCards: ProjectCard[] = projects.map((project) => {
      const tasks = project.tasks;
      const totalTasks = tasks.length;
      const doneCount = tasks.filter((t) => t.status === 'DONE').length;
      const percentComplete = totalTasks === 0 ? 100 : Math.round((doneCount / totalTasks) * 100);

      // Count tasks by status
      const tasksByStatus = {
        todo: tasks.filter((t) => t.status === 'TODO').length,
        in_progress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        in_review: tasks.filter((t) => t.status === 'IN_REVIEW').length,
        blocked: tasks.filter((t) => t.status === 'BLOCKED').length,
        done: doneCount,
      };

      return {
        id: project.id,
        name: project.name,
        color: project.color,
        task_counts: tasksByStatus,
        total_tasks: totalTasks,
        percent_complete: percentComplete,
        is_completed: percentComplete === 100,
        updated_at: project.updated_at.toISOString(),
      };
    });

    return { projects: projectCards };
  }

  /**
   * Get activity feed for projects user is member of
   * Story 3: Activity Feed
   * - Show last N events across user's projects
   * - Include actor name, action, task/project details
   * - Pagination support
   */
  static async getActivity(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<DashboardActivityResponse> {
    // Get project IDs user is member of
    const userProjects = await prisma.projectMember.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      select: { project_id: true },
    });

    const projectIds = userProjects.map((pm) => pm.project_id);

    if (projectIds.length === 0) {
      // User is not member of any project
      return {
        activities: [],
        pagination: { page, limit, total: 0, pages: 0 },
      };
    }

    const pageNum = Math.max(1, page);
    const limitNum = Math.min(Math.max(1, limit), 100);
    const skip = (pageNum - 1) * limitNum;

    // Get activity logs for user's projects
    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: {
          project_id: { in: projectIds },
          deleted_at: null,
        },
        include: {
          actor: {
            select: { id: true, name: true, email: true },
          },
          task: {
            select: { id: true, title: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
        skip,
        take: limitNum,
        orderBy: { created_at: 'desc' },
      }),
      prisma.activityLog.count({
        where: {
          project_id: { in: projectIds },
          deleted_at: null,
        },
      }),
    ]);

    const formattedActivities: ActivityFeedItem[] = activities.map((activity) => ({
      id: activity.id,
      actor: {
        id: activity.actor.id,
        name: activity.actor.name,
      },
      action: activity.action,
      task: activity.task ? { id: activity.task.id, title: activity.task.title } : null,
      project: activity.project ? { id: activity.project.id, name: activity.project.name } : null,
      created_at: activity.created_at.toISOString(),
      timestamp_relative: this.getRelativeTime(activity.created_at),
    }));

    return {
      activities: formattedActivities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get admin overview of all projects and their health
   * Story 4: Admin Project Health Overview
   * - Show all projects (not scoped)
   * - Health indicators: red (blocked > 2 or overdue > 5), yellow (overdue 1-5), green
   * - Include task counts by status and overdue count
   */
  static async getAdminOverview(): Promise<DashboardAdminOverviewResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all projects with task aggregation
    const projects = await prisma.project.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        name: true,
        color: true,
        created_at: true,
        tasks: {
          where: { deleted_at: null },
          select: {
            id: true,
            status: true,
            due_date: true,
          },
        },
        members: {
          where: { deleted_at: null },
          select: { id: true },
        },
      },
    });

    const overview = projects.map((project) => {
      const tasks = project.tasks;

      // Count by status
      const todoCount = tasks.filter((t) => t.status === 'TODO').length;
      const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
      const inReviewCount = tasks.filter((t) => t.status === 'IN_REVIEW').length;
      const blockedCount = tasks.filter((t) => t.status === 'BLOCKED').length;
      const doneCount = tasks.filter((t) => t.status === 'DONE').length;

      // Count overdue: due_date < today AND status != DONE
      const overdueCount = tasks.filter(
        (t) => t.due_date && t.due_date < today && t.status !== 'DONE'
      ).length;

      // Health indicator
      const health: HealthIndicator = this.getHealthIndicator(blockedCount, overdueCount);

      return {
        id: project.id,
        name: project.name,
        color: project.color,
        total_tasks: tasks.length,
        task_counts: {
          todo: todoCount,
          in_progress: inProgressCount,
          in_review: inReviewCount,
          blocked: blockedCount,
          done: doneCount,
        },
        overdue_count: overdueCount,
        member_count: project.members.length,
        health_indicator: health,
        created_at: project.created_at.toISOString(),
      };
    });

    return { projects: overview };
  }

  /**
   * Calculate health indicator based on blocked and overdue counts
   * Red: blocked > 2 or overdue > 5
   * Yellow: overdue 1-5
   * Green: otherwise
   */
  private static getHealthIndicator(blockedCount: number, overdueCount: number): HealthIndicator {
    if (blockedCount > 2 || overdueCount > 5) {
      return 'red';
    }
    if (overdueCount > 0) {
      return 'yellow';
    }
    return 'green';
  }

  /**
   * Get human-readable relative time (e.g., "2 hours ago")
   * For now, return ISO string - frontend can use date-fns formatDistanceToNow
   */
  private static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toISOString().split('T')[0]; // Return date only for older events
  }
}
