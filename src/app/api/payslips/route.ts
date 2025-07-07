import { PrismaClient } from '@/generated/prisma';
import { logError } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch payslips with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const employeeNumber = searchParams.get('employeeNumber') || searchParams.get('empId'); // Support both for backward compatibility
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const whereClause: {
      employeeId?: string;
      year?: number;
      payslipForMonth?: {
        contains: string;
        mode: 'insensitive';
      };
    } = {};

    if (employeeNumber) {
      // Find employee by employeeNumber first
      const employee = await prisma.employee.findUnique({
        where: { employeeNumber },
        select: { id: true },
      });

      if (employee) {
        whereClause.employeeId = employee.id;
      } else {
        return NextResponse.json({ payslips: [], total: 0 });
      }
    }

    if (year) {
      whereClause.year = parseInt(year, 10);
    }

    if (month) {
      whereClause.payslipForMonth = {
        contains: month,
        mode: 'insensitive' as const,
      };
    }

    const payslips = await prisma.payslip.findMany({
      skip,
      take: limit,
      where: whereClause,
      include: {
        employee: {
          select: {
            employeeNumber: true,
            firstName: true,
            lastName: true,
            email: true,
            currentDesignation: true,
            stream: true,
            dateOfJoining: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
    });

    const totalCount = await prisma.payslip.count({
      where: whereClause,
    });

    // Transform data to match the frontend interface
    const transformedPayslips = payslips.map(payslip => ({
      id: payslip.id,
      employeeId: payslip.employeeId,
      employeeNumber: payslip.employee.employeeNumber,
      employeeName: `${payslip.employee.firstName} ${payslip.employee.lastName}`,
      payslipForMonth: payslip.payslipForMonth,
      payslipDate: payslip.payslipDate.toISOString().split('T')[0].split('-').reverse().join('/'), // Convert to DD/MM/YYYY
      location: payslip.location,
      department: payslip.department,
      designation: payslip.designation,
      doj: payslip.doj.toISOString().split('T')[0].split('-').reverse().join('/'), // Convert to DD/MM/YYYY
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
    }));

    return NextResponse.json({
      payslips: transformedPayslips,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    logError('Error fetching payslips', error);
    return NextResponse.json({ error: 'Failed to fetch payslips' }, { status: 500 });
  }
}

// POST - Create new payslip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeNumber,
      empId, // Support legacy field for backward compatibility
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

    // Use employeeNumber or fall back to empId for backward compatibility
    const empNumber = employeeNumber || empId;

    // Validate required fields
    if (
      !empNumber ||
      !payslipForMonth ||
      !payslipDate ||
      !location ||
      !department ||
      !designation ||
      !doj ||
      !gradeBand ||
      attendedDays === undefined ||
      daysInMonth === undefined ||
      basic === undefined ||
      hra === undefined ||
      specialAllowance === undefined ||
      lta === undefined ||
      !year
    ) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { employeeNumber: empNumber },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Calculate total salary and net salary
    const totalSalary = basic + hra + specialAllowance + lta;
    const totalDeductions = providentFund + professionalTax + incomeTax;
    const netSalary = totalSalary - totalDeductions;

    // Check if payslip already exists for this employee, month, and year
    const existingPayslip = await prisma.payslip.findUnique({
      where: {
        employeeId_payslipForMonth_year: {
          employeeId: employee.id,
          payslipForMonth,
          year,
        },
      },
    });

    if (existingPayslip) {
      return NextResponse.json(
        { error: 'Payslip already exists for this employee, month, and year' },
        { status: 400 }
      );
    }

    const payslip = await prisma.payslip.create({
      data: {
        employeeId: employee.id,
        payslipForMonth,
        payslipDate: new Date(payslipDate),
        location,
        department,
        designation,
        doj: new Date(doj),
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
            employeeNumber: true,
            firstName: true,
            lastName: true,
            email: true,
            currentDesignation: true,
            stream: true,
            dateOfJoining: true,
          },
        },
      },
    });

    // Transform response to match frontend interface
    const transformedPayslip = {
      id: payslip.id,
      employeeId: payslip.employeeId,
      employeeNumber: payslip.employee.employeeNumber,
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
      providentFund: payslip.providentFund,
      professionalTax: payslip.professionalTax,
      incomeTax: payslip.incomeTax,
      netSalary: payslip.netSalary,
    };

    return NextResponse.json(transformedPayslip, { status: 201 });
  } catch (error) {
    logError('Error creating payslip', error);
    return NextResponse.json({ error: 'Failed to create payslip' }, { status: 500 });
  }
}
