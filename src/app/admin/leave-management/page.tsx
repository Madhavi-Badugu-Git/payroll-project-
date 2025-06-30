'use client';

import ConfirmDialog from '@/components/ConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useLeaveManagement } from '@/hooks/useLeaveManagement';
import { hasAdminRoleClient } from '@/lib/clientRoleUtils';
import { RootState } from '@/store';
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  CogIcon,
  PlayIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AppLayout from '../../AppLayout';

export default function AdminLeaveManagementPage() {
  const reduxUser = useSelector((state: RootState) => state.user.user);
  const isAdmin = hasAdminRoleClient(reduxUser);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const {
    stats,
    employeeLeaveInfo,
    isLoading,
    isProcessing,
    fetchStats,
    processMonthlyAllocation,
    processCarryForward,
    initializeEmployeeLeaves,
  } = useLeaveManagement();

  const { confirmDialog, showConfirmDialog, hideConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    if (isAdmin) {
      fetchStats(selectedYear);
    }
  }, [isAdmin, selectedYear, fetchStats]);

  const handleProcessMonthlyAllocation = async () => {
    showConfirmDialog({
      title: 'Process Monthly Allocation',
      message:
        'Are you sure you want to process monthly leave allocation for all employees? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await processMonthlyAllocation();
          await fetchStats(selectedYear); // Refresh data
        } catch (_error) {
          // Error is already handled in the hook
        }
      },
    });
  };

  const handleProcessCarryForward = async () => {
    showConfirmDialog({
      title: 'Process Year-End Carry Forward',
      message:
        'Are you sure you want to process year-end carry forward for all employees? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await processCarryForward();
          await fetchStats(selectedYear); // Refresh data
        } catch (_error) {
          // Error is already handled in the hook
        }
      },
    });
  };

  const handleInitializeEmployeeLeaves = async (empId: string, joiningDate: string) => {
    showConfirmDialog({
      title: 'Initialize Leave Balance',
      message: `Are you sure you want to initialize leave balance for employee ${empId}?`,
      onConfirm: async () => {
        try {
          await initializeEmployeeLeaves(empId, joiningDate);
          await fetchStats(selectedYear); // Refresh data
        } catch (_error) {
          // Error is already handled in the hook
        }
      },
    });
  };

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className='p-6 text-center'>
          <p className='text-red-600 dark:text-red-400'>
            Access denied. Admin privileges required.
          </p>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className='p-6 text-center'>Loading leave management dashboard...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='w-full max-w-7xl mx-auto p-4 md:p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-800 dark:text-white'>
            Leave Management Dashboard
          </h1>
          <div className='flex items-center space-x-4'>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white'
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
            <div className='flex items-center'>
              <UserGroupIcon className='h-8 w-8 text-blue-600 dark:text-blue-400' />
              <div className='ml-4'>
                <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Total Employees
                </h3>
                <p className='text-2xl font-semibold text-gray-800 dark:text-white'>
                  {stats.totalEmployees}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
            <div className='flex items-center'>
              <ChartBarIcon className='h-8 w-8 text-green-600 dark:text-green-400' />
              <div className='ml-4'>
                <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  With Leave Balance
                </h3>
                <p className='text-2xl font-semibold text-gray-800 dark:text-white'>
                  {stats.employeesWithLeaveBalance}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
            <div className='flex items-center'>
              <CalendarDaysIcon className='h-8 w-8 text-indigo-600 dark:text-indigo-400' />
              <div className='ml-4'>
                <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Total Allocated
                </h3>
                <p className='text-2xl font-semibold text-gray-800 dark:text-white'>
                  {stats.totalLeavesAllocated.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
            <div className='flex items-center'>
              <ClockIcon className='h-8 w-8 text-orange-600 dark:text-orange-400' />
              <div className='ml-4'>
                <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>Total Used</h3>
                <p className='text-2xl font-semibold text-gray-800 dark:text-white'>
                  {stats.totalLeavesUsed.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <Link href='/admin/leave'>
            <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
              <div className='flex items-center'>
                <CogIcon className='h-8 w-8 text-red-600 dark:text-red-400' />
                <div className='ml-4'>
                  <div className='flex items-center space-x-3'>
                    <span>Pending Applications</span>
                  </div>

                  <p className='text-2xl font-semibold text-gray-800 dark:text-white'>
                    {stats.pendingApplications}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8'>
          <h2 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
            Management Actions
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <button
              onClick={handleProcessMonthlyAllocation}
              disabled={isProcessing}
              className='flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-md transition-colors'
            >
              <PlayIcon className='h-5 w-5 mr-2' />
              {isProcessing ? 'Processing...' : 'Process Monthly Allocation'}
            </button>

            <button
              onClick={handleProcessCarryForward}
              disabled={isProcessing}
              className='flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-md transition-colors'
            >
              <PlayIcon className='h-5 w-5 mr-2' />
              {isProcessing ? 'Processing...' : 'Process Year-End Carry Forward'}
            </button>
          </div>
        </div>

        {/* Employee Leave Overview */}
        <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden'>
          <div className='px-6 py-4 bg-gray-50 dark:bg-gray-700'>
            <h2 className='text-lg font-semibold text-gray-800 dark:text-white'>
              Employee Leave Overview ({selectedYear})
            </h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-700'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Employee
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Allocated
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Used
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Available
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Carry Forward
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {employeeLeaveInfo.map(employee => (
                  <tr key={employee.empId}>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900 dark:text-white'>
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className='text-sm text-gray-500 dark:text-gray-400'>
                          {employee.empId}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {employee.balance ? employee.balance.totalAllocated.toFixed(1) : '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {employee.balance ? employee.balance.totalUsed.toFixed(1) : '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {employee.balance ? employee.balance.totalAvailable.toFixed(1) : '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {employee.balance ? employee.balance.carryForward.toFixed(1) : '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          employee.balance
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}
                      >
                        {employee.balance ? 'Initialized' : 'Not Initialized'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      {!employee.balance && (
                        <button
                          onClick={() =>
                            handleInitializeEmployeeLeaves(
                              employee.empId,
                              new Date().toISOString().split('T')[0]
                            )
                          }
                          className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300'
                        >
                          Initialize
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={() => {
            confirmDialog.onConfirm();
            hideConfirmDialog();
          }}
          onCancel={hideConfirmDialog}
          severity={confirmDialog.severity}
        />
      </div>
    </AppLayout>
  );
}
