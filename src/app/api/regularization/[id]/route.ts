import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

// PUT /api/regularization/[id] - Approve or reject a regularization request
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, sessionClaims } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user has an admin role
    const isAdmin = (sessionClaims?.publicMetadata as { role?: string[] })?.role?.includes('admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const { status } = await req.json();

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const regularization = await prisma.attendanceRegularization.findUnique({
      where: { id },
      include: { attendance: true },
    });

    if (!regularization) {
      return NextResponse.json({ error: 'Regularization request not found' }, { status: 404 });
    }

    // If approved, update the attendance record
    if (status === 'Approved') {
      await prisma.attendance.update({
        where: { id: regularization.attendanceId },
        data: {
          checkIn: regularization.requestedCheckIn,
          checkOut: regularization.requestedCheckOut,
          status: 'Present', // Or calculate based on hours
        },
      });
    }

    const updatedRegularization = await prisma.attendanceRegularization.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedRegularization);
  } catch (error) {
    console.error('Error updating regularization request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
