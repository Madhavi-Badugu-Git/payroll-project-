'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AppLayout from './AppLayout';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Handle redirect for signed-in users
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <AppLayout>
        <div className='flex flex-col items-center justify-center h-full'>
          <p>Loading...</p>
        </div>
      </AppLayout>
    );
  }

  // Show sign-in prompt for unauthenticated users
  if (status === 'unauthenticated') {
    return (
      <AppLayout>
        <div className='flex flex-col items-center justify-center h-full'>
          <h1 className='text-2xl font-semibold mb-4'>Welcome to TriNits Payroll</h1>
          <p className='mb-6 text-gray-600 dark:text-gray-400'>
            Please sign in to access your dashboard.
          </p>
          <Link
            href='/auth/signin'
            className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            Sign In
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Authenticated users get redirected, but show fallback
  return (
    <AppLayout>
      <div className='flex flex-col items-center justify-center h-full'>
        <p>Redirecting to dashboard...</p>
      </div>
    </AppLayout>
  );
}
