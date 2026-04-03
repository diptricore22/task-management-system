// User controller
// This file handles HTTP requests and responses for user profile management

import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/error.middleware';
import { prisma } from '@/lib/prisma';
import AuthService from '../auth/auth.service';
import { updateProfileSchema } from '../auth/auth.validation';
import { NotificationPreferencesService } from '../notifications/notification-preferences.service';
import { updateNotificationPreferencesSchema } from '../notifications/notification-preferences.validation';

export class UserController {
  // GET /api/users/me
  static getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id; // From auth middleware

    const user = await AuthService.getUserById(userId);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at.toISOString(),
        }
      },
    });
  });

  // PATCH /api/users/me
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = updateProfileSchema.parse(req.body);
    const userId = req.user!.id; // From auth middleware

    const updatedUser = await AuthService.updateUserProfile(userId, validatedData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          updated_at: updatedUser.updated_at.toISOString(),
        }
      },
    });
  });

  // GET /api/users/me/tasks
  static getMyTasks = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // Get tasks assigned to current user with pagination
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(Math.max(1, limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: {
          assignee_id: userId,
          deleted_at: null,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: [
          { due_date: { sort: 'asc', nulls: 'last' } },
          { created_at: 'desc' },
        ],
      }),
      prisma.task.count({
        where: {
          assignee_id: userId,
          deleted_at: null,
        },
      }),
    ]);

    // Group tasks by project
    const groupedByProject: { [key: string]: any } = {};
    tasks.forEach((task) => {
      const projId = task.project_id;
      if (!groupedByProject[projId]) {
        groupedByProject[projId] = {
          project_id: task.project.id,
          project_name: task.project.name,
          project_color: task.project.color,
          tasks: [],
        };
      }
      groupedByProject[projId].tasks.push({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ? task.due_date.toISOString().split('T')[0] : null,
        created_at: task.created_at.toISOString(),
      });
    });

    res.json({
      success: true,
      data: {
        tasks: tasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date ? task.due_date.toISOString().split('T')[0] : null,
          project: {
            id: task.project.id,
            name: task.project.name,
            color: task.project.color,
          },
          created_at: task.created_at.toISOString(),
        })),
        grouped_by_project: Object.values(groupedByProject),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  });

  // GET /api/users/me/notification-preferences
  static getNotificationPreferences = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const preferences = await NotificationPreferencesService.getPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  });

  // PATCH /api/users/me/notification-preferences
  static updateNotificationPreferences = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = updateNotificationPreferencesSchema.parse(req.body);
    const userId = req.user!.id;

    const preferences = await NotificationPreferencesService.updatePreferences(userId, validatedData);

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: preferences,
    });
  });
}

export default UserController;