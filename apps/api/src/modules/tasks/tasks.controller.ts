/**
 * Task Module - HTTP Request Handlers
 * Controller layer for task endpoints
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/error.middleware';
import { TasksService } from './tasks.service';
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksSchema,
} from './tasks.validation';

export class TasksController {
  /**
   * POST /api/projects/:projectId/tasks
   * Create a new task in a project
   */
  static create = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createTaskSchema.parse(req.body);
    const result = await TasksService.create(
      validatedData,
      req.params.projectId,
      req.user!.id
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: result,
    });
  });

  /**
   * GET /api/projects/:projectId/tasks
   * List tasks in a project with filtering, sorting, and pagination
   */
  static list = asyncHandler(async (req: Request, res: Response) => {
    const validatedQuery = listTasksSchema.parse(req.query);
    const page = parseInt(validatedQuery.page as any) || 1;
    const limit = parseInt(validatedQuery.limit as any) || 20;

    const filters = {
      status: validatedQuery.status,
      priority: validatedQuery.priority,
      assignee_id: validatedQuery.assignee_id,
    };

    const result = await TasksService.list(
      req.params.projectId,
      req.user!.id,
      req.user!.role === 'ADMIN',
      filters,
      validatedQuery.sort || 'created_at_desc',
      page,
      limit
    );

    res.json({
      success: true,
      data: {
        tasks: result.tasks,
        pagination: result.pagination,
      },
    });
  });

  /**
   * GET /api/tasks/:id
   * Get task detail by ID
   */
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const result = await TasksService.getById(
      req.params.id,
      req.user!.id,
      req.user!.role === 'ADMIN'
    );

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * PATCH /api/tasks/:id
   * Update a task (title, description, status, priority, due_date, assignee)
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = updateTaskSchema.parse(req.body);
    const result = await TasksService.update(
      req.params.id,
      validatedData,
      req.user!.id,
      req.user!.role === 'ADMIN'
    );

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: result,
    });
  });

  /**
   * DELETE /api/tasks/:id
   * Soft-delete a task
   */
  static delete = asyncHandler(async (req: Request, res: Response) => {
    await TasksService.delete(
      req.params.id,
      req.user!.id,
      req.user!.role === 'ADMIN'
    );

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  });
}
