import { createApp } from './app';
import { config } from '@/config/env';
import { logger } from '@/lib/logger';
import { SchedulerService } from '@/modules/notifications/scheduler.service';

// Try to load and initialize cron scheduler if available
let cronInitialized = false;

// Attempt to load node-cron for scheduling
function initializeScheduler() {
  try {
    // Dynamically import node-cron to avoid breaking if not installed
    const cron = require('node-cron');

    // Schedule daily reminder job at 08:00 AM server time (UTC)
    // Format: minute hour day-of-month month day-of-week
    // 0 8 * * * = 08:00 AM every day
    const scheduledJob = cron.schedule('0 8 * * *', async () => {
      logger.info('Executing scheduled task: Daily due date reminders');
      try {
        await SchedulerService.runDailyDueDateReminders();
      } catch (error) {
        logger.error('Error executing scheduled reminder job:', error);
      }
    });

    // Validate cron job was created
    if (scheduledJob) {
      cronInitialized = true;
      logger.info('✅ Scheduler initialized - Daily due date reminders will run at 08:00 AM (server timezone)');
    }
  } catch (error: any) {
    if (error.code === 'MODULE_NOT_FOUND') {
      logger.warn(
        '⚠️  node-cron not installed. Install with: npm install node-cron'
      );
      logger.warn('Scheduled jobs will not run. Run reminders manually via: /api/admin/run-scheduled-jobs');
    } else {
      logger.error('Failed to initialize scheduler:', error);
    }
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown handler
function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Graceful shutdown initiated...`);

  // Close server
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed.');

      // Close database connections
      // prisma.$disconnect() - will be added when Prisma is set up

      logger.info('Application shutdown complete.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Create and start server
const app = createApp();

const server = app.listen(config.app.port, () => {
  logger.info(`🚀 Server running on port ${config.app.port}`);
  logger.info(`📍 Environment: ${config.app.env}`);
  logger.info(`🌍 Base URL: ${config.app.baseUrl}`);

  if (config.app.isDevelopment) {
    logger.info(`📊 Health check: ${config.app.baseUrl}/health`);
    logger.info(`🧪 Test endpoint: ${config.app.baseUrl}/api/test`);
  }

  // Initialize scheduler after server starts
  initializeScheduler();
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof config.app.port === 'string'
    ? 'Pipe ' + config.app.port
    : 'Port ' + config.app.port;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

export default server;