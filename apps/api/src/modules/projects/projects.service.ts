// Projects service - business logic for project management
import { prisma } from '@/lib/prisma';
import { AppError } from '@/middlewares/error.middleware';
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  AddMemberRequest,
  UpdateMemberRequest,
  ProjectResponse,
  ProjectDetailResponse,
  ProjectMemberResponse,
  ProjectStatus,
} from './projects.types';

export class ProjectsService {
  /**
   * Create a new project
   * - Creator is automatically added as ADMIN member
   * - Activity logged
   */
  static async create(
    data: CreateProjectRequest,
    userId: string,
    isAdmin: boolean
  ): Promise<ProjectDetailResponse> {
    // Only Admins can create projects (implied by specs, enforcing in service)
    if (!isAdmin) {
      throw new AppError(
        'Only administrators can create projects',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    // Validate project name
    if (data.name.length > 100) {
      throw new AppError(
        'Project name must be 100 characters or fewer',
        400,
        'INVALID_INPUT'
      );
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim(),
        color: data.color,
        created_by: userId,
        status: 'ACTIVE',
      },
    });

    // Auto-add creator as ADMIN member
    await prisma.projectMember.create({
      data: {
        project_id: project.id,
        user_id: userId,
        role: 'ADMIN',
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        project_id: project.id,
        actor_id: userId,
        action: 'project_created',
        payload: { name: project.name },
      },
    });

    // Return fully populated project
    return this.getById(project.id, userId, true);
  }

