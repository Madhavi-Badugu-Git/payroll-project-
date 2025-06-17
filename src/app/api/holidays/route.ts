
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

// GET /api/holidays - Fetches all holidays
export async function GET() {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: {
        date: 'asc',
      },
    });
    return NextResponse.json(holidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    return NextResponse.json({ error: 'Failed to fetch holidays' }, { status: 500 });
  }
}

// POST /api/holidays - Creates a new holiday
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, date } = body;

    if (!name || !date) {
      return NextResponse.json({ error: 'Missing required fields (name, date)' }, { status: 400 });
    }

    const holidayDate = new Date(date);

    // Optional: Check if holiday on this date already exists
    const existingHoliday = await prisma.holiday.findFirst({
        where: { date: holidayDate }
    });
    if (existingHoliday) {
        return NextResponse.json({ error: 'A holiday on this date already exists'}, { status: 409 });
    }

    const newHoliday = await prisma.holiday.create({
      data: {
        name,
        date: holidayDate,
      },
    });
    return NextResponse.json(newHoliday, { status: 201 });
  } catch (error) {
    console.error('Error creating holiday:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors, e.g., unique constraints if added to model
        return NextResponse.json({ error: `Database error: ${error.message}`, code: error.code }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create holiday' }, { status: 500 });
  }
}
