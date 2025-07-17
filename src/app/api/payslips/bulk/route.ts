import { PrismaClient } from '@/generated/prisma';
import { logError } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// POST - Create multiple payslips at once
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payslips } = body;

    if (!Array.isArray(payslips) || payslips.length === 0) {
      return NextResponse.json({ error: 'Payslips array is required' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < payslips.length; i++) {
      const payslipData = payslips[i];

      try {
        const {
          employeeNumber,
          empId, // Support legacy field name for backward compatibility
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
        } = payslipData;

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
          errors.push({
            index: i,
            error: 'Missing required fields',
            data: payslipData,
          });
          continue;
        }

        // Check if employee exists
        const employee = await prisma.employee.findUnique({
          where: { employeeNumber: empNumber },
        });

        if (!employee) {
          errors.push({
            index: i,
            error: `Employee with number ${empNumber} not found`,
            data: payslipData,
          });
          continue;
        }

        // Calculate total salary and net salary
        const totalSalary = basic + hra + specialAllowance + lta;
        const totalDeductions = providentFund + professionalTax + incomeTax;
        const netSalary = totalSalary - totalDeductions;

        // Check if payslip already exists
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
          errors.push({
            index: i,
            error: `Payslip already exists for ${empNumber} - ${payslipForMonth} ${year}`,
            data: payslipData,
          });
          continue;
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
        });

        results.push({
          index: i,
          success: true,
          payslipId: payslip.id,
          employeeId: payslip.employeeId,
          employeeNumber: empNumber,
          payslipForMonth: payslip.payslipForMonth,
          year: payslip.year,
        });
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: payslipData,
        });
      }
    }

    return NextResponse.json(
      {
        message: `Processed ${payslips.length} payslips`,
        successful: results.length,
        failed: errors.length,
        results,
        errors,
      },
      { status: 201 }
    );
  } catch (error) {
    logError('Error in bulk payslip creation', error);
    return NextResponse.json({ error: 'Failed to process bulk payslips' }, { status: 500 });
  }
}

// DELETE - Delete multiple payslips
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { payslipIds } = body;

    if (!Array.isArray(payslipIds) || payslipIds.length === 0) {
      return NextResponse.json({ error: 'Payslip IDs array is required' }, { status: 400 });
    }

    const deleteResult = await prisma.payslip.deleteMany({
      where: {
        id: {
          in: payslipIds,
        },
      },
    });

    return NextResponse.json({
      message: `Deleted ${deleteResult.count} payslips`,
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    logError('Error in bulk payslip deletion', error);
    return NextResponse.json({ error: 'Failed to delete payslips' }, { status: 500 });
  }
}
