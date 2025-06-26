import { Attendance, AttendanceRegularization } from '@/types/attendance';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

interface RegularizationRequest extends AttendanceRegularization {
  attendance: Attendance;
  // employee is already defined in AttendanceRegularization, no need to redefine
}

export const useRegularization = () => {
  const [requests, setRequests] = useState<RegularizationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all regularization requests
  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/regularization');
      setRequests(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching regularization requests:', error);
      toast.error('Failed to fetch regularization requests');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Submit a new regularization request
  const submitRequest = useCallback(
    async (requestData: {
      empId: string;
      date: string;
      reason: string;
      requestedCheckIn?: string;
      requestedCheckOut?: string;
    }) => {
      try {
        const response = await axios.post('/api/regularization', requestData);
        toast.success('Regularization request submitted successfully');
        return response.data;
      } catch (error) {
        console.error('Error submitting regularization request:', error);
        toast.error('Failed to submit regularization request');
        throw error;
      }
    },
    []
  );

  // Approve a regularization request
  const approveRequest = useCallback(async (requestId: string, approvedBy: string) => {
    try {
      const response = await axios.patch(`/api/regularization/${requestId}`, {
        status: 'APPROVED', // Will be normalized to 'Approved' by the API
        approvedBy, // API will accept but ignore these fields for now
        approvedDate: new Date().toISOString(),
      });

      // Update local state
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? {
                ...req,
                status: 'Approved' as const, // Use database format for local state
              }
            : req
        )
      );

      toast.success('Regularization request approved successfully');
      return response.data;
    } catch (error) {
      console.error('Error approving regularization request:', error);
      toast.error('Failed to approve regularization request');
      throw error;
    }
  }, []);

  // Reject a regularization request
  const rejectRequest = useCallback(
    async (requestId: string, approvedBy: string, rejectionReason: string) => {
      try {
        const response = await axios.patch(`/api/regularization/${requestId}`, {
          status: 'REJECTED', // Will be normalized to 'Rejected' by the API
          approvedBy, // API will accept but ignore these fields for now
          approvedDate: new Date().toISOString(),
          rejectionReason,
        });

        // Update local state
        setRequests(prev =>
          prev.map(req =>
            req.id === requestId
              ? {
                  ...req,
                  status: 'Rejected' as const, // Use database format for local state
                }
              : req
          )
        );

        toast.success('Regularization request rejected successfully');
        return response.data;
      } catch (error) {
        console.error('Error rejecting regularization request:', error);
        toast.error('Failed to reject regularization request');
        throw error;
      }
    },
    []
  );

  // Get regularization requests for a specific employee
  const getEmployeeRequests = useCallback(async (empId: string) => {
    try {
      const response = await axios.get(`/api/regularization?empId=${empId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee regularization requests:', error);
      toast.error('Failed to fetch employee regularization requests');
      throw error;
    }
  }, []);

  // Get statistics for admin dashboard
  const getStats = useCallback(async () => {
    try {
      const response = await axios.get('/api/regularization/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching regularization stats:', error);
      // Don't show toast for stats as it might be called frequently
      throw error;
    }
  }, []);

  return {
    // State
    requests,
    isLoading,

    // Actions
    fetchRequests,
    submitRequest,
    approveRequest,
    rejectRequest,
    getEmployeeRequests,
    getStats,
  };
};
