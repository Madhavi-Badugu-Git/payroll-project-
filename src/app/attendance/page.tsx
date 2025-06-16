'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../AppLayout';
import { useUser } from '@clerk/nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AttendanceEntry {
  id: string; 
  employeeId: string;
  date: string; // ISO Date string (e.g., "2023-10-27T00:00:00.000Z")
  checkIn?: string | null; // ISO DateTime string
  checkOut?: string | null; // ISO DateTime string
  status: string; 
  totalHours?: number | null;
  overtimeHours?: number | null;
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

  const todayDateOnlyString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD for comparison

  const fetchAttendanceLog = useCallback(async () => {
    if (!user || !user.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/attendance?employeeId=${user.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch attendance: ${response.statusText}`);
      }
      const data: AttendanceEntry[] = await response.json();
      setAttendanceLog(data);
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
    fetchAttendanceLog();
  }, [fetchAttendanceLog]);

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

  const handleAttendanceAction = async (type: 'checkIn' | 'checkOut') => {
    if (!user || !user.id) return;
    
    const now = new Date();
    const payload = {
      employeeId: user.id, 
      date: todayDateOnlyString, 
      type: type,
      time: now.toISOString(),
    };

    setIsLoading(true); 
    setError(null);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${type}: ${response.statusText}`);
      }
      await fetchAttendanceLog(); 
    } catch (err) {
      console.error(`${type} error:`, err);
      if (err instanceof Error) {
        setError(err.message || `Could not perform ${type}.`);
      } else {
        setError(`An unknown error occurred while performing ${type}.`);
      }
      setIsLoading(false); 
    }
  };

  const handleCheckIn = () => handleAttendanceAction('checkIn');
  const handleCheckOut = () => handleAttendanceAction('checkOut');

  const canCheckIn = !todayRecord || (todayRecord.checkIn && todayRecord.checkOut);
  const canCheckOut = todayRecord && todayRecord.checkIn && !todayRecord.checkOut;

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

  if (isLoading && attendanceLog.length === 0) { // Show loading only on initial load
    return <AppLayout><div className="text-center p-10">Loading attendance records...</div></AppLayout>;
  }

  if (error) {
    return <AppLayout><div className="text-center p-10 text-red-500">Error: {error} <button onClick={fetchAttendanceLog} className="text-blue-500 underline ml-2">Try again</button></div></AppLayout>;
  }
  
  if (!user) {
    return <AppLayout><div className="text-center p-10">Please log in to view your attendance.</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
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

        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">Attendance History</h2>
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
            <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">Attendance Chart (Last {chartData.length} Days)</h2>
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

      </div>
    </AppLayout>
  );
}
