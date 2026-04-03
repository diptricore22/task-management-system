/**
 * Comments Module - Route Definitions
 * HTTP routes for comments endpoints
 */

import { Router } from 'express';
import CommentsController from './comments.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Task activity feed (comments + activity logs)
router.get('/tasks/:id/comments', CommentsController.getTaskFeed);

// Create comment
router.post('/tasks/:id/comments', CommentsController.create);

// Update comment (within 15-minute window)
router.patch('/:id', CommentsController.update);

// Delete comment
router.delete('/:id', CommentsController.delete);

export default router;
