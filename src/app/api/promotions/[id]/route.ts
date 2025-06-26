import { PrismaClient } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch single employee promotion by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const promotion = await prisma.employeePromotion.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            empId: true,
            firstName: true,
            lastName: true,
            officeEmail: true,
            currentDesignation: true,
          },
        },
      },
    });

    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('Error fetching promotion:', error);
    return NextResponse.json({ error: 'Failed to fetch promotion' }, { status: 500 });
  }
}

// PUT - Update employee promotion
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { empId, salary, revisionDate, currentPosition, previousPosition } = body;

    // Check if promotion exists
    const existingPromotion = await prisma.employeePromotion.findUnique({
      where: { id },
    });

    if (!existingPromotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    // Validate required fields
    if (!empId || !salary || !revisionDate || !currentPosition || !previousPosition) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { empId: empId },
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Validate salary is a positive number
    if (salary <= 0) {
      return NextResponse.json({ error: 'Salary must be a positive number' }, { status: 400 });
    }

    // Use a transaction to update promotion and possibly employee data
    const result = await prisma.$transaction(async tx => {
      // Update the promotion record
      const updatedPromotion = await tx.employeePromotion.update({
        where: { id },
        data: {
          empId,
          salary: parseFloat(salary),
          revisionDate: new Date(revisionDate),
          currentPosition,
          previousPosition,
        },
        include: {
          employee: {
            select: {
              empId: true,
              firstName: true,
              lastName: true,
              officeEmail: true,
              currentDesignation: true,
            },
          },
        },
      });

      // Check if this is the most recent promotion for this employee
      const mostRecentPromotion = await tx.employeePromotion.findFirst({
        where: { empId: empId },
        orderBy: { revisionDate: 'desc' },
      });

      // If this is the most recent promotion, update employee's current data
      if (mostRecentPromotion && mostRecentPromotion.id === id) {
        await tx.employee.update({
          where: { empId: empId },
          data: {
            salary: parseFloat(salary),
            currentDesignation: currentPosition,
            updatedAt: new Date(),
          },
        });
      }

      return updatedPromotion;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating promotion:', error);
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 });
  }
}

// DELETE - Delete employee promotion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if promotion exists and get its details
    const existingPromotion = await prisma.employeePromotion.findUnique({
      where: { id },
    });

    if (!existingPromotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    // Use a transaction to delete promotion and update employee data if necessary
    await prisma.$transaction(async tx => {
      // Check if this is the most recent promotion before deletion
      const mostRecentPromotion = await tx.employeePromotion.findFirst({
        where: { empId: existingPromotion.empId },
        orderBy: { revisionDate: 'desc' },
      });

      const isLatestPromotion = mostRecentPromotion && mostRecentPromotion.id === id;

      // Delete the promotion
      await tx.employeePromotion.delete({
        where: { id },
      });

      // If this was the most recent promotion, update employee to previous promotion or base salary
      if (isLatestPromotion) {
        // Find the new most recent promotion after deletion
        const newMostRecentPromotion = await tx.employeePromotion.findFirst({
          where: { empId: existingPromotion.empId },
          orderBy: { revisionDate: 'desc' },
        });

        if (newMostRecentPromotion) {
          // Update employee to match the new most recent promotion
          await tx.employee.update({
            where: { empId: existingPromotion.empId },
            data: {
              salary: newMostRecentPromotion.salary,
              currentDesignation: newMostRecentPromotion.currentPosition,
              updatedAt: new Date(),
            },
          });
        } else {
          // No promotions left, you might want to set to base salary/designation
          // For now, we'll keep the current values but update the timestamp
          await tx.employee.update({
            where: { empId: existingPromotion.empId },
            data: {
              updatedAt: new Date(),
            },
          });
        }
      }
    });

    return NextResponse.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 });
  }
}
