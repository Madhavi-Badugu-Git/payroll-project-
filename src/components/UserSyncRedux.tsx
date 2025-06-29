'use client';

import { useUserSyncRedux } from '@/hooks/useUserSyncRedux';

/**
 * Redux-powered UserSync component that automatically syncs user data with the database
 * This component uses Redux for state management and is automatically included in the layout
 */
export default function UserSyncRedux() {
  const { isLoading, error, retryCount, maxRetries } = useUserSyncRedux();

  // Show error state for debugging (can be removed in production)
  if (error && !isLoading && retryCount >= maxRetries) {
    console.error('UserSyncRedux - Failed to sync user after max retries:', error);
  }

  // This component doesn't render anything visible
  return null;
}
