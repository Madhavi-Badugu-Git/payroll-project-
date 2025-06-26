import axios from 'axios';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

// Configuration types matching the actual Prisma schema
export interface Configuration {
  id: string;
  configKey: string;
  configValue: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigurationFormData {
  configKey: string;
  configValue: string;
  description: string;
}

export interface UseConfigurationsReturn {
  // Data
  configurations: Configuration[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchConfigurations: () => Promise<void>;
  createConfiguration: (data: ConfigurationFormData) => Promise<boolean>;
  updateConfiguration: (id: string, data: ConfigurationFormData) => Promise<boolean>;
  deleteConfiguration: (id: string) => Promise<boolean>;

  // Utility
  refreshConfigurations: () => Promise<void>;
}

export const useConfigurations = (): UseConfigurationsReturn => {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigurations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<{ configurations: Configuration[] }>('/api/configurations');
      setConfigurations(response.data.configurations);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'An unexpected error occurred while fetching configurations';
      setError(message);
      console.error('Failed to fetch configurations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createConfiguration = useCallback(
    async (data: ConfigurationFormData): Promise<boolean> => {
      setError(null);

      try {
        const response = await axios.post('/api/configurations', data);

        if (response.status === 200 || response.status === 201) {
          toast.success('Configuration created successfully!');
          await fetchConfigurations(); // Refresh the list
          return true;
        }

        return false;
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : 'Failed to create configuration';
        setError(message);
        toast.error(message);
        console.error('Failed to create configuration:', err);
        return false;
      }
    },
    [fetchConfigurations]
  );

  const updateConfiguration = useCallback(
    async (id: string, data: ConfigurationFormData): Promise<boolean> => {
      setError(null);

      try {
        const response = await axios.put(`/api/configurations/${id}`, data);

        if (response.status === 200) {
          toast.success('Configuration updated successfully!');
          await fetchConfigurations(); // Refresh the list
          return true;
        }

        return false;
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : 'Failed to update configuration';
        setError(message);
        toast.error(message);
        console.error('Failed to update configuration:', err);
        return false;
      }
    },
    [fetchConfigurations]
  );

  const deleteConfiguration = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null);

      try {
        const response = await axios.delete(`/api/configurations/${id}`);

        if (response.status === 200) {
          toast.success('Configuration deleted successfully!');
          await fetchConfigurations(); // Refresh the list
          return true;
        }

        return false;
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : 'Failed to delete configuration';
        setError(message);
        toast.error(message);
        console.error('Failed to delete configuration:', err);
        return false;
      }
    },
    [fetchConfigurations]
  );

  const refreshConfigurations = useCallback(async () => {
    await fetchConfigurations();
  }, [fetchConfigurations]);

  return {
    // Data
    configurations,
    isLoading,
    error,

    // Actions
    fetchConfigurations,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,

    // Utility
    refreshConfigurations,
  };
};
