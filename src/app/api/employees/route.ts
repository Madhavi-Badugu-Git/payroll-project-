import { PrismaClient } from '@/generated/prisma';
import { generateEmployeeId } from '@/lib/employeeUtils';
import { LeaveManagementService } from '@/lib/leaveManagement';
import { logError, logInfo } from '@/lib/logger';
import { assignRoleToUser } from '@/lib/roleUtils';
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
            { email: { contains: search, mode: 'insensitive' as const } },
            { employeeNumber: { contains: search, mode: 'insensitive' as const } },
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
    logError('Error fetching employees', error);
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
    const missingFields = [];
    if (!firstName?.trim()) missingFields.push('firstName');
    if (!lastName?.trim()) missingFields.push('lastName');
    if (!officeEmail?.trim()) missingFields.push('officeEmail');
    if (!mobileNo?.trim()) missingFields.push('mobileNo');
    if (!joiningDate?.trim()) missingFields.push('joiningDate');
    if (!status?.trim()) missingFields.push('status');
    if (!currentDesignation?.trim()) missingFields.push('currentDesignation');
    if (!employmentType?.trim()) missingFields.push('employmentType');
    if (!stream?.trim()) missingFields.push('stream');

    if (missingFields.length > 0) {
      logError('Missing required fields', { missingFields, receivedData: body });
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields,
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(officeEmail)) {
      logError('Invalid email format', { email: officeEmail });
      return NextResponse.json(
        {
          error: 'Invalid office email format',
        },
        { status: 400 }
      );
    }

    // Check if a user with this email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: officeEmail },
    });

    if (!existingUser) {
      logError('No user found with email', { email: officeEmail });
      return NextResponse.json(
        {
          error: `User is not registered with this email ID: ${officeEmail}. Please ensure the user is registered in the system before creating an employee record.`,
        },
        { status: 400 }
      );
    }

    // Generate employee ID automatically
    const empId = await generateEmployeeId();

    // Check if office email already exists
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [{ employeeNumber: empId }, { email: officeEmail }],
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
        employeeNumber: empId,
        firstName,
        lastName,
        email: officeEmail,
        personalEmail: personalEmail || null,
        mobileNo,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        currentSalary: salary ? parseFloat(salary) : null,
        dateOfJoining: new Date(joiningDate),
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
      logInfo(`Leave balance initialized for employee ${empId}`);
    } catch (leaveError) {
      logError(`Failed to initialize leave balance for employee ${empId}`, leaveError);
      // Don't fail the employee creation if leave initialization fails
    }

    // Assign employee role to the linked user
    try {
      await assignRoleToUser(existingUser.id, 'employee');
      logInfo(`Employee role assigned to user ${existingUser.id} for employee ${empId}`);
    } catch (roleError) {
      logError(
        `Failed to assign employee role to user ${existingUser.id} for employee ${empId}`,
        roleError
      );
      // Don't fail the employee creation if role assignment fails
      // The employee record is created successfully, role assignment is additional
    }

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    logError('Error creating employee', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
