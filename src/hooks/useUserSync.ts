import { useUser } from '@clerk/nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';

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
}

export const useUserSync = (): UseUserSyncReturn => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncUserResponse | null>(null);
  const syncedRef = useRef(false);

  const syncUser = useCallback(async (): Promise<void> => {
    if (!user || !isLoaded) {
      setError('User not available for sync');
      return;
    }

    if (syncedRef.current) {
      console.log('User already synced, skipping duplicate sync');
      return;
    }

    setIsLoading(true);
    setError(null);
    syncedRef.current = true; // Prevent multiple calls

    try {
      console.log('Attempting to sync user:', {
        userId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
      });

      const response = await fetch('/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }

        const errorMessage = `Failed to sync user data: ${response.status} ${response.statusText}`;
        console.error(errorMessage, {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url: response.url,
        });

        setError(errorMessage);
        syncedRef.current = false; // Allow retry on error
        return;
      }

      const responseData: SyncUserResponse = await response.json();
      console.log('User data synced successfully:', responseData);

      setLastSyncResult(responseData);
      setIsSynced(true);
      setError(null);
    } catch (error) {
      const errorMessage = `Error syncing user to database: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage, error);

      setError(errorMessage);
      syncedRef.current = false; // Allow retry on error
      setIsSynced(false);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  // Reset sync state when user changes
  useEffect(() => {
    if (user?.id !== lastSyncResult?.user?.clerkId) {
      syncedRef.current = false;
      setIsSynced(false);
      setError(null);
      setLastSyncResult(null);
    }
  }, [user?.id, lastSyncResult?.user?.clerkId]);

  // Auto-sync when user is loaded
  useEffect(() => {
    if (isLoaded && user && !syncedRef.current && !isLoading) {
      syncUser();
    }
  }, [user, isLoaded, syncUser, isLoading]);

  return {
    isLoading,
    isSynced,
    error,
    syncUser,
    lastSyncResult,
  };
};
