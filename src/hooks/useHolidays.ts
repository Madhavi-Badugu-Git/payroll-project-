import { Holiday, UseHolidaysReturn } from '@/types';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getApiUrl } from '../lib/api';

// Helper function to format date to YYYY-MM-DD for API and input
const toYYYYMMDD = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useHolidays = (): UseHolidaysReturn => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHolidays = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<Holiday[]>(getApiUrl('/holidays'));
      const formattedHolidays = response.data.map(h => ({
        ...h,
        date: toYYYYMMDD(h.date),
      }));
      setHolidays(formattedHolidays);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'An unexpected error occurred';
      setError(message);
      console.error('Failed to fetch holidays:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createHoliday = useCallback(
    async (holiday: Omit<Holiday, 'id'>): Promise<'success' | 'duplicate' | 'error'> => {
      try {
        setError(null);
        const response = await axios.post<Holiday>(getApiUrl('/holidays'), {
          name: holiday.name,
          date: holiday.date,
        });

        // Add the new holiday to the list
        const newHoliday = { ...response.data, date: toYYYYMMDD(response.data.date) };
        setHolidays(prev => [...prev, newHoliday]);

        return 'success';
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const message = err.response?.data?.error || err.message;

          if (status === 409) {
            // Handle duplicate holiday - don't show as error since it's expected during import
            console.log(`Holiday already exists for ${holiday.date}: ${holiday.name}`);
            return 'duplicate';
          }

          setError(message);
          console.error('Failed to create holiday:', err);
          return 'error';
        } else {
          const message = 'Failed to create holiday';
          setError(message);
          console.error('Failed to create holiday:', err);
          return 'error';
        }
      }
    },
    []
  );

  const updateHoliday = useCallback(
    async (id: string, holiday: Omit<Holiday, 'id'>): Promise<boolean> => {
      try {
        setError(null);
        const response = await axios.put<Holiday>(getApiUrl(`/holidays/${id}`), {
          name: holiday.name,
          date: holiday.date,
        });

        // Update the holiday in the list
        const updatedHoliday = { ...response.data, date: toYYYYMMDD(response.data.date) };
        setHolidays(prev => prev.map(h => (h.id === id ? updatedHoliday : h)));

        toast.success('Holiday updated successfully!');
        return true;
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : 'Failed to update holiday';
        setError(message);
        toast.error(`Error: ${message}`);
        console.error('Failed to update holiday:', err);
        return false;
      }
    },
    []
  );

  const deleteHoliday = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await axios.delete(getApiUrl(`/holidays/${id}`));

      // Remove the holiday from the list
      setHolidays(prev => prev.filter(h => h.id !== id));

      toast.success('Holiday deleted successfully!');
      return true;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'Failed to delete holiday';
      setError(message);
      toast.error(`Error: ${message}`);
      console.error('Failed to delete holiday:', err);
      return false;
    }
  }, []);

  // Fetch holidays on mount
  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  return {
    holidays,
    isLoading,
    error,
    fetchHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
  };
};
