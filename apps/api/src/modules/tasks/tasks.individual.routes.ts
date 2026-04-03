/**
 * Individual Task Routes
 * Routes for GET, PATCH, DELETE individual tasks
 */

import { Router } from 'express';
import { TasksController } from './tasks.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Individual task endpoints
// GET /api/tasks/:id - Get task detail
// PATCH /api/tasks/:id - Update task
// DELETE /api/tasks/:id - Delete task
router.get('/:id', TasksController.getById);
router.patch('/:id', TasksController.update);
router.delete('/:id', TasksController.delete);

export default router;
