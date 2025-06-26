import { PrismaClient } from '@/generated/prisma';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch single payslip by ID
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            empId: true,
            firstName: true,
            lastName: true,
            officeEmail: true,
            currentDesignation: true,
            stream: true,
            joiningDate: true,
          },
        },
      },
    });

    if (!payslip) {
      return NextResponse.json({ error: 'Payslip not found' }, { status: 404 });
    }

    // Transform data to match the frontend interface
    const transformedPayslip = {
      id: payslip.id,
      employeeId: payslip.empId,
      employeeName: `${payslip.employee.firstName} ${payslip.employee.lastName}`,
      payslipForMonth: payslip.payslipForMonth,
      payslipDate: payslip.payslipDate.toISOString().split('T')[0].split('-').reverse().join('/'),
      location: payslip.location,
      department: payslip.department,
      designation: payslip.designation,
      doj: payslip.doj.toISOString().split('T')[0].split('-').reverse().join('/'),
      gradeBand: payslip.gradeBand,
      attendedDays: payslip.attendedDays,
      arrearDays: payslip.arrearDays,
      daysInMonth: payslip.daysInMonth,
      basic: payslip.basic,
      hra: payslip.hra,
      specialAllowance: payslip.specialAllowance,
      lta: payslip.lta,
      totalSalary: payslip.totalSalary,
      year: payslip.year,
      providentFund: payslip.providentFund || 0,
      professionalTax: payslip.professionalTax || 0,
      incomeTax: payslip.incomeTax || 0,
      netSalary: payslip.netSalary || payslip.totalSalary,
    };

    return NextResponse.json(transformedPayslip);
  } catch (error) {
    console.error('Error fetching payslip:', error);
    return NextResponse.json({ error: 'Failed to fetch payslip' }, { status: 500 });
  }
}

// PUT - Update payslip
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const {
      payslipForMonth,
      payslipDate,
      location,
      department,
      designation,
      doj,
      gradeBand,
      attendedDays,
      arrearDays = 0,
      daysInMonth,
      basic,
      hra,
      specialAllowance,
      lta,
      year,
      providentFund = 0,
      professionalTax = 0,
      incomeTax = 0,
    } = body;

    // Check if payslip exists
    const existingPayslip = await prisma.payslip.findUnique({
      where: { id },
    });

    if (!existingPayslip) {
      return NextResponse.json({ error: 'Payslip not found' }, { status: 404 });
    }

    // Calculate total salary and net salary
    const totalSalary = basic + hra + specialAllowance + lta;
    const totalDeductions = providentFund + professionalTax + incomeTax;
    const netSalary = totalSalary - totalDeductions;

    const updatedPayslip = await prisma.payslip.update({
      where: { id },
      data: {
        payslipForMonth,
        payslipDate: payslipDate ? new Date(payslipDate) : undefined,
        location,
        department,
        designation,
        doj: doj ? new Date(doj) : undefined,
        gradeBand,
        attendedDays,
        arrearDays,
        daysInMonth,
        basic,
        hra,
        specialAllowance,
        lta,
        totalSalary,
        year,
        providentFund,
        professionalTax,
        incomeTax,
        netSalary,
      },
      include: {
        employee: {
          select: {
            empId: true,
            firstName: true,
            lastName: true,
            officeEmail: true,
            currentDesignation: true,
            stream: true,
            joiningDate: true,
          },
        },
      },
    });

    // Transform response to match frontend interface
    const transformedPayslip = {
      id: updatedPayslip.id,
      employeeId: updatedPayslip.empId,
      employeeName: `${updatedPayslip.employee.firstName} ${updatedPayslip.employee.lastName}`,
      payslipForMonth: updatedPayslip.payslipForMonth,
      payslipDate: updatedPayslip.payslipDate
        .toISOString()
        .split('T')[0]
        .split('-')
        .reverse()
        .join('/'),
      location: updatedPayslip.location,
      department: updatedPayslip.department,
      designation: updatedPayslip.designation,
      doj: updatedPayslip.doj.toISOString().split('T')[0].split('-').reverse().join('/'),
      gradeBand: updatedPayslip.gradeBand,
      attendedDays: updatedPayslip.attendedDays,
      arrearDays: updatedPayslip.arrearDays,
      daysInMonth: updatedPayslip.daysInMonth,
      basic: updatedPayslip.basic,
      hra: updatedPayslip.hra,
      specialAllowance: updatedPayslip.specialAllowance,
      lta: updatedPayslip.lta,
      totalSalary: updatedPayslip.totalSalary,
      year: updatedPayslip.year,
      providentFund: updatedPayslip.providentFund,
      professionalTax: updatedPayslip.professionalTax,
      incomeTax: updatedPayslip.incomeTax,
      netSalary: updatedPayslip.netSalary,
    };

    return NextResponse.json(transformedPayslip);
  } catch (error) {
    console.error('Error updating payslip:', error);
    return NextResponse.json({ error: 'Failed to update payslip' }, { status: 500 });
  }
}

// DELETE - Delete payslip
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    // Check if payslip exists
    const existingPayslip = await prisma.payslip.findUnique({
      where: { id },
    });

    if (!existingPayslip) {
      return NextResponse.json({ error: 'Payslip not found' }, { status: 404 });
    }

    await prisma.payslip.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Payslip deleted successfully' });
  } catch (error) {
    console.error('Error deleting payslip:', error);
    return NextResponse.json({ error: 'Failed to delete payslip' }, { status: 500 });
  }
}
