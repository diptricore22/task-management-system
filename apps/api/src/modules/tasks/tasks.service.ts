/**
 * Task Module - Service Layer
 * Business logic for task management
 */

import { prisma } from '@/lib/prisma';
import { AppError } from '@/middlewares/error.middleware';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { NotificationPreferencesService } from '@/modules/notifications/notification-preferences.service';
import { EmailService } from '@/modules/notifications/email.service';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  ListTasksQuery,
  TaskResponse,
  TaskDetailResponse,
  TaskStatus,
  TaskPriority,
} from './tasks.types';

export class TasksService {
  /**
   * Create a new task
   * - Validate assignee is project member (if provided)
   * - Validate project exists and user is member
   * - Auto-logs activity
   */
  static async create(
    data: CreateTaskRequest,
    projectId: string,
    userId: string
  ): Promise<TaskDetailResponse> {
    // Verify project exists
    const project = await prisma.project.findFirst({
      where: { id: projectId, deleted_at: null },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Check user is project member (except for global admins)
    const userInDb = await prisma.user.findFirst({
      where: { id: userId, deleted_at: null },
    });
    if (!userInDb) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isMember = userInDb.role === 'ADMIN' || (await prisma.projectMember.findFirst({
      where: {
        project_id: projectId,
        user_id: userId,
        deleted_at: null,
      },
    }));

    if (!isMember) {
      throw new AppError(
        'Insufficient permissions',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    // Validate assignee if provided
    if (data.assignee_id) {
      const assignee = await prisma.user.findFirst({
        where: { id: data.assignee_id, deleted_at: null },
      });

      if (!assignee) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const assigneeIsMember = await prisma.projectMember.findFirst({
        where: {
          project_id: projectId,
          user_id: data.assignee_id,
          deleted_at: null,
        },
      });

      if (!assigneeIsMember) {
        throw new AppError(
          'Assignee is not a project member',
          400,
          'INVALID_ASSIGNEE'
        );
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        project_id: projectId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        status: 'TODO' as TaskStatus,
        priority: data.priority || ('MEDIUM' as TaskPriority),
        due_date: data.due_date ? new Date(data.due_date) : null,
        assignee_id: data.assignee_id || null,
        created_by: userId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    const creator = await prisma.user.findFirst({
      where: { id: userId, deleted_at: null },
      select: { name: true },
    });

    await prisma.activityLog.create({
      data: {
        project_id: projectId,
        task_id: task.id,
        actor_id: userId,
        action: 'task_created',
        payload: {
          actor_name: creator?.name || 'Unknown',
          title: task.title,
          priority: task.priority
        },
      },
    });

    // Create notification if task is assigned (Story 4 AC1 - notification on assignment)
    if (task.assignee_id) {
      const assignee = await prisma.user.findFirst({
        where: { id: task.assignee_id, deleted_at: null },
      });

      if (assignee) {
        await NotificationsService.create(
          task.assignee_id,
          'task_assigned',
          {
            title: `Task assigned: ${task.title}`,
            message: `You have been assigned to "${task.title}"`,
            task_id: task.id,
            project_id: projectId,
          },
          task.id
        );

        // Send email if enabled
        const emailEnabled = await NotificationPreferencesService.isEmailNotificationEnabled(
          task.assignee_id,
          'assigned'
        );

        if (emailEnabled && assignee.email) {
          await EmailService.sendTaskAssignedEmail(
            assignee.email,
            assignee.name,
            task.title,
            project.name,
            userInDb.name,
            task.id
          );
        }
      }
    }

    return this.formatTaskDetailResponse(task);
  }

  /**
   * List tasks with filtering, sorting, and pagination
   * - Validate user is project member
   * - Apply filters (status, priority, labels, assignee, due date range)
   * - Supports AND/OR logic: OR within field, AND across fields
   * - Return paginated results
   */
  static async list(
    projectId: string,
    userId: string,
    isAdmin: boolean,
    filters: any,
    sort: string,
    page: number,
    limit: number
  ): Promise<{
    tasks: TaskResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    // Verify project exists
    const project = await prisma.project.findFirst({
      where: { id: projectId, deleted_at: null },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Check membership for non-admins
    if (!isAdmin) {
      const isMember = await prisma.projectMember.findFirst({
        where: {
          project_id: projectId,
          user_id: userId,
          deleted_at: null,
        },
      });

      if (!isMember) {
        throw new AppError(
          'Insufficient permissions',
          403,
          'INSUFFICIENT_PERMISSIONS'
        );
      }
    }

    // Build where clause with advanced filters
    const where: any = { project_id: projectId, deleted_at: null };

    // Status filter: OR logic if multiple statuses provided
    if (filters.statuses && filters.statuses.length > 0) {
      where.status = { in: filters.statuses };
    }

    // Priority filter: OR logic if multiple priorities provided
    if (filters.priorities && filters.priorities.length > 0) {
      where.priority = { in: filters.priorities };
    }

    // Assignee filter: exact match
    if (filters.assigneeId) {
      where.assignee_id = filters.assigneeId;
    }

    // Due date range filter
    if (filters.dueDateFrom || filters.dueDateTo) {
      where.due_date = {};
      if (filters.dueDateFrom) {
        where.due_date.gte = new Date(filters.dueDateFrom);
      }
      if (filters.dueDateTo) {
        const endOfDay = new Date(filters.dueDateTo);
        endOfDay.setHours(23, 59, 59, 999);
        where.due_date.lte = endOfDay;
      }
    }

    // Label filter: if labels provided, use many-to-many join
    let labelFilter: any = undefined;
    if (filters.labelIds && filters.labelIds.length > 0) {
      labelFilter = {
        some: {
          label_id: { in: filters.labelIds },
        },
      };
    }

    // Build orderBy based on sort parameter
    const orderBy: any = {};
    if (sort === 'due_date_asc') {
      orderBy.due_date = 'asc';
    } else if (sort === 'priority_desc') {
      orderBy.priority = 'desc';
    } else if (sort === 'title_asc') {
      orderBy.title = 'asc';
    } else {
      orderBy.created_at = 'desc'; // default
    }

    // Pagination
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(Math.max(1, limit), 100);
    const skip = (pageNum - 1) * limitNum;

    // Fetch tasks and count with label filtering via many-to-many
    let tasksQuery: any = {
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: limitNum,
      orderBy,
    };

    // Apply label filter if provided
    if (labelFilter) {
      tasksQuery.where.labels = labelFilter;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany(tasksQuery),
      prisma.task.count({ where: tasksQuery.where }),
    ]);

    const taskResponses = tasks.map((t) => this.formatTaskResponse(t));

    return {
      tasks: taskResponses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get task detail by ID
   * - Validate user is project member
   * - Return full task information
   */
  static async getById(
    taskId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<TaskDetailResponse> {
    // Get task with relationships
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        deleted_at: null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            deleted_at: true,
          },
        },
      },
    });

    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    // Verify project exists
    if (!task.project || task.project.deleted_at !== null) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Check membership for non-admins
    if (!isAdmin) {
      const isMember = await prisma.projectMember.findFirst({
        where: {
          project_id: task.project_id,
          user_id: userId,
          deleted_at: null,
        },
      });

      if (!isMember) {
        throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
      }
    }

    return this.formatTaskDetailResponse(task);
  }

  /**
   * Update a task
   * - Only creator or global admin can update
   * - Validate assignee if provided
   * - Auto-logs activity
   */
  static async update(
    taskId: string,
    data: UpdateTaskRequest,
    userId: string,
    isAdmin: boolean
  ): Promise<TaskDetailResponse> {
    // Get task
    const task = await prisma.task.findFirst({
      where: { id: taskId, deleted_at: null },
    });

    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    // Check permissions: only creator or admin can update
    if (!isAdmin && task.created_by !== userId) {
      throw new AppError(
        'Only task creator or admin can update',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    // Validate assignee if provided
    if (data.assignee_id !== undefined && data.assignee_id !== null) {
      const assignee = await prisma.user.findFirst({
        where: { id: data.assignee_id, deleted_at: null },
      });

      if (!assignee) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const assigneeIsMember = await prisma.projectMember.findFirst({
        where: {
          project_id: task.project_id,
          user_id: data.assignee_id,
          deleted_at: null,
        },
      });

      if (!assigneeIsMember) {
        throw new AppError(
          'Assignee is not a project member',
          400,
          'INVALID_ASSIGNEE'
        );
      }
    }

    // Build update data
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined)
      updateData.description = data.description?.trim() || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.due_date !== undefined)
      updateData.due_date = data.due_date ? new Date(data.due_date) : null;
    if (data.assignee_id !== undefined) updateData.assignee_id = data.assignee_id;

    // Update task
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get actor name for activity log
    const actor = await prisma.user.findFirst({
      where: { id: userId, deleted_at: null },
      select: { name: true },
    });

    // Log specific field changes as separate activity entries
    if (data.status !== undefined && data.status !== task.status) {
      await prisma.activityLog.create({
        data: {
          project_id: task.project_id,
          task_id: taskId,
          actor_id: userId,
          action: 'status_changed',
          payload: {
            actor_name: actor?.name || 'Unknown',
            field: 'status',
            from_value: task.status,
            to_value: data.status,
          },
        },
      });
    }

    if (data.priority !== undefined && data.priority !== task.priority) {
      await prisma.activityLog.create({
        data: {
          project_id: task.project_id,
          task_id: taskId,
          actor_id: userId,
          action: 'priority_changed',
          payload: {
            actor_name: actor?.name || 'Unknown',
            field: 'priority',
            from_value: task.priority,
            to_value: data.priority,
          },
        },
      });
    }

    if (data.assignee_id !== undefined && data.assignee_id !== task.assignee_id) {
      const newAssigneeName = data.assignee_id ? (await prisma.user.findFirst({
        where: { id: data.assignee_id, deleted_at: null },
        select: { name: true },
      }))?.name || 'Unknown' : 'Unassigned';

      await prisma.activityLog.create({
        data: {
          project_id: task.project_id,
          task_id: taskId,
          actor_id: userId,
          action: 'assignee_changed',
          payload: {
            actor_name: actor?.name || 'Unknown',
            field: 'assignee',
            from_value: task.assignee_id,
            to_value: data.assignee_id,
            to_value_name: newAssigneeName,
          },
        },
      });
    }

    if (data.due_date !== undefined && data.due_date !== task.due_date?.toISOString().split('T')[0]) {
      const dueDateStr = data.due_date ? new Date(data.due_date).toISOString().split('T')[0] : 'No due date';
      await prisma.activityLog.create({
        data: {
          project_id: task.project_id,
          task_id: taskId,
          actor_id: userId,
          action: 'due_date_changed',
          payload: {
            actor_name: actor?.name || 'Unknown',
            field: 'due_date',
            from_value: task.due_date ? task.due_date.toISOString().split('T')[0] : 'No due date',
            to_value: dueDateStr,
          },
        },
      });
    }

    // Create notification if assignee changed and new assignee exists (Story 4 AC1)
    if (data.assignee_id !== undefined && data.assignee_id !== null && data.assignee_id !== task.assignee_id) {
      const newAssignee = await prisma.user.findFirst({
        where: { id: data.assignee_id, deleted_at: null },
      });

      const project = await prisma.project.findFirst({
        where: { id: task.project_id, deleted_at: null },
      });

      if (newAssignee && project) {
        await NotificationsService.create(
          data.assignee_id,
          'task_assigned',
          {
            title: `Task assigned: ${updated.title}`,
            message: `You have been assigned to "${updated.title}" in ${project.name}`,
            task_id: taskId,
            project_id: task.project_id,
          },
          taskId
        );

        // Send email if enabled
        const emailEnabled = await NotificationPreferencesService.isEmailNotificationEnabled(
          data.assignee_id,
          'assigned'
        );

        if (emailEnabled && newAssignee.email) {
          await EmailService.sendTaskAssignedEmail(
            newAssignee.email,
            newAssignee.name,
            updated.title,
            project.name,
            actor?.name || 'A team member',
            taskId
          );
        }
      }
    }

    return this.formatTaskDetailResponse(updated);
  }

  /**
   * Soft-delete a task
   * - Only creator or global admin can delete
   * - Sets deleted_at timestamp
   * - Auto-logs activity
   */
  static async delete(
    taskId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<void> {
    // Get task
    const task = await prisma.task.findFirst({
      where: { id: taskId, deleted_at: null },
    });

    if (!task) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
    }

    // Check permissions: only creator or admin can delete
    if (!isAdmin && task.created_by !== userId) {
      throw new AppError(
        'Only task creator or admin can delete',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    // Soft-delete task
    await prisma.task.update({
      where: { id: taskId },
      data: { deleted_at: new Date() },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        project_id: task.project_id,
        actor_id: userId,
        action: 'task_deleted',
        payload: { title: task.title },
      },
    });
  }

  /**
   * Format task response for list view
   */
  private static formatTaskResponse(task: any): TaskResponse {
    return {
      id: task.id,
      project_id: task.project_id,
      title: task.title,
      description: task.description,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      assignee_id: task.assignee_id,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
          }
        : null,
      created_by: task.created_by,
      due_date: task.due_date ? task.due_date.toISOString().split('T')[0] : null,
      created_at: task.created_at.toISOString(),
      updated_at: task.updated_at.toISOString(),
    };
  }

  /**
   * Format task response for detail view
   */
  private static formatTaskDetailResponse(task: any): TaskDetailResponse {
    return {
      id: task.id,
      project_id: task.project_id,
      title: task.title,
      description: task.description,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      assignee_id: task.assignee_id,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email,
          }
        : null,
      created_by: task.created_by,
      due_date: task.due_date ? task.due_date.toISOString().split('T')[0] : null,
      created_at: task.created_at.toISOString(),
      updated_at: task.updated_at.toISOString(),
      creator: task.creator
        ? {
            id: task.creator.id,
            name: task.creator.name,
            email: task.creator.email,
          }
        : undefined,
      comment_count: 0, // Will be implemented in FEAT-006
    };
  }
}
