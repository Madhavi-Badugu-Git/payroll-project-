'use client';

import { AttendanceEntry, LeaveApplicationData, useAttendance } from '@/hooks/useAttendance';
import { combineDateAndTime, formatInputTime, formatTime24 } from '@/lib/dateUtils';
import { RootState } from '@/store';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AppLayout from '../AppLayout';

// Helper function to format numeric hours to "Xh Ym" string
const formatHoursFromNumber = (totalDecimalHours?: number | null): string => {
  if (
    totalDecimalHours === null ||
    typeof totalDecimalHours === 'undefined' ||
    totalDecimalHours <= 0
  )
    return '0h 0m';
  const totalMinutes = Math.round(totalDecimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

// Helper function to determine status color
const getStatusColorClass = (status?: string) => {
  switch (status) {
    case 'Present':
      return 'text-green-600 dark:text-green-400 font-semibold';
    case 'Half Day':
      return 'text-orange-500 dark:text-orange-400 font-semibold';
    case 'Absent':
      return 'text-red-600 dark:text-red-400 font-semibold';
    default:
      return 'text-gray-500 dark:text-gray-300';
  }
};

export default function AttendancePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { linkedEmployee } = useSelector((state: RootState) => state.user);
  const {
    attendanceLog,
    todayRecord,
    isLoading,
    error,
    fetchAttendanceLog,
    handleAttendanceAction,
    submitLeaveApplication,
    submitRegularizationRequest,
  } = useAttendance();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewedMonth, setViewedMonth] = useState(new Date());
  const [isRegularizeModalOpen, setIsRegularizeModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AttendanceEntry | null>(null);
  const [regularizationReason, setRegularizationReason] = useState('');
  const [requestedCheckIn, setRequestedCheckIn] = useState('');
  const [requestedCheckOut, setRequestedCheckOut] = useState('');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState<LeaveApplicationData>({
    startDate: '',
    endDate: '',
    leaveType: '',
    reason: '',
  });
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);

  const todayDateOnlyString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD for comparison

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedEmployee?.empId) {
      return;
    }
    setLeaveSubmitting(true);

    const success = await submitLeaveApplication(leaveForm);

    if (success) {
      setIsLeaveModalOpen(false);
      setLeaveForm({ startDate: '', endDate: '', leaveType: '', reason: '' });
    }

    setLeaveSubmitting(false);
  };

  // Use the hook's fetchAttendanceLog function
  useEffect(() => {
    if (linkedEmployee?.empId) {
      fetchAttendanceLog(viewedMonth);
    }
  }, [fetchAttendanceLog, viewedMonth, linkedEmployee?.empId]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--';
    return formatTime24(isoString);
  };

  const handleOpenRegularizeModal = (entry: AttendanceEntry) => {
    setSelectedEntry(entry);
    setRegularizationReason('');
    // Pre-fill times if they exist, otherwise empty
    setRequestedCheckIn(entry.checkIn ? formatInputTime(entry.checkIn) : '09:30');
    setRequestedCheckOut(entry.checkOut ? formatInputTime(entry.checkOut) : '18:30');
    setIsRegularizeModalOpen(true);
  };

  const handleRegularizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    // Use date utilities for consistent datetime handling
    const entryDate = selectedEntry.date.split('T')[0];
    const checkInDateTime = requestedCheckIn
      ? combineDateAndTime(entryDate, requestedCheckIn)
      : null;
    const checkOutDateTime = requestedCheckOut
      ? combineDateAndTime(entryDate, requestedCheckOut)
      : null;

    const data = {
      checkIn: checkInDateTime || undefined,
      checkOut: checkOutDateTime || undefined,
      reason: regularizationReason,
    };

    const success = await submitRegularizationRequest(selectedEntry.id, data);

    if (success) {
      setIsRegularizeModalOpen(false);
    }
  };

  // Use the hook's handleAttendanceAction function directly
  const handleCheckIn = () => {
    if (linkedEmployee?.empId && user?.id) {
      handleAttendanceAction('check-in');
    }
  };

  const handleCheckOut = () => {
    if (linkedEmployee?.empId && user?.id) {
      handleAttendanceAction('check-out');
    }
  };

  const canCheckIn =
    !todayRecord || !todayRecord.checkIn || (todayRecord.checkIn && todayRecord.checkOut);
  const canCheckOut = todayRecord && todayRecord.checkIn;

  const handlePreviousMonth = () => {
    setViewedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const userDisplayLog = [...attendanceLog].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let todayStatusMessage = "You haven't checked in today.";
  if (todayRecord) {
    if (todayRecord.checkIn && !todayRecord.checkOut) {
      todayStatusMessage = `Checked In at: ${formatTime(todayRecord.checkIn)}.`;
    } else if (todayRecord.checkIn && todayRecord.checkOut) {
      todayStatusMessage = `First Check In: ${formatTime(todayRecord.checkIn)}. Last Check Out: ${formatTime(todayRecord.checkOut)}. Total: ${formatHoursFromNumber(todayRecord.totalHours)} (Status: ${todayRecord.status}). Overtime: ${formatHoursFromNumber(todayRecord.overtimeHours)}.`;
    }
  }

  const chartData = userDisplayLog
    .filter(entry => typeof entry.totalHours === 'number' && entry.totalHours > 0)
    .map(entry => ({
      // API returns date as ISO string like "2023-11-15T00:00:00.000Z"
      // We need just the date part for display
      date: new Date(entry.date.split('T')[0] + 'T00:00:00').toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      }), // Ensure correct date parsing for local timezone display
      originalDate: entry.date, // Keep original date for proper sorting
      totalHours: entry.totalHours || 0,
      overtimeHours: entry.overtimeHours || 0,
    }))
    .sort((a, b) => new Date(a.originalDate).getTime() - new Date(b.originalDate).getTime()); // Sort chronologically for better chart readability

  if (isLoading && attendanceLog.length === 0) {
    // Show loading only on initial load
    return (
      <AppLayout>
        <div className='text-center p-10'>Loading attendance records...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className='text-center p-10 text-red-500'>
          Error: {error}{' '}
          <button
            onClick={() => user && user.id && fetchAttendanceLog(viewedMonth)}
            className='text-blue-500 underline ml-2'
          >
            Try again
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className='text-center p-10'>Please log in to view your attendance.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='w-full max-w-4xl mx-auto p-4 md:p-6'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6'>
          My Attendance
        </h1>

        <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6'>
          <h2 className='text-xl font-semibold text-gray-700 dark:text-white mb-2'>
            Today:{' '}
            {new Date(todayDateOnlyString + 'T00:00:00').toLocaleDateString([], {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h2>
          <p className='text-3xl font-mono text-gray-800 dark:text-gray-200 mb-4'>
            {currentTime.toLocaleTimeString()}
          </p>
          <div className='flex gap-4 mb-4'>
            <button
              onClick={handleCheckIn}
              disabled={!canCheckIn || isLoading} // Disable if loading
              className={`px-6 py-3 rounded-md font-semibold text-white transition-colors 
                          ${canCheckIn && !isLoading ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!canCheckOut || isLoading} // Disable if loading
              className={`px-6 py-3 rounded-md font-semibold text-white transition-colors 
                          ${canCheckOut && !isLoading ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Check Out
            </button>
          </div>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {isLoading ? 'Processing...' : todayStatusMessage}
          </p>
        </div>

        <div className='flex justify-between items-center mt-8 mb-4'>
          <h2 className='text-xl font-semibold text-gray-700 dark:text-white'>
            Attendance History for{' '}
            {viewedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
            >
              Apply for Leave
            </button>
            <button
              onClick={handlePreviousMonth}
              className='p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            >
              <ChevronLeftIcon className='h-5 w-5 text-gray-700 dark:text-gray-300' />
            </button>
            <button
              onClick={handleNextMonth}
              className='p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            >
              <ChevronRightIcon className='h-5 w-5 text-gray-700 dark:text-gray-300' />
            </button>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-50 dark:bg-gray-700'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                >
                  Date
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                >
                  Check In
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                >
                  Check Out
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                >
                  Total Hours
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                >
                  Status
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                >
                  Overtime
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
              {userDisplayLog.map(entry => (
                <tr key={entry.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                    {new Date(entry.date.split('T')[0] + 'T00:00:00').toLocaleDateString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                    {formatTime(entry.checkIn)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                    {formatTime(entry.checkOut)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                    {formatHoursFromNumber(entry.totalHours)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${getStatusColorClass(entry.status)}`}
                  >
                    {entry.status}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                    {formatHoursFromNumber(entry.overtimeHours)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    {entry.isRegularizationAllowed ? (
                      <button
                        onClick={() => handleOpenRegularizeModal(entry)}
                        className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-600 disabled:text-gray-400 disabled:cursor-not-allowed'
                      >
                        Regularize
                      </button>
                    ) : entry.regularizationStatus ? (
                      <span className='text-sm text-gray-500 dark:text-gray-400 italic'>
                        {entry.regularizationStatus}
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))}
              {userDisplayLog.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className='px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300'
                  >
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {userDisplayLog.length > 0 && (
          <div className='mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-gray-700 dark:text-white'>
                Attendance Chart (
                {viewedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })})
              </h2>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Showing {chartData.length} days with recorded hours (excluding zero-hour days)
              </p>
            </div>
            <ResponsiveContainer width='100%' height={400}>
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} hrs`} />
                <Legend />
                <Bar dataKey='totalHours' fill='#8884d8' name='Total Hours' />
                <Bar dataKey='overtimeHours' fill='#82ca9d' name='Overtime Hours' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Regularization Modal */}
        {isRegularizeModalOpen && selectedEntry && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md'>
              <h2 className='text-xl font-bold text-gray-800 dark:text-white mb-4'>
                Regularize Attendance
              </h2>
              <p className='mb-2 text-sm text-gray-600 dark:text-gray-300'>
                Date:{' '}
                <span className='font-semibold'>
                  {new Date(selectedEntry.date).toLocaleDateString()}
                </span>
              </p>
              <p className='mb-4 text-sm text-gray-600 dark:text-gray-300'>
                Status:{' '}
                <span className={`font-semibold ${getStatusColorClass(selectedEntry.status)}`}>
                  {selectedEntry.status}
                </span>
              </p>
              <form onSubmit={handleRegularizationSubmit}>
                <div className='mb-4'>
                  <label
                    htmlFor='checkInTime'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Requested Check-In
                  </label>
                  <input
                    type='time'
                    id='checkInTime'
                    value={requestedCheckIn}
                    onChange={e => setRequestedCheckIn(e.target.value)}
                    className='mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200'
                  />
                </div>
                <div className='mb-4'>
                  <label
                    htmlFor='checkOutTime'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Requested Check-Out
                  </label>
                  <input
                    type='time'
                    id='checkOutTime'
                    value={requestedCheckOut}
                    onChange={e => setRequestedCheckOut(e.target.value)}
                    className='mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200'
                  />
                </div>
                <div className='mb-4'>
                  <label
                    htmlFor='reason'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Reason
                  </label>
                  <textarea
                    id='reason'
                    rows={3}
                    value={regularizationReason}
                    onChange={e => setRegularizationReason(e.target.value)}
                    required
                    className='mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200'
                    placeholder='e.g., Forgot to check in, client meeting, etc.'
                  />
                </div>
                <div className='flex justify-end gap-4'>
                  <button
                    type='button'
                    onClick={() => setIsRegularizeModalOpen(false)}
                    className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700'
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Leave Application Modal */}
        {isLeaveModalOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md'>
              <h2 className='text-xl font-bold text-gray-800 dark:text-white mb-4'>
                Apply for Leave
              </h2>
              <form onSubmit={handleLeaveSubmit}>
                <div className='mb-4'>
                  <label
                    htmlFor='startDate'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Start Date
                  </label>
                  <input
                    type='date'
                    id='startDate'
                    required
                    value={leaveForm.startDate}
                    onChange={e => setLeaveForm(f => ({ ...f, startDate: e.target.value }))}
                    className='mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200'
                  />
                </div>
                <div className='mb-4'>
                  <label
                    htmlFor='endDate'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    End Date
                  </label>
                  <input
                    type='date'
                    id='endDate'
                    required
                    value={leaveForm.endDate}
                    onChange={e => setLeaveForm(f => ({ ...f, endDate: e.target.value }))}
                    className='mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200'
                  />
                </div>
                <div className='mb-4'>
                  <label
                    htmlFor='leaveType'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Leave Type
                  </label>
                  <select
                    id='leaveType'
                    required
                    value={leaveForm.leaveType}
                    onChange={e => setLeaveForm(f => ({ ...f, leaveType: e.target.value }))}
                    className='mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200'
                  >
                    <option value=''>Select a type</option>
                    <option value='Sick'>Sick</option>
                    <option value='Casual'>Casual</option>
                    <option value='Earned'>Earned</option>
                  </select>
                </div>
                <div className='mb-4'>
                  <label
                    htmlFor='leaveReason'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300'
                  >
                    Reason
                  </label>
                  <textarea
                    id='leaveReason'
                    rows={3}
                    required
                    value={leaveForm.reason}
                    onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))}
                    className='mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200'
                    placeholder='Please provide a reason for your leave.'
                  />
                </div>
                <div className='flex justify-end gap-4'>
                  <button
                    type='button'
                    onClick={() => setIsLeaveModalOpen(false)}
                    className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={leaveSubmitting}
                    className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed'
                  >
                    {leaveSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
