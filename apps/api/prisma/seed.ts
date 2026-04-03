import { PrismaClient, UserRole, TaskStatus, TaskPriority, ProjectStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Clearing existing data...');

    // Delete in reverse order of dependencies
    try {
      await prisma.taskLabel.deleteMany();
      await prisma.label.deleteMany();
      await prisma.comment.deleteMany();
      await prisma.task.deleteMany();
      await prisma.activityLog.deleteMany();
      await prisma.notification.deleteMany();
      await prisma.notificationPreference.deleteMany();
      await prisma.refreshToken.deleteMany();
      await prisma.inviteToken.deleteMany();
      await prisma.projectMember.deleteMany();
      await prisma.project.deleteMany();
      await prisma.user.deleteMany();
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }

  // Create test users
  console.log('👤 Creating test users...');

  const passwordHash = await bcrypt.hash('password123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password_hash: passwordHash,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  const memberUser1 = await prisma.user.create({
    data: {
      email: 'member1@test.com',
      password_hash: passwordHash,
      name: 'John Doe',
      role: UserRole.MEMBER,
    },
  });

  const memberUser2 = await prisma.user.create({
    data: {
      email: 'member2@test.com',
      password_hash: passwordHash,
      name: 'Jane Smith',
      role: UserRole.MEMBER,
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      email: 'viewer@test.com',
      password_hash: passwordHash,
      name: 'Viewer User',
      role: UserRole.VIEWER,
    },
  });

  // Create notification preferences for all users
  console.log('📧 Creating notification preferences...');

  const users = [adminUser, memberUser1, memberUser2, viewerUser];
  for (const user of users) {
    await prisma.notificationPreference.create({
      data: {
        user_id: user.id,
        email_due_tomorrow: true,
        email_overdue: true,
        email_assigned: true,
        email_commented: true,
      },
    });
  }

  // Create test projects
  console.log('🚀 Creating test projects...');

  const project1 = await prisma.project.create({
    data: {
      name: 'Web Application Development',
      description: 'Building the company\'s main web application',
      color: '#3B82F6',
      created_by: adminUser.id,
      status: ProjectStatus.ACTIVE,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App MVP',
      description: 'Minimum viable product for mobile application',
      color: '#10B981',
      created_by: adminUser.id,
      status: ProjectStatus.ACTIVE,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'API Documentation',
      description: 'Complete API documentation and testing suite',
      color: '#F59E0B',
      created_by: memberUser1.id,
      status: ProjectStatus.ACTIVE,
    },
  });

  // Add project members
  console.log('👥 Adding project members...');

  // Project 1 members
  await prisma.projectMember.createMany({
    data: [
      { user_id: adminUser.id, project_id: project1.id, role: 'ADMIN' },
      { user_id: memberUser1.id, project_id: project1.id, role: 'MEMBER' },
      { user_id: memberUser2.id, project_id: project1.id, role: 'MEMBER' },
      { user_id: viewerUser.id, project_id: project1.id, role: 'VIEWER' },
    ],
  });

  // Project 2 members
  await prisma.projectMember.createMany({
    data: [
      { user_id: adminUser.id, project_id: project2.id, role: 'ADMIN' },
      { user_id: memberUser2.id, project_id: project2.id, role: 'MEMBER' },
      { user_id: viewerUser.id, project_id: project2.id, role: 'VIEWER' },
    ],
  });

  // Project 3 members
  await prisma.projectMember.createMany({
    data: [
      { user_id: memberUser1.id, project_id: project3.id, role: 'ADMIN' },
      { user_id: memberUser2.id, project_id: project3.id, role: 'MEMBER' },
    ],
  });

  // Create labels
  console.log('🏷️ Creating labels...');

  const labels = await prisma.label.createMany({
    data: [
      // Project 1 labels
      { name: 'Frontend', color: '#3B82F6', project_id: project1.id },
      { name: 'Backend', color: '#10B981', project_id: project1.id },
      { name: 'Bug', color: '#EF4444', project_id: project1.id },
      { name: 'Feature', color: '#8B5CF6', project_id: project1.id },
      // Project 2 labels
      { name: 'UI/UX', color: '#EC4899', project_id: project2.id },
      { name: 'Testing', color: '#F59E0B', project_id: project2.id },
      // Project 3 labels
      { name: 'Documentation', color: '#6B7280', project_id: project3.id },
      { name: 'API', color: '#06B6D4', project_id: project3.id },
    ],
  });

  // Get created labels for task assignment
  const project1Labels = await prisma.label.findMany({
    where: { project_id: project1.id },
  });
  const project2Labels = await prisma.label.findMany({
    where: { project_id: project2.id },
  });
  const project3Labels = await prisma.label.findMany({
    where: { project_id: project3.id },
  });

  // Create tasks
  console.log('✅ Creating tasks...');

  // Project 1 tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Setup user authentication system',
      description: 'Implement JWT-based authentication with refresh tokens',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      project_id: project1.id,
      created_by: adminUser.id,
      assignee_id: memberUser1.id,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Design dashboard layout',
      description: 'Create responsive dashboard with task overview and project cards',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      project_id: project1.id,
      created_by: adminUser.id,
      assignee_id: memberUser2.id,
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Fix login form validation',
      description: 'Email validation is not working correctly on the login form',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      project_id: project1.id,
      created_by: memberUser1.id,
      assignee_id: memberUser1.id,
    },
  });

  // Project 2 tasks
  const task4 = await prisma.task.create({
    data: {
      title: 'Create user onboarding flow',
      description: 'Design and implement user onboarding screens',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      project_id: project2.id,
      created_by: adminUser.id,
      assignee_id: memberUser2.id,
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'Setup push notifications',
      description: 'Implement push notifications for task updates',
      status: TaskStatus.BLOCKED,
      priority: TaskPriority.LOW,
      project_id: project2.id,
      created_by: memberUser2.id,
      assignee_id: memberUser2.id,
    },
  });

  // Project 3 tasks
  const task6 = await prisma.task.create({
    data: {
      title: 'Write API endpoint documentation',
      description: 'Document all REST API endpoints with examples',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      project_id: project3.id,
      created_by: memberUser1.id,
      assignee_id: memberUser2.id,
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  });

  // Add task labels
  console.log('🔗 Adding task labels...');

  await prisma.taskLabel.createMany({
    data: [
      // Task 1 labels
      { task_id: task1.id, label_id: project1Labels.find(l => l.name === 'Backend')!.id },
      { task_id: task1.id, label_id: project1Labels.find(l => l.name === 'Feature')!.id },
      // Task 2 labels
      { task_id: task2.id, label_id: project1Labels.find(l => l.name === 'Frontend')!.id },
      { task_id: task2.id, label_id: project1Labels.find(l => l.name === 'Feature')!.id },
      // Task 3 labels
      { task_id: task3.id, label_id: project1Labels.find(l => l.name === 'Frontend')!.id },
      { task_id: task3.id, label_id: project1Labels.find(l => l.name === 'Bug')!.id },
      // Task 4 labels
      { task_id: task4.id, label_id: project2Labels.find(l => l.name === 'UI/UX')!.id },
      // Task 5 labels
      { task_id: task5.id, label_id: project2Labels.find(l => l.name === 'Testing')!.id },
      // Task 6 labels
      { task_id: task6.id, label_id: project3Labels.find(l => l.name === 'Documentation')!.id },
      { task_id: task6.id, label_id: project3Labels.find(l => l.name === 'API')!.id },
    ],
  });

  // Add some comments
  console.log('💬 Adding comments...');

  await prisma.comment.createMany({
    data: [
      {
        body: 'Started working on the JWT implementation. Making good progress!',
        task_id: task1.id,
        author_id: memberUser1.id,
      },
      {
        body: 'I have some questions about the refresh token strategy. Can we discuss this in our next standup?',
        task_id: task1.id,
        author_id: memberUser1.id,
      },
      {
        body: 'The bug has been fixed and tested. Ready for review.',
        task_id: task3.id,
        author_id: memberUser1.id,
      },
      {
        body: 'UI mockups are ready. Please review before I start implementation.',
        task_id: task4.id,
        author_id: memberUser2.id,
      },
    ],
  });

  // Add activity logs
  console.log('📝 Adding activity logs...');

  await prisma.activityLog.createMany({
    data: [
      {
        action: 'task_created',
        project_id: project1.id,
        task_id: task1.id,
        actor_id: adminUser.id,
        payload: { title: task1.title, priority: 'HIGH', assignee: 'member1@test.com' },
      },
      {
        action: 'task_assigned',
        project_id: project1.id,
        task_id: task1.id,
        actor_id: adminUser.id,
        payload: { assignee_id: memberUser1.id, assignee_name: 'John Doe' },
      },
      {
        action: 'task_completed',
        project_id: project1.id,
        task_id: task3.id,
        actor_id: memberUser1.id,
        payload: { status: 'DONE' },
      },
      {
        action: 'project_created',
        project_id: project1.id,
        actor_id: adminUser.id,
        payload: { name: project1.name },
      },
    ],
  });

  // Add some notifications
  console.log('🔔 Adding notifications...');

  await prisma.notification.createMany({
    data: [
      {
        user_id: memberUser1.id,
        task_id: task1.id,
        type: 'task_assigned',
        payload: {
          title: 'New task assigned',
          message: 'You have been assigned to "Setup user authentication system"',
          task_id: task1.id,
          project_id: project1.id
        },
      },
      {
        user_id: memberUser2.id,
        task_id: task2.id,
        type: 'due_date_reminder',
        payload: {
          title: 'Task due soon',
          message: 'Your task "Design dashboard layout" is due in 3 days',
          task_id: task2.id,
          due_date: task2.due_date
        },
      },
      {
        user_id: adminUser.id,
        task_id: task3.id,
        type: 'task_completed',
        payload: {
          title: 'Task completed',
          message: 'John Doe completed "Fix login form validation"',
          task_id: task3.id,
          completed_by: memberUser1.id
        },
        read_at: new Date(), // Mark as read
      },
    ],
  });

  console.log('✅ Database seed completed successfully!');
  console.log(`
📊 Seed Summary:
  👤 Users: 4 (1 admin, 2 members, 1 viewer)
  🚀 Projects: 3
  👥 Project memberships: 7
  ✅ Tasks: 6
  🏷️ Labels: 8
  💬 Comments: 4
  📝 Activity logs: 4
  🔔 Notifications: 3

🔐 Test Accounts:
  Admin: admin@test.com / password123
  Member 1: member1@test.com / password123
  Member 2: member2@test.com / password123
  Viewer: viewer@test.com / password123

🎯 You can now test the authentication system with these accounts!
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });