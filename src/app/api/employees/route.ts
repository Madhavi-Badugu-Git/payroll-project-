import { PrismaClient } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch all employees with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { empId: { contains: search, mode: 'insensitive' as const } },
            { designation: { contains: search, mode: 'insensitive' as const } },
            { status: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const employees = await prisma.employee.findMany({
      skip,
      take: limit,
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalCount = await prisma.employee.count({
      where: whereClause,
    });

    return NextResponse.json({ employees, totalCount });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

// POST - Create new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empId, name, email, phoneNo, designation, joiningDate, status } = body;

    // Validate required fields
    if (!empId || !name || !email || !phoneNo || !designation || !joiningDate || !status) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if empId or email already exists
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [{ empId: empId }, { email: email }],
      },
    });

    if (existingEmployee) {
      return NextResponse.json({ error: 'Employee ID or email already exists' }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        empId,
        name,
        email,
        phoneNo,
        designation,
        joiningDate: new Date(joiningDate),
        status,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
