import { Holiday, UseHolidaysReturn } from '@/types';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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
      const response = await axios.get<Holiday[]>('/api/holidays');
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

  const createHoliday = useCallback(async (holiday: Omit<Holiday, 'id'>): Promise<boolean> => {
    try {
      setError(null);
      const response = await axios.post<Holiday>('/api/holidays', {
        name: holiday.name,
        date: holiday.date,
      });

      // Add the new holiday to the list
      const newHoliday = { ...response.data, date: toYYYYMMDD(response.data.date) };
      setHolidays(prev => [...prev, newHoliday]);

      toast.success('Holiday created successfully!');
      return true;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'Failed to create holiday';
      setError(message);
      toast.error(`Error: ${message}`);
      console.error('Failed to create holiday:', err);
      return false;
    }
  }, []);

  const updateHoliday = useCallback(
    async (id: string, holiday: Omit<Holiday, 'id'>): Promise<boolean> => {
      try {
        setError(null);
        const response = await axios.put<Holiday>(`/api/holidays/${id}`, {
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
      await axios.delete(`/api/holidays/${id}`);

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