  /**
   * List projects for a user
   * - Admins see all projects
   * - Non-admins see only projects they're members of
   */
  static async list(
    userId: string,
    isAdmin: boolean,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    projects: ProjectResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(Math.max(1, limit), 100);
    const skip = (pageNum - 1) * limitNum;

    let whereClause: any = { deleted_at: null };

    // Non-admins only see projects they're members of
    if (!isAdmin) {
      whereClause = {
        deleted_at: null,
        members: {
          some: {
            user_id: userId,
            deleted_at: null,
          },
        },
      };
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        include: {
          members: {
            where: { deleted_at: null },
            select: { id: true },
          },
          tasks: {
            where: { deleted_at: null },
            select: { status: true },
          },
        },
        skip,
        take: limitNum,
        orderBy: { created_at: 'desc' },
      }),
      prisma.project.count({ where: whereClause }),
    ]);

    const projectResponses = projects.map((p) => this.formatProjectResponse(p));

    return {
      projects: projectResponses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get project details by ID
   * - Non-admins must be project members
   * - Returns full project with members and task stats
   */
  static async getById(
    projectId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<ProjectDetailResponse> {
    // Check if project exists and is not deleted
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        deleted_at: null,
      },
      include: {
        members: {
          where: { deleted_at: null },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        tasks: {
          where: { deleted_at: null },
          select: { status: true },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Check membership for non-admins
    if (!isAdmin) {
      const isMember = project.members.some((m) => m.user_id === userId);
      if (!isMember) {
        throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
      }
    }

    return this.formatProjectDetailResponse(project);
  }

  /**
   * Update project details
   * - Only name, description, and color can be updated
   * - Admin only (global admin)
   */
  static async update(
    projectId: string,
    data: UpdateProjectRequest,
    userId: string
  ): Promise<ProjectDetailResponse> {
    // Verify project exists
    const project = await prisma.project.findFirst({
      where: { id: projectId, deleted_at: null },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Update project
    const updateData: any = {};
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new AppError('Project name cannot be empty', 400, 'INVALID_INPUT');
      }
      if (data.name.length > 100) {
        throw new AppError(
          'Project name must be 100 characters or fewer',
          400,
          'INVALID_INPUT'
        );
      }
      updateData.name = data.name.trim();
    }
    if (data.description !== undefined)
      updateData.description = data.description?.trim() || null;
    if (data.color !== undefined) updateData.color = data.color;

    await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        project_id: projectId,
        actor_id: userId,
        action: 'project_updated',
        payload: updateData,
      },
    });

    return this.getById(projectId, userId, true);
  }

  /**
   * Archive or restore a project
   * - Sets status to ARCHIVED or ACTIVE (not soft-delete)
   * - Admin only
   */
  static async archive(
    projectId: string,
    archived: boolean,
    userId: string
  ): Promise<ProjectDetailResponse> {
    // Verify project exists
    const project = await prisma.project.findFirst({
      where: { id: projectId, deleted_at: null },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Update status
    const newStatus: ProjectStatus = archived ? 'ARCHIVED' : 'ACTIVE';
    await prisma.project.update({
      where: { id: projectId },
      data: { status: newStatus },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        project_id: projectId,
        actor_id: userId,
        action: archived ? 'project_archived' : 'project_restored',
      },
    });

    return this.getById(projectId, userId, true);
  }

  /**
   * Soft-delete a project
   * - Sets deleted_at timestamp
   * - Returns count of tasks in project (for warning)
   * - Admin only
   */
  static async delete(
    projectId: string,
    userId: string
  ): Promise<{ task_count: number }> {
    // Verify project exists
    const project = await prisma.project.findFirst({
      where: { id: projectId, deleted_at: null },
      include: {
        _count: {
          select: { tasks: { where: { deleted_at: null } } },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    const taskCount = project._count.tasks;

    // Soft-delete project
    await prisma.project.update({
      where: { id: projectId },
      data: { deleted_at: new Date() },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        project_id: projectId,
        actor_id: userId,
        action: 'project_deleted',
        payload: { task_count: taskCount },
      },
    });

    return { task_count: taskCount };
  }

  /**
   * List all members of a project
   * - User must be a project member
   */
  static async listMembers(
    projectId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<ProjectMemberResponse[]> {
    // Verify project exists
    const project = await prisma.project.findFirst({
      where: { id: projectId, deleted_at: null },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Check membership for non-admins
    if (!isAdmin) {
      const isMember = await prisma.projectMember.findFirst({
        where: {
          project_id: projectId,
          user_id: userId,
          deleted_at: null,
        },
      });

      if (!isMember) {
        throw new AppError(
          'Insufficient permissions',
          403,
          'INSUFFICIENT_PERMISSIONS'
        );
      }
    }

    // Get members
    const members = await prisma.projectMember.findMany({
      where: {
        project_id: projectId,
        deleted_at: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { joined_at: 'asc' },
    });

    return members.map((m) => ({
      id: m.id,
      user_id: m.user_id,
      project_id: m.project_id,
      role: m.role as any,
      name: m.user.name,
      email: m.user.email,
      joined_at: m.joined_at.toISOString(),
    }));
  }

  /**
   * Add a member to a project
   * - User must exist
   * - User cannot already be a member
   * - Admin only
   */
  static async addMember(
    projectId: string,
    data: AddMemberRequest,
    userId: string
  ): Promise<ProjectMemberResponse> {
    // Verify project exists
    const project = await prisma.project.findFirst({
      where: { id: projectId, deleted_at: null },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Verify user exists
    const targetUser = await prisma.user.findFirst({
      where: {
        id: data.user_id,
        deleted_at: null,
      },
    });

    if (!targetUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        project_id: projectId,
        user_id: data.user_id,
        deleted_at: null,
      },
    });

    if (existingMember) {
      throw new AppError(
        'User is already a member of this project',
        409,
        'MEMBER_EXISTS'
      );
    }

    // Create membership
    const member = await prisma.projectMember.create({
      data: {
        project_id: projectId,
        user_id: data.user_id,
        role: data.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        project_id: projectId,
        actor_id: userId,
        action: 'member_added',
        payload: { user_id: data.user_id, role: data.role },
      },
    });

    return {
      id: member.id,
      user_id: member.user_id,
      project_id: member.project_id,
      role: member.role as any,
      name: member.user.name,
      email: member.user.email,
      joined_at: member.joined_at.toISOString(),
    };
  }

  /**
   * Update a member's role in a project
   * - Cannot demote if last admin
   * - Admin only
   */
  static async updateMemberRole(
    projectId: string,
    memberId: string,
    newRole: string,
    userId: string
  ): Promise<ProjectMemberResponse> {
    // Verify project exists
    const project = await prisma.project.findFirst({
      where: { id: projectId, deleted_at: null },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Get member
    const member = await prisma.projectMember.findFirst({
      where: {
        id: memberId,
        project_id: projectId,
        deleted_at: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!member) {
      throw new AppError('Member not found', 404, 'USER_NOT_FOUND');
    }

    // Check last admin: if demoting from ADMIN to something else
    if (member.role === 'ADMIN' && newRole !== 'ADMIN') {
      const adminCount = await prisma.projectMember.count({
        where: {
          project_id: projectId,
          role: 'ADMIN',
          deleted_at: null,
          id: { not: memberId },
        },
      });

      if (adminCount === 0) {
        throw new AppError(
          'Cannot remove the last admin from a project',
          409,
          'LAST_ADMIN'
        );
      }
    }

    // Update role
    const updated = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role: newRole as any },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        project_id: projectId,
        actor_id: userId,
        action: 'member_role_updated',
        payload: { user_id: member.user_id, old_role: member.role, new_role: newRole },
      },
    });

    return {
      id: updated.id,
      user_id: updated.user_id,
      project_id: updated.project_id,
      role: updated.role as any,
      name: updated.user.name,
      email: updated.user.email,
      joined_at: updated.joined_at.toISOString(),
    };
  }

  /**
   * Remove a member from a project
   * - Cannot remove if last admin
   * - Unassigns all open tasks from this member
   * - Admin only
   */
  static async removeMember(
    projectId: string,
    memberId: string,
    userId: string
  ): Promise<void> {
    // Verify project exists
    const project = await prisma.project.findFirst({
      where: { id: projectId, deleted_at: null },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    // Get member
    const member = await prisma.projectMember.findFirst({
      where: {
        id: memberId,
        project_id: projectId,
        deleted_at: null,
      },
    });

    if (!member) {
      throw new AppError('Member not found', 404, 'USER_NOT_FOUND');
    }

    // Check last admin: if removing someone with ADMIN role
    if (member.role === 'ADMIN') {
      const adminCount = await prisma.projectMember.count({
        where: {
          project_id: projectId,
          role: 'ADMIN',
          deleted_at: null,
          id: { not: memberId },
        },
      });

      if (adminCount === 0) {
        throw new AppError(
          'Cannot remove the last admin from a project',
          409,
          'LAST_ADMIN'
        );
      }
    }

    // Unassign all open tasks from this member (Story 2 AC2)
    await prisma.task.updateMany({
      where: {
        project_id: projectId,
        assignee_id: member.user_id,
        deleted_at: null,
        status: { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED'] },
      },
      data: { assignee_id: null },
    });

    // Soft-delete member
    await prisma.projectMember.update({
      where: { id: memberId },
      data: { deleted_at: new Date() },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        project_id: projectId,
        actor_id: userId,
        action: 'member_removed',
        payload: { user_id: member.user_id, role: member.role },
      },
    });
  }

  /**
   * Format project response with stats
   */
  private static formatProjectResponse(project: any): any {
    const taskStats = {
      total: project.tasks.length,
      todo: project.tasks.filter((t: any) => t.status === 'TODO').length,
      in_progress: project.tasks.filter((t: any) => t.status === 'IN_PROGRESS')
        .length,
      in_review: project.tasks.filter((t: any) => t.status === 'IN_REVIEW')
        .length,
      blocked: project.tasks.filter((t: any) => t.status === 'BLOCKED').length,
      done: project.tasks.filter((t: any) => t.status === 'DONE').length,
    };

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      status: project.status,
      created_by: project.created_by,
      member_count: project.members.length,
      task_stats: taskStats,
      created_at: project.created_at.toISOString(),
      updated_at: project.updated_at.toISOString(),
    };
  }

  /**
   * Format project detail response with members
   */
  private static formatProjectDetailResponse(project: any): any {
    const taskStats = {
      total: project.tasks.length,
      todo: project.tasks.filter((t: any) => t.status === 'TODO').length,
      in_progress: project.tasks.filter((t: any) => t.status === 'IN_PROGRESS')
        .length,
      in_review: project.tasks.filter((t: any) => t.status === 'IN_REVIEW')
        .length,
      blocked: project.tasks.filter((t: any) => t.status === 'BLOCKED').length,
      done: project.tasks.filter((t: any) => t.status === 'DONE').length,
    };

    const members = project.members.map((m: any) => ({
      id: m.id,
      user_id: m.user_id,
      project_id: m.project_id,
      role: m.role,
      name: m.user.name,
      email: m.user.email,
      joined_at: m.joined_at.toISOString(),
    }));

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      status: project.status,
      created_by: project.created_by,
      member_count: members.length,
      members,
      task_stats: taskStats,
      created_at: project.created_at.toISOString(),
      updated_at: project.updated_at.toISOString(),
    };
  }
}