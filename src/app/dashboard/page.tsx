'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import AppLayout from '../AppLayout';
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface LeaveEntry {
  id: string;
  leaveType: 'Sick' | 'Casual' | 'Earned';
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'Cancelled';
  appliedAt?: string;
  noOfDays?: number;
}

interface LeaveSummary {
  totalSanctioned: number;
  totalUsed: number;
  totalAvailable: number;
  pending: number;
  approved: number;
  rejected: number;
  recentLeaves: LeaveEntry[];
}

interface Holiday {
  id: string;
  name: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [leaveSummary, setLeaveSummary] = useState<LeaveSummary | null>(null);
  const [nextHoliday, setNextHoliday] = useState<Holiday | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const LEAVES_PER_MONTH = 2;
  const CURRENT_YEAR = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch leave data
        const leaveResponse = await fetch('/api/leave');
        const leaves: LeaveEntry[] = leaveResponse.ok ? await leaveResponse.json() : [];

        // Fetch holidays data
        const holidayResponse = await fetch('/api/holidays');
        const holidays: Holiday[] = holidayResponse.ok ? await holidayResponse.json() : [];

        // Find next holiday
        const today = new Date();
        const upcomingHolidays = holidays
          .filter(holiday => new Date(holiday.date) >= today)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (upcomingHolidays.length > 0) {
          setNextHoliday(upcomingHolidays[0]);
        }

        // Calculate leave statistics
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const completedMonths = currentMonth;
        const totalSanctioned = completedMonths * LEAVES_PER_MONTH;

        const currentYearLeaves = leaves.filter(
          leave => new Date(leave.startDate).getFullYear() === CURRENT_YEAR
        );

