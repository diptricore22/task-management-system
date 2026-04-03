/**
 * Task Module - Route Definitions
 * HTTP routes for task endpoints
 */

import { Router } from 'express';
import { TasksController } from './tasks.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(authMiddleware);

// Project task list and create endpoints
// POST /api/projects/:projectId/tasks - Create task
// GET /api/projects/:projectId/tasks - List tasks
router.post('/', TasksController.create);
router.get('/', TasksController.list);

export default router;
