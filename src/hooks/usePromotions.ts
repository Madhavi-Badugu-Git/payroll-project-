import { Promotion } from '@/types';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { getApiUrl } from '../lib/api';

export interface PromotionFormData {
  empId: string;
  salary: number;
  revisionDate: string;
  currentPosition: string;
  previousPosition: string;
}

export interface UsePromotionsReturn {
  promotions: Promotion[];
  isLoading: boolean;
  error: string | null;
  // CRUD operations
  fetchPromotions: (empId: string) => Promise<void>;
  createPromotion: (promotionData: PromotionFormData) => Promise<boolean>;
  updatePromotion: (id: string, promotionData: PromotionFormData) => Promise<boolean>;
  deletePromotion: (id: string) => Promise<boolean>;
  // Utility
  clearError: () => void;
  clearPromotions: () => void;
}

export const usePromotions = (): UsePromotionsReturn => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearPromotions = useCallback(() => {
    setPromotions([]);
  }, []);

  const fetchPromotions = useCallback(async (empId: string) => {
    if (!empId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl(`/promotions?empId=${encodeURIComponent(empId)}`));

      if (!response.ok) {
        throw new Error('Failed to fetch promotions data');
      }

      const data = await response.json();
      setPromotions(data.promotions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch promotions';
      setError(errorMessage);
      console.error('Error fetching promotions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPromotion = useCallback(
    async (promotionData: PromotionFormData): Promise<boolean> => {
      setError(null);

      try {
        const response = await fetch(getApiUrl('/promotions'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(promotionData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create promotion');
        }

        toast.success('Promotion added successfully!');
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create promotion';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error creating promotion:', err);
        return false;
      }
    },
    []
  );

  const updatePromotion = useCallback(
    async (id: string, promotionData: PromotionFormData): Promise<boolean> => {
      setError(null);

      try {
        const response = await fetch(getApiUrl(`/promotions/${id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(promotionData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update promotion');
        }

        toast.success('Promotion updated successfully!');
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update promotion';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error updating promotion:', err);
        return false;
      }
    },
    []
  );

  const deletePromotion = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(getApiUrl(`/promotions/${id}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete promotion');
      }

      toast.success('Promotion record deleted successfully!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete promotion';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error deleting promotion:', err);
      return false;
    }
  }, []);

  return {
    promotions,
    isLoading,
    error,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    clearError,
    clearPromotions,
  };
};
