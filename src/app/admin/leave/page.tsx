'use client';
import AppLayout from '@/app/AppLayout';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/dist/client/link';
import { useCallback, useEffect, useState } from 'react';

interface LeaveApplication {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'Cancelled';
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  employee?: {
    firstName: string;
    lastName: string;
    empId: string;
  };
}

export default function LeaveAdminPage() {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchLeaves = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/leave');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch leave applications');
      }
      const data = await res.json();
      setLeaves(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/leave/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `Failed to ${status === 'APPROVED' ? 'approve' : 'reject'} leave.`
        );
      }
      setToast({
        message: `Leave ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`,
        type: 'success',
      });
      fetchLeaves();
    } catch (err) {
      if (err instanceof Error) {
        setToast({ message: err.message, type: 'error' });
      } else {
        setToast({ message: 'An unknown error occurred.', type: 'error' });
      }
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AppLayout>
      <div className='w-full max-w-6xl mx-auto p-4 md:p-6'>
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

        <h1 className='text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6'>
          <Link href='/admin/leave-management' className='flex items-center gap-2'>
            <ArrowLeftIcon className='h-6 w-6' />
            Manage Leave Applications
          </Link>
        </h1>

        {isLoading && <p>Loading applications...</p>}
        {error && <p className='text-red-500'>Error: {error}</p>}

        {!isLoading && !error && (
          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-700'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Employee
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Leave Type
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Dates
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Days
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
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {leave.employee ? (
                        <div>
                          <div className='font-medium'>
                            {leave.employee.firstName} {leave.employee.lastName}
                          </div>
                          <div className='text-gray-500 text-xs'>{leave.employee.empId}</div>
                        </div>
                      ) : (
                        leave.employeeId
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {leave.leaveType}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {Math.ceil(
                        (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + 1}
                    </td>
                    <td
                      className='px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate'
                      title={leave.reason}
                    >
                      {leave.reason}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          leave.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : leave.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : leave.status === 'Cancelled'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {leave.status === 'PENDING'
                          ? 'Pending'
                          : leave.status === 'APPROVED'
                            ? 'Approved'
                            : leave.status === 'REJECTED'
                              ? 'Rejected'
                              : 'Cancelled'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {formatDate(leave.appliedAt)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      {leave.status === 'PENDING' && (
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleAction(leave.id, 'APPROVED')}
                            className='text-green-600 hover:text-green-900 px-3 py-1 border border-green-600 rounded hover:bg-green-50'
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(leave.id, 'REJECTED')}
                            className='text-red-600 hover:text-red-900 px-3 py-1 border border-red-600 rounded hover:bg-red-50'
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {leave.status !== 'PENDING' && (
                        <span className='text-gray-400 text-sm'>No actions available</span>
                      )}
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan={8} className='text-center py-4'>
                      No leave applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
