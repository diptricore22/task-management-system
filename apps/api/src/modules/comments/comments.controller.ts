/**
 * Comments Module - Controller
 * HTTP request handlers for comments and task activity feed
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/error.middleware';
import { CommentsService } from './comments.service';
import {
  createCommentSchema,
  updateCommentSchema,
  taskActivityQuerySchema,
} from './comments.validation';

export class CommentsController {
  /**
   * GET /api/tasks/:id/comments
   * Get merged comments and activity feed for a task with pagination
   */
  static getTaskFeed = asyncHandler(async (req: Request, res: Response) => {
    const validatedQuery = taskActivityQuerySchema.parse(req.query);
    const page = validatedQuery.page
      ? parseInt(validatedQuery.page as unknown as string)
      : 1;
    const limit = validatedQuery.limit
      ? parseInt(validatedQuery.limit as unknown as string)
      : 20;

    const result = await CommentsService.getByTaskId(
      req.params.id,
      req.user!.id,
      page,
      limit
    );

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * POST /api/tasks/:id/comments
   * Create a new comment on a task
   */
  static create = asyncHandler(async (req: Request, res: Response) => {
    const validatedBody = createCommentSchema.parse(req.body);

    const comment = await CommentsService.create(
      req.params.id,
      req.user!.id,
      validatedBody
    );

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment,
    });
  });

  /**
   * PATCH /api/comments/:id
   * Edit a comment (within 15-minute window)
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    const validatedBody = updateCommentSchema.parse(req.body);

    const comment = await CommentsService.update(
      req.params.id,
      req.user!.id,
      validatedBody
    );

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    });
  });

  /**
   * DELETE /api/comments/:id
   * Delete a comment (soft-delete)
   */
  static delete = asyncHandler(async (req: Request, res: Response) => {
    await CommentsService.delete(req.params.id, req.user!.id);

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  });
}

export default CommentsController;
