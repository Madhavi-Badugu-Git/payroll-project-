import { LeaveManagementService } from '@/lib/leaveManagement';
import { NextRequest, NextResponse } from 'next/server';

// POST - Process scheduled leave management tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, secret } = body;

    // Simple authentication for scheduled jobs
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    switch (action) {
      case 'monthly-allocation':
        await LeaveManagementService.processMonthlyLeaveAllocation();
        return NextResponse.json({
          message: 'Monthly leave allocation processed successfully',
          timestamp: new Date().toISOString(),
        });

      case 'year-end-carry-forward':
        const maxCarryForward = body.maxCarryForwardDays || 10;
        await LeaveManagementService.processYearEndCarryForward(maxCarryForward);
        return NextResponse.json({
          message: 'Year-end carry forward processed successfully',
          timestamp: new Date().toISOString(),
          maxCarryForwardDays: maxCarryForward,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing scheduled leave task:', error);
    return NextResponse.json(
      {
        error: 'Failed to process scheduled leave task',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET - Status endpoint for health checks
export async function GET() {
  return NextResponse.json({
    status: 'OK',
    service: 'Leave Management Scheduler',
    timestamp: new Date().toISOString(),
  });
}
