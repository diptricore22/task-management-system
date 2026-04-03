// Projects routes - HTTP route definitions
import { Router } from 'express';
import { ProjectsController } from './projects.controller';
import { authMiddleware, requireAdmin } from '@/middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Project CRUD endpoints
router.post('/', requireAdmin, ProjectsController.create);
router.get('/', ProjectsController.list);
router.get('/:id', ProjectsController.getById);
router.patch('/:id', requireAdmin, ProjectsController.update);
router.patch('/:id/archive', requireAdmin, ProjectsController.archive);
router.delete('/:id', requireAdmin, ProjectsController.delete);

// Project members endpoints
router.get('/:id/members', ProjectsController.listMembers);
router.post('/:id/members', requireAdmin, ProjectsController.addMember);
router.patch('/:id/members/:userId', requireAdmin, ProjectsController.updateMemberRole);
router.delete('/:id/members/:userId', requireAdmin, ProjectsController.removeMember);

export default router;