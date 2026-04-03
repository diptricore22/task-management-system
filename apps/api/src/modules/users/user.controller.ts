// User controller
// This file handles HTTP requests and responses for user profile management

import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/error.middleware';
import AuthService from '../auth/auth.service';
import { updateProfileSchema } from '../auth/auth.validation';

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
    // const userId = req.user!.id; // From auth middleware
    // const page = parseInt(req.query.page as string) || 1;
    // const limit = parseInt(req.query.limit as string) || 20;

    // TODO: Get tasks assigned to current user
    // const result = await TaskService.getTasksByUser(userId, { page, limit });

    res.json({
      success: true,
      data: {
        tasks: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      },
    });
  });
}

export default UserController;