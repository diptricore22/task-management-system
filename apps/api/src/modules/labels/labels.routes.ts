/**
 * Labels Module - Route Definitions
 * HTTP routes for labels endpoints
 */

import { Router } from 'express';
import LabelsController from './labels.controller';
import { authMiddleware, requireAdmin } from '@/middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Project labels endpoints
router.get('/projects/:id/labels', LabelsController.getProjectLabels);
router.post('/projects/:id/labels', requireAdmin, LabelsController.createLabel);

// Label management endpoints
router.patch('/:id', requireAdmin, LabelsController.updateLabel);
router.delete('/:id', requireAdmin, LabelsController.deleteLabel);

// Task labeling endpoints
router.post('/tasks/:id/labels', LabelsController.addLabelToTask);
router.delete('/tasks/:id/labels/:labelId', LabelsController.removeLabelFromTask);
router.get('/tasks/:id/labels', LabelsController.getTaskLabels);

export default router;
