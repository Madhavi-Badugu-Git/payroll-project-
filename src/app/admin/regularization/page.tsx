'use client';

import AppLayout from '@/app/AppLayout';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useRegularization } from '@/hooks/useRegularization';
import { formatDisplayDate, formatDisplayDateTime, formatTime24 } from '@/lib/dateUtils';
import { useEffect } from 'react';

export default function RegularizationAdminPage() {
  const { requests, isLoading, fetchRequests, approveRequest, rejectRequest } = useRegularization();

  const { confirmDialog, showConfirmDialog, hideConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = (requestId: string) => {
    showConfirmDialog({
      title: 'Approve Regularization',
      message: 'Are you sure you want to approve this regularization request?',
      onConfirm: () => approveRequest(requestId, 'admin'),
    });
  };

  const handleReject = (requestId: string) => {
    showConfirmDialog({
      title: 'Reject Regularization',
      message:
        'Are you sure you want to reject this regularization request? Please provide a reason.',
      onConfirm: () => {
        const reason = 'Request rejected by admin'; // You can customize this or prompt the user for input
        rejectRequest(requestId, 'admin', reason);
      },
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    return formatDisplayDateTime(dateTimeString);
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return '-';

    try {
      return formatTime24(timeString);
    } catch (_error) {
      return '-';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className='p-6 text-center'>Loading regularization requests...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='w-full max-w-7xl mx-auto p-4 md:p-6'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-800 dark:text-white'>
            Regularization Requests
          </h1>
        </div>

        {/* Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>Total Requests</h3>
            <p className='text-2xl font-semibold text-gray-800 dark:text-white'>
              {requests.length}
            </p>
          </div>
          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>Pending</h3>
            <p className='text-2xl font-semibold text-yellow-600 dark:text-yellow-400'>
              {requests.filter(r => r.status.toLowerCase() === 'pending').length}
            </p>
          </div>
          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>Processed</h3>
            <p className='text-2xl font-semibold text-green-600 dark:text-green-400'>
              {requests.filter(r => r.status.toLowerCase() !== 'pending').length}
            </p>
          </div>
        </div>

        {/* Requests Table */}
        <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden'>
          <div className='px-6 py-4 bg-gray-50 dark:bg-gray-700'>
            <h2 className='text-lg font-semibold text-gray-800 dark:text-white'>
              All Regularization Requests
            </h2>
          </div>

          {requests.length === 0 ? (
            <div className='p-6 text-center text-gray-500 dark:text-gray-400'>
              No regularization requests found.
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-gray-700'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Employee
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Current Times
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Requested Times
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Reason
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Submitted
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                  {requests.map(request => (
                    <tr key={request.id}>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div>
                          <div className='text-sm font-medium text-gray-900 dark:text-white'>
                            {request.employee
                              ? `${request.employee.firstName} ${request.employee.lastName}`
                              : 'Unknown Employee'}
                          </div>
                          <div className='text-sm text-gray-500 dark:text-gray-400'>
                            {request.employee?.empId || request.employeeId}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                        {formatDisplayDate(request.date)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                        <div>
                          <div>In: {formatTime(request.attendance?.checkIn)}</div>
                          <div>Out: {formatTime(request.attendance?.checkOut)}</div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                        <div>
                          <div>In: {formatTime(request.requestedCheckIn)}</div>
                          <div>Out: {formatTime(request.requestedCheckOut)}</div>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs'>
                        <div className='truncate' title={request.reason}>
                          {request.reason}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClass(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                        {formatDateTime(request.createdAt)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        {request.status.toLowerCase() === 'pending' ? (
                          <div className='flex space-x-2'>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className='text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className='text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className='text-gray-400 dark:text-gray-500'>{request.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
