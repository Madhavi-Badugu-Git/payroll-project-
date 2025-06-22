'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../AppLayout';
import { useUser } from '@clerk/nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface AttendanceEntry {
  id: string; 
  employeeId: string;
  date: string; // ISO Date string (e.g., "2023-10-27T00:00:00.000Z")
  checkIn?: string | null; // ISO DateTime string
  checkOut?: string | null; // ISO DateTime string
  status: string; 
  totalHours?: number | null;
  overtimeHours?: number | null;
  regularizationStatus?: string | null; // e.g., 'Pending', 'Approved', 'Rejected'
  isRegularizationAllowed?: boolean;
}

// Helper function to format numeric hours to "Xh Ym" string
const formatHoursFromNumber = (totalDecimalHours?: number | null): string => {
  if (totalDecimalHours === null || typeof totalDecimalHours === 'undefined' || totalDecimalHours <= 0) return '0h 0m';
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
  const { user } = useUser();
  const [attendanceLog, setAttendanceLog] = useState<AttendanceEntry[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceEntry | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [viewedMonth, setViewedMonth] = useState(new Date());
  const [isRegularizeModalOpen, setIsRegularizeModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AttendanceEntry | null>(null);
  const [regularizationReason, setRegularizationReason] = useState('');
  const [requestedCheckIn, setRequestedCheckIn] = useState('');
  const [requestedCheckOut, setRequestedCheckOut] = useState('');

  const todayDateOnlyString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD for comparison

  const fetchAttendanceLog = useCallback(async (date: Date) => {
    if (!user || !user.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // getMonth() is 0-indexed
      const response = await fetch(`/api/attendance?employeeId=${user.id}&year=${year}&month=${month}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch attendance: ${response.statusText}`);
      }
      const data: AttendanceEntry[] = await response.json();

      // Add client-side logic to determine if regularization is allowed
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(today.getDate() - 3);

      const processedData = data.map(entry => {
        const entryDate = new Date(entry.date);
        const isAllowed = (entry.status === 'Absent' || entry.status === 'Half Day') &&
                            entryDate >= threeDaysAgo &&
                            entryDate < today &&
                            !entry.regularizationStatus;
        return { ...entry, isRegularizationAllowed: isAllowed };
      });

      setAttendanceLog(processedData);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err instanceof Error) {
        setError(err.message || 'Could not fetch attendance data.');
      } else {
        setError('An unknown error occurred while fetching attendance data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAttendanceLog(viewedMonth);
    }
  }, [fetchAttendanceLog, viewedMonth, user]);

  useEffect(() => {
    if (user && attendanceLog.length > 0) {
      const currentDayEntry = attendanceLog.find(entry => entry.date.startsWith(todayDateOnlyString));
      setTodayRecord(currentDayEntry);
    } else if (user && attendanceLog.length === 0 && !isLoading) {
      // If log is empty after loading and user exists, there's no record for today (or any day)
      setTodayRecord(undefined);
    }
  }, [user, attendanceLog, todayDateOnlyString, isLoading]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleOpenRegularizeModal = (entry: AttendanceEntry) => {
    setSelectedEntry(entry);
    setRegularizationReason('');
    // Pre-fill times if they exist, otherwise empty
    setRequestedCheckIn(entry.checkIn ? new Date(entry.checkIn).toTimeString().substring(0, 5) : '09:30');
    setRequestedCheckOut(entry.checkOut ? new Date(entry.checkOut).toTimeString().substring(0, 5) : '18:30');
    setIsRegularizeModalOpen(true);
  };

  const handleRegularizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    // Combine date with time strings to create full ISO strings
    const entryDate = selectedEntry.date.split('T')[0];
    const checkInDateTime = requestedCheckIn ? `${entryDate}T${requestedCheckIn}:00.000Z` : null;
    const checkOutDateTime = requestedCheckOut ? `${entryDate}T${requestedCheckOut}:00.000Z` : null;

    const payload = {
      attendanceId: selectedEntry.id,
      date: selectedEntry.date,
      reason: regularizationReason,
      requestedCheckIn: checkInDateTime,
      requestedCheckOut: checkOutDateTime,
    };

    try {
      const response = await fetch('/api/regularization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request.');
      }

      setToast({ message: 'Regularization request submitted successfully!', type: 'success' });
      setIsRegularizeModalOpen(false);
      // Refresh data to show updated status
      fetchAttendanceLog(viewedMonth);
    } catch (err) {
        if (err instanceof Error) {
            setToast({ message: err.message, type: 'error' });
        } else {
            setToast({ message: 'An unknown error occurred.', type: 'error' });
        }
    }
  };

  const handleAttendanceAction = async (type: 'checkIn' | 'checkOut') => {
    if (!user || !user.id) return;
    setToast(null);
    // Let fetchAttendanceLog handle loading state
    setError(null);
    const now = new Date();
    const payload = {
      employeeId: user.id, 
      date: todayDateOnlyString, 
      type: type,
      time: now.toISOString(),
    };
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      // Always refresh attendance log for the currently viewed month
      await fetchAttendanceLog(viewedMonth);

      if (!response.ok) {
        const errorData = await response.json();
        setToast({ message: errorData.error || `Failed to ${type}.`, type: 'error' });
        return;
      }
      setToast({ message: `${type === 'checkIn' ? 'Check-in' : 'Check-out'} successful!`, type: 'success' });
    } catch (err) {
      console.error("Error in handleAttendanceAction:", err);
      setToast({ message: `An error occurred while performing ${type}.`, type: 'error' });
    }
  };

  const handleCheckIn = () => handleAttendanceAction('checkIn');
  const handleCheckOut = () => handleAttendanceAction('checkOut');

  const canCheckIn = !todayRecord || (todayRecord.checkIn && todayRecord.checkOut);
  const canCheckOut = todayRecord && todayRecord.checkIn

  const handlePreviousMonth = () => {
    setViewedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewedMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const userDisplayLog = [...attendanceLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let todayStatusMessage = "You haven't checked in today.";
  if (todayRecord) {
    if (todayRecord.checkIn && !todayRecord.checkOut) {
      todayStatusMessage = `Checked In at: ${formatTime(todayRecord.checkIn)}.`;
    } else if (todayRecord.checkIn && todayRecord.checkOut) {
      todayStatusMessage = `First Check In: ${formatTime(todayRecord.checkIn)}. Last Check Out: ${formatTime(todayRecord.checkOut)}. Total: ${formatHoursFromNumber(todayRecord.totalHours)} (Status: ${todayRecord.status}). Overtime: ${formatHoursFromNumber(todayRecord.overtimeHours)}.`;
    }
  }

  const chartData = userDisplayLog
    .filter(entry => typeof entry.totalHours === 'number')
    .map(entry => ({
      // date: new Date(entry.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      // API returns date as ISO string like "2023-11-15T00:00:00.000Z"
      // We need just the date part for display
      date: new Date(entry.date.split('T')[0] + 'T00:00:00').toLocaleDateString([], { month: 'short', day: 'numeric' }), // Ensure correct date parsing for local timezone display
      totalHours: entry.totalHours || 0,
      overtimeHours: entry.overtimeHours || 0,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (isLoading && attendanceLog.length === 0) { // Show loading only on initial load
    return <AppLayout><div className="text-center p-10">Loading attendance records...</div></AppLayout>;
  }

  if (error) {
    return <AppLayout><div className="text-center p-10 text-red-500">Error: {error} <button onClick={() => fetchAttendanceLog(viewedMonth)} className="text-blue-500 underline ml-2">Try again</button></div></AppLayout>;
  }
  
  if (!user) {
    return <AppLayout><div className="text-center p-10">Please log in to view your attendance.</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
        {/* Toast Notification (matching employees page style) */}
        {toast && (
          <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-md shadow-lg text-white font-semibold flex items-center transition-all duration-300 ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">My Attendance</h1>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">Today: {new Date(todayDateOnlyString + 'T00:00:00').toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
          <p className="text-3xl font-mono text-gray-800 dark:text-gray-200 mb-4">{currentTime.toLocaleTimeString()}</p>
          <div className="flex gap-4 mb-4">
            <button 
              onClick={handleCheckIn}
              disabled={!canCheckIn || isLoading} // Disable if loading
              className={`px-6 py-3 rounded-md font-semibold text-white transition-colors 
                          ${(canCheckIn && !isLoading) ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Check In
            </button>
            <button 
              onClick={handleCheckOut}
              disabled={!canCheckOut || isLoading} // Disable if loading
              className={`px-6 py-3 rounded-md font-semibold text-white transition-colors 
                          ${(canCheckOut && !isLoading) ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Check Out
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLoading ? 'Processing...' : todayStatusMessage}
          </p>
        </div>

        <div className="flex justify-between items-center mt-8 mb-4">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white">
            Attendance History for {viewedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePreviousMonth} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
              <ChevronLeftIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button onClick={handleNextMonth} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
              <ChevronRightIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Check In</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Check Out</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Hours</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Overtime</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {userDisplayLog.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(entry.date.split('T')[0] + 'T00:00:00').toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatTime(entry.checkIn)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatTime(entry.checkOut)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatHoursFromNumber(entry.totalHours)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatusColorClass(entry.status)}`}>{entry.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatHoursFromNumber(entry.overtimeHours)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {entry.isRegularizationAllowed ? (
                      <button 
                        onClick={() => handleOpenRegularizeModal(entry)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Regularize
                      </button>
                    ) : entry.regularizationStatus ? (
                        <span className="text-sm text-gray-500 dark:text-gray-400 italic">{entry.regularizationStatus}</span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))}
              {userDisplayLog.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {userDisplayLog.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">Attendance Chart ({viewedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })})</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{
                  top: 5, right: 30, left: 20, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)} hrs`} />
                <Legend />
                <Bar dataKey="totalHours" fill="#8884d8" name="Total Hours" />
                <Bar dataKey="overtimeHours" fill="#82ca9d" name="Overtime Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Regularization Modal */}
        {isRegularizeModalOpen && selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Regularize Attendance</h2>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">Date: <span className="font-semibold">{new Date(selectedEntry.date).toLocaleDateString()}</span></p>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">Status: <span className={`font-semibold ${getStatusColorClass(selectedEntry.status)}`}>{selectedEntry.status}</span></p>
              <form onSubmit={handleRegularizationSubmit}>
                <div className="mb-4">
                  <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Requested Check-In</label>
                  <input 
                    type="time" 
                    id="checkInTime"
                    value={requestedCheckIn}
                    onChange={(e) => setRequestedCheckIn(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Requested Check-Out</label>
                  <input 
                    type="time" 
                    id="checkOutTime"
                    value={requestedCheckOut}
                    onChange={(e) => setRequestedCheckOut(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                  <textarea 
                    id="reason" 
                    rows={3} 
                    value={regularizationReason}
                    onChange={(e) => setRegularizationReason(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200"
                    placeholder="e.g., Forgot to check in, client meeting, etc."
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setIsRegularizeModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Submit Request</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
