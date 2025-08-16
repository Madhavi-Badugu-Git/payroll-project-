import axios, { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { getApiUrl } from '../lib/api';
import { RootState } from '../store';

export interface LeaveEntry {
  id: string;
  employeeId: string;
  leaveType: 'Sick' | 'Casual' | 'Earned';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'Cancelled';
  appliedAt?: string;
  createdAt?: string;
  noOfDays: number;
  appliedDate: string;
}

export interface LeaveBalance {
  totalAllocated: number;
  totalUsed: number;
  totalAvailable: number;
  carryForward: number;
}

export interface LeaveAccumulation {
  id: string;
  employeeNumber: string;
  year: number;
  month: number;
  monthName: string;
  allocatedDays: number;
  reason: string;
  accumulationDate: string;
}

export interface LeaveTransaction {
  id: string;
  employeeNumber: string;
  leaveApplicationId: string | null;
  transactionType: string;
  days: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  transactionDate: string;
  leaveApplication?: {
    id: string;
    startDate: string;
    endDate: string;
    leaveType: string;
    reason: string;
    status: string;
  } | null;
}

interface LeaveInfo {
  balance: LeaveBalance | null;
  accumulations: LeaveAccumulation[];
  transactions: LeaveTransaction[];
}

interface Configuration {
  configKey: string;
  configValue: string;
}

interface UseLeavesReturn {
  leaves: LeaveEntry[];
  leaveInfo: LeaveInfo;
  configurations: Record<string, string>;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchLeaves: () => Promise<void>;
  fetchLeaveInfo: (employeeNumber: string, year: number) => Promise<void>;
  fetchConfigurations: () => Promise<void>;
  createLeave: (
    leaveData: Omit<
      LeaveEntry,
      'id' | 'employeeId' | 'noOfDays' | 'appliedDate' | 'appliedAt' | 'createdAt' | 'status'
    >
  ) => Promise<void>;
  updateLeave: (
    leaveId: string,
    leaveData: Omit<
      LeaveEntry,
      'id' | 'employeeId' | 'noOfDays' | 'appliedDate' | 'appliedAt' | 'createdAt' | 'status'
    >
  ) => Promise<void>;
  deleteLeave: (leaveId: string) => Promise<void>;
  cancelLeave: (leaveId: string) => Promise<void>;
  refreshData: (employeeNumber?: string, year?: number) => Promise<void>;
}

/**
 * Custom hook for managing leave applications
 *
 * Features:
 * - Fetch leave applications for current user
 * - Fetch leave balance and transaction history
 * - Fetch system configurations
 * - Create, update, delete, and cancel leave applications
 * - Automatic error handling with axios
 * - Loading states management
 * - Centralized API calls for all leave operations
 *
 * @returns {UseLeavesReturn} Hook state and functions for leave operations
 */
export const useLeaves = (): UseLeavesReturn => {
  // Get employee number from Redux state
  const linkedEmployee = useSelector((state: RootState) => state.user.linkedEmployee);
  const employeeNumber = linkedEmployee?.employeeNumber;

  const [leaves, setLeaves] = useState<LeaveEntry[]>([]);
  const [leaveInfo, setLeaveInfo] = useState<LeaveInfo>({
    balance: null,
    accumulations: [],
    transactions: [],
  });
  const [configurations, setConfigurations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigurations = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const url = getApiUrl('/configurations');
      const response = await axios.get<{ configurations: Configuration[] }>(url);

      const configMap = response.data.configurations.reduce(
        (acc: Record<string, string>, config: Configuration) => {
          acc[config.configKey] = config.configValue;
          return acc;
        },
        {}
      );

      setConfigurations(configMap);

      console.log('Configurations fetched successfully:', {
        count: response.data.configurations.length,
        url,
      });
    } catch (error) {
      let errorMessage = 'Failed to fetch configurations: ';

      if (error instanceof AxiosError) {
        if (error.response) {
          errorMessage += `${error.response.status} ${error.response.statusText}`;
          console.error('Failed to fetch configurations:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            url: error.config?.url,
          });
        } else if (error.request) {
          errorMessage += 'No response from server';
          console.error('No response from server:', error.request);
        } else {
          errorMessage += error.message;
          console.error('Request setup error:', error.message);
        }
      } else {
        errorMessage += error instanceof Error ? error.message : 'Unknown error';
        console.error('Unknown error:', error);
      }

      setError(errorMessage);
      // Set default configuration on error
      setConfigurations({ SANCTIONED_LEAVE_PER_YEAR: '24' });
    }
  }, []);

  const fetchLeaves = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('fetchLeaves debug:', { employeeNumber, linkedEmployee });

      const url = getApiUrl('/leave');
      const params = employeeNumber ? `?employeeNumber=${employeeNumber}` : '';
      console.log('Making request to:', `${url}${params}`);

      const response = await axios.get<Array<Omit<LeaveEntry, 'noOfDays' | 'appliedDate'>>>(
        `${url}${params}`
      );

      const processedLeaves = response.data.map(leave => {
        const from = new Date(leave.startDate);
        const to = new Date(leave.endDate);
        const diffTime = Math.abs(to.getTime() - from.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const appliedDate = leave.appliedAt
          ? new Date(leave.appliedAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        return {
          ...leave,
          startDate: leave.startDate.split('T')[0],
          endDate: leave.endDate.split('T')[0],
          noOfDays: diffDays,
          appliedDate: appliedDate,
        };
      });

      const sortedLeaves = processedLeaves.sort(
        (a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
      );

      setLeaves(sortedLeaves);

      console.log('Leaves fetched successfully:', {
        count: response.data.length,
        url,
      });
    } catch (error) {
      let errorMessage = 'Failed to fetch leave data: ';

      if (error instanceof AxiosError) {
        if (error.response) {
          errorMessage += `${error.response.status} ${error.response.statusText}`;
          console.error('Failed to fetch leaves:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            url: error.config?.url,
          });
        } else if (error.request) {
          errorMessage += 'No response from server';
          console.error('No response from server:', error.request);
        } else {
          errorMessage += error.message;
          console.error('Request setup error:', error.message);
        }
      } else {
        errorMessage += error instanceof Error ? error.message : 'Unknown error';
        console.error('Unknown error:', error);
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [employeeNumber, linkedEmployee]);

  const fetchLeaveInfo = useCallback(
    async (employeeNumber: string, year: number): Promise<void> => {
      try {
        setError(null);
        const url = getApiUrl(`/leave-management?empId=${employeeNumber}&year=${year}`);
        const response = await axios.get<LeaveInfo>(url);

        setLeaveInfo(response.data);

        console.log('Leave info fetched successfully:', {
          employeeNumber,
          year,
          url,
        });
      } catch (error) {
        console.error('Error fetching leave info:', {
          employeeNumber,
          year,
          error,
        });

        // Don't set error for leave info as it might not be initialized yet
        // Just log the error and keep empty state
      }
    },
    []
  );

  const createLeave = useCallback(
    async (
      leaveData: Omit<
        LeaveEntry,
        'id' | 'employeeId' | 'noOfDays' | 'appliedDate' | 'appliedAt' | 'createdAt' | 'status'
      >
    ): Promise<void> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const url = getApiUrl('/leave');
        const payload = { ...leaveData, employeeNumber };
        const response = await axios.post(url, payload);

        console.log('Leave created successfully:', {
          leaveData,
          response: response.data,
        });

        // Refresh leaves after successful creation
        await fetchLeaves();
      } catch (error) {
        let errorMessage = 'Failed to submit leave request: ';

        if (error instanceof AxiosError) {
          if (error.response) {
            errorMessage += `${error.response.status} ${error.response.statusText}`;
            console.error('Failed to create leave:', {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
              leaveData,
            });
          } else if (error.request) {
            errorMessage += 'No response from server';
            console.error('No response from server:', error.request);
          } else {
            errorMessage += error.message;
            console.error('Request setup error:', error.message);
          }
        } else {
          errorMessage += error instanceof Error ? error.message : 'Unknown error';
          console.error('Unknown error:', error);
        }

        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchLeaves, employeeNumber]
  );

  const updateLeave = useCallback(
    async (
      leaveId: string,
      leaveData: Omit<
        LeaveEntry,
        'id' | 'employeeId' | 'noOfDays' | 'appliedDate' | 'appliedAt' | 'createdAt' | 'status'
      >
    ): Promise<void> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const url = getApiUrl(`/leave/${leaveId}`);
        const payload = { ...leaveData, employeeNumber };
        const response = await axios.put(url, payload);

        console.log('Leave updated successfully:', {
          leaveId,
          leaveData,
          response: response.data,
        });

        // Refresh leaves after successful update
        await fetchLeaves();
      } catch (error) {
        let errorMessage = 'Failed to update leave request: ';

        if (error instanceof AxiosError) {
          if (error.response) {
            errorMessage += `${error.response.status} ${error.response.statusText}`;
            console.error('Failed to update leave:', {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
              leaveId,
              leaveData,
            });
          } else if (error.request) {
            errorMessage += 'No response from server';
            console.error('No response from server:', error.request);
          } else {
            errorMessage += error.message;
            console.error('Request setup error:', error.message);
          }
        } else {
          errorMessage += error instanceof Error ? error.message : 'Unknown error';
          console.error('Unknown error:', error);
        }

        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchLeaves, employeeNumber]
  );

  const deleteLeave = useCallback(
    async (leaveId: string): Promise<void> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const url = getApiUrl(`/leave/${leaveId}`);
        await axios.delete(url);

        console.log('Leave deleted successfully:', {
          leaveId,
        });

        // Refresh leaves after successful deletion
        await fetchLeaves();
      } catch (error) {
        let errorMessage = 'Failed to delete leave request: ';

        if (error instanceof AxiosError) {
          if (error.response) {
            errorMessage += `${error.response.status} ${error.response.statusText}`;
            console.error('Failed to delete leave:', {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
              leaveId,
            });
          } else if (error.request) {
            errorMessage += 'No response from server';
            console.error('No response from server:', error.request);
          } else {
            errorMessage += error.message;
            console.error('Request setup error:', error.message);
          }
        } else {
          errorMessage += error instanceof Error ? error.message : 'Unknown error';
          console.error('Unknown error:', error);
        }

        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchLeaves]
  );

  const cancelLeave = useCallback(
    async (leaveId: string): Promise<void> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const url = getApiUrl(`/leave/${leaveId}`);
        await axios.patch(url, { action: 'cancel' });

        console.log('Leave cancelled successfully:', {
          leaveId,
        });

        // Refresh leaves after successful cancellation
        await fetchLeaves();
      } catch (error) {
        let errorMessage = 'Failed to cancel leave request: ';

        if (error instanceof AxiosError) {
          if (error.response) {
            errorMessage += `${error.response.status} ${error.response.statusText}`;
            console.error('Failed to cancel leave:', {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
              leaveId,
            });
          } else if (error.request) {
            errorMessage += 'No response from server';
            console.error('No response from server:', error.request);
          } else {
            errorMessage += error.message;
            console.error('Request setup error:', error.message);
          }
        } else {
          errorMessage += error instanceof Error ? error.message : 'Unknown error';
          console.error('Unknown error:', error);
        }

        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchLeaves]
  );

  const refreshData = useCallback(
    async (employeeNumber?: string, year?: number): Promise<void> => {
      await fetchLeaves();
      if (employeeNumber && year) {
        await fetchLeaveInfo(employeeNumber, year);
      }
    },
    [fetchLeaves, fetchLeaveInfo]
  );

  return {
    leaves,
    leaveInfo,
    configurations,
    isLoading,
    isSubmitting,
    error,
    fetchLeaves,
    fetchLeaveInfo,
    fetchConfigurations,
    createLeave,
    updateLeave,
    deleteLeave,
    cancelLeave,
    refreshData,
  };
};
