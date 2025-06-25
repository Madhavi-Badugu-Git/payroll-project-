import { Prisma } from '@/generated/prisma';
import { logDebug, logError, logInfo } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/holidays - Fetches all holidays
export async function GET() {
  try {
    logDebug('Fetching all holidays');
    const holidays = await prisma.holiday.findMany({
      orderBy: {
        date: 'asc',
      },
    });
    logInfo(`Successfully fetched holidays`, { count: holidays.length });
    return NextResponse.json(holidays);
  } catch (error) {
    logError('Error fetching holidays', error);
    return NextResponse.json({ error: 'Failed to fetch holidays' }, { status: 500 });
  }
}

// POST /api/holidays - Creates a new holiday
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, date } = body;

    if (!name || !date) {
      logDebug('Missing required fields for holiday creation', { name, date });
      return NextResponse.json({ error: 'Missing required fields (name, date)' }, { status: 400 });
    }

    const holidayDate = new Date(date);
    logDebug('Creating new holiday', { name, date: holidayDate });

    // Optional: Check if holiday on this date already exists
    const existingHoliday = await prisma.holiday.findFirst({
      where: { date: holidayDate },
    });
    if (existingHoliday) {
      logDebug(`Holiday already exists on date ${date}`, { existingHoliday: existingHoliday.name });
      return NextResponse.json({ error: 'A holiday on this date already exists' }, { status: 409 });
    }

    const newHoliday = await prisma.holiday.create({
      data: {
        name,
        date: holidayDate,
      },
    });

    logInfo('Holiday created successfully', {
      id: newHoliday.id,
      name: newHoliday.name,
      date: newHoliday.date,
    });

    return NextResponse.json(newHoliday, { status: 201 });
  } catch (error) {
    logError('Error creating holiday', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors, e.g., unique constraints if added to model
      return NextResponse.json(
        { error: `Database error: ${error.message}`, code: error.code },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to create holiday' }, { status: 500 });
  }
}
