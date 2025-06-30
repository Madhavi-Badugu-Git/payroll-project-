import { PrismaClient } from '@/generated/prisma';
import { logError } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch single employee
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    logError('Error fetching employee', error);
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 });
  }
}

// PUT - Update employee
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    // First, get the existing employee to get the empId
    const existingEmployeeRecord = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployeeRecord) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(officeEmail)) {
      return NextResponse.json(
        {
          error: 'Invalid office email format',
        },
        { status: 400 }
      );
    }

    // If email is being changed, check if a user with the new email exists
    if (existingEmployeeRecord.email !== officeEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: officeEmail },
      });

      if (!existingUser) {
        return NextResponse.json(
          {
            error: `User is not registered with this email ID: ${officeEmail}. Please ensure the user is registered in the system before updating the employee record.`,
          },
          { status: 400 }
        );
      }
    }

    // Check if officeEmail already exists for other employees (empId shouldn't change)
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        AND: [{ id: { not: id } }, { email: officeEmail }],
      },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Office email already exists for another employee' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
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

    return NextResponse.json(employee);
  } catch (error) {
    logError('Error updating employee', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

// DELETE - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First, get the employee to get the empId for related record checks
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Check for related records that would prevent deletion
    const [
      leaveApplications,
      attendanceRegularizations,
      promotions,
      payslips,
      leaveBalances,
      leaveAccumulations,
      leaveTransactions,
    ] = await Promise.all([
      prisma.leaveApplication.count({ where: { employeeId: id } }),
      prisma.attendanceRegularization.count({ where: { employeeId: id } }),
      prisma.employeePromotion.count({ where: { empId: employee.empId } }),
      prisma.payslip.count({ where: { empId: employee.empId } }),
      prisma.leaveBalance.count({ where: { empId: employee.empId } }),
      prisma.leaveAccumulation.count({ where: { empId: employee.empId } }),
      prisma.leaveTransaction.count({ where: { empId: employee.empId } }),
    ]);

    const totalRelatedRecords =
      leaveApplications +
      attendanceRegularizations +
      promotions +
      payslips +
      leaveBalances +
      leaveAccumulations +
      leaveTransactions;

    if (totalRelatedRecords > 0) {
      const relatedRecordDetails = [];
      if (leaveApplications > 0)
        relatedRecordDetails.push(`${leaveApplications} leave application(s)`);
      if (attendanceRegularizations > 0)
        relatedRecordDetails.push(`${attendanceRegularizations} attendance regularization(s)`);
      if (promotions > 0) relatedRecordDetails.push(`${promotions} promotion(s)`);
      if (payslips > 0) relatedRecordDetails.push(`${payslips} payslip(s)`);
      if (leaveBalances > 0) relatedRecordDetails.push(`${leaveBalances} leave balance record(s)`);
      if (leaveAccumulations > 0)
        relatedRecordDetails.push(`${leaveAccumulations} leave accumulation record(s)`);
      if (leaveTransactions > 0)
        relatedRecordDetails.push(`${leaveTransactions} leave transaction(s)`);

      return NextResponse.json(
        {
          error: 'Cannot delete employee',
          message: `This employee has related records that must be handled first: ${relatedRecordDetails.join(', ')}. Please contact an administrator to handle the deletion of related data.`,
          relatedRecords: {
            leaveApplications,
            attendanceRegularizations,
            promotions,
            payslips,
            leaveBalances,
            leaveAccumulations,
            leaveTransactions,
          },
        },
        { status: 400 }
      );
    }

    // If no related records, proceed with deletion
    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    logError('Error deleting employee', error);

    // Check if it's a foreign key constraint error
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        {
          error: 'Cannot delete employee due to related records',
          message:
            'This employee has related records that prevent deletion. Please contact an administrator.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}
