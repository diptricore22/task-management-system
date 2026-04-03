/**
 * Labels Module - Service Layer
 * Business logic for label management and task labeling
 */

import { prisma } from '@/lib/prisma';
import { AppError } from '@/middlewares/error.middleware';
import type {
  CreateLabelRequest,
  UpdateLabelRequest,
  LabelResponse,
} from './labels.types';

export class LabelsService {
  /**
   * Create a new label for a project
   * - Validates label name is unique within project
   * - Validates color format (hex)
   * - Admin only
   */
  static async create(
    projectId: string,
    data: CreateLabelRequest
  ): Promise<LabelResponse> {
    // Verify project exists
    const project = await prisma.project.findFirst({
      where: { id: projectId, deleted_at: null },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Check label name uniqueness within project
    const existingLabel = await prisma.label.findFirst({
      where: {
        project_id: projectId,
        name: data.name.trim(),
        deleted_at: null,
      },
    });

    if (existingLabel) {
      throw new AppError(
        'A label with this name already exists',
        409,
        'LABEL_ALREADY_EXISTS'
      );
    }

    // Create label
    const label = await prisma.label.create({
      data: {
        project_id: projectId,
        name: data.name.trim(),
        color: data.color.toUpperCase(),
      },
    });

    return this.formatLabelResponse(label);
  }

  /**
   * Get all labels for a project
   */
  static async getByProjectId(projectId: string): Promise<LabelResponse[]> {
    // Verify project exists
    const project = await prisma.project.findFirst({
      where: { id: projectId, deleted_at: null },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Fetch all non-deleted labels for project
    const labels = await prisma.label.findMany({
      where: {
        project_id: projectId,
        deleted_at: null,
      },
      orderBy: { name: 'asc' },
    });

    return labels.map((label) => this.formatLabelResponse(label));
  }

  /**
   * Update a label (color, name)
   * - Admin only
   */
  static async update(
    labelId: string,
    data: UpdateLabelRequest
  ): Promise<LabelResponse> {
    // Verify label exists
    const label = await prisma.label.findFirst({
      where: { id: labelId, deleted_at: null },
    });

    if (!label) {
      throw new AppError('Label not found', 404, 'LABEL_NOT_FOUND');
    }

    // If name is being updated, check uniqueness within project
    if (data.name && data.name.trim() !== label.name) {
      const existingLabel = await prisma.label.findFirst({
        where: {
          project_id: label.project_id,
          name: data.name.trim(),
          deleted_at: null,
          id: { not: labelId }, // Exclude current label
        },
      });

      if (existingLabel) {
        throw new AppError(
          'A label with this name already exists',
          409,
          'LABEL_ALREADY_EXISTS'
        );
      }
    }

    // Build update data
    const updateData: any = {};
    if (data.name) updateData.name = data.name.trim();
    if (data.color) updateData.color = data.color.toUpperCase();

    // Update label
    const updated = await prisma.label.update({
      where: { id: labelId },
      data: updateData,
    });

    return this.formatLabelResponse(updated);
  }

  /**
   * Delete a label (hard delete, removes from all tasks)
   * - Admin only
   */
  static async delete(labelId: string): Promise<void> {
    // Verify label exists
    const label = await prisma.label.findFirst({
      where: { id: labelId, deleted_at: null },
    });

    if (!label) {
      throw new AppError('Label not found', 404, 'LABEL_NOT_FOUND');
    }

    // Remove label from all tasks
    await prisma.taskLabel.deleteMany({
      where: { label_id: labelId },
    });

    // Delete label
    await prisma.label.delete({
      where: { id: labelId },
    });
  }

  /**
   * Add a label to a task
   * - Validates task and label exist
   * - Validates membership
   */
  static async addToTask(
    taskId: string,
    labelId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<void> {
    // Verify task exists
    const task = await prisma.task.findFirst({
      where: { id: taskId, deleted_at: null },
      include: { project: true },
    });

    if (!task || !task.project) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
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
        throw new AppError(
          'You are not a member of this project',
          403,
          'NOT_PROJECT_MEMBER'
        );
      }
    }

    // Verify label exists and belongs to same project
    const label = await prisma.label.findFirst({
      where: {
        id: labelId,
        project_id: task.project_id,
        deleted_at: null,
      },
    });

    if (!label) {
      throw new AppError('Label not found', 404, 'LABEL_NOT_FOUND');
    }

    // Check if label already assigned
    const existingRelation = await prisma.taskLabel.findFirst({
      where: {
        task_id: taskId,
        label_id: labelId,
      },
    });

    if (existingRelation) {
      throw new AppError(
        'Label already assigned to this task',
        409,
        'LABEL_ALREADY_ASSIGNED'
      );
    }

    // Add label to task
    await prisma.taskLabel.create({
      data: {
        task_id: taskId,
        label_id: labelId,
      },
    });
  }

  /**
   * Remove a label from a task
   * - Validates task and label exist
   * - Validates membership
   */
  static async removeFromTask(
    taskId: string,
    labelId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<void> {
    // Verify task exists
    const task = await prisma.task.findFirst({
      where: { id: taskId, deleted_at: null },
      include: { project: true },
    });

    if (!task || !task.project) {
      throw new AppError('Task not found', 404, 'TASK_NOT_FOUND');
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
        throw new AppError(
          'You are not a member of this project',
          403,
          'NOT_PROJECT_MEMBER'
        );
      }
    }

    // Verify label exists
    const label = await prisma.label.findFirst({
      where: {
        id: labelId,
        project_id: task.project_id,
        deleted_at: null,
      },
    });

    if (!label) {
      throw new AppError('Label not found', 404, 'LABEL_NOT_FOUND');
    }

    // Remove label from task
    const result = await prisma.taskLabel.deleteMany({
      where: {
        task_id: taskId,
        label_id: labelId,
      },
    });

    if (result.count === 0) {
      throw new AppError(
        'Label not assigned to this task',
        404,
        'LABEL_NOT_ASSIGNED'
      );
    }
  }

  /**
   * Get labels for a task
   */
  static async getTaskLabels(taskId: string): Promise<LabelResponse[]> {
    const labels = await prisma.label.findMany({
      where: {
        tasks: {
          some: {
            task_id: taskId,
          },
        },
        deleted_at: null,
      },
      orderBy: { name: 'asc' },
    });

    return labels.map((label) => this.formatLabelResponse(label));
  }

  /**
   * Format label response for API
   */
  private static formatLabelResponse(label: any): LabelResponse {
    return {
      id: label.id,
      project_id: label.project_id,
      name: label.name,
      color: label.color,
      created_at: label.created_at.toISOString(),
      updated_at: label.updated_at.toISOString(),
    };
  }

  /**
   * Parse filter query params
   * Returns structured filter object for use in task filtering
   */
  static parseFilterParams(query: any): {
    statuses?: string[];
    priorities?: string[];
    labelIds?: string[];
    assigneeId?: string;
    dueDateFrom?: Date;
    dueDateTo?: Date;
  } {
    const filters: any = {};

    // Parse status (comma-separated)
    if (query.status) {
      filters.statuses = Array.isArray(query.status)
        ? query.status
        : query.status.split(',');
    }

    // Parse priority (comma-separated)
    if (query.priority) {
      filters.priorities = Array.isArray(query.priority)
        ? query.priority
        : query.priority.split(',');
    }

    // Parse labels (comma-separated label IDs)
    if (query.labels) {
      filters.labelIds = Array.isArray(query.labels)
        ? query.labels
        : query.labels.split(',');
    }

    // Parse assignee
    if (query.assignee_id) {
      filters.assigneeId = query.assignee_id;
    }

    // Parse due date range
    if (query.due_date_from) {
      filters.dueDateFrom = new Date(query.due_date_from);
    }
    if (query.due_date_to) {
      filters.dueDateTo = new Date(query.due_date_to);
    }

    return filters;
  }

  /**
   * Parse sort query param
   * Supports: created_at_desc, due_date_asc, priority_desc, title_asc
   */
  static parseSortParam(sort?: string): any {
    if (!sort) {
      return { created_at: 'desc' }; // default
    }

    switch (sort) {
      case 'due_date_asc':
        return { due_date: 'asc' };
      case 'priority_desc':
        return { priority: 'desc' };
      case 'title_asc':
        return { title: 'asc' };
      case 'created_at_desc':
      default:
        return { created_at: 'desc' };
    }
  }
}
