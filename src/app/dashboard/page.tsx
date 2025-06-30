'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { formatDate } from '@/lib/dateUtils';
import {
  ArrowRightIcon,
  BellIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  GiftIcon,
  PlayIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AppLayout from '../AppLayout';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { leaveSummary, nextHoliday, isLoading } = useDashboard();

  const CURRENT_YEAR = new Date().getFullYear();
  const currentDate = new Date();

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

  if (!session?.user) {
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
      <div className='p-4 md:p-8 max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
            Welcome back, {session.user.firstName || session.user.name}! 👋
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Here&apos;s what&apos;s happening with your payroll today.
          </p>
        </div>

        {/* Top Row - Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          {/* Attendance Today */}
          <div className='bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-blue-100 text-sm font-medium'>Today&apos;s Status</p>
                <p className='text-2xl font-bold'>Present</p>
                <p className='text-blue-100 text-xs mt-1'>
                  {formatDate(currentDate, 'DISPLAY_DATE')}
                </p>
              </div>
              <ClockIcon className='h-8 w-8 text-blue-200' />
            </div>
          </div>

          {/* Leave Balance */}
          <div className='bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-green-100 text-sm font-medium'>Leave Balance</p>
                <p className='text-2xl font-bold'>
                  {isLoading ? '...' : leaveSummary?.totalAvailable || 0}
                </p>
                <p className='text-green-100 text-xs mt-1'>Days remaining</p>
              </div>
              <CalendarDaysIcon className='h-8 w-8 text-green-200' />
            </div>
          </div>

          {/* Payslip */}
          <div className='bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-purple-100 text-sm font-medium'>Latest Payslip</p>
                <p className='text-2xl font-bold'>
                  {formatDate(currentDate, 'DISPLAY_DATE_SHORT')}
                </p>
                <p className='text-purple-100 text-xs mt-1'>Ready to download</p>
              </div>
              <CurrencyDollarIcon className='h-8 w-8 text-purple-200' />
            </div>
          </div>

          {/* Notifications */}
          <div className='bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-orange-100 text-sm font-medium'>Notifications</p>
                <p className='text-2xl font-bold'>3</p>
                <p className='text-orange-100 text-xs mt-1'>New updates</p>
              </div>
              <BellIcon className='h-8 w-8 text-orange-200' />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - 2/3 width */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Upcoming Holidays */}
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
              <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div className='p-2 bg-red-100 dark:bg-red-900/20 rounded-lg'>
                      <GiftIcon className='h-6 w-6 text-red-600 dark:text-red-400' />
                    </div>
                    <div>
                      <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                        Upcoming Holidays
                      </h2>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Next public holidays
                      </p>
                    </div>
                  </div>
                  <Link
                    href='/holidays'
                    className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1'
                  >
                    <span>View All</span>
                    <ArrowRightIcon className='h-4 w-4' />
                  </Link>
                </div>
              </div>
              <div className='p-6'>
                {isLoading ? (
                  <div className='text-center py-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                    <p className='text-gray-500 dark:text-gray-400 mt-2'>Loading holidays...</p>
                  </div>
                ) : nextHoliday ? (
                  <div className='flex items-center space-x-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg'>
                    <div className='flex-shrink-0'>
                      <div className='w-16 h-16 bg-red-600 rounded-lg flex flex-col items-center justify-center text-white'>
                        <span className='text-xs font-medium'>
                          {new Date(nextHoliday.date).toLocaleDateString('en-US', {
                            month: 'short',
                          })}
                        </span>
                        <span className='text-lg font-bold'>
                          {new Date(nextHoliday.date).toLocaleDateString('en-US', {
                            day: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-gray-900 dark:text-white'>
                        {nextHoliday.name}
                      </h3>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        {formatDate(nextHoliday.date, 'DISPLAY_DATE_FULL')}
                      </p>
                      <p className='text-xs text-red-600 dark:text-red-400 mt-1'>
                        {Math.ceil(
                          (new Date(nextHoliday.date).getTime() - currentDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        days away
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <GiftIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-500 dark:text-gray-400'>No upcoming holidays</p>
                  </div>
                )}
              </div>
            </div>

            {/* Leave Summary */}
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
              <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div className='p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg'>
                      <CalendarDaysIcon className='h-6 w-6 text-indigo-600 dark:text-indigo-400' />
                    </div>
                    <div>
                      <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                        Leave Summary ({CURRENT_YEAR})
                      </h2>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Your leave balance and history
                      </p>
                    </div>
                  </div>
                  <Link
                    href='/leaves'
                    className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1'
                  >
                    <span>Manage Leaves</span>
                    <ArrowRightIcon className='h-4 w-4' />
                  </Link>
                </div>
              </div>
              <div className='p-6'>
                {isLoading ? (
                  <div className='text-center py-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto'></div>
                    <p className='text-gray-500 dark:text-gray-400 mt-2'>Loading leave data...</p>
                  </div>
                ) : leaveSummary ? (
                  <div className='space-y-6'>
                    {/* Leave Balance Cards */}
                    <div className='grid grid-cols-3 gap-4'>
                      <div className='text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                        <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                          {leaveSummary.totalSanctioned}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                          Sanctioned
                        </div>
                      </div>
                      <div className='text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800'>
                        <div className='text-2xl font-bold text-red-600 dark:text-red-400'>
                          {leaveSummary.totalUsed}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Used</div>
                      </div>
                      <div className='text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800'>
                        <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                          {leaveSummary.totalAvailable}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                          Available
                        </div>
                      </div>
                    </div>

                    {/* Recent Leaves */}
                    {leaveSummary.recentLeaves.length > 0 && (
                      <div>
                        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                          Recent Leave Requests
                        </h3>
                        <div className='space-y-3'>
                          {leaveSummary.recentLeaves.map(leave => (
                            <div
                              key={leave.id}
                              className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg'
                            >
                              <div className='flex items-center space-x-3'>
                                {getStatusIcon(leave.status)}
                                <div>
                                  <span className='text-sm font-medium text-gray-900 dark:text-white'>
                                    {leave.leaveType}
                                  </span>
                                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                                    {leave.noOfDays} day{(leave.noOfDays || 0) !== 1 ? 's' : ''} •{' '}
                                    {formatDate(leave.startDate, 'DISPLAY_DATE')}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  leave.status === 'APPROVED'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : leave.status === 'PENDING'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}
                              >
                                {leave.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <CalendarDaysIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <p className='text-gray-500 dark:text-gray-400'>No leave data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className='space-y-8'>
            {/* Quick Access */}
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
              <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
                <div className='flex items-center space-x-3'>
                  <div className='p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg'>
                    <PlayIcon className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div>
                    <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                      Quick Access
                    </h2>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>Frequent actions</p>
                  </div>
                </div>
              </div>
              <div className='p-6'>
                <div className='space-y-3'>
                  <Link
                    href='/attendance'
                    className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group'
                  >
                    <div className='flex items-center space-x-3'>
                      <ClockIcon className='h-5 w-5 text-gray-400 group-hover:text-blue-600' />
                      <span className='text-sm font-medium text-gray-900 dark:text-white'>
                        Mark Attendance
                      </span>
                    </div>
                    <ArrowRightIcon className='h-4 w-4 text-gray-400 group-hover:text-blue-600' />
                  </Link>
                  <Link
                    href='/leaves'
                    className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group'
                  >
                    <div className='flex items-center space-x-3'>
                      <CalendarDaysIcon className='h-5 w-5 text-gray-400 group-hover:text-blue-600' />
                      <span className='text-sm font-medium text-gray-900 dark:text-white'>
                        Apply for Leave
                      </span>
                    </div>
                    <ArrowRightIcon className='h-4 w-4 text-gray-400 group-hover:text-blue-600' />
                  </Link>
                  <Link
                    href='/documents/payslips'
                    className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group'
                  >
                    <div className='flex items-center space-x-3'>
                      <DocumentTextIcon className='h-5 w-5 text-gray-400 group-hover:text-blue-600' />
                      <span className='text-sm font-medium text-gray-900 dark:text-white'>
                        Download Payslip
                      </span>
                    </div>
                    <ArrowRightIcon className='h-4 w-4 text-gray-400 group-hover:text-blue-600' />
                  </Link>
                  <Link
                    href='/employee-directory'
                    className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group'
                  >
                    <div className='flex items-center space-x-3'>
                      <UserGroupIcon className='h-5 w-5 text-gray-400 group-hover:text-blue-600' />
                      <span className='text-sm font-medium text-gray-900 dark:text-white'>
                        Employee Directory
                      </span>
                    </div>
                    <ArrowRightIcon className='h-4 w-4 text-gray-400 group-hover:text-blue-600' />
                  </Link>
                </div>
              </div>
            </div>

            {/* Track Card */}
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
              <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
                <div className='flex items-center space-x-3'>
                  <div className='p-2 bg-green-100 dark:bg-green-900/20 rounded-lg'>
                    <ChartBarIcon className='h-6 w-6 text-green-600 dark:text-green-400' />
                  </div>
                  <div>
                    <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Track</h2>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>Your progress</p>
                  </div>
                </div>
              </div>
              <div className='p-6'>
                <div className='space-y-4'>
                  <div>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='text-sm font-medium text-gray-900 dark:text-white'>
                        Monthly Attendance
                      </span>
                      <span className='text-sm text-gray-500 dark:text-gray-400'>95%</span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                      <div className='bg-green-600 h-2 rounded-full' style={{ width: '95%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className='flex justify-between items-center mb-2'>
                      <span className='text-sm font-medium text-gray-900 dark:text-white'>
                        Leave Balance Used
                      </span>
                      <span className='text-sm text-gray-500 dark:text-gray-400'>
                        {leaveSummary
                          ? Math.round(
                              (leaveSummary.totalUsed / leaveSummary.totalSanctioned) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full'
                        style={{
                          width: `${
                            leaveSummary
                              ? Math.round(
                                  (leaveSummary.totalUsed / leaveSummary.totalSanctioned) * 100
                                )
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
                    <div className='text-center'>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>Overall Score</p>
                      <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
                        Excellent
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700'>
              <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
                <div className='flex items-center space-x-3'>
                  <div className='p-2 bg-gray-100 dark:bg-gray-700 rounded-lg'>
                    <ClockIcon className='h-6 w-6 text-gray-600 dark:text-gray-400' />
                  </div>
                  <div>
                    <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                      Recent Activity
                    </h2>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>Latest updates</p>
                  </div>
                </div>
              </div>
              <div className='p-6'>
                <div className='space-y-3'>
                  <div className='flex items-start space-x-3'>
                    <div className='w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0'></div>
                    <div>
                      <p className='text-sm text-gray-900 dark:text-white'>
                        Attendance marked for today
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        {formatDate(currentDate, 'DISPLAY_TIME_12H')}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0'></div>
                    <div>
                      <p className='text-sm text-gray-900 dark:text-white'>
                        Payslip generated for {formatDate(currentDate, 'DISPLAY_DATE_SHORT')}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>2 hours ago</p>
                    </div>
                  </div>
                  <div className='flex items-start space-x-3'>
                    <div className='w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0'></div>
                    <div>
                      <p className='text-sm text-gray-900 dark:text-white'>Dashboard accessed</p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>Just now</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
