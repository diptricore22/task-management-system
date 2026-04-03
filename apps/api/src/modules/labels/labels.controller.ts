/**
 * Labels Module - Controller
 * HTTP request handlers for labels and task labeling
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/error.middleware';
import { LabelsService } from './labels.service';
import {
  createLabelSchema,
  updateLabelSchema,
} from './labels.validation';

export class LabelsController {
  /**
   * GET /api/projects/:id/labels
   * Get all labels for a project
   */
  static getProjectLabels = asyncHandler(async (req: Request, res: Response) => {
    const labels = await LabelsService.getByProjectId(req.params.id);

    res.json({
      success: true,
      data: {
        labels,
      },
    });
  });

  /**
   * POST /api/projects/:id/labels
   * Create a new label for a project (admin only)
   */
  static createLabel = asyncHandler(async (req: Request, res: Response) => {
    const validatedBody = createLabelSchema.parse(req.body);

    const label = await LabelsService.create(req.params.id, validatedBody);

    res.status(201).json({
      success: true,
      message: 'Label created successfully',
      data: label,
    });
  });

  /**
   * PATCH /api/labels/:id
   * Update a label (admin only)
   */
  static updateLabel = asyncHandler(async (req: Request, res: Response) => {
    const validatedBody = updateLabelSchema.parse(req.body);

    const label = await LabelsService.update(req.params.id, validatedBody);

    res.json({
      success: true,
      message: 'Label updated successfully',
      data: label,
    });
  });

  /**
   * DELETE /api/labels/:id
   * Delete a label (admin only)
   */
  static deleteLabel = asyncHandler(async (req: Request, res: Response) => {
    await LabelsService.delete(req.params.id);

    res.json({
      success: true,
      message: 'Label deleted successfully',
    });
  });

  /**
   * POST /api/tasks/:id/labels
   * Add a label to a task (member/admin)
   */
  static addLabelToTask = asyncHandler(async (req: Request, res: Response) => {
    const { label_id } = req.body;

    if (!label_id) {
      res.status(400).json({
        success: false,
        error: 'label_id is required',
        code: 'INVALID_REQUEST',
      });
      return;
    }

    await LabelsService.addToTask(
      req.params.id,
      label_id,
      req.user!.id,
      req.user!.role === 'ADMIN'
    );

    res.status(201).json({
      success: true,
      message: 'Label added to task successfully',
    });
  });

  /**
   * DELETE /api/tasks/:id/labels/:labelId
   * Remove a label from a task (member/admin)
   */
  static removeLabelFromTask = asyncHandler(async (req: Request, res: Response) => {
    await LabelsService.removeFromTask(
      req.params.id,
      req.params.labelId,
      req.user!.id,
      req.user!.role === 'ADMIN'
    );

    res.json({
      success: true,
      message: 'Label removed from task successfully',
    });
  });

  /**
   * GET /api/tasks/:id/labels
   * Get all labels for a task
   */
  static getTaskLabels = asyncHandler(async (req: Request, res: Response) => {
    const labels = await LabelsService.getTaskLabels(req.params.id);

    res.json({
      success: true,
      data: {
        labels,
      },
    });
  });
}

export default LabelsController;
