'use client';

import { useUser } from '@clerk/nextjs';
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ClockIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LeaveEntry, useLeaves } from '../../hooks/useLeaves';
import AppLayout from '../AppLayout';

const LEAVE_TYPES: LeaveEntry['leaveType'][] = ['Sick', 'Casual', 'Earned'];
const CURRENT_YEAR = new Date().getFullYear();

export default function EnhancedLeavesPage() {
  const { user } = useUser();
  const {
    leaves,
    leaveInfo,
    configurations,
    isLoading,
    isSubmitting,
    error: hookError,
    fetchLeaves,
    fetchLeaveInfo,
    fetchConfigurations,
    createLeave,
    updateLeave,
    deleteLeave,
    cancelLeave,
  } = useLeaves();

  const [sanctionedLeavePerYear, setSanctionedLeavePerYear] = useState<number>(24);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveEntry | null>(null);
  const [formData, setFormData] = useState({
    leaveType: 'Casual' as LeaveEntry['leaveType'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    noOfDays: 1,
  });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [leaveToDeleteId, setLeaveToDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'applications' | 'balance' | 'history'>(
    'applications'
  );

  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Get employee ID from user
  const getEmployeeId = useCallback((): string | null => {
    if (!user) return null;

    if (user.publicMetadata?.empId) {
      return user.publicMetadata.empId as string;
    }

    // Fallback mapping for demo
    const emailToEmpIdMap: { [key: string]: string } = {
      'john.doe@company.com': 'EMP001',
      'jane.smith@company.com': 'EMP002',
      'mike.johnson@company.com': 'EMP003',
    };

    if (user.emailAddresses?.[0]?.emailAddress) {
      return emailToEmpIdMap[user.emailAddresses[0].emailAddress] || null;
    }

    return null;
  }, [user]);

  // Update sanctioned leave per year when configurations change
  useEffect(() => {
    const sanctionedLeave = configurations.SANCTIONED_LEAVE_PER_YEAR;
    if (sanctionedLeave) {
      setSanctionedLeavePerYear(parseInt(sanctionedLeave));
    }
  }, [configurations]);

  // Initial data loading
  useEffect(() => {
    if (user) {
      fetchConfigurations();
      fetchLeaves();

      const empId = getEmployeeId();
      if (empId) {
        fetchLeaveInfo(empId, CURRENT_YEAR);
      }
    }
  }, [user, fetchLeaves, fetchConfigurations, fetchLeaveInfo, getEmployeeId]);

  // Handle hook errors
  useEffect(() => {
    if (hookError) {
      setToast({ message: hookError, type: 'error' });
    }
  }, [hookError]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Calculate legacy available leaves (for backward compatibility with old UI components)
  const availableLeaves = useMemo(() => {
    if (leaveInfo.balance) {
      return {
        earned: Math.max(0, leaveInfo.balance.totalAvailable),
        sick: 0,
        casual: 0,
        totalAvailable: Math.max(0, leaveInfo.balance.totalAvailable),
        totalUsed: leaveInfo.balance.totalUsed,
        totalSanctioned: leaveInfo.balance.totalAllocated,
      };
    }

    // Fallback to old calculation if new system not initialized
    if (!user)
      return { earned: 0, sick: 0, casual: 0, totalAvailable: 0, totalUsed: 0, totalSanctioned: 0 };

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const completedMonths = currentMonth;
    const totalSanctioned = Math.floor((sanctionedLeavePerYear / 12) * completedMonths);

    const usedLeaves = leaves
      .filter(
        leave =>
          leave.status === 'APPROVED' && new Date(leave.startDate).getFullYear() === CURRENT_YEAR
      )
      .reduce((acc, leave) => acc + leave.noOfDays, 0);

    const available = totalSanctioned - usedLeaves;

    return {
      earned: Math.max(0, available),
      sick: 0,
      casual: 0,
      totalAvailable: Math.max(0, available),
      totalUsed: usedLeaves,
      totalSanctioned,
    };
  }, [leaves, user, sanctionedLeavePerYear, leaveInfo.balance]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };

    if (newFormData.startDate && newFormData.endDate) {
      const from = new Date(newFormData.startDate);
      const to = new Date(newFormData.endDate);
      if (to >= from) {
        const diffTime = Math.abs(to.getTime() - from.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setFormData({ ...newFormData, noOfDays: diffDays });
      } else {
        setFormData({ ...newFormData, noOfDays: 0 });
      }
    } else {
      setFormData(newFormData);
    }
  };

  const openModal = (leave: LeaveEntry | null = null) => {
    if (leave) {
      setEditingLeave(leave);
      setFormData({
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        noOfDays: leave.noOfDays,
        reason: leave.reason,
      });
    } else {
      setEditingLeave(null);
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        leaveType: 'Casual',
        startDate: today,
        endDate: today,
        noOfDays: 1,
        reason: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLeave(null);
  };

  const openDeleteConfirm = (id: string) => {
    setLeaveToDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setLeaveToDeleteId(null);
    setIsDeleteConfirmOpen(false);
  };

  const confirmDelete = async () => {
    if (leaveToDeleteId) {
      try {
        await deleteLeave(leaveToDeleteId);
        setToast({ message: 'Leave request deleted successfully.', type: 'success' });

        // Refresh leave info
        const empId = getEmployeeId();
        if (empId) {
          await fetchLeaveInfo(empId, CURRENT_YEAR);
        }
      } catch (err) {
        if (err instanceof Error) {
          setToast({ message: err.message, type: 'error' });
        } else {
          setToast({ message: 'An unknown error occurred.', type: 'error' });
        }
      } finally {
        closeDeleteConfirm();
      }
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    try {
      await cancelLeave(leaveId);
      setToast({ message: 'Leave request cancelled successfully.', type: 'success' });

      // Refresh leave info
      const empId = getEmployeeId();
      if (empId) {
        await fetchLeaveInfo(empId, CURRENT_YEAR);
      }
    } catch (err) {
      if (err instanceof Error) {
        setToast({ message: err.message, type: 'error' });
      } else {
        setToast({ message: 'An unknown error occurred.', type: 'error' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !user ||
      !formData.leaveType ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.noOfDays ||
      formData.noOfDays <= 0
    ) {
      setToast({
        message: 'Please fill all required fields and ensure number of days is positive.',
        type: 'error',
      });
      return;
    }

    // Check if user has sufficient leave balance
    if (leaveInfo.balance && formData.noOfDays > leaveInfo.balance.totalAvailable) {
      setToast({
        message: `Insufficient leave balance. Available: ${leaveInfo.balance.totalAvailable} days, Requested: ${formData.noOfDays} days`,
        type: 'error',
      });
      return;
    }

    const leaveData = {
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
    };

    try {
      if (editingLeave) {
        await updateLeave(editingLeave.id, leaveData);
        setToast({
          message: 'Leave request updated successfully!',
          type: 'success',
        });
      } else {
        await createLeave(leaveData);
        setToast({
          message: 'Leave request submitted successfully!',
          type: 'success',
        });
      }

      // Refresh leave info
      const empId = getEmployeeId();
      if (empId) {
        await fetchLeaveInfo(empId, CURRENT_YEAR);
      }

      closeModal();
    } catch (err) {
      if (err instanceof Error) {
        setToast({ message: err.message, type: 'error' });
      } else {
        setToast({ message: 'An unknown error occurred.', type: 'error' });
      }
    }
  };

  const getStatusDisplay = (status: LeaveEntry['status']) => {
    const statusMap = {
      PENDING: 'Pending Approval',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      Cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: LeaveEntry['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 dark:text-green-400';
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'REJECTED':
        return 'text-red-600 dark:text-red-400';
      case 'Cancelled':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return '';
    }
  };

  if (isLoading && leaves.length === 0) {
    return (
      <AppLayout>
        <div className='p-6 text-center'>Loading your leave records...</div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className='p-6'>Please sign in to manage your leaves.</div>
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
              <XMarkIcon className='h-5 w-5' />
            </button>
          </div>
        )}

        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-800 dark:text-white'>
            Leave Management
          </h1>
          <button
            onClick={() => openModal()}
            className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md flex items-center transition-colors'
          >
            <PlusIcon className='h-5 w-5 mr-2' />
            Apply for Leave
          </button>
        </div>

        {/* Tab Navigation */}
        <div className='border-b border-gray-200 dark:border-gray-700 mb-6'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <CalendarDaysIcon className='h-5 w-5 inline mr-2' />
              Leave Applications
            </button>
            <button
              onClick={() => setActiveTab('balance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'balance'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <ChartBarIcon className='h-5 w-5 inline mr-2' />
              Leave Balance
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <ClockIcon className='h-5 w-5 inline mr-2' />
              Transaction History
            </button>
          </nav>
        </div>

        {/* Leave Balance Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-4'>
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              Total Allocated ({CURRENT_YEAR})
            </h3>
            <p className='text-2xl font-semibold text-gray-800 dark:text-white'>
              {availableLeaves.totalSanctioned}
            </p>
          </div>
          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-4'>
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              Total Used ({CURRENT_YEAR})
            </h3>
            <p className='text-2xl font-semibold text-gray-800 dark:text-white'>
              {availableLeaves.totalUsed}
            </p>
          </div>
          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-4'>
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              Available Balance
            </h3>
            <p className='text-2xl font-semibold text-green-600 dark:text-green-400'>
              {availableLeaves.totalAvailable}
            </p>
          </div>
          {leaveInfo.balance && leaveInfo.balance.carryForward > 0 && (
            <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-4'>
              <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                Carry Forward
              </h3>
              <p className='text-2xl font-semibold text-blue-600 dark:text-blue-400'>
                {leaveInfo.balance.carryForward}
              </p>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'applications' && (
          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-700'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Leave Type
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    From Date
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    To Date
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    No. of Days
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Reason
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Applied On
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {leaves.map(leave => (
                  <tr key={leave.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                      {leave.leaveType}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {new Date(leave.startDate).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {leave.noOfDays}
                    </td>
                    <td
                      className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 truncate max-w-xs'
                      title={leave.reason}
                    >
                      {leave.reason}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getStatusColor(leave.status)}`}
                    >
                      {getStatusDisplay(leave.status)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {new Date(leave.appliedDate).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      {(() => {
                        const today = new Date();
                        const leaveStartDate = new Date(leave.startDate);
                        const canModify = leave.status === 'PENDING' && leaveStartDate > today;

                        if (canModify) {
                          return (
                            <div className='flex space-x-2'>
                              <button
                                onClick={() => openModal(leave)}
                                className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200'
                                title='Edit Leave'
                              >
                                <PencilIcon className='h-5 w-5' />
                              </button>
                              <button
                                onClick={() => handleCancelLeave(leave.id)}
                                className='text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-200'
                                disabled={isSubmitting}
                                title='Cancel Leave'
                              >
                                <XMarkIcon className='h-5 w-5' />
                              </button>
                              <button
                                onClick={() => openDeleteConfirm(leave.id)}
                                className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200'
                                title='Delete Leave'
                              >
                                <TrashIcon className='h-5 w-5' />
                              </button>
                            </div>
                          );
                        } else if (leave.status === 'PENDING' && leaveStartDate <= today) {
                          return <span className='text-gray-400 text-sm'>Leave has started</span>;
                        } else {
                          return (
                            <span className='text-gray-400 text-sm'>No actions available</span>
                          );
                        }
                      })()}
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan={8}
                      className='px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300'
                    >
                      No leave records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'balance' && (
          <div className='space-y-6'>
            {/* Leave Accumulation History */}
            <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
                Leave Accumulation History ({CURRENT_YEAR})
              </h3>
              {leaveInfo.accumulations.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                    <thead className='bg-gray-50 dark:bg-gray-700'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Month
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Allocated Days
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Reason
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Allocation Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                      {leaveInfo.accumulations.map(accumulation => (
                        <tr key={accumulation.id}>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                            {accumulation.monthName}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                            {accumulation.allocatedDays}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                            {accumulation.reason.replace(/_/g, ' ')}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                            {new Date(accumulation.accumulationDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className='text-gray-500 dark:text-gray-400'>No accumulation history found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
              Leave Transaction History ({CURRENT_YEAR})
            </h3>
            {leaveInfo.transactions.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                  <thead className='bg-gray-50 dark:bg-gray-700'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                        Date
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                        Type
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                        Days
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                        Balance Before
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                        Balance After
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                    {leaveInfo.transactions.map(transaction => (
                      <tr key={transaction.id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm'>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              transaction.transactionType === 'CREDIT'
                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                : transaction.transactionType === 'DEBIT'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                            }`}
                          >
                            {transaction.transactionType}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm'>
                          <span
                            className={
                              transaction.days > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }
                          >
                            {transaction.days > 0 ? '+' : ''}
                            {transaction.days}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                          {transaction.balanceBefore}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                          {transaction.balanceAfter}
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate'>
                          {transaction.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className='text-gray-500 dark:text-gray-400'>No transaction history found.</p>
            )}
          </div>
        )}

        {/* Leave Application Modal */}
        {isModalOpen && (
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-40 flex items-center justify-center'>
            <div className='relative bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md mx-auto'>
              <h2 className='text-xl font-semibold text-gray-800 dark:text-white mb-6'>
                {editingLeave ? 'Edit' : 'Apply for'} Leave
              </h2>
              <form onSubmit={handleSubmit}>
                <div className='mb-4'>
                  <label
                    htmlFor='leaveType'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Leave Type
                  </label>
                  <select
                    name='leaveType'
                    id='leaveType'
                    value={formData.leaveType || ''}
                    onChange={handleInputChange}
                    required
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white'
                  >
                    {LEAVE_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                  <div>
                    <label
                      htmlFor='startDate'
                      className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      From Date
                    </label>
                    <input
                      type='date'
                      name='startDate'
                      id='startDate'
                      value={formData.startDate || ''}
                      onChange={handleDateChange}
                      required
                      className='mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white'
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='endDate'
                      className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      To Date
                    </label>
                    <input
                      type='date'
                      name='endDate'
                      id='endDate'
                      value={formData.endDate || ''}
                      onChange={handleDateChange}
                      required
                      min={formData.startDate}
                      className='mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white'
                    />
                  </div>
                </div>
                <div className='mb-4'>
                  <label
                    htmlFor='noOfDays'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Number of Days
                  </label>
                  <input
                    type='number'
                    name='noOfDays'
                    id='noOfDays'
                    value={formData.noOfDays || ''}
                    readOnly
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none sm:text-sm bg-gray-100 dark:bg-gray-700 dark:text-white'
                  />
                  {leaveInfo.balance && (
                    <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                      Available balance: {leaveInfo.balance.totalAvailable} days
                    </p>
                  )}
                </div>
                <div className='mb-6'>
                  <label
                    htmlFor='reason'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Reason
                  </label>
                  <textarea
                    name='reason'
                    id='reason'
                    rows={3}
                    value={formData.reason || ''}
                    onChange={handleInputChange}
                    required
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white'
                  />
                </div>
                <div className='flex items-center justify-end space-x-4'>
                  <button
                    type='button'
                    onClick={closeModal}
                    className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:bg-indigo-400'
                  >
                    {isSubmitting
                      ? 'Submitting...'
                      : editingLeave
                        ? 'Update Leave'
                        : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && (
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center'>
            <div className='relative bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md mx-auto'>
              <h2 className='text-xl font-semibold text-gray-800 dark:text-white mb-4'>
                Confirm Deletion
              </h2>
              <p className='text-gray-600 dark:text-gray-300 mb-6'>
                Are you sure you want to delete this leave request? This action cannot be undone.
              </p>
              <div className='flex items-center justify-end space-x-4'>
                <button
                  type='button'
                  onClick={closeDeleteConfirm}
                  className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                  className='px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:bg-red-400'
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
