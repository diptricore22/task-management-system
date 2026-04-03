import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  console.log('Testing Prisma client...');

  // Test basic connection
  try {
    console.log('Available models:', Object.keys(prisma));
    console.log('User model available:', !!prisma.user);
    console.log('NotificationPreference model available:', !!prisma.notificationPreference);
    console.log('Prisma client initialized successfully');
  } catch (error) {
    console.error('Prisma client error:', error);
  }
}

test()
  .finally(async () => {
    await prisma.$disconnect();
  });