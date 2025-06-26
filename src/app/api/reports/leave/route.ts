import { logError, logInfo } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// GET /api/reports/leave - Generate leave report
export async function GET(req: NextRequest) {
  try {
    const { userId, sessionClaims } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = (sessionClaims?.publicMetadata as { role?: string[] })?.role?.includes('admin');
    const tempAdminAccess = true; // TODO: Set up proper admin roles

    if (!isAdmin && !tempAdminAccess) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'json';
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const empId = url.searchParams.get('empId');
    const year = url.searchParams.get('year');

    // Build query filters
    const filters: {
      appliedAt?: {
        gte?: Date;
        lte?: Date;
      };
      employeeId?: string;
    } = {};

    if (startDate && endDate) {
      filters.appliedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (year) {
      const yearInt = parseInt(year);
      filters.appliedAt = {
        gte: new Date(yearInt, 0, 1),
        lte: new Date(yearInt, 11, 31),
      };
    }

    if (empId) {
      const employee = await prisma.employee.findUnique({
        where: { empId },
        select: { id: true },
      });

      if (employee) {
        filters.employeeId = employee.id;
      }
    }

    // Fetch leave applications with employee details
    const leaveApplications = await prisma.leaveApplication.findMany({
      where: filters,
      include: {
        employee: {
          select: {
            empId: true,
            firstName: true,
            lastName: true,
            officeEmail: true,
            currentDesignation: true,
            stream: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    // Fetch leave balances if no specific employee filter
    let leaveBalances: Array<{
      year: number;
      totalAllocated: number;
      totalUsed: number;
      totalAvailable: number;
      carryForward: number;
      employee: {
        empId: string;
        firstName: string;
        lastName: string;
        currentDesignation: string;
        stream: string;
      };
    }> = [];
    if (!empId) {
      const currentYear = year ? parseInt(year) : new Date().getFullYear();
      leaveBalances = await prisma.leaveBalance.findMany({
        where: { year: currentYear },
        include: {
          employee: {
            select: {
              empId: true,
              firstName: true,
              lastName: true,
              currentDesignation: true,
              stream: true,
            },
          },
        },
      });
    }

    if (format === 'excel') {
      // Generate Excel report
      const workbook = XLSX.utils.book_new();

      // Leave Applications Sheet
      const leaveAppData = leaveApplications.map(leave => ({
        'Employee ID': leave.employee.empId,
        'Employee Name': `${leave.employee.firstName} ${leave.employee.lastName}`,
        Department: leave.employee.stream || 'N/A',
        Designation: leave.employee.currentDesignation || 'N/A',
        'Leave Type': leave.leaveType,
        'Start Date': leave.startDate.toLocaleDateString(),
        'End Date': leave.endDate.toLocaleDateString(),
        Days:
          Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24)) +
          1,
        Reason: leave.reason,
        Status: leave.status,
        'Applied Date': leave.appliedAt.toLocaleDateString(),
        'Reviewed Date': leave.reviewedAt ? leave.reviewedAt.toLocaleDateString() : 'N/A',
      }));

      const leaveAppSheet = XLSX.utils.json_to_sheet(leaveAppData);
      XLSX.utils.book_append_sheet(workbook, leaveAppSheet, 'Leave Applications');

      // Leave Balances Sheet (if available)
      if (leaveBalances.length > 0) {
        const balanceData = leaveBalances.map(balance => ({
          'Employee ID': balance.employee.empId,
          'Employee Name': `${balance.employee.firstName} ${balance.employee.lastName}`,
          Department: balance.employee.stream || 'N/A',
          Designation: balance.employee.currentDesignation || 'N/A',
          Year: balance.year,
          'Total Allocated': balance.totalAllocated,
          'Total Used': balance.totalUsed,
          'Total Available': balance.totalAvailable,
          'Carry Forward': balance.carryForward,
        }));

        const balanceSheet = XLSX.utils.json_to_sheet(balanceData);
        XLSX.utils.book_append_sheet(workbook, balanceSheet, 'Leave Balances');
      }

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      logInfo(`Leave report generated in Excel format`, {
        userId,
        recordCount: leaveApplications.length,
        format: 'excel',
      });

      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="leave-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    } else {
      // Return JSON format
      const report = {
        summary: {
          totalApplications: leaveApplications.length,
          approvedApplications: leaveApplications.filter(l => l.status === 'APPROVED').length,
          rejectedApplications: leaveApplications.filter(l => l.status === 'REJECTED').length,
          pendingApplications: leaveApplications.filter(l => l.status === 'PENDING').length,
          reportPeriod: {
            startDate: startDate || (year ? `${year}-01-01` : 'All time'),
            endDate: endDate || (year ? `${year}-12-31` : 'All time'),
          },
        },
        leaveApplications,
        leaveBalances: leaveBalances.length > 0 ? leaveBalances : null,
      };

      logInfo(`Leave report generated in JSON format`, {
        userId,
        recordCount: leaveApplications.length,
        format: 'json',
      });

      return NextResponse.json(report);
    }
  } catch (error) {
    logError('Error generating leave report', error);
    return NextResponse.json({ error: 'Failed to generate leave report' }, { status: 500 });
  }
}
