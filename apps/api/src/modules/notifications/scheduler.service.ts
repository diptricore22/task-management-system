/**
 * Scheduler Service
 * Handles scheduled jobs for due date reminders
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { NotificationPreferencesService } from '@/modules/notifications/notification-preferences.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { EmailService } from '@/modules/notifications/email.service';

export class SchedulerService {
  /**
   * Run daily due date reminder job
   * Sends reminders for:
   * - Tasks due tomorrow
   * - Overdue tasks (debounced)
   */
  static async runDailyDueDateReminders(): Promise<void> {
    logger.info('Starting daily due date reminder job');

    const startTime = Date.now();
    let successCount = 0;
    let errorCount = 0;

    try {
      // Get today's date (at midnight)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get tomorrow's date
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      // ===== TASKS DUE TOMORROW =====
      logger.info('Processing tasks due tomorrow...');

      const tasksDueTomorrow = await prisma.task.findMany({
        where: {
          due_date: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
            lte: tomorrow,
          },
          status: { not: 'DONE' },
          assignee_id: { not: null },
          deleted_at: null,
        },
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      });

      logger.info(`Found ${tasksDueTomorrow.length} tasks due tomorrow`);

      for (const task of tasksDueTomorrow) {
        try {
          // Create in-app notification
          await NotificationsService.create(
            task.assignee_id!,
            'task_due_tomorrow',
            {
              title: `Reminder: '${task.title}' is due tomorrow`,
              message: `Task is due tomorrow in ${task.project.name}`,
              task_id: task.id,
              project_id: task.project_id,
            },
            task.id
          );

          // Send email if enabled
          const emailEnabled = await NotificationPreferencesService.isEmailNotificationEnabled(
            task.assignee_id!,
            'due_tomorrow'
          );

          if (emailEnabled && task.assignee?.email) {
            await EmailService.sendDueTomorrowEmail(
              task.assignee.email,
              task.assignee.name,
              task.title,
              task.project.name,
              task.due_date,
              task.id
            );
          }

          successCount++;
        } catch (error) {
          errorCount++;
          logger.error(`Error processing task due tomorrow ${task.id}:`, error);
        }
      }

      // ===== OVERDUE TASKS =====
      logger.info('Processing overdue tasks...');

      const today2 = new Date();
      today2.setHours(0, 0, 0, 0);

      const overdutasks = await prisma.task.findMany({
        where: {
          due_date: {
            lt: today2,
          },
          status: { not: 'DONE' },
          assignee_id: { not: null },
          deleted_at: null,
          OR: [
            { last_due_notified_at: null },
            {
              last_due_notified_at: {
                lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // More than 24 hours ago
              },
            },
          ],
        },
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      });

      logger.info(`Found ${overdutasks.length} overdue tasks`);

      for (const task of overdutasks) {
        try {
          // Create in-app notification
          await NotificationsService.create(
            task.assignee_id!,
            'task_overdue',
            {
              title: `Overdue: '${task.title}'`,
              message: `Task was due on ${task.due_date?.toLocaleDateString()} in ${task.project.name}`,
              task_id: task.id,
              project_id: task.project_id,
            },
            task.id
          );

          // Send email if enabled
          const emailEnabled = await NotificationPreferencesService.isEmailNotificationEnabled(
            task.assignee_id!,
            'overdue'
          );

          if (emailEnabled && task.assignee?.email) {
            await EmailService.sendOverdueEmail(
              task.assignee.email,
              task.assignee.name,
              task.title,
              task.project.name,
              task.due_date,
              task.id
            );
          }

          // Update last_due_notified_at
          await prisma.task.update({
            where: { id: task.id },
            data: { last_due_notified_at: new Date() },
          });

          successCount++;
        } catch (error) {
          errorCount++;
          logger.error(`Error processing overdue task ${task.id}:`, error);
        }
      }

      const duration = Date.now() - startTime;
      logger.info(
        `Daily due date reminder job completed: ${successCount} successes, ${errorCount} errors in ${duration}ms`
      );
    } catch (error) {
      logger.error('Critical error in daily due date reminder job:', error);
      throw error;
    }
  }

  /**
   * Start scheduled jobs
   * Should be called once on application startup
   */
  static startScheduledJobs(): void {
    logger.info('Starting scheduled jobs...');

    // Note: node-cron needs to be installed separately
    // For now, we provide this service to be integrated with a scheduler
    // Example integration in main app file:
    // import cron from 'node-cron';
    // cron.schedule('0 8 * * *', () => SchedulerService.runDailyDueDateReminders());
  }
}

export default SchedulerService;
