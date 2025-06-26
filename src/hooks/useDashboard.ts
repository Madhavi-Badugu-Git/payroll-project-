import { Holiday, LeaveEntry, LeaveSummary } from '@/types';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export interface DashboardData {
  leaveSummary: LeaveSummary | null;
  nextHoliday: Holiday | null;
}

export interface UseDashboardReturn {
  leaveSummary: LeaveSummary | null;
  nextHoliday: Holiday | null;
  isLoading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
}

const LEAVES_PER_MONTH = 2;
const CURRENT_YEAR = new Date().getFullYear();

export const useDashboard = (): UseDashboardReturn => {
  const [leaveSummary, setLeaveSummary] = useState<LeaveSummary | null>(null);
  const [nextHoliday, setNextHoliday] = useState<Holiday | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateLeaveSummary = useCallback((leaves: LeaveEntry[]): LeaveSummary => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const completedMonths = currentMonth;
    const totalSanctioned = completedMonths * LEAVES_PER_MONTH;

    const currentYearLeaves = leaves.filter(
      leave => new Date(leave.startDate).getFullYear() === CURRENT_YEAR
    );

    const processedLeaves = currentYearLeaves.map(leave => {
      const from = new Date(leave.startDate);
      const to = new Date(leave.endDate);
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return { ...leave, noOfDays: diffDays };
    });

    const totalUsed = processedLeaves
      .filter(leave => leave.status === 'APPROVED')
      .reduce((acc, leave) => acc + (leave.noOfDays || 0), 0);

    const pending = processedLeaves.filter(leave => leave.status === 'PENDING').length;
    const approved = processedLeaves.filter(leave => leave.status === 'APPROVED').length;
    const rejected = processedLeaves.filter(leave => leave.status === 'REJECTED').length;

    // Get recent leaves (last 3)
    const recentLeaves = processedLeaves
      .sort(
        (a, b) =>
          new Date(b.appliedAt || b.startDate).getTime() -
          new Date(a.appliedAt || a.startDate).getTime()
      )
      .slice(0, 3);

    return {
      totalSanctioned,
      totalUsed,
      totalAvailable: Math.max(0, totalSanctioned - totalUsed),
      pending,
      approved,
      rejected,
      recentLeaves,
    };
  }, []);

  const findNextHoliday = useCallback((holidays: Holiday[]): Holiday | null => {
    const today = new Date();
    const upcomingHolidays = holidays
      .filter(holiday => new Date(holiday.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return upcomingHolidays.length > 0 ? upcomingHolidays[0] : null;
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch both leave and holiday data in parallel
      const [leaveResponse, holidayResponse] = await Promise.all([
        axios.get<LeaveEntry[]>('/api/leave'),
        axios.get<Holiday[]>('/api/holidays'),
      ]);

      const leaves = leaveResponse.data || [];
      const holidays = holidayResponse.data || [];

      // Calculate leave summary
      const summary = calculateLeaveSummary(leaves);
      setLeaveSummary(summary);

      // Find next holiday
      const nextHol = findNextHoliday(holidays);
      setNextHoliday(nextHol);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'Failed to fetch dashboard data';
      setError(message);
      console.error('Error fetching dashboard data:', err);
      toast.error(`Failed to load dashboard data: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [calculateLeaveSummary, findNextHoliday]);

  const refreshDashboard = useCallback(async () => {
    await fetchDashboardData();
    toast.success('Dashboard data refreshed!');
  }, [fetchDashboardData]);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    leaveSummary,
    nextHoliday,
    isLoading,
    error,
    refreshDashboard,
  };
};
