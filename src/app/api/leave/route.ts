import { PrismaClient } from '@/generated/prisma';
import { authOptions } from '@/lib/auth/config';
import { logError } from '@/lib/logger';
import { getEmployeeIdFromUser } from '@/lib/userutils';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get empId from URL search params or session
    const { searchParams } = new URL(req.url);
    let empId = searchParams.get('empId') || searchParams.get('employeeId');

    if (!empId) {
      // Fallback to getting empId from session user
      empId = getEmployeeIdFromUser(session.user);
    }

    if (!empId) {
      return NextResponse.json({ error: 'Employee ID not found' }, { status: 404 });
    }

    // Find employee by empId
    const employee = await prisma.employee.findUnique({
      where: { empId },
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
    const { startDate, endDate, leaveType, reason, empId: bodyEmpId, employeeId } = body;

    // Get empId from request body or session
    let empId = bodyEmpId || employeeId;

    if (!empId) {
      // Fallback to getting empId from session user
      empId = getEmployeeIdFromUser(session.user);
    }

    if (!empId) {
      return NextResponse.json({ error: 'Employee ID not found' }, { status: 404 });
    }

    // Find employee by empId
    const employee = await prisma.employee.findUnique({
      where: { empId },
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
