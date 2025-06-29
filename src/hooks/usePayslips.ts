import { DetailedPayslip, PayslipsResponse } from '@/types';
import { useCallback, useState } from 'react';
import { getApiUrl } from '../lib/api';

export interface UsePayslipsReturn {
  payslips: DetailedPayslip[];
  isLoading: boolean;
  error: string | null;
  // Operations
  fetchPayslips: (employeeId?: string) => Promise<void>;
  // Utility
  clearError: () => void;
  clearPayslips: () => void;
}

export const usePayslips = (): UsePayslipsReturn => {
  const [payslips, setPayslips] = useState<DetailedPayslip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearPayslips = useCallback(() => {
    setPayslips([]);
  }, []);

  const fetchPayslips = useCallback(async (employeeId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (employeeId) {
        params.append('empId', employeeId);
      }

      const response = await fetch(getApiUrl(`/payslips?${params.toString()}`));

      if (!response.ok) {
        throw new Error('Failed to fetch payslips');
      }

      const data: PayslipsResponse = await response.json();
      setPayslips(data.payslips);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load payslips. Please try again.';
      setError(errorMessage);
      console.error('Error fetching payslips:', err);
      setPayslips([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    payslips,
    isLoading,
    error,
    fetchPayslips,
    clearError,
    clearPayslips,
  };
};
