import axios, { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { getApiUrl } from '../lib/api';
import { RootState } from '../store';

export interface AttendanceEntry {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string; // Can be 'Present', 'Absent', 'Leave', 'Weekend', 'Holiday Name', etc.
  totalHours: number | null;
  overtimeHours: number | null;
  workingHours?: number; // Keep for backward compatibility
  remarks?: string;
  leaveType?: string;
  isRegularizationAllowed?: boolean;
  regularizationStatus?: string;
}

export interface LeaveApplicationData {
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
}

interface UseAttendanceReturn {
  attendanceLog: AttendanceEntry[];
  todayRecord: AttendanceEntry | null;
  isLoading: boolean;
  error: string | null;
  fetchAttendanceLog: (month: Date) => Promise<void>;
  handleAttendanceAction: (
    action: 'check-in' | 'check-out',
    time?: string,
    remarks?: string
  ) => Promise<void>;
  submitLeaveApplication: (data: LeaveApplicationData) => Promise<boolean>;
  submitRegularizationRequest: (
    id: string,
    data: { checkIn?: string; checkOut?: string; reason: string }
  ) => Promise<boolean>;
}

const getAxiosErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response) {
      return `${error.response.status} ${error.response.statusText}: ${
        error.response.data?.error || error.response.data?.message || 'Server error'
      }`;
    } else if (error.request) {
      return 'No response from server';
    } else {
      return error.message;
    }
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return 'Unknown error occurred';
  }
};

export const useAttendance = (): UseAttendanceReturn => {
  // Get employee ID (primary key) from Redux state for API calls
  const linkedEmployee = useSelector((state: RootState) => state.user.linkedEmployee);
  const user = useSelector((state: RootState) => state.user.user);
  const employeeId = linkedEmployee?.id; // Use the primary key for API calls

  const [attendanceLog, setAttendanceLog] = useState<AttendanceEntry[]>([]);
  const [todayRecord, setTodayRecord] = useState<AttendanceEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceLog = useCallback(
    async (month: Date): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const url = getApiUrl('/attendance');
        const params = new URLSearchParams({
          employeeId: employeeId || '',
          month: (month.getMonth() + 1).toString(),
          year: month.getFullYear().toString(),
        });

        const response = await axios.get<AttendanceEntry[]>(`${url}?${params}`);
        setAttendanceLog(response.data);

        // Set today's record if it exists
        const today = new Date().toISOString().split('T')[0];
        const todaysEntry = response.data.find(entry => entry.date === today);
        setTodayRecord(todaysEntry || null);
      } catch (err) {
        setError(getAxiosErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [employeeId]
  );

  const handleAttendanceAction = useCallback(
    async (action: 'check-in' | 'check-out', time?: string, remarks?: string): Promise<void> => {
      setError(null);

      try {
        const url = getApiUrl('/attendance');
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const currentTime = time || now.toISOString(); // Use provided time or current time

        // Convert action to the expected type format
        const type = action === 'check-in' ? 'checkIn' : 'checkOut';

        const payload: {
          employeeId: string | undefined;
          userId: string | undefined;
          date: string;
          type: string;
          time: string;
          remarks?: string;
        } = {
          employeeId: employeeId,
          userId: user?.id,
          date: currentDate,
          type: type,
          time: currentTime,
        };

        if (remarks) {
          payload.remarks = remarks;
        }

        await axios.post(url, payload);
      } catch (err) {
        setError(getAxiosErrorMessage(err));
        throw err;
      }
    },
    [employeeId, user?.id]
  );

  const submitLeaveApplication = useCallback(
    async (data: LeaveApplicationData): Promise<boolean> => {
      setError(null);

      try {
        const url = getApiUrl('/leave');
        const payload = { ...data, employeeNumber: linkedEmployee?.employeeNumber };
        await axios.post(url, payload);
        return true;
      } catch (err) {
        setError(getAxiosErrorMessage(err));
        return false;
      }
    },
    [linkedEmployee?.employeeNumber]
  );

  const submitRegularizationRequest = useCallback(
    async (
      id: string,
      data: { checkIn?: string; checkOut?: string; reason: string }
    ): Promise<boolean> => {
      setError(null);

      try {
        const url = getApiUrl(`/attendance/${id}`);
        const payload = { ...data, employeeId, userId: user?.id };
        await axios.put(url, payload);
        return true;
      } catch (err) {
        setError(getAxiosErrorMessage(err));
        return false;
      }
    },
    [employeeId, user?.id]
  );

  return {
    attendanceLog,
    todayRecord,
    isLoading,
    error,
    fetchAttendanceLog,
    handleAttendanceAction,
    submitLeaveApplication,
    submitRegularizationRequest,
  };
};
