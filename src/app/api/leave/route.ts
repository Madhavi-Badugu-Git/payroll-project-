import { EmailService } from '@/lib/emailService';
import { LeaveManagementService } from '@/lib/leaveManagement';
import { logDebug, logError, logInfo } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/leave - Employee applies for leave
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      logDebug('Unauthorized leave application attempt - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startDate, endDate, leaveType, reason } = await req.json();
    if (!startDate || !endDate || !leaveType || !reason) {
      logDebug(`Missing required fields for leave application from user ${userId}`, {
        startDate,
        endDate,
        leaveType,
        reason,
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    logDebug(`Leave application attempt by user ${userId}`, {
      startDate,
      endDate,
      leaveType,
      reason,
    });

    // Find the user by Clerk ID, then get their employee record
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      logError(`Employee profile not found for user ${userId}`);
      return NextResponse.json(
        {
          error:
            'Employee profile not found. Please contact admin to set up your employee profile.',
        },
        { status: 404 }
      );
    }

    // Calculate the number of leave days requested
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates

    logDebug(`Leave days calculation`, {
      startDate,
      endDate,
      daysDiff,
      empId: user.employee.empId,
    });

    // Check if employee has sufficient leave balance
    try {
      const leaveInfo = await LeaveManagementService.getEmployeeLeaveInfo(user.employee.empId);

      if (!leaveInfo.balance) {
        logDebug(
          `No leave balance found for employee ${user.employee.empId}. Proceeding with application.`
        );
      } else if (leaveInfo.balance.totalAvailable < daysDiff) {
        logDebug(`Insufficient leave balance for employee ${user.employee.empId}`, {
          requested: daysDiff,
          available: leaveInfo.balance.totalAvailable,
        });
        return NextResponse.json(
          {
            error: `Insufficient leave balance. You have ${leaveInfo.balance.totalAvailable} days available, but requested ${daysDiff} days.`,
            balance: {
              available: leaveInfo.balance.totalAvailable,
              requested: daysDiff,
            },
          },
          { status: 400 }
        );
      }

      logInfo(`Leave balance check passed for employee ${user.employee.empId}`, {
        requested: daysDiff,
        available: leaveInfo.balance?.totalAvailable || 0,
      });
    } catch (balanceError) {
      logError(`Error checking leave balance for employee ${user.employee.empId}`, balanceError);
      // Continue with application creation but log the error
      // This ensures the system doesn't break if balance checking fails
    }

    const newLeave = await prisma.leaveApplication.create({
      data: {
        employeeId: user.employee.id, // Use the Employee's database ID
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        leaveType,
        reason,
        status: 'PENDING',
      },
    });

    logInfo(`Leave application created successfully`, {
      leaveId: newLeave.id,
      employeeId: user.employee.id,
      empId: user.employee.empId,
      leaveType,
      startDate,
      endDate,
    });

    // Send email notification to admin (async, don't wait for completion)
    EmailService.sendLeaveApplicationNotification({
      employeeName: `${user.employee.firstName} ${user.employee.lastName}`,
      employeeEmail: user.email || '',
      leaveType,
      startDate,
      endDate,
      days: daysDiff,
      reason,
    }).catch(error => {
      logError('Failed to send leave application email notification', error);
    });

    return NextResponse.json(newLeave, { status: 201 });
  } catch (error) {
    logError('Error applying for leave', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET /api/leave - List leave applications for the logged-in user (or all for admin)
export async function GET(req: NextRequest) {
  try {
    const { userId, sessionClaims } = getAuth(req);
    if (!userId) {
      logDebug('Unauthorized leave fetch attempt - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = (sessionClaims?.publicMetadata as { role?: string[] })?.role?.includes('admin');
    // TEMPORARY: Allow any authenticated user to access admin features for testing
    const tempAdminAccess = true; // TODO: Set up proper admin roles and change this to false
    let leaves;

    logDebug(`Fetching leaves for user ${userId}`, { isAdmin, tempAdminAccess });

    if (isAdmin || tempAdminAccess) {
      leaves = await prisma.leaveApplication.findMany({
        orderBy: { appliedAt: 'desc' },
        include: { employee: true },
      });
      logInfo(`Admin fetched all leaves`, { userId, totalLeaves: leaves.length });
    } else {
      // Find the user by Clerk ID, then get their employee record
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { employee: true },
      });

      if (!user || !user.employee) {
        logError(`Employee profile not found for user ${userId} during leave fetch`);
        return NextResponse.json({ error: 'Employee profile not found.' }, { status: 404 });
      }

      leaves = await prisma.leaveApplication.findMany({
        where: { employeeId: user.employee.id }, // Use the Employee's database ID
        orderBy: { appliedAt: 'desc' },
        include: { employee: true },
      });
      logInfo(`User fetched their leaves`, {
        userId,
        employeeId: user.employee.id,
        totalLeaves: leaves.length,
      });
    }

    return NextResponse.json(leaves);
  } catch (error) {
    logError('Error fetching leaves', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
