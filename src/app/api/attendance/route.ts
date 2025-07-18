import { Prisma } from '@/generated/prisma';
import { authOptions } from '@/lib/auth/config';
import { calculateHours, calculateOvertimeHours, getAttendanceStatus } from '@/lib/dateUtils';
import { logDebug, logError, logInfo } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/attendance - Fetches attendance records for the logged-in user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get('employeeId');
  const month = searchParams.get('month'); // e.g., '10' for October
  const year = searchParams.get('year'); // e.g., '2023'

  if (!employeeId || !month || !year) {
    return NextResponse.json(
      { error: 'employeeId, month, and year query parameters are required' },
      { status: 400 }
    );
  }

  try {
    const monthInt = parseInt(month, 10);
    const yearInt = parseInt(year, 10);

    if (isNaN(monthInt) || isNaN(yearInt) || monthInt < 1 || monthInt > 12) {
      return NextResponse.json({ error: 'Invalid month or year provided' }, { status: 400 });
    }

    const startDate = new Date(Date.UTC(yearInt, monthInt - 1, 1));
    const endDate = new Date(Date.UTC(yearInt, monthInt, 1));

    // 1. Fetch existing attendance records for the month
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        employeeId: employeeId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    // 2. Fetch holidays for the month
    const holidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    // 2b. Fetch leaves for the month
    const { getLeaveMap } = await import('./leaveUtils');
    const leaveMap = await getLeaveMap(employeeId, startDate, endDate);

    // 3. Create lookup maps
    // Use only the date part (YYYY-MM-DD) for all comparisons
    const attendanceMap = new Map(
      attendanceRecords.map(r => [new Date(r.date).toISOString().split('T')[0], r])
    );
    const holidayMap = new Map(
      holidays.map(h => [new Date(h.date).toISOString().split('T')[0], h.name])
    );

    // 4. Generate full month calendar
    const fullMonthAttendance = [];
    const daysInMonth = new Date(Date.UTC(yearInt, monthInt, 0)).getUTCDate(); // Use Date.UTC for consistency

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(Date.UTC(yearInt, monthInt - 1, day));
      const currentDateString = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getUTCDay(); // 0 for Sunday, 6 for Saturday

      // LEAVE LOGIC
      if (leaveMap.has(currentDateString)) {
        const leave = leaveMap.get(currentDateString)!;
        const status = leave.status === 'Pending' ? `Leave (Pending)` : 'Leave';
        fullMonthAttendance.push({
          id: `leave-${currentDateString}`,
          employeeId: employeeId,
          date: currentDate.toISOString(),
          checkIn: null,
          checkOut: null,
          status: status,
          totalHours: null,
          overtimeHours: null,
          leaveType: leave.leaveType,
        });
        continue;
      }

      if (attendanceMap.has(currentDateString)) {
        fullMonthAttendance.push(attendanceMap.get(currentDateString)!);
      } else {
        let status = 'Absent';
        const holidayName = holidayMap.get(currentDateString);

        // Check if the date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentDateLocal = new Date(currentDateString + 'T00:00:00');

        if (holidayName) {
          status = holidayName;
        } else if (dayOfWeek === 0) {
          // Sunday
          status = 'Weekend';
        } else if (dayOfWeek === 6) {
          // Saturday
          const dayOfMonth = currentDate.getUTCDate();
          const isFirstSaturday = dayOfMonth >= 1 && dayOfMonth <= 7;
          const isThirdSaturday = dayOfMonth >= 15 && dayOfMonth <= 21;
          if (!isFirstSaturday && !isThirdSaturday) {
            status = 'Weekend';
          }
        } else if (currentDateLocal > today) {
          status = 'Upcoming';
        }

        fullMonthAttendance.push({
          id: `placeholder-${currentDateString}`,
          employeeId: employeeId,
          date: currentDate.toISOString(),
          checkIn: null,
          checkOut: null,
          status: status,
          totalHours: null,
          overtimeHours: null,
        });
      }
    }

    return NextResponse.json(fullMonthAttendance);
  } catch (error) {
    logError('Error fetching attendance', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

// POST /api/attendance - Creates or updates an attendance record (check-in/check-out)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { employeeId, userId, date, type, time } = body;

    // Find the employee record
    let employee = null;

    if (employeeId) {
      // If employeeId is provided, use it as the primary key
      employee = await prisma.employee.findUnique({
        where: { id: employeeId },
      });
    }

    // If employee not found by id, try to find by session user email as fallback
    if (!employee) {
      employee = await prisma.employee.findUnique({
        where: { email: session.user.email! },
      });
    }

    // Final validation - make sure we have a valid employee
    if (!employee) {
      logError('Employee record not found', {
        providedEmployeeId: employeeId,
        providedUserId: userId,
        sessionUserEmail: session.user.email,
      });
      return NextResponse.json(
        {
          error:
            'Employee record not found. Please ensure your user account is linked to an employee record.',
        },
        { status: 404 }
      );
    }

    if (!date || !type || !time) {
      return NextResponse.json(
        { error: 'Missing required fields (date, type, time)' },
        { status: 400 }
      );
    }

    const attendanceDate = new Date(date);
    const actionTime = new Date(time);

    // Prevent action on non-working days
    const _dayOfWeek = attendanceDate.getUTCDay();
    const startOfDay = new Date(
      Date.UTC(
        attendanceDate.getUTCFullYear(),
        attendanceDate.getUTCMonth(),
        attendanceDate.getUTCDate()
      )
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);

    const _holiday = await prisma.holiday.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    // if (holiday) {
    //     return NextResponse.json({ error: `Cannot ${type} on a holiday: ${holiday.name}` }, { status: 400 });
    // }

    // if (dayOfWeek === 0) { // Sunday
    //     return NextResponse.json({ error: `Cannot ${type} on a Sunday.` }, { status: 400 });
    // }

    // if (dayOfWeek === 6) { // Saturday
    //     const dayOfMonth = attendanceDate.getUTCDate();
    //     const isFirstSaturday = dayOfMonth >= 1 && dayOfMonth <= 7;
    //     const isThirdSaturday = dayOfMonth >= 15 && dayOfMonth <= 21;
    //     if (!isFirstSaturday && !isThirdSaturday) {
    //         return NextResponse.json({ error: `Cannot ${type} on a non-working Saturday.` }, { status: 400 });
    //     }
    // }

    const existingRecord = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
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
        return NextResponse.json(
          { error: 'Cannot check out before checking in.' },
          { status: 400 }
        );
      }
      dataToUpdate.checkOut = actionTime;
    }

    // Use existing record's times if not being updated by current action
    const checkInTime =
      type === 'checkIn'
        ? actionTime
        : existingRecord?.checkIn
          ? new Date(existingRecord.checkIn)
          : null;
    const checkOutTime =
      type === 'checkOut'
        ? actionTime
        : existingRecord?.checkOut
          ? new Date(existingRecord.checkOut)
          : null;

    if (checkInTime && checkOutTime) {
      logDebug('Calculating hours for attendance', {
        checkInTime: checkInTime.toISOString(),
        checkOutTime: checkOutTime.toISOString(),
        employeeId: employee.id,
        date: attendanceDate.toISOString(),
      });

      if (checkOutTime < checkInTime) {
        // Handle invalid case: checkout time is before check-in time
        dataToUpdate.totalHours = 0;
        dataToUpdate.overtimeHours = 0;
        currentStatus = 'Error: Checkout before Checkin';
        logInfo('Invalid time range: checkout before checkin');
      } else {
        const totalHours = calculateHours(checkInTime, checkOutTime);
        dataToUpdate.totalHours = totalHours;
        dataToUpdate.overtimeHours = calculateOvertimeHours(totalHours);
        currentStatus = getAttendanceStatus(totalHours);

        logDebug('Calculated hours for attendance:', {
          data: {
            totalHours: dataToUpdate.totalHours,
            overtimeHours: dataToUpdate.overtimeHours,
            status: currentStatus,
          },
        });
      }
    } else if (checkInTime && !checkOutTime) {
      // Only check-in exists
      currentStatus = 'Present';
      dataToUpdate.totalHours = null; // No check-out to calculate total hours
      dataToUpdate.overtimeHours = null;
      logInfo('Only check-in exists, setting status to Present');
    } else if (!checkInTime && checkOutTime) {
      // Only check-out exists (unusual case - forgot to check-in)
      currentStatus = 'Absent'; // Or could be 'Missed Check-in'
      dataToUpdate.totalHours = null; // No check-in to calculate total hours
      dataToUpdate.overtimeHours = null;
      logInfo('Only check-out exists, setting status to Absent');
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
        employeeId: employee.id,
        date: attendanceDate,
        status: currentStatus, // Status determined by the logic above
        checkIn: type === 'checkIn' ? actionTime : null,
        checkOut: type === 'checkOut' ? actionTime : null,
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
    logError('Error processing attendance', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: `Database error: ${error.message}`, code: error.code },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to process attendance' }, { status: 500 });
  }
}
