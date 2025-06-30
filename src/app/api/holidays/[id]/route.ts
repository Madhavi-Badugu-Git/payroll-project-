import { Prisma } from '@/generated/prisma';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

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
      return NextResponse.json({ error: 'Missing required fields (name, date)' }, { status: 400 });
    }

    const holidayDate = new Date(date);

    // Optional: Check if holiday on this date already exists
    const existingHoliday = await prisma.holiday.findFirst({
      where: { date: holidayDate },
    });
    if (existingHoliday) {
      return NextResponse.json({ error: 'A holiday on this date already exists' }, { status: 409 });
    }

    const newHoliday = await prisma.holiday.create({
      data: {
        name,
        date: holidayDate,
      },
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

// PUT /api/holidays/:id - Updates an existing holiday
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: holidayId } = await params;
  if (!holidayId) {
    return NextResponse.json({ error: 'Holiday ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, date } = body;

    if (!name && !date) {
      return NextResponse.json(
        { error: 'Nothing to update. Provide name or date.' },
        { status: 400 }
      );
    }

    const dataToUpdate: Prisma.HolidayUpdateInput = {};
    if (name) dataToUpdate.name = name;
    if (date) dataToUpdate.date = new Date(date);

    // Optional: Check if updating to a date that already has another holiday
    if (date) {
      const newDate = new Date(date);
      const existingHolidayOnNewDate = await prisma.holiday.findFirst({
        where: {
          date: newDate,
          id: { not: holidayId }, // Exclude the current holiday being updated
        },
      });
      if (existingHolidayOnNewDate) {
        return NextResponse.json(
          { error: 'Another holiday already exists on this date' },
          { status: 409 }
        );
      }
    }

    const updatedHoliday = await prisma.holiday.update({
      where: { id: holidayId },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedHoliday);
  } catch (error) {
    logError('Error updating holiday ${holidayId}', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record to update not found
        return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: `Database error: ${error.message}`, code: error.code },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to update holiday' }, { status: 500 });
  }
}

// DELETE /api/holidays/:id - Deletes a holiday
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: holidayId } = await params;
  if (!holidayId) {
    return NextResponse.json({ error: 'Holiday ID is required' }, { status: 400 });
  }

  try {
    await prisma.holiday.delete({
      where: { id: holidayId },
    });
    return NextResponse.json({ message: 'Holiday deleted successfully' }, { status: 200 }); // Or 204 No Content
  } catch (error) {
    logError('Error deleting holiday ${holidayId}', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record to delete not found
        return NextResponse.json({ error: 'Holiday not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: `Database error: ${error.message}`, code: error.code },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to delete holiday' }, { status: 500 });
  }
}
