import { PrismaClient, UserRole, TaskStatus, TaskPriority, ProjectStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Clearing existing data...');

    // Delete in reverse order of dependencies - simplified order
    try {
      console.log('Deleting taskLabel...');
      await prisma.taskLabel.deleteMany();

      console.log('Deleting label...');
      await prisma.label.deleteMany();

      console.log('Deleting comment...');
      await prisma.comment.deleteMany();

      console.log('Deleting task...');
      await prisma.task.deleteMany();

      console.log('Deleting activityLog...');
      await prisma.activityLog.deleteMany();

      console.log('Deleting notification...');
      await prisma.notification.deleteMany();

      console.log('Deleting notificationPreference...');
      await prisma.notificationPreference.deleteMany();

      console.log('Deleting refreshToken...');
      await prisma.refreshToken.deleteMany();

      console.log('Deleting inviteToken...');
      await prisma.inviteToken.deleteMany();

      console.log('Deleting projectMember...');
      await prisma.projectMember.deleteMany();

      console.log('Deleting project...');
      await prisma.project.deleteMany();

      console.log('Deleting user...');
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

  console.log('✅ Database seed completed successfully!');
  console.log(`
📊 Seed Summary:
  👤 Users: 4 (1 admin, 2 members, 1 viewer)
  📧 Notification preferences: 4

🔐 Test Accounts:
  Admin: admin@test.com / password123
  Member 1: member1@test.com / password123
  Member 2: member2@test.com / password123
  Viewer: viewer@test.com / password123

🎯 Basic auth testing data is ready!
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