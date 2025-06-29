import { useUser } from '@clerk/nextjs';
import axios, { AxiosError } from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiUrl } from '../lib/api';

interface SyncUserResponse {
  success: boolean;
  user: {
    id: string;
    clerkId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
  };
  linkedEmployee?: {
    id: string;
    empId: string;
    name: string;
    designation: string;
  } | null;
}

interface UseUserSyncReturn {
  isLoading: boolean;
  isSynced: boolean;
  error: string | null;
  syncUser: () => Promise<void>;
  lastSyncResult: SyncUserResponse | null;
  retryCount: number;
  maxRetries: number;
  canRetry: boolean;
}

/**
 * Custom hook for syncing Clerk user data with the database
 *
 * Features:
 * - Automatic sync when user loads
 * - Prevents duplicate API calls
 * - Uses axios for better error handling
 * - Proper state management for sync status
 * - Automatic retry on user changes
 * - Retry limit protection (max 5 attempts)
 * - Comprehensive error tracking with attempt counts
 *
 * @returns {UseUserSyncReturn} Hook state, sync function, and retry information
 */
export const useUserSync = (): UseUserSyncReturn => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncUserResponse | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const syncedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const MAX_RETRIES = 5;

  const syncUser = useCallback(async (): Promise<void> => {
    const currentUser = user;
    const currentIsLoaded = isLoaded;

    if (!currentUser || !currentIsLoaded) {
      setError('User not available for sync');
      return;
    }

    // Check if we've exceeded max retries
    if (retryCount >= MAX_RETRIES) {
      const maxRetriesError = `Maximum sync attempts (${MAX_RETRIES}) exceeded. Please refresh the page or contact support.`;
      setError(maxRetriesError);
      console.error(maxRetriesError);
      return;
    }

    // Check if we're already syncing or already synced for this user
    if (syncedRef.current && lastUserIdRef.current === currentUser.id) {
      console.log('User already synced, skipping duplicate sync');
      return;
    }

    setIsLoading(true);
    setError(null);
    syncedRef.current = true; // Prevent multiple calls
    lastUserIdRef.current = currentUser.id;

    try {
      console.log('Attempting to sync user:', {
        userId: currentUser.id,
        email: currentUser.emailAddresses[0]?.emailAddress,
        attempt: retryCount + 1,
        maxRetries: MAX_RETRIES,
      });

      const url = getApiUrl('/sync-user');
      const responseData = await axios.post<SyncUserResponse>(url, {
        userId: currentUser.id,
      });

      console.log('User data synced successfully:', responseData.data);

      setLastSyncResult(responseData.data);
      setIsSynced(true);
      setError(null);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      let errorMessage = 'Error syncing user to database: ';

      if (error instanceof AxiosError) {
        if (error.response) {
          // Server responded with error status
          errorMessage += `${error.response.status} ${error.response.statusText}`;
          console.error(errorMessage, {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            url: error.config?.url,
            attempt: retryCount + 1,
            maxRetries: MAX_RETRIES,
          });
        } else if (error.request) {
          // Request was made but no response received
          errorMessage += 'No response from server';
          console.error(errorMessage, error.request);
        } else {
          // Something else happened
          errorMessage += error.message;
          console.error(errorMessage, error.message);
        }
      } else {
        errorMessage += error instanceof Error ? error.message : 'Unknown error';
        console.error(errorMessage, error);
      }

      // Increment retry count
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);

      // Add retry information to error message
      if (newRetryCount >= MAX_RETRIES) {
        errorMessage += ` (Max attempts reached: ${MAX_RETRIES}/${MAX_RETRIES})`;
      } else {
        errorMessage += ` (Attempt ${newRetryCount}/${MAX_RETRIES})`;
      }

      setError(errorMessage);
      syncedRef.current = false; // Allow retry on error
      lastUserIdRef.current = null;
      setIsSynced(false);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoaded, retryCount, MAX_RETRIES]);

  // Reset sync state when user changes
  useEffect(() => {
    if (user?.id && user.id !== lastUserIdRef.current) {
      syncedRef.current = false;
      setIsSynced(false);
      setError(null);
      setLastSyncResult(null);
      setRetryCount(0); // Reset retry count for new user
      lastUserIdRef.current = null;
    }
  }, [user?.id]);

  // Auto-sync when user is loaded - use ref to track sync attempts
  useEffect(() => {
    const shouldSync =
      isLoaded &&
      user &&
      !syncedRef.current &&
      !isLoading &&
      user.id !== lastUserIdRef.current &&
      retryCount < MAX_RETRIES; // Don't auto-sync if max retries reached

    if (shouldSync) {
      syncUser();
    }
  }, [isLoaded, user, isLoading, syncUser, retryCount, MAX_RETRIES]);

  return {
    isLoading,
    isSynced,
    error,
    syncUser,
    lastSyncResult,
    retryCount,
    maxRetries: MAX_RETRIES,
    canRetry: retryCount < MAX_RETRIES,
  };
};
