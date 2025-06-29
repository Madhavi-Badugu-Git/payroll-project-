import { LeaveApplication, LeaveSummary } from '@/types/leave';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { getApiUrl } from '../lib/api';

interface AdminStats {
  totalEmployees: number;
  employeesWithLeaveBalance: number;
  totalLeavesAllocated: number;
  totalLeavesUsed: number;
  pendingApplications: number;
}

interface EmployeeLeaveInfo {
  empId: string;
  firstName: string;
  lastName: string;
  balance: {
    totalAllocated: number;
    totalUsed: number;
    totalAvailable: number;
    carryForward: number;
  } | null;
  pendingApplications: number;
}

export const useLeaveManagement = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalEmployees: 0,
    employeesWithLeaveBalance: 0,
    totalLeavesAllocated: 0,
    totalLeavesUsed: 0,
    pendingApplications: 0,
  });

  const [employeeLeaveInfo, setEmployeeLeaveInfo] = useState<EmployeeLeaveInfo[]>([]);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch admin statistics
  const fetchStats = useCallback(async (selectedYear: number) => {
    try {
      setIsLoading(true);

      // Fetch employees
      const employeesResponse = await axios.get(getApiUrl('/employees?limit=1000'));
      const employees = employeesResponse.data.employees || [];

      // Initialize stats
      let totalLeavesAllocated = 0;
      let totalLeavesUsed = 0;
      let employeesWithBalance = 0;
      const employeeInfos: EmployeeLeaveInfo[] = [];

      // Fetch leave info for each employee
      for (const employee of employees) {
        try {
          const leaveResponse = await axios.get(
            getApiUrl(`/leave-management?empId=${employee.empId}&year=${selectedYear}`)
          );
          const leaveData = leaveResponse.data;

          const employeeInfo: EmployeeLeaveInfo = {
            empId: employee.empId,
            firstName: employee.firstName,
            lastName: employee.lastName,
            balance: leaveData.balance,
            pendingApplications: 0, // Will be calculated separately
          };

          if (leaveData.balance) {
            employeesWithBalance++;
            totalLeavesAllocated += leaveData.balance.totalAllocated;
            totalLeavesUsed += leaveData.balance.totalUsed;
          }

          employeeInfos.push(employeeInfo);
        } catch (error) {
          console.error(`Failed to fetch leave info for ${employee.empId}:`, error);
          // Add employee without balance info
          employeeInfos.push({
            empId: employee.empId,
            firstName: employee.firstName,
            lastName: employee.lastName,
            balance: null,
            pendingApplications: 0,
          });
        }
      }

      // Fetch pending applications count
      const leaveResponse = await axios.get(getApiUrl('/leave'));
      const allLeaves: Array<{ status: string }> = leaveResponse.data;
      const pendingApplications = allLeaves.filter(leave => leave.status === 'PENDING').length;

      const newStats = {
        totalEmployees: employees.length,
        employeesWithLeaveBalance: employeesWithBalance,
        totalLeavesAllocated,
        totalLeavesUsed,
        pendingApplications,
      };

      setStats(newStats);
      setEmployeeLeaveInfo(employeeInfos);
      return newStats;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Failed to fetch leave management statistics');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch leave applications
  const fetchLeaveApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(getApiUrl('/leave'));
      setLeaveApplications(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      toast.error('Failed to fetch leave applications');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Process monthly allocation
  const processMonthlyAllocation = useCallback(async () => {
    try {
      setIsProcessing(true);
      const response = await axios.post(getApiUrl('/leave-management'), {
        action: 'monthly-allocation',
        empId: 'ADMIN',
      });

      if (response.data.success) {
        toast.success('Monthly leave allocation processed successfully');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to process monthly allocation');
      }
    } catch (error) {
      console.error('Error processing monthly allocation:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to process monthly allocation';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Process carry forward
  const processCarryForward = useCallback(async () => {
    try {
      setIsProcessing(true);
      const response = await axios.post(getApiUrl('/leave-management'), {
        action: 'carry-forward',
        empId: 'ADMIN',
      });

      if (response.data.success) {
        toast.success('Carry forward processed successfully');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to process carry forward');
      }
    } catch (error) {
      console.error('Error processing carry forward:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to process carry forward';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Approve leave application
  const approveLeave = useCallback(async (leaveId: string, approvedBy: string) => {
    try {
      const response = await axios.patch(getApiUrl(`/leave/${leaveId}`), {
        status: 'APPROVED',
        approvedBy,
        approvedDate: new Date().toISOString(),
      });

      toast.success('Leave application approved successfully');
      return response.data;
    } catch (error) {
      console.error('Error approving leave:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to approve leave application';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Reject leave application
  const rejectLeave = useCallback(
    async (leaveId: string, approvedBy: string, rejectionReason: string) => {
      try {
        const response = await axios.patch(getApiUrl(`/leave/${leaveId}`), {
          status: 'REJECTED',
          approvedBy,
          approvedDate: new Date().toISOString(),
          rejectionReason,
        });

        toast.success('Leave application rejected successfully');
        return response.data;
      } catch (error) {
        console.error('Error rejecting leave:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to reject leave application';
        toast.error(errorMessage);
        throw error;
      }
    },
    []
  );

  // Get employee leave summary
  const getEmployeeLeaveSummary = useCallback(
    async (empId: string, year?: number): Promise<LeaveSummary> => {
      try {
        const params = new URLSearchParams({ empId });
        if (year) params.append('year', year.toString());

        const response = await axios.get(getApiUrl(`/leave-management?${params.toString()}`));
        return response.data;
      } catch (error) {
        console.error('Error fetching employee leave summary:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch leave summary';
        toast.error(errorMessage);
        throw error;
      }
    },
    []
  );

  // Initialize employee leaves
  const initializeEmployeeLeaves = useCallback(
    async (empId: string, joiningDate: string): Promise<void> => {
      try {
        const response = await axios.post(getApiUrl('/leave-management'), {
          action: 'initialize',
          empId,
          joiningDate,
        });

        console.log('Employee leaves initialized successfully:', {
          empId,
          joiningDate,
          response: response.data,
        });

        toast.success(`Leave balance initialized successfully for employee ${empId}`);
        return response.data;
      } catch (error) {
        console.error('Error initializing employee leaves:', {
          empId,
          joiningDate,
          error,
        });

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to initialize employee leaves';
        toast.error(errorMessage);
        throw error;
      }
    },
    []
  );

  return {
    // State
    stats,
    employeeLeaveInfo,
    leaveApplications,
    isLoading,
    isProcessing,

    // Actions
    fetchStats,
    fetchLeaveApplications,
    processMonthlyAllocation,
    processCarryForward,
    approveLeave,
    rejectLeave,
    getEmployeeLeaveSummary,
    initializeEmployeeLeaves,
  };
};
