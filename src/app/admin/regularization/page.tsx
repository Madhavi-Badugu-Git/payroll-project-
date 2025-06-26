'use client';

import AppLayout from '@/app/AppLayout';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';

interface Attendance {
  id: string;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: string;
}

interface RegularizationRequest {
  id: string;
  employeeId: string;
  date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedCheckIn?: string | null;
  requestedCheckOut?: string | null;
  createdAt: string;
  attendance: Attendance;
  employee?: {
    firstName: string;
    lastName: string;
    empId: string;
  };
}

export default function RegularizationAdminPage() {
  const [requests, setRequests] = useState<RegularizationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/regularization'); // No auth header needed
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch requests');
      }
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleUpdateRequest = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const response = await fetch(`/api/regularization/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${status.toLowerCase()} request.`);
      }

      setToast({ message: `Request ${status.toLowerCase()} successfully.`, type: 'success' });
      fetchRequests(); // Refresh the list
    } catch (err) {
      if (err instanceof Error) {
        setToast({ message: err.message, type: 'error' });
      } else {
        setToast({ message: 'An unknown error occurred.', type: 'error' });
      }
    }
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          Manage Attendance Regularization
        </h1>

        {isLoading && <p>Loading requests...</p>}
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
                    Date
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Original Status
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {req.employee ? (
                        <div>
                          <div className='font-medium'>
                            {req.employee.firstName} {req.employee.lastName}
                          </div>
                          <div className='text-gray-500 text-xs'>{req.employee.empId}</div>
                        </div>
                      ) : (
                        req.employeeId
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {formatDate(req.date)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {req.attendance.status}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {`In: ${formatTime(req.requestedCheckIn)} | Out: ${formatTime(req.requestedCheckOut)}`}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate'>
                      {req.reason}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          req.status === 'Approved'
                            ? 'bg-green-100 text-green-800'
                            : req.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      {req.status === 'Pending' && (
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleUpdateRequest(req.id, 'Approved')}
                            className='text-green-600 hover:text-green-900'
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateRequest(req.id, 'Rejected')}
                            className='text-red-600 hover:text-red-900'
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={7} className='text-center py-4'>
                      No pending requests.
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
