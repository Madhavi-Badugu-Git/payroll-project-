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
  // Dialog state for checkout confirmation
  showCheckoutDialog: boolean;
  checkoutDialogMessage: string;
  confirmCheckout: () => void;
  cancelCheckout: () => void;
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

  // Dialog state for checkout confirmation
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [checkoutDialogMessage, setCheckoutDialogMessage] = useState('');
  const [pendingCheckoutData, setPendingCheckoutData] = useState<{
    time?: string;
    remarks?: string;
  } | null>(null);

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
        const todaysEntry = response.data.find(entry => {
          const entryDate = new Date(entry.date).toISOString().split('T')[0];
          return entryDate === today;
        });
        setTodayRecord(todaysEntry || null);
      } catch (err) {
        setError(getAxiosErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [employeeId]
  );

  const performCheckout = useCallback(
    async (action: 'check-in' | 'check-out', time?: string, remarks?: string): Promise<void> => {
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

        // Refetch attendance data after successful action
        const currentMonth = new Date();
        await fetchAttendanceLog(currentMonth);
      } catch (err) {
        setError(getAxiosErrorMessage(err));
        throw err;
      }
    },
    [employeeId, user?.id, fetchAttendanceLog]
  );

  const handleAttendanceAction = useCallback(
    async (action: 'check-in' | 'check-out', time?: string, remarks?: string): Promise<void> => {
      setError(null);

      // For checkout, validate minimum hours
      if (action === 'check-out' && todayRecord && todayRecord.checkIn) {
        const checkInTime = new Date(todayRecord.checkIn);
        const checkOutTime = time ? new Date(time) : new Date();
        const timeDiff = checkOutTime.getTime() - checkInTime.getTime();
        const hoursWorked = timeDiff / (1000 * 60 * 60);

        if (hoursWorked < 9) {
          // Store the checkout data for later use
          setPendingCheckoutData({ time, remarks });
          setCheckoutDialogMessage(
            `You have worked ${hoursWorked.toFixed(1)} hours. Minimum required is 9 hours. Do you want to proceed with checkout?`
          );
          setShowCheckoutDialog(true);
          return; // Don't proceed with checkout yet
        }
      }

      await performCheckout(action, time, remarks);
    },
    [todayRecord, performCheckout]
  );

  // Dialog handler functions
  const confirmCheckout = useCallback(() => {
    setShowCheckoutDialog(false);
    if (pendingCheckoutData) {
      performCheckout('check-out', pendingCheckoutData.time, pendingCheckoutData.remarks);
    }
    setPendingCheckoutData(null);
  }, [pendingCheckoutData, performCheckout]);

  const cancelCheckout = useCallback(() => {
    setShowCheckoutDialog(false);
    setPendingCheckoutData(null);
  }, []);

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

        // Refetch attendance data after successful regularization
        const currentMonth = new Date();
        await fetchAttendanceLog(currentMonth);

        return true;
      } catch (err) {
        setError(getAxiosErrorMessage(err));
        return false;
      }
    },
    [employeeId, user?.id, fetchAttendanceLog]
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
    showCheckoutDialog,
    checkoutDialogMessage,
    confirmCheckout,
    cancelCheckout,
  };
};
