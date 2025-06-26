import { PrismaClient } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch all employee promotions with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const empId = searchParams.get('empId') || '';

    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};

    if (empId) {
      whereClause.empId = empId;
    }

    if (search) {
      whereClause.OR = [
        { currentPosition: { contains: search, mode: 'insensitive' as const } },
        { previousPosition: { contains: search, mode: 'insensitive' as const } },
        {
          employee: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' as const } },
              { lastName: { contains: search, mode: 'insensitive' as const } },
              { empId: { contains: search, mode: 'insensitive' as const } },
            ],
          },
        },
      ];
    }

    const promotions = await prisma.employeePromotion.findMany({
      skip,
      take: limit,
      where: whereClause,
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
      orderBy: {
        revisionDate: 'desc',
      },
    });

    const totalCount = await prisma.employeePromotion.count({
      where: whereClause,
    });

    return NextResponse.json({ promotions, totalCount });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
  }
}

// POST - Create new employee promotion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empId, salary, revisionDate, currentPosition, previousPosition } = body;

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

    // Use a transaction to create promotion AND update employee's current salary/designation
    const result = await prisma.$transaction(async tx => {
      // Create the promotion record
      const promotion = await tx.employeePromotion.create({
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

      // Update employee's current salary and designation to match the promotion
      await tx.employee.update({
        where: { empId: empId },
        data: {
          salary: parseFloat(salary),
          currentDesignation: currentPosition,
          updatedAt: new Date(),
        },
      });

      return promotion;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}
