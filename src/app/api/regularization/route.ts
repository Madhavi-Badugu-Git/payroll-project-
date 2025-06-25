import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/regularization - Submit a new regularization request
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attendanceId, date, reason, requestedCheckIn, requestedCheckOut } = await req.json();

    if (!attendanceId || !date || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }

    // Check if a regularization request already exists for this attendance record
    const existingRequest = await prisma.attendanceRegularization.findFirst({
      where: { attendanceId: attendanceId },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'A regularization request for this date already exists.' },
        { status: 409 }
      );
    }

    const newRegularization = await prisma.attendanceRegularization.create({
      data: {
        attendanceId,
        employeeId: attendance.employeeId,
        date,
        reason,
        requestedCheckIn: requestedCheckIn ? new Date(requestedCheckIn) : null,
        requestedCheckOut: requestedCheckOut ? new Date(requestedCheckOut) : null,
        status: 'Pending',
      },
    });

    return NextResponse.json(newRegularization, { status: 201 });
  } catch (error) {
    console.error('Error creating regularization request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET /api/regularization - Get all regularization requests (for admins)
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user has an admin role from Clerk's public metadata
    // const isAdmin = (sessionClaims?.publicMetadata as { role?: string[] })?.role?.includes('admin');

    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Forbidden: User does not have admin privileges.' }, { status: 403 });
    // }

    const regularizations = await prisma.attendanceRegularization.findMany({
      include: {
        attendance: true, // Include related attendance details
        employee: {
          select: {
            name: true,
            empId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(regularizations);
  } catch (error) {
    console.error('Error fetching regularization requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