        const processedLeaves = currentYearLeaves.map(leave => {
          const from = new Date(leave.startDate);
          const to = new Date(leave.endDate);
          const diffTime = Math.abs(to.getTime() - from.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          return { ...leave, noOfDays: diffDays };
        });

        const totalUsed = processedLeaves
          .filter(leave => leave.status === 'APPROVED')
          .reduce((acc, leave) => acc + (leave.noOfDays || 0), 0);

        const pending = processedLeaves.filter(leave => leave.status === 'PENDING').length;
        const approved = processedLeaves.filter(leave => leave.status === 'APPROVED').length;
        const rejected = processedLeaves.filter(leave => leave.status === 'REJECTED').length;

        // Get recent leaves (last 3)
        const recentLeaves = processedLeaves
          .sort(
            (a, b) =>
              new Date(b.appliedAt || b.startDate).getTime() -
              new Date(a.appliedAt || a.startDate).getTime()
          )
          .slice(0, 3);

        setLeaveSummary({
          totalSanctioned,
          totalUsed,
          totalAvailable: Math.max(0, totalSanctioned - totalUsed),
          pending,
          approved,
          rejected,
          recentLeaves,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, CURRENT_YEAR]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'REJECTED':
        return 'text-red-600';
      case 'Cancelled':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className='h-4 w-4 text-green-600' />;
      case 'PENDING':
        return <ClockIcon className='h-4 w-4 text-yellow-600' />;
      case 'REJECTED':
        return <XCircleIcon className='h-4 w-4 text-red-600' />;
      case 'Cancelled':
        return <XCircleIcon className='h-4 w-4 text-gray-600' />;
      default:
        return <ClockIcon className='h-4 w-4 text-gray-600' />;
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className='p-4 md:p-8'>
          <div className='text-center'>Please sign in to view your dashboard.</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='p-4 md:p-8'>
        <h1 className='text-2xl font-semibold text-gray-800 dark:text-white mb-6'>Dashboard</h1>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Welcome Card */}
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md'>
            <h2 className='text-xl font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Welcome, {user.firstName || user.username}!
            </h2>
            <p className='text-gray-600 dark:text-gray-400'>
              This is your central hub for all payroll activities.
            </p>
          </div>

          {/* Leave Summary Card */}
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md col-span-1 md:col-span-2'>
            <div className='flex items-center mb-4'>
              <CalendarDaysIcon className='h-6 w-6 text-indigo-600 mr-2' />
              <h2 className='text-xl font-medium text-gray-700 dark:text-gray-300'>
                Leave Summary ({CURRENT_YEAR})
              </h2>
            </div>

            {isLoading ? (
              <div className='text-gray-500 dark:text-gray-400'>Loading leave summary...</div>
            ) : leaveSummary ? (
              <div className='space-y-4'>
                {/* Leave Balance */}
                <div className='grid grid-cols-3 gap-4'>
                  <div className='text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                    <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                      {leaveSummary.totalSanctioned}
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>Sanctioned</div>
                  </div>
                  <div className='text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg'>
                    <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                      {leaveSummary.totalUsed}
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>Used</div>
                  </div>
                  <div className='text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'>
                    <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                      {leaveSummary.totalAvailable}
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>Available</div>
                  </div>
                </div>

                {/* Leave Status */}
                <div className='grid grid-cols-3 gap-4 pt-2'>
                  <div className='text-center'>
                    <div className='text-lg font-semibold text-yellow-600 dark:text-yellow-400'>
                      {leaveSummary.pending}
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>Pending</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-semibold text-green-600 dark:text-green-400'>
                      {leaveSummary.approved}
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>Approved</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-semibold text-red-600 dark:text-red-400'>
                      {leaveSummary.rejected}
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>Rejected</div>
                  </div>
                </div>

                {/* Recent Leaves */}
                {leaveSummary.recentLeaves.length > 0 && (
                  <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
                    <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Recent Leave Requests
                    </h3>
                    <div className='space-y-2'>
                      {leaveSummary.recentLeaves.map(leave => (
                        <div key={leave.id} className='flex items-center justify-between text-sm'>
                          <div className='flex items-center space-x-2'>
                            {getStatusIcon(leave.status)}
                            <span className='text-gray-700 dark:text-gray-300'>
                              {leave.leaveType} - {leave.noOfDays} day
                              {(leave.noOfDays || 0) !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <span className={`text-xs font-medium ${getStatusColor(leave.status)}`}>
                              {leave.status === 'PENDING'
                                ? 'Pending'
                                : leave.status === 'APPROVED'
                                  ? 'Approved'
                                  : leave.status === 'REJECTED'
                                    ? 'Rejected'
                                    : 'Cancelled'}
                            </span>
                            <span className='text-xs text-gray-500 dark:text-gray-400'>
                              {new Date(leave.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className='mt-3'>
                      <a
                        href='/leaves'
                        className='text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium'
                      >
                        View all leaves →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='text-gray-500 dark:text-gray-400'>Unable to load leave summary</div>
            )}
          </div>

          {/* Quick Stats */}
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md'>
            <h2 className='text-xl font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Quick Stats
            </h2>
            <div className='space-y-2 text-gray-600 dark:text-gray-400'>
              <p>
                • Current Month:{' '}
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <p>• Today: {new Date().toLocaleDateString()}</p>
              <p>
                • Next Holiday:{' '}
                {isLoading
                  ? 'Loading...'
                  : nextHoliday
                    ? `${nextHoliday.name} - ${new Date(nextHoliday.date).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )}`
                    : 'None scheduled'}
              </p>
              {leaveSummary && (
                <p>
                  • Next Leave:{' '}
                  {leaveSummary.recentLeaves.find(
                    l => l.status === 'APPROVED' && new Date(l.startDate) > new Date()
                  )
                    ? new Date(
                        leaveSummary.recentLeaves.find(
                          l => l.status === 'APPROVED' && new Date(l.startDate) > new Date()
                        )!.startDate
                      ).toLocaleDateString()
                    : 'None scheduled'}
                </p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md col-span-1 md:col-span-2'>
            <h2 className='text-xl font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Recent Activity
            </h2>
            <div className='space-y-2 text-gray-600 dark:text-gray-400'>
              <p>- Dashboard accessed on {new Date().toLocaleDateString()}</p>
              <p>
                - Payslip available for{' '}
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <p>- Attendance tracking active</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
