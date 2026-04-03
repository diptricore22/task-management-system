/**
 * Dashboard Module - Controller
 * HTTP request handlers for dashboard endpoints
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/error.middleware';
import { DashboardService } from './dashboard.service';
import { dashboardActivityQuerySchema } from './dashboard.validation';

export class DashboardController {
  /**
   * GET /api/dashboard/summary
   * Personal task summary: overdue, due today, in progress counts
   * Story 1: Personal Task Overview
   */
  static getSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await DashboardService.getSummary(req.user!.id);

    res.json({
      success: true,
      data: summary,
    });
  });

  /**
   * GET /api/dashboard/projects
   * Project cards for projects user is member of with task status counts and % complete
   * Story 2: Project Status Cards
   */
  static getProjects = asyncHandler(async (req: Request, res: Response) => {
    const projects = await DashboardService.getProjects(req.user!.id);

    res.json({
      success: true,
      data: projects,
    });
  });

  /**
   * GET /api/dashboard/activity
   * Activity feed for projects user is member of with pagination
   * Story 3: Activity Feed
   */
  static getActivity = asyncHandler(async (req: Request, res: Response) => {
    const validatedQuery = dashboardActivityQuerySchema.parse(req.query);
    const page = validatedQuery.page ? parseInt(validatedQuery.page as unknown as string) : 1;
    const limit = validatedQuery.limit ? parseInt(validatedQuery.limit as unknown as string) : 20;

    const activity = await DashboardService.getActivity(req.user!.id, page, limit);

    res.json({
      success: true,
      data: activity,
    });
  });

  /**
   * GET /api/dashboard/admin/overview
   * Admin-only: all projects with health overview
   * Story 4: Admin Project Health Overview
   * Requires ADMIN role (enforced by requireAdmin middleware)
   */
  static getAdminOverview = asyncHandler(async (req: Request, res: Response) => {
    const overview = await DashboardService.getAdminOverview();

    res.json({
      success: true,
      data: overview,
    });
  });
}

export default DashboardController;
