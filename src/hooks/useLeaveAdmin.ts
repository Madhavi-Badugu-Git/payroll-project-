import axios, { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { getApiUrl } from '../lib/api';

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

interface UseLeaveAdminReturn {
  leaves: LeaveApplication[];
  isLoading: boolean;
  error: string | null;
  fetchLeaves: () => Promise<void>;
  approveLeave: (id: string) => Promise<void>;
  rejectLeave: (id: string) => Promise<void>;
  refreshLeaves: () => Promise<void>;
}

/**
 * Custom hook for managing leave applications in admin context
 *
 * Features:
 * - Fetch all leave applications
 * - Approve/reject leave applications
 * - Automatic error handling with axios
 * - Loading states management
 * - Centralized API calls for leave admin operations
 *
 * @returns {UseLeaveAdminReturn} Hook state and functions for leave admin operations
 */
export const useLeaveAdmin = (): UseLeaveAdminReturn => {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaves = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const url = getApiUrl('/leave');
      const response = await axios.get<LeaveApplication[]>(url);

      console.log('Leave applications fetched successfully:', {
        count: response.data.length,
        url,
      });

      setLeaves(response.data);
    } catch (error) {
      let errorMessage = 'Failed to fetch leave applications: ';

      if (error instanceof AxiosError) {
        if (error.response) {
          errorMessage += `${error.response.status} ${error.response.statusText}`;
          console.error('Failed to fetch leave applications:', {
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
  }, []);

  const approveLeave = useCallback(
    async (id: string): Promise<void> => {
      try {
        const url = getApiUrl(`/leave/${id}`);
        await axios.put(url, { status: 'APPROVED' });

        console.log('Leave approved successfully:', { id });

        // Refresh the leaves list after successful approval
        await fetchLeaves();
      } catch (error) {
        let errorMessage = 'Failed to approve leave: ';

        if (error instanceof AxiosError) {
          if (error.response) {
            errorMessage += `${error.response.status} ${error.response.statusText}`;
            console.error('Failed to approve leave:', {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
              leaveId: id,
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

        throw new Error(errorMessage);
      }
    },
    [fetchLeaves]
  );

  const rejectLeave = useCallback(
    async (id: string): Promise<void> => {
      try {
        const url = getApiUrl(`/leave/${id}`);
        await axios.put(url, { status: 'REJECTED' });

        console.log('Leave rejected successfully:', { id });

        // Refresh the leaves list after successful rejection
        await fetchLeaves();
      } catch (error) {
        let errorMessage = 'Failed to reject leave: ';

        if (error instanceof AxiosError) {
          if (error.response) {
            errorMessage += `${error.response.status} ${error.response.statusText}`;
            console.error('Failed to reject leave:', {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
              leaveId: id,
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

        throw new Error(errorMessage);
      }
    },
    [fetchLeaves]
  );

  // Alias for fetchLeaves to provide a refresh function
  const refreshLeaves = useCallback(async (): Promise<void> => {
    await fetchLeaves();
  }, [fetchLeaves]);

  return {
    leaves,
    isLoading,
    error,
    fetchLeaves,
    approveLeave,
    rejectLeave,
    refreshLeaves,
  };
};
