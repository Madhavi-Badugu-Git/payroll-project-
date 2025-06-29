import { useUser } from '@clerk/nextjs';
import axios, { AxiosError } from 'axios';
import { useCallback, useEffect, useRef } from 'react';
import { getApiUrl } from '../lib/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  LinkedEmployee,
  resetSyncState,
  setSyncFailed,
  setSyncLoading,
  setSyncSuccess,
  User,
  UserSyncResponse,
} from '../store/userSlice';

interface UseUserSyncReduxReturn {
  isLoading: boolean;
  isSynced: boolean;
  error: string | null;
  syncUser: () => Promise<void>;
  lastSyncResult: UserSyncResponse | null;
  retryCount: number;
  maxRetries: number;
  canRetry: boolean;
  user: User | null;
  linkedEmployee: LinkedEmployee | null;
}

/**
 * Redux-powered custom hook for syncing Clerk user data with the database
 *
 * Features:
 * - Uses Redux for state management
 * - Automatic sync when user loads
 * - Prevents duplicate API calls
 * - Uses axios for better error handling
 * - Proper state management for sync status
 * - Automatic retry on user changes
 * - Retry limit protection (max 5 attempts)
 * - Comprehensive error tracking with attempt counts
 * - Centralized state in Redux store
 *
 * @returns {UseUserSyncReduxReturn} Hook state, sync function, and retry information
 */
export const useUserSyncRedux = (): UseUserSyncReduxReturn => {
  const { user: clerkUser, isLoaded } = useUser();
  const dispatch = useAppDispatch();

  // Get state from Redux store
  const { isLoading, isSynced, error, lastSyncResult, retryCount, user, linkedEmployee } =
    useAppSelector(state => state.user);

  // Constants
  const MAX_RETRIES = 5;
  const canRetry = retryCount < MAX_RETRIES;

  // Refs to track sync status and prevent duplicate calls
  const syncedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const syncUser = useCallback(async (): Promise<void> => {
    const currentUser = clerkUser;

    if (!currentUser || !isLoaded) {
      console.log('User not available for sync:', {
        hasUser: !!currentUser,
        isLoaded,
      });
      return;
    }

    // Check if we already synced this user
    if (syncedRef.current && currentUser.id === lastUserIdRef.current) {
      console.log('User already synced, skipping:', {
        userId: currentUser.id,
        wasSynced: syncedRef.current,
      });
      return;
    }

    // Check retry limit
    if (retryCount >= MAX_RETRIES) {
      console.log('Max retry attempts reached for user sync:', {
        userId: currentUser.id,
        retryCount,
        maxRetries: MAX_RETRIES,
      });
      return;
    }

    dispatch(setSyncLoading(true));

    try {
      console.log('Attempting to sync user:', {
        userId: currentUser.id,
        email: currentUser.emailAddresses[0]?.emailAddress,
        attempt: retryCount + 1,
        maxRetries: MAX_RETRIES,
      });

      const url = getApiUrl('/sync-user');
      const responseData = await axios.post<UserSyncResponse>(url, {
        userId: currentUser.id,
      });

      console.log('User data synced successfully:', responseData.data);

      // Update Redux state
      dispatch(setSyncSuccess(responseData.data));

      // Update refs
      syncedRef.current = true;
      lastUserIdRef.current = currentUser.id;
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

      // Add retry information to error message
      const newRetryCount = retryCount + 1;
      if (newRetryCount >= MAX_RETRIES) {
        errorMessage += ` (Max attempts reached: ${MAX_RETRIES}/${MAX_RETRIES})`;
      } else {
        errorMessage += ` (Attempt ${newRetryCount}/${MAX_RETRIES})`;
      }

      dispatch(setSyncFailed(errorMessage));
      syncedRef.current = false; // Allow retry on error
      lastUserIdRef.current = null;
    }
  }, [clerkUser, isLoaded, retryCount, dispatch, MAX_RETRIES]);

  // Reset sync state when user changes
  useEffect(() => {
    if (clerkUser?.id && clerkUser.id !== lastUserIdRef.current) {
      syncedRef.current = false;
      lastUserIdRef.current = null;
      dispatch(resetSyncState());
    }
  }, [clerkUser?.id, dispatch]);

  // Auto-sync when user is loaded - use ref to track sync attempts
  useEffect(() => {
    if (clerkUser && isLoaded && !syncedRef.current && canRetry) {
      syncUser();
    }
  }, [clerkUser, isLoaded, syncUser, canRetry]);

  return {
    isLoading,
    isSynced,
    error,
    syncUser,
    lastSyncResult,
    retryCount,
    maxRetries: MAX_RETRIES,
    canRetry,
    user,
    linkedEmployee,
  };
};
