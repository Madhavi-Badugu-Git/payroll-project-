import { PrismaClient } from '@/generated/prisma';
import { authOptions } from '@/lib/auth/config';
import { logError } from '@/lib/logger';
import { getEmployeeNumberFromUser } from '@/lib/userutils';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get employeeNumber from URL search params or session
    const { searchParams } = new URL(req.url);
    let employeeNumber =
      searchParams.get('employeeNumber') ||
      searchParams.get('empId') ||
      searchParams.get('employeeId');

    logError('Leave API Debug Info', {
      employeeNumberFromParams: employeeNumber,
      sessionUser: session.user,
      searchParams: Object.fromEntries(searchParams.entries()),
    });

    if (!employeeNumber) {
      // Fallback to getting employeeNumber from session user
      employeeNumber = getEmployeeNumberFromUser(session.user);
      logError('Fallback employeeNumber from session', {
        employeeNumberFromSession: employeeNumber,
      });
    }

    if (!employeeNumber) {
      logError('No employeeNumber found anywhere', {
        employeeNumberFromParams: searchParams.get('employeeNumber'),
        employeeNumberFromSession: getEmployeeNumberFromUser(session.user),
        sessionUserEmail: session.user?.email,
      });
      return NextResponse.json({ error: 'Employee ID not found' }, { status: 404 });
    }

    // Find employee by employeeNumber
    const employee = await prisma.employee.findUnique({
      where: { employeeNumber },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Fetch leave applications for this employee
    const leaveApplications = await prisma.leaveApplication.findMany({
      where: { employeeId: employee.id },
      orderBy: { appliedAt: 'desc' },
    });

    // Transform data to match the expected format
    const transformedLeaves = leaveApplications.map(leave => ({
      id: leave.id,
      employeeId: leave.employeeId,
      startDate: leave.startDate.toISOString(),
      endDate: leave.endDate.toISOString(),
      leaveType: leave.leaveType,
      reason: leave.reason,
      status: leave.status,
      appliedAt: leave.appliedAt.toISOString(),
      reviewedAt: leave.reviewedAt?.toISOString() || null,
      reviewedBy: leave.reviewedBy || null,
    }));

    return NextResponse.json(transformedLeaves);
  } catch (error) {
    logError('Error fetching leaves', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      startDate,
      endDate,
      leaveType,
      reason,
      employeeNumber: bodyEmployeeNumber,
      empId: bodyEmpId,
      employeeId,
    } = body;

    // Get employeeNumber from request body or session (support legacy field names for backward compatibility)
    let employeeNumber = bodyEmployeeNumber || bodyEmpId || employeeId;

    if (!employeeNumber) {
      // Fallback to getting employeeNumber from session user
      employeeNumber = getEmployeeNumberFromUser(session.user);
    }

    if (!employeeNumber) {
      return NextResponse.json({ error: 'Employee ID not found' }, { status: 404 });
    }

    // Find employee by employeeNumber
    const employee = await prisma.employee.findUnique({
      where: { employeeNumber },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Validation
    if (!startDate || !endDate || !leaveType || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create leave application
    const leaveApplication = await prisma.leaveApplication.create({
      data: {
        employeeId: employee.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        leaveType,
        reason,
        status: 'PENDING',
      },
    });

    // Transform data to match the expected format
    const transformedLeave = {
      id: leaveApplication.id,
      employeeId: leaveApplication.employeeId,
      startDate: leaveApplication.startDate.toISOString(),
      endDate: leaveApplication.endDate.toISOString(),
      leaveType: leaveApplication.leaveType,
      reason: leaveApplication.reason,
      status: leaveApplication.status,
      appliedAt: leaveApplication.appliedAt.toISOString(),
      reviewedAt: leaveApplication.reviewedAt?.toISOString() || null,
      reviewedBy: leaveApplication.reviewedBy || null,
    };

    return NextResponse.json(transformedLeave, { status: 201 });
  } catch (error) {
    logError('Error creating leave application', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
