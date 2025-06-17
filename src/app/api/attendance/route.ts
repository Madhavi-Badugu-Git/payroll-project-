import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { Prisma } from '@/generated/prisma/client';

// GET /api/attendance - Fetches attendance records for the logged-in user
export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get('employeeId');

  if (!employeeId) {
    return NextResponse.json({ error: 'employeeId query parameter is required' }, { status: 400 });
  }

  try {
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        employeeId: employeeId,
      },
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

// POST /api/attendance - Creates or updates an attendance record (check-in/check-out)
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { employeeId, date, type, time } = body;

    if (!employeeId || !date || !type || !time) {
      return NextResponse.json({ error: 'Missing required fields (employeeId, date, type, time)' }, { status: 400 });
    }

    const attendanceDate = new Date(date);
    const actionTime = new Date(time);

    const existingRecord = await prisma.attendance.findFirst({
      where: {
        employeeId: employeeId,
        date: attendanceDate,
      },
    });

    const dataToUpdate: Prisma.AttendanceUpdateInput = {};
    let currentStatus = existingRecord?.status || 'Absent';

    if (type === 'checkIn') {
      // Only save the first check-in for the day
      if (existingRecord?.checkIn) {
        // Do not update check-in time, just return the existing record
        return NextResponse.json(existingRecord);
      }
      dataToUpdate.checkIn = actionTime;
      if (currentStatus === 'Absent' || (existingRecord?.checkIn && existingRecord?.checkOut)) {
        currentStatus = 'Present';
      }
    } else if (type === 'checkOut') {
      // Prevent check-out before check-in
      if (!existingRecord?.checkIn) {
        return NextResponse.json({ error: 'Cannot check out before checking in.' }, { status: 400 });
      }
      dataToUpdate.checkOut = actionTime;
    }

    // Use existing record's times if not being updated by current action
    const checkInTime = type === 'checkIn' ? actionTime : (existingRecord?.checkIn ? new Date(existingRecord.checkIn) : null);
    const checkOutTime = type === 'checkOut' ? actionTime : (existingRecord?.checkOut ? new Date(existingRecord.checkOut) : null);

    if (checkInTime && checkOutTime) {
      if (checkOutTime < checkInTime) {
        // Handle invalid case: checkout time is before check-in time
        dataToUpdate.totalHours = 0;
        dataToUpdate.overtimeHours = 0;
        currentStatus = 'Error: Checkout before Checkin'; // Or some other status indicating an issue
      } else {
        const diffMs = checkOutTime.getTime() - checkInTime.getTime();
        const totalHours = Math.max(0, diffMs / (1000 * 60 * 60));
        dataToUpdate.totalHours = parseFloat(totalHours.toFixed(2));
        dataToUpdate.overtimeHours = parseFloat(Math.max(0, totalHours - 8).toFixed(2));

        if (totalHours >= 8) {
          currentStatus = 'Present';
        } else if (totalHours >= 4) {
          currentStatus = 'Half Day';
        } else if (totalHours > 0) {
          currentStatus = 'Short Leave'; // Or 'Present' if any presence is 'Present'
        } else { // totalHours is 0 or negative (already handled if checkOutTime < checkInTime)
          currentStatus = 'Absent';
        }
      }
    } else if (checkInTime && !checkOutTime) {
      // Only check-in exists
      currentStatus = 'Present';
      // When updating, if totalHours was already set (e.g. from a previous erroneous checkout now being corrected by a new checkin), 
      // preserve it unless it should be reset. For now, we assume it should be nulled if checkout is not present.
      dataToUpdate.totalHours = existingRecord?.totalHours !== undefined ? existingRecord.totalHours : null; // Or simply null if a check-in alone shouldn't show hours
      dataToUpdate.overtimeHours = existingRecord?.overtimeHours !== undefined ? existingRecord.overtimeHours : null; // Same as above
    } else if (!checkInTime && checkOutTime) {
      // Only check-out exists (e.g. forgot to check-in)
      currentStatus = existingRecord?.status || 'Absent'; // Or a specific status like 'Missed Check-in'
      dataToUpdate.totalHours = null; // No check-in to calculate total hours
      dataToUpdate.overtimeHours = null;
    }
    // If neither checkInTime nor checkOutTime (e.g. manual status update in future), status remains as initialized.

    dataToUpdate.status = currentStatus;

    let updatedRecord;

    if (existingRecord) {
      updatedRecord = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: dataToUpdate,
      });
    } else {
      // Creating a new record
      const dataToCreate: Prisma.AttendanceCreateInput = {
        employeeId,
        date: attendanceDate,
        status: currentStatus, // Status determined by the logic above
        checkIn: (type === 'checkIn') ? actionTime : null,
        checkOut: (type === 'checkOut') ? actionTime : null,
        // For a new record created by a single check-in or check-out event,
        // total and overtime hours are not yet determined. They will be null.
        totalHours: null,
        overtimeHours: null,
      };
      updatedRecord = await prisma.attendance.create({
        data: dataToCreate,
      });
    }

    return NextResponse.json(updatedRecord);

  } catch (error) {
    console.error('Error processing attendance:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: `Database error: ${error.message}`, code: error.code }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to process attendance' }, { status: 500 });
  }
}
