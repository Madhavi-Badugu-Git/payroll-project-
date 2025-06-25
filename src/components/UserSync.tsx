'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function UserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user) {
        try {
          const response = await fetch('/api/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.id }),
          });

          if (!response.ok) {
            console.error('Failed to sync user data:', response.statusText);
          } else {
            console.log('User data synced successfully');
          }
        } catch (error) {
          console.error('Error syncing user to database:', error);
        }
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return null; // This component doesn't render anything
}
