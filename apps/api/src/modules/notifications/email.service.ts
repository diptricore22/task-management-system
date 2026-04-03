/**
 * Email Service
 * Handles sending email notifications for due dates and other events
 */

import { logger } from '@/lib/logger';
import { config } from '@/config/env';

export class EmailService {
  /**
   * Send "due tomorrow" reminder email
   */
  static async sendDueTomorrowEmail(
    toEmail: string,
    toName: string,
    taskTitle: string,
    projectName: string,
    dueDate: Date | null,
    taskId: string
  ): Promise<void> {
    try {
      const taskLink = `${config.app.frontendUrl}/projects/tasks/${taskId}`;
      const formattedDueDate = dueDate
        ? new Date(dueDate).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })
        : 'Unknown date';

      const subject = `Reminder: "${taskTitle}" is due tomorrow`;
      const htmlContent = this.getEmailTemplate(
        toName,
        `Reminder: <strong>"${taskTitle}"</strong> is due tomorrow`,
        `The task <strong>"${taskTitle}"</strong> in project <strong>${projectName}</strong> is due on ${formattedDueDate}.`,
        taskLink,
        'View Task'
      );

      // TODO: Integrate with email provider (Resend, SendGrid, Nodemailer, etc.)
      // For now, log the email that would be sent
      logger.info(`[EMAIL] To: ${toEmail}, Subject: ${subject}`);
      logger.debug(`[EMAIL] Content preview: ${htmlContent.substring(0, 200)}...`);

      // Example implementation with Resend:
      // const response = await resend.emails.send({
      //   from: "notifications@tasksystem.app",
      //   to: toEmail,
      //   subject: subject,
      //   html: htmlContent,
      // });
      // if (!response.data?.id) throw new Error("Failed to send email");
    } catch (error) {
      logger.error(`Failed to send due tomorrow email to ${toEmail}:`, error);
      throw error;
    }
  }

  /**
   * Send overdue task email
   */
  static async sendOverdueEmail(
    toEmail: string,
    toName: string,
    taskTitle: string,
    projectName: string,
    dueDate: Date | null,
    taskId: string
  ): Promise<void> {
    try {
      const taskLink = `${config.app.frontendUrl}/projects/tasks/${taskId}`;
      const formattedDueDate = dueDate
        ? new Date(dueDate).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })
        : 'Unknown date';

      const subject = `Overdue: "${taskTitle}" in ${projectName}`;
      const htmlContent = this.getEmailTemplate(
        toName,
        `Overdue Task: <strong>"${taskTitle}"</strong>`,
        `The task <strong>"${taskTitle}"</strong> in project <strong>${projectName}</strong> was due on ${formattedDueDate} and is now overdue.`,
        taskLink,
        'View Overdue Task'
      );

      logger.info(`[EMAIL] To: ${toEmail}, Subject: ${subject}`);
      logger.debug(`[EMAIL] Content preview: ${htmlContent.substring(0, 200)}...`);

      // TODO: Send via email provider
      // const response = await resend.emails.send({
      //   from: "notifications@tasksystem.app",
      //   to: toEmail,
      //   subject: subject,
      //   html: htmlContent,
      // });
      // if (!response.data?.id) throw new Error("Failed to send email");
    } catch (error) {
      logger.error(`Failed to send overdue email to ${toEmail}:`, error);
      throw error;
    }
  }

  /**
   * Send task assigned email
   */
  static async sendTaskAssignedEmail(
    toEmail: string,
    toName: string,
    taskTitle: string,
    projectName: string,
    assignedBy: string,
    taskId: string
  ): Promise<void> {
    try {
      const taskLink = `${config.app.frontendUrl}/projects/tasks/${taskId}`;

      const subject = `Task Assigned: "${taskTitle}"`;
      const htmlContent = this.getEmailTemplate(
        toName,
        `New Task Assignment`,
        `<strong>${assignedBy}</strong> has assigned you the task <strong>"${taskTitle}"</strong> in project <strong>${projectName}</strong>.`,
        taskLink,
        'View Task'
      );

      logger.info(`[EMAIL] To: ${toEmail}, Subject: ${subject}`);
      logger.debug(`[EMAIL] Content preview: ${htmlContent.substring(0, 200)}...`);

      // TODO: Send via email provider
    } catch (error) {
      logger.error(`Failed to send task assigned email to ${toEmail}:`, error);
      throw error;
    }
  }

  /**
   * Send task commented email
   */
  static async sendTaskCommentedEmail(
    toEmail: string,
    toName: string,
    taskTitle: string,
    projectName: string,
    commentAuthor: string,
    taskId: string
  ): Promise<void> {
    try {
      const taskLink = `${config.app.frontendUrl}/projects/tasks/${taskId}`;

      const subject = `New Comment: "${taskTitle}"`;
      const htmlContent = this.getEmailTemplate(
        toName,
        `New Comment on Your Task`,
        `<strong>${commentAuthor}</strong> commented on the task <strong>"${taskTitle}"</strong> in project <strong>${projectName}</strong>.`,
        taskLink,
        'View Comment'
      );

      logger.info(`[EMAIL] To: ${toEmail}, Subject: ${subject}`);
      logger.debug(`[EMAIL] Content preview: ${htmlContent.substring(0, 200)}...`);

      // TODO: Send via email provider
    } catch (error) {
      logger.error(`Failed to send task commented email to ${toEmail}:`, error);
      throw error;
    }
  }

  /**
   * Generate email template with consistent styling
   */
  private static getEmailTemplate(
    recipientName: string,
    heading: string,
    message: string,
    actionLink: string,
    actionText: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Notification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0;">
  <div style="background-color: #ffffff; max-width: 600px; margin: 20px auto; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background-color: #3B82F6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 600;">${heading}</h1>
    </div>

    <!-- Content -->
    <div style="padding: 30px; color: #333;">
      <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${recipientName},</p>

      <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; color: #555;">
        ${message}
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${actionLink}" style="background-color: #3B82F6; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 500; display: inline-block;">
          ${actionText}
        </a>
      </div>

      <!-- Footer -->
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
      <p style="margin: 15px 0 5px 0; font-size: 12px; color: #999;">
        You are receiving this notification because of your task notifications settings.
      </p>
      <p style="margin: 5px 0; font-size: 12px; color: #999;">
        <a href="${config.app.frontendUrl}/settings/notifications" style="color: #3B82F6; text-decoration: none;">Manage notification preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

export default EmailService;
