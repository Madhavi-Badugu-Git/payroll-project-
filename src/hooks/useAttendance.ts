import axios from 'axios';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { getApiUrl } from '../lib/api';

// Types specific to the attendance page
export interface AttendanceEntry {
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

export interface LeaveApplicationData {
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
}

export interface RegularizationRequestData {
  attendanceId: string;
  date: string;
  reason: string;
  requestedCheckIn: string | null;
  requestedCheckOut: string | null;
}

export interface AttendanceActionPayload {
  employeeId: string;
  date: string;
  type: 'checkIn' | 'checkOut';
  time: string;
}

export interface UseAttendanceReturn {
  // Data
  attendanceLog: AttendanceEntry[];
  todayRecord: AttendanceEntry | undefined;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAttendanceLog: (date: Date, employeeId: string) => Promise<void>;
  handleAttendanceAction: (type: 'checkIn' | 'checkOut', employeeId: string) => Promise<boolean>;
  submitLeaveApplication: (data: LeaveApplicationData, employeeId: string) => Promise<boolean>;
  submitRegularizationRequest: (data: RegularizationRequestData) => Promise<boolean>;

  // Utility
  refreshAttendanceLog: () => Promise<void>;
}

export const useAttendance = (): UseAttendanceReturn => {
  const [attendanceLog, setAttendanceLog] = useState<AttendanceEntry[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceEntry | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentViewedMonth, setCurrentViewedMonth] = useState<Date>(new Date());
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('');

  const todayDateOnlyString = new Date().toISOString().split('T')[0]; // YYYY-MM-DD for comparison

  const fetchAttendanceLog = useCallback(
    async (date: Date, employeeId: string) => {
      if (!employeeId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setCurrentViewedMonth(date);
      setCurrentEmployeeId(employeeId);

      try {
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth() is 0-indexed
        const response = await axios.get<AttendanceEntry[]>(
          getApiUrl(`/attendance?employeeId=${employeeId}&year=${year}&month=${month}`)
        );

        // Add client-side logic to determine if regularization is allowed
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);

        const processedData = response.data.map(entry => {
          const entryDate = new Date(entry.date);
          const isAllowed =
            ((entry.status === 'Absent' || entry.status === 'Half Day') &&
              entryDate >= threeDaysAgo &&
              entryDate < today &&
              !entry.regularizationStatus) ||
            true;
          return { ...entry, isRegularizationAllowed: isAllowed };
        });

        setAttendanceLog(processedData);

        // Update today's record
        const currentDayEntry = processedData.find(entry =>
          entry.date.startsWith(todayDateOnlyString)
        );
        setTodayRecord(currentDayEntry);
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : 'An unexpected error occurred while fetching attendance data';
        setError(message);
        console.error('Failed to fetch attendance log:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [todayDateOnlyString]
  );

  const handleAttendanceAction = useCallback(
    async (type: 'checkIn' | 'checkOut', employeeId: string): Promise<boolean> => {
      if (!employeeId) {
        toast.error('Employee ID is required');
        return false;
      }

      setError(null);
      const now = new Date();
      const payload: AttendanceActionPayload = {
        employeeId,
        date: todayDateOnlyString,
        type,
        time: now.toISOString(),
      };

      try {
        const response = await axios.post(getApiUrl('/attendance'), payload);

        if (response.status === 200) {
          toast.success(`${type === 'checkIn' ? 'Check-in' : 'Check-out'} successful!`);

          // Refresh attendance log to get updated data
          if (currentEmployeeId) {
            await fetchAttendanceLog(currentViewedMonth, currentEmployeeId);
          }

          return true;
        }

        return false;
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : `An error occurred while performing ${type}`;
        setError(message);
        toast.error(message);
        console.error(`Error in ${type}:`, err);
        return false;
      }
    },
    [todayDateOnlyString, currentViewedMonth, currentEmployeeId, fetchAttendanceLog]
  );

  const submitLeaveApplication = useCallback(
    async (data: LeaveApplicationData, employeeId: string): Promise<boolean> => {
      if (!employeeId) {
        toast.error('Employee ID is required');
        return false;
      }

      setError(null);

      try {
        const response = await axios.post(getApiUrl('/leave'), {
          employeeId,
          ...data,
        });

        if (response.status === 200 || response.status === 201) {
          toast.success('Leave application submitted successfully!');

          // Refresh attendance log to show leave status
          if (currentEmployeeId) {
            await fetchAttendanceLog(currentViewedMonth, currentEmployeeId);
          }

          return true;
        }

        return false;
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : 'Failed to submit leave application';
        setError(message);
        toast.error(message);
        console.error('Failed to submit leave application:', err);
        return false;
      }
    },
    [currentViewedMonth, currentEmployeeId, fetchAttendanceLog]
  );

  const submitRegularizationRequest = useCallback(
    async (data: RegularizationRequestData): Promise<boolean> => {
      setError(null);

      try {
        const response = await axios.post(getApiUrl('/regularization'), data);

        if (response.status === 200 || response.status === 201) {
          toast.success('Regularization request submitted successfully!');

          // Refresh attendance log to show updated status
          if (currentEmployeeId) {
            await fetchAttendanceLog(currentViewedMonth, currentEmployeeId);
          }

          return true;
        }

        return false;
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : 'Failed to submit regularization request';
        setError(message);
        toast.error(message);
        console.error('Failed to submit regularization request:', err);
        return false;
      }
    },
    [currentViewedMonth, currentEmployeeId, fetchAttendanceLog]
  );

  const refreshAttendanceLog = useCallback(async () => {
    if (currentEmployeeId) {
      await fetchAttendanceLog(currentViewedMonth, currentEmployeeId);
    }
  }, [currentViewedMonth, currentEmployeeId, fetchAttendanceLog]);

  return {
    // Data
    attendanceLog,
    todayRecord,
    isLoading,
    error,

    // Actions
    fetchAttendanceLog,
    handleAttendanceAction,
    submitLeaveApplication,
    submitRegularizationRequest,

    // Utility
    refreshAttendanceLog,
  };
};
