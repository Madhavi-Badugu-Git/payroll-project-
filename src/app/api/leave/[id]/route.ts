import { EmailService } from '@/lib/emailService';
import { LeaveManagementService } from '@/lib/leaveManagement';
import { logDebug, logError, logInfo } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/leave/[id] - Admin approves/rejects OR User edits their own leave application
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, sessionClaims } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const requestBody = await req.json();

    logDebug('PUT request received', {
      userId,
      requestBody,
      sessionClaims: sessionClaims?.publicMetadata,
    });

    // Check if this is an admin approval/rejection request
    const isAdmin = (sessionClaims?.publicMetadata as { role?: string[] })?.role?.includes('admin');
    const isAdminAction =
      requestBody.status &&
      (requestBody.status === 'APPROVED' || requestBody.status === 'REJECTED');

    logDebug('Admin check', { isAdmin, isAdminAction, status: requestBody.status });

    if (isAdminAction) {
      // Admin approval/rejection logic
      // TEMPORARY: Allow any authenticated user to perform admin actions for testing
      // TODO: Set up proper admin roles in Clerk
      const tempAdminAccess = true; // Change this to false and set up proper admin roles

      if (!isAdmin && !tempAdminAccess) {
        logDebug('Admin check failed', {
          userId,
          sessionClaims: sessionClaims?.publicMetadata,
          isAdmin,
          requestBody,
        });
        return NextResponse.json(
          {
            error: 'Unauthorized - Admin role required',
            debug: {
              hasPublicMetadata: !!sessionClaims?.publicMetadata,
              publicMetadata: sessionClaims?.publicMetadata,
              isAdmin,
              userId,
            },
          },
          { status: 403 }
        );
      }

      const { status } = requestBody;
      const leave = await prisma.leaveApplication.findUnique({ where: { id } });
      if (!leave) {
        logDebug(`Leave application not found for id: ${id}`);
        return NextResponse.json({ error: 'Leave application not found' }, { status: 404 });
      }

      const updatedLeave = await prisma.leaveApplication.update({
        where: { id },
        data: {
          status,
          reviewedAt: new Date(),
          reviewedBy: userId, // Clerk user ID of the admin
        },
      });

      logInfo(`Leave application ${status.toLowerCase()} by admin`, {
        leaveId: id,
        status,
        reviewedBy: userId,
        employeeId: leave.employeeId,
        leaveType: leave.leaveType,
      });

      // If approved, update attendance records and deduct leave balance
      if (status === 'APPROVED') {
        const { employeeId, startDate, endDate } = leave;

        // Calculate number of leave days
        const leaveDays =
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;

        // Get employee details to find empId
        const employee = await prisma.employee.findUnique({
          where: { id: employeeId },
          select: { empId: true },
        });

        if (employee) {
          // Try to deduct leaves from balance
          const deductionSuccess = await LeaveManagementService.deductLeaves(
            employee.empId,
            id,
            leaveDays
          );

          if (!deductionSuccess) {
            logError(`Insufficient leave balance for employee ${employee.empId}`, {
              leaveId: id,
              requiredDays: leaveDays,
              employeeId: employee.empId,
            });

            return NextResponse.json(
              {
                error: 'Insufficient leave balance. Cannot approve this leave application.',
              },
              { status: 400 }
            );
          }

          logInfo(`Leave balance deducted successfully`, {
            leaveId: id,
            empId: employee.empId,
            daysDeducted: leaveDays,
          });
        }

        const datesToUpdate = [];
        const currentDate = new Date(startDate);
        // Loop through the dates of the leave period
        while (currentDate <= endDate) {
          datesToUpdate.push(new Date(currentDate.toISOString().split('T')[0]));
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Use a transaction to update all attendance records at once
        const updatePromises = datesToUpdate.map(date => {
          return prisma.attendance.upsert({
            where: {
              employeeId_date: {
                employeeId: employeeId,
                date: date,
              },
            },
            update: {
              status: 'Leave',
              checkIn: null,
              checkOut: null,
              totalHours: 0,
              overtimeHours: 0,
            },
            create: {
              employeeId: employeeId,
              date: date,
              status: 'Leave',
            },
          });
        });

        await prisma.$transaction(updatePromises);
      }

      // If rejected or cancelled, credit back leaves if they were previously deducted
      if (status === 'REJECTED' && leave.status === 'APPROVED') {
        const { employeeId, startDate, endDate } = leave;
        const leaveDays =
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;

        // Get employee details to find empId
        const employee = await prisma.employee.findUnique({
          where: { id: employeeId },
          select: { empId: true },
        });

        if (employee) {
          await LeaveManagementService.creditLeaves(employee.empId, id, leaveDays);
          logInfo(`Leave balance credited back`, {
            leaveId: id,
            empId: employee.empId,
            daysCredited: leaveDays,
          });
        }
      }

      // Send email notification to employee about the decision
      const employee = await prisma.employee.findUnique({
        where: { id: leave.employeeId },
        include: { user: true },
      });

      if (employee && employee.user?.email) {
        const leaveDays =
          Math.ceil(
            (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1;

        EmailService.sendLeaveDecisionNotification({
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeEmail: employee.user.email,
          leaveType: leave.leaveType,
          startDate: leave.startDate.toLocaleDateString(),
          endDate: leave.endDate.toLocaleDateString(),
          days: leaveDays,
          reason: leave.reason,
          status: status as 'APPROVED' | 'REJECTED',
          rejectionReason: requestBody.rejectionReason || undefined,
        }).catch(error => {
          logError('Failed to send leave decision email notification', error);
        });
      }

      return NextResponse.json(updatedLeave);
    } else {
      // User editing their own leave application
      const { startDate, endDate, leaveType, reason } = requestBody;

      if (!startDate || !endDate || !leaveType || !reason) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Find the user by Clerk ID, then get their employee record
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: { employee: true },
      });

      if (!user || !user.employee) {
        return NextResponse.json({ error: 'Employee profile not found.' }, { status: 404 });
      }

      // Find the leave application
      const leave = await prisma.leaveApplication.findUnique({
        where: { id },
        include: { employee: true },
      });

      if (!leave) {
        return NextResponse.json({ error: 'Leave application not found' }, { status: 404 });
      }

      // Check if the leave belongs to the authenticated user
      if (leave.employeeId !== user.employee.id) {
        return NextResponse.json(
          { error: 'Unauthorized to edit this leave application' },
          { status: 403 }
        );
      }

      // Check if the leave is still pending
      if (leave.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'Can only edit pending leave applications' },
          { status: 400 }
        );
      }

      // Check if the leave hasn't started yet
      const today = new Date();
      const leaveStartDate = new Date(leave.startDate);
      if (leaveStartDate <= today) {
        return NextResponse.json(
          { error: 'Cannot edit leave that has already started' },
          { status: 400 }
        );
      }

      // Update the leave application
      const updatedLeave = await prisma.leaveApplication.update({
        where: { id },
        data: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          leaveType,
          reason,
        },
      });

      return NextResponse.json(updatedLeave);
    }
  } catch (error) {
    logError('Error updating leave', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/leave/[id] - User cancels their own leave application (only if pending)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (action !== 'cancel') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Find the user by Clerk ID, then get their employee record
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return NextResponse.json({ error: 'Employee profile not found.' }, { status: 404 });
    }

    // Find the leave application
    const leave = await prisma.leaveApplication.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!leave) {
      return NextResponse.json({ error: 'Leave application not found' }, { status: 404 });
    }

    // Check if the leave belongs to the authenticated user
    if (leave.employeeId !== user.employee.id) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this leave application' },
        { status: 403 }
      );
    }

    // Check if the leave is still pending
    if (leave.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only cancel pending leave applications' },
        { status: 400 }
      );
    }

    // Check if the leave hasn't started yet
    const today = new Date();
    const leaveStartDate = new Date(leave.startDate);
    if (leaveStartDate <= today) {
      return NextResponse.json(
        { error: 'Cannot cancel leave that has already started' },
        { status: 400 }
      );
    }

    // Update the leave status to cancelled
    const updatedLeave = await prisma.leaveApplication.update({
      where: { id },
      data: {
        status: 'Cancelled',
        reviewedAt: new Date(),
        reviewedBy: userId, // User cancelled their own leave
      },
    });

    return NextResponse.json(updatedLeave);
  } catch (error) {
    logError('Error cancelling leave', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/leave/[id] - User deletes their own leave application (only if pending)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find the user by Clerk ID, then get their employee record
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return NextResponse.json({ error: 'Employee profile not found.' }, { status: 404 });
    }

    // Find the leave application
    const leave = await prisma.leaveApplication.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!leave) {
      return NextResponse.json({ error: 'Leave application not found' }, { status: 404 });
    }

    // Check if the leave belongs to the authenticated user
    if (leave.employeeId !== user.employee.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this leave application' },
        { status: 403 }
      );
    }

    // Check if the leave is still pending
    if (leave.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only delete pending leave applications' },
        { status: 400 }
      );
    }

    // Check if the leave hasn't started yet
    const today = new Date();
    const leaveStartDate = new Date(leave.startDate);
    if (leaveStartDate <= today) {
      return NextResponse.json(
        { error: 'Cannot delete leave that has already started' },
        { status: 400 }
      );
    }

    // Delete the leave application
    await prisma.leaveApplication.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Leave application deleted successfully' });
  } catch (error) {
    logError('Error deleting leave', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
