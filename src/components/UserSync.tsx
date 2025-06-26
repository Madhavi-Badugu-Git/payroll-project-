'use client';

import { useUserSync } from '@/hooks/useUserSync';

export default function UserSync() {
  const { isLoading, isSynced, error } = useUserSync();

  // Optional: You can add some debug logging or UI indicators
  if (process.env.NODE_ENV === 'development') {
    if (isLoading) {
      console.log('UserSync: Syncing user...');
    }
    if (isSynced) {
      console.log('UserSync: User synced successfully');
    }
    if (error) {
      console.log('UserSync: Error -', error);
    }
  }

  return null; // This component doesn't render anything
}
