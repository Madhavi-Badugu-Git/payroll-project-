import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { logError, logInfo, logDebug } from '@/lib/logger';

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
