import { PrismaClient } from '@/generated/prisma';
import { generateEmployeeId } from '@/lib/employeeUtils';
import { LeaveManagementService } from '@/lib/leaveManagement';
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
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { officeEmail: { contains: search, mode: 'insensitive' as const } },
            { empId: { contains: search, mode: 'insensitive' as const } },
            { currentDesignation: { contains: search, mode: 'insensitive' as const } },
            { status: { contains: search, mode: 'insensitive' as const } },
            { stream: { contains: search, mode: 'insensitive' as const } },
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
    const {
      firstName,
      lastName,
      officeEmail,
      personalEmail,
      mobileNo,
      dateOfBirth,
      salary,
      joiningDate,
      exitDate,
      status,
      currentDesignation,
      employmentType,
      stream,
      githubUserId,
      linkedinId,
    } = body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !officeEmail ||
      !mobileNo ||
      !joiningDate ||
      !status ||
      !currentDesignation ||
      !employmentType ||
      !stream
    ) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    // Generate employee ID automatically
    const empId = await generateEmployeeId();

    // Check if office email already exists
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [{ empId: empId }, { officeEmail: officeEmail }],
      },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee ID or office email already exists' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        empId,
        firstName,
        lastName,
        officeEmail,
        personalEmail: personalEmail || null,
        mobileNo,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        salary: salary ? parseFloat(salary) : null,
        joiningDate: new Date(joiningDate),
        exitDate: exitDate ? new Date(exitDate) : null,
        status,
        currentDesignation,
        employmentType,
        stream,
        githubUserId: githubUserId || null,
        linkedinId: linkedinId || null,
      },
    });

    // Initialize leave balance for the new employee
    try {
      await LeaveManagementService.initializeEmployeeLeaves(empId, new Date(joiningDate));
      console.log(`Leave balance initialized for employee ${empId}`);
    } catch (leaveError) {
      console.error(`Failed to initialize leave balance for employee ${empId}:`, leaveError);
      // Don't fail the employee creation if leave initialization fails
    }

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
