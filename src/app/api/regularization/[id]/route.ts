import { calculateHours, calculateOvertimeHours, getAttendanceStatus } from '@/lib/dateUtils';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/regularization/[id] - Approve or reject a regularization request
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleRegularizationUpdate(req, { params });
}

// PATCH /api/regularization/[id] - Approve or reject a regularization request (alternative method)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleRegularizationUpdate(req, { params });
}

async function handleRegularizationUpdate(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, sessionClaims: _sessionClaims } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if the user has an admin role
    // const isAdmin = (sessionClaims?.publicMetadata as { role?: string[] })?.role?.includes('admin');
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const {
      status,
      approvedBy: _approvedBy,
      approvedDate: _approvedDate,
      rejectionReason: _rejectionReason,
    } = await req.json();

    // Normalize status to title case and validate
    const normalizedStatus =
      status?.toUpperCase() === 'APPROVED'
        ? 'Approved'
        : status?.toUpperCase() === 'REJECTED'
          ? 'Rejected'
          : status;

    if (!normalizedStatus || !['Approved', 'Rejected'].includes(normalizedStatus)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "Approved" or "Rejected"' },
        { status: 400 }
      );
    }

    const regularization = await prisma.attendanceRegularization.findUnique({
      where: { id },
      include: { attendance: true },
    });

    if (!regularization) {
      return NextResponse.json({ error: 'Regularization request not found' }, { status: 404 });
    }

    // If approved, update the attendance record
    if (normalizedStatus === 'Approved') {
      // Calculate total hours and overtime hours from the requested times
      let totalHours = null;
      let overtimeHours = null;
      let attendanceStatus = 'Present';

      console.log('Processing regularization approval:', {
        requestedCheckIn: regularization.requestedCheckIn,
        requestedCheckOut: regularization.requestedCheckOut,
        attendanceId: regularization.attendanceId,
      });

      if (regularization.requestedCheckIn && regularization.requestedCheckOut) {
        const checkInTime = new Date(regularization.requestedCheckIn);
        const checkOutTime = new Date(regularization.requestedCheckOut);

        if (checkOutTime < checkInTime) {
          // Handle invalid case: checkout time is before check-in time
          totalHours = 0;
          overtimeHours = 0;
          attendanceStatus = 'Error: Checkout before Checkin';
          console.log('Invalid time range: checkout before checkin');
        } else {
          totalHours = calculateHours(checkInTime, checkOutTime);
          overtimeHours = calculateOvertimeHours(totalHours);
          attendanceStatus = getAttendanceStatus(totalHours);

          console.log('Calculated hours:', {
            totalHours,
            overtimeHours,
            attendanceStatus,
          });
        }
      } else if (regularization.requestedCheckIn && !regularization.requestedCheckOut) {
        // Only check-in requested
        attendanceStatus = 'Present';
        totalHours = null;
        overtimeHours = null;
        console.log('Only check-in requested, setting status to Present');
      } else if (!regularization.requestedCheckIn && regularization.requestedCheckOut) {
        // Only check-out requested (unusual case)
        attendanceStatus = 'Absent';
        totalHours = null;
        overtimeHours = null;
        console.log('Only check-out requested, setting status to Absent');
      }

      const updatedAttendance = await prisma.attendance.update({
        where: { id: regularization.attendanceId },
        data: {
          checkIn: regularization.requestedCheckIn,
          checkOut: regularization.requestedCheckOut,
          totalHours,
          overtimeHours,
          status: attendanceStatus,
        },
      });

      console.log('Updated attendance record:', updatedAttendance);
    }

    const updatedRegularization = await prisma.attendanceRegularization.update({
      where: { id },
      data: { status: normalizedStatus },
    });

    return NextResponse.json(updatedRegularization);
  } catch (error) {
    console.error('Error updating regularization request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
