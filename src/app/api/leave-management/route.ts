import { LeaveManagementService } from '@/lib/leaveManagement';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get employee leave information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empId = searchParams.get('empId');
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
    const action = searchParams.get('action');

    if (!empId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    if (action === 'calculate-prorata') {
      // Calculate pro-rata for joining date
      const joiningDateStr = searchParams.get('joiningDate');
      const sanctionedLeaves = searchParams.get('sanctionedLeaves');

      if (!joiningDateStr || !sanctionedLeaves) {
        return NextResponse.json(
          {
            error: 'Joining date and sanctioned leaves are required for pro-rata calculation',
          },
          { status: 400 }
        );
      }

      const joiningDate = new Date(joiningDateStr);
      const calculation = LeaveManagementService.calculateProRataLeaves(
        joiningDate,
        parseInt(sanctionedLeaves)
      );

      return NextResponse.json(calculation);
    }

    // Get employee leave information
    const leaveInfo = await LeaveManagementService.getEmployeeLeaveInfo(empId, year);
    return NextResponse.json(leaveInfo);
  } catch (error) {
    console.error('Error fetching leave information:', error);
    return NextResponse.json({ error: 'Failed to fetch leave information' }, { status: 500 });
  }
}

// POST - Initialize leaves for new employee or process operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, empId, joiningDate, leaveApplicationId, days } = body;

    if (!action || !empId) {
      return NextResponse.json({ error: 'Action and Employee ID are required' }, { status: 400 });
    }

    switch (action) {
      case 'initialize':
        if (!joiningDate) {
          return NextResponse.json(
            { error: 'Joining date is required for initialization' },
            { status: 400 }
          );
        }
        await LeaveManagementService.initializeEmployeeLeaves(empId, new Date(joiningDate));
        return NextResponse.json({ message: 'Employee leaves initialized successfully' });

      case 'deduct':
        if (!leaveApplicationId || !days) {
          return NextResponse.json(
            { error: 'Leave application ID and days are required for deduction' },
            { status: 400 }
          );
        }
        const deductSuccess = await LeaveManagementService.deductLeaves(
          empId,
          leaveApplicationId,
          days
        );
        if (!deductSuccess) {
          return NextResponse.json({ error: 'Insufficient leave balance' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Leaves deducted successfully' });

      case 'credit':
        if (!leaveApplicationId || !days) {
          return NextResponse.json(
            { error: 'Leave application ID and days are required for credit' },
            { status: 400 }
          );
        }
        await LeaveManagementService.creditLeaves(empId, leaveApplicationId, days);
        return NextResponse.json({ message: 'Leaves credited successfully' });

      case 'monthly-allocation':
        await LeaveManagementService.processMonthlyLeaveAllocation();
        return NextResponse.json({ message: 'Monthly leave allocation processed successfully' });

      case 'year-end-carry-forward':
        const maxCarryForward = body.maxCarryForwardDays || 10;
        await LeaveManagementService.processYearEndCarryForward(maxCarryForward);
        return NextResponse.json({ message: 'Year-end carry forward processed successfully' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing leave management request:', error);
    return NextResponse.json(
      { error: 'Failed to process leave management request' },
      { status: 500 }
    );
  }
}
