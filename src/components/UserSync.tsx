'use client';

import { useUserSync } from '@/hooks/useUserSync';

export default function UserSync() {
  const { isLoading, isSynced, error, retryCount, maxRetries, canRetry } = useUserSync();

  // Optional: You can add some debug logging or UI indicators
  if (process.env.NODE_ENV === 'development') {
    if (isLoading) {
      console.log('UserSync: Syncing user...', { retryCount, maxRetries });
    }
    if (isSynced) {
      console.log('UserSync: User synced successfully');
    }
    if (error) {
      console.log('UserSync: Error -', error, {
        retryCount,
        maxRetries,
        canRetry,
        maxRetriesReached: retryCount >= maxRetries,
      });
    }
  }

  return null; // This component doesn't render anything
}
