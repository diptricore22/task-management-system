/**
 * Dashboard Module - Route Definitions
 * HTTP routes for dashboard endpoints
 */

import { Router } from 'express';
import DashboardController from './dashboard.controller';
import { authMiddleware, requireAdmin } from '@/middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Personal dashboard endpoints
router.get('/summary', DashboardController.getSummary);
router.get('/projects', DashboardController.getProjects);
router.get('/activity', DashboardController.getActivity);

// Admin-only endpoints
router.get('/admin/overview', requireAdmin, DashboardController.getAdminOverview);

export default router;
