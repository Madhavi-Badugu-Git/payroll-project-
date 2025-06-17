import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET - Fetch single employee
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

// PUT - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { empId, name, email, phoneNo, designation, joiningDate, status } = body;

    // Validate required fields
    if (!empId || !name || !email || !phoneNo || !designation || !joiningDate || !status) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if empId or email already exists for other employees
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { empId: empId },
              { email: email }
            ]
          }
        ]
      }
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee ID or email already exists' },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        empId,
        name,
        email,
        phoneNo,
        designation,
        joiningDate: new Date(joiningDate),
        status
      }
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

// DELETE - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.employee.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}