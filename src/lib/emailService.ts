import { Resend } from 'resend';

let resend: Resend | null = null;

// Initialize Resend only if API key is available
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

interface LeaveNotificationData {
  employeeName: string;
  employeeEmail: string;
  adminEmail?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status?: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export class EmailService {
  private static isEnabled(): boolean {
    return (
      !!process.env.RESEND_API_KEY && !!resend && process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true'
    );
  }

  static async sendLeaveApplicationNotification(data: LeaveNotificationData): Promise<boolean> {
    if (!this.isEnabled() || !resend) {
      console.log('Email notifications disabled or not configured');
      return false;
    }

    try {
      const adminEmail = data.adminEmail || process.env.ADMIN_EMAIL || 'admin@company.com';

      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@company.com',
        to: [adminEmail],
        subject: `New Leave Application - ${data.employeeName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Leave Application</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Employee:</strong> ${data.employeeName}</p>
              <p><strong>Email:</strong> ${data.employeeEmail}</p>
              <p><strong>Leave Type:</strong> ${data.leaveType}</p>
              <p><strong>Start Date:</strong> ${data.startDate}</p>
              <p><strong>End Date:</strong> ${data.endDate}</p>
              <p><strong>Duration:</strong> ${data.days} day(s)</p>
              <p><strong>Reason:</strong> ${data.reason}</p>
            </div>
            <p>Please log in to the payroll system to approve or reject this application.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p>This is an automated notification from the Payroll Management System.</p>
            </div>
          </div>
        `,
      });

      console.log(`Leave application notification sent to admin for employee ${data.employeeName}`);
      return true;
    } catch (error) {
      console.error('Failed to send leave application notification:', error);
      return false;
    }
  }

  static async sendLeaveDecisionNotification(data: LeaveNotificationData): Promise<boolean> {
    if (!this.isEnabled() || !resend || !data.status) {
      console.log('Email notifications disabled, not configured, or no status provided');
      return false;
    }

    try {
      const statusColor = data.status === 'APPROVED' ? '#22c55e' : '#ef4444';
      const statusText = data.status === 'APPROVED' ? 'Approved' : 'Rejected';

      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@company.com',
        to: [data.employeeEmail],
        subject: `Leave Application ${statusText}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Leave Application ${statusText}</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>Hello ${data.employeeName},</p>
              <p>Your leave application has been <strong style="color: ${statusColor};">${statusText.toLowerCase()}</strong>.</p>
              
              <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 6px;">
                <p><strong>Leave Details:</strong></p>
                <p><strong>Type:</strong> ${data.leaveType}</p>
                <p><strong>Start Date:</strong> ${data.startDate}</p>
                <p><strong>End Date:</strong> ${data.endDate}</p>
                <p><strong>Duration:</strong> ${data.days} day(s)</p>
                <p><strong>Reason:</strong> ${data.reason}</p>
              </div>

              ${
                data.status === 'REJECTED' && data.rejectionReason
                  ? `<div style="margin: 20px 0; padding: 15px; background: #fee2e2; border-radius: 6px; border-left: 4px solid #ef4444;">
                  <p><strong>Rejection Reason:</strong></p>
                  <p>${data.rejectionReason}</p>
                </div>`
                  : ''
              }
            </div>
            
            <p>You can view your leave history and balance in the payroll system.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p>This is an automated notification from the Payroll Management System.</p>
            </div>
          </div>
        `,
      });

      console.log(`Leave decision notification sent to ${data.employeeName} - ${statusText}`);
      return true;
    } catch (error) {
      console.error('Failed to send leave decision notification:', error);
      return false;
    }
  }

  static async sendLeaveBalanceAlert(
    employeeName: string,
    employeeEmail: string,
    availableDays: number
  ): Promise<boolean> {
    if (!this.isEnabled() || !resend) {
      console.log('Email notifications disabled or not configured');
      return false;
    }

    // Only send alert if balance is low (less than 5 days)
    if (availableDays >= 5) {
      return false;
    }

    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@company.com',
        to: [employeeEmail],
        subject: 'Low Leave Balance Alert',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Leave Balance Alert</h2>
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p>Hello ${employeeName},</p>
              <p>Your leave balance is running low.</p>
              <p><strong>Available Leave Days:</strong> ${availableDays}</p>
              <p>Please plan your future leave applications accordingly.</p>
            </div>
            <p>You can check your detailed leave balance in the payroll system.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
              <p>This is an automated notification from the Payroll Management System.</p>
            </div>
          </div>
        `,
      });

      console.log(`Low balance alert sent to ${employeeName} - ${availableDays} days remaining`);
      return true;
    } catch (error) {
      console.error('Failed to send leave balance alert:', error);
      return false;
    }
  }
}
