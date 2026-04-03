// Projects controller - HTTP request handlers
import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/error.middleware';
import { ProjectsService } from './projects.service';
import {
  createProjectSchema,
  updateProjectSchema,
  archiveProjectSchema,
  addMemberSchema,
  updateMemberSchema,
} from './projects.validation';

export class ProjectsController {
  // POST /api/projects - Create project
  static create = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = createProjectSchema.parse(req.body);
    const result = await ProjectsService.create(validatedData, req.user!.id);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project: result,
      },
    });
  });

  // GET /api/projects - List projects
  static list = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await ProjectsService.list(
      req.user!.id,
      req.user!.role === 'ADMIN',
      page,
      limit
    );

    res.json({
      success: true,
      data: {
        projects: result.projects,
        pagination: result.pagination,
      },
    });
  });

  // GET /api/projects/:id - Get project detail
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const result = await ProjectsService.getById(
      req.params.id,
      req.user!.id,
      req.user!.role === 'ADMIN'
    );

    res.json({
      success: true,
      data: {
        project: result,
      },
    });
  });

  // PATCH /api/projects/:id - Update project
  static update = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = updateProjectSchema.parse(req.body);
    const result = await ProjectsService.update(
      req.params.id,
      validatedData,
      req.user!.id
    );

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project: result,
      },
    });
  });

  // PATCH /api/projects/:id/archive - Archive/restore project
  static archive = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = archiveProjectSchema.parse(req.body);
    const result = await ProjectsService.archive(
      req.params.id,
      validatedData.archived,
      req.user!.id
    );

    const action = validatedData.archived ? 'archived' : 'restored';
    res.json({
      success: true,
      message: `Project ${action} successfully`,
      data: {
        project: result,
      },
    });
  });

  // DELETE /api/projects/:id - Delete project
  static delete = asyncHandler(async (req: Request, res: Response) => {
    await ProjectsService.delete(req.params.id, req.user!.id);

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  });

  // GET /api/projects/:id/members - List project members
  static listMembers = asyncHandler(async (req: Request, res: Response) => {
    const members = await ProjectsService.listMembers(
      req.params.id,
      req.user!.id,
      req.user!.role === 'ADMIN'
    );

    res.json({
      success: true,
      data: {
        members,
      },
    });
  });

  // POST /api/projects/:id/members - Add member
  static addMember = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = addMemberSchema.parse(req.body);
    const member = await ProjectsService.addMember(
      req.params.id,
      validatedData,
      req.user!.id
    );

    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      data: {
        member,
      },
    });
  });

  // PATCH /api/projects/:id/members/:userId - Update member role
  static updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
    const validatedData = updateMemberSchema.parse(req.body);
    const member = await ProjectsService.updateMemberRole(
      req.params.id,
      req.params.userId,
      validatedData.role,
      req.user!.id
    );

    res.json({
      success: true,
      message: 'Member role updated successfully',
      data: {
        member,
      },
    });
  });

  // DELETE /api/projects/:id/members/:userId - Remove member
  static removeMember = asyncHandler(async (req: Request, res: Response) => {
    await ProjectsService.removeMember(
      req.params.id,
      req.params.userId,
      req.user!.id
    );

    res.json({
      success: true,
      message: 'Member removed successfully',
    });
  });
}