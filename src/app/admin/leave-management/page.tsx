'use client';

import { hasAdminRole } from '@/lib/userutils';
import { useUser } from '@clerk/nextjs';
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  CogIcon,
  PlayIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AppLayout from '../../AppLayout';

interface AdminStats {
  totalEmployees: number;
  employeesWithLeaveBalance: number;
  totalLeavesAllocated: number;
  totalLeavesUsed: number;
  pendingApplications: number;
}

interface EmployeeLeaveInfo {
  empId: string;
  firstName: string;
  lastName: string;
  balance: {
    totalAllocated: number;
    totalUsed: number;
    totalAvailable: number;
    carryForward: number;
  } | null;
  pendingApplications: number;
}

export default function AdminLeaveManagementPage() {
  const { user } = useUser();
  const isAdmin = useMemo(() => (user ? hasAdminRole(user) : false), [user]);

  const [stats, setStats] = useState<AdminStats>({
    totalEmployees: 0,
    employeesWithLeaveBalance: 0,
    totalLeavesAllocated: 0,
    totalLeavesUsed: 0,
    pendingApplications: 0,
  });

  const [employeeLeaveInfo, setEmployeeLeaveInfo] = useState<EmployeeLeaveInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Fetch admin statistics
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch employees
      const employeesResponse = await fetch('/api/employees?limit=1000');
      const employeesData = await employeesResponse.json();
      const employees = employeesData.employees || [];

      // Initialize stats
      let totalLeavesAllocated = 0;
      let totalLeavesUsed = 0;
      let employeesWithBalance = 0;
      const employeeInfos: EmployeeLeaveInfo[] = [];

      // Fetch leave info for each employee
      for (const employee of employees) {
        try {
          const leaveResponse = await fetch(
            `/api/leave-management?empId=${employee.empId}&year=${selectedYear}`
          );
          const leaveData = await leaveResponse.json();

          const employeeInfo: EmployeeLeaveInfo = {
            empId: employee.empId,
            firstName: employee.firstName,
            lastName: employee.lastName,
            balance: leaveData.balance,
            pendingApplications: 0, // Will be calculated separately
          };

          if (leaveData.balance) {
            employeesWithBalance++;
            totalLeavesAllocated += leaveData.balance.totalAllocated;
            totalLeavesUsed += leaveData.balance.totalUsed;
          }

          employeeInfos.push(employeeInfo);
        } catch (error) {
          console.error(`Failed to fetch leave info for ${employee.empId}:`, error);
          // Add employee without balance info
          employeeInfos.push({
            empId: employee.empId,
            firstName: employee.firstName,
            lastName: employee.lastName,
            balance: null,
            pendingApplications: 0,
          });
        }
      }

      // Fetch pending applications count
      const leaveResponse = await fetch('/api/leave');
      const allLeaves: Array<{ status: string }> = await leaveResponse.json();
      const pendingApplications = allLeaves.filter(leave => leave.status === 'PENDING').length;

      setStats({
        totalEmployees: employees.length,
        employeesWithLeaveBalance: employeesWithBalance,
        totalLeavesAllocated,
        totalLeavesUsed,
        pendingApplications,
      });

      setEmployeeLeaveInfo(employeeInfos);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setToast({ message: 'Failed to fetch leave management statistics', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, fetchStats]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const processMonthlyAllocation = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/leave-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'monthly-allocation', empId: 'ADMIN' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process monthly allocation');
      }

      setToast({ message: 'Monthly leave allocation processed successfully!', type: 'success' });
      fetchStats(); // Refresh data
    } catch (error) {
      console.error('Error processing monthly allocation:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to process monthly allocation',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processYearEndCarryForward = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/leave-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'year-end-carry-forward',
          empId: 'ADMIN',
          maxCarryForwardDays: 10,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process year-end carry forward');
      }

      setToast({ message: 'Year-end carry forward processed successfully!', type: 'success' });
      fetchStats(); // Refresh data
    } catch (error) {
      console.error('Error processing year-end carry forward:', error);
      setToast({
        message:
          error instanceof Error ? error.message : 'Failed to process year-end carry forward',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const initializeEmployeeLeaves = async (empId: string, joiningDate: string) => {
    try {
      const response = await fetch('/api/leave-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initialize',
          empId,
          joiningDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize employee leaves');
      }

      setToast({ message: `Leave balance initialized for ${empId}`, type: 'success' });
      fetchStats(); // Refresh data
    } catch (error) {
      console.error('Error initializing employee leaves:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to initialize employee leaves',
        type: 'error',
      });
    }
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
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-md shadow-lg text-white font-semibold flex items-center transition-all duration-300 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}
          >
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className='ml-4 text-white hover:text-gray-200'>
              ×
            </button>
          </div>
        )}

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

          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
            <div className='flex items-center'>
              <CogIcon className='h-8 w-8 text-red-600 dark:text-red-400' />
              <div className='ml-4'>
                <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Pending Applications
                </h3>
                <p className='text-2xl font-semibold text-gray-800 dark:text-white'>
                  {stats.pendingApplications}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8'>
          <h2 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
            Management Actions
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <button
              onClick={processMonthlyAllocation}
              disabled={isProcessing}
              className='flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-md transition-colors'
            >
              <PlayIcon className='h-5 w-5 mr-2' />
              {isProcessing ? 'Processing...' : 'Process Monthly Allocation'}
            </button>

            <button
              onClick={processYearEndCarryForward}
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
                            initializeEmployeeLeaves(
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
      </div>
    </AppLayout>
  );
}
