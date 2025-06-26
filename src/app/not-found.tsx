'use client';

import NotFoundComponent from '@/components/NotFoundComponent';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import AppLayout from './AppLayout';

export default function NotFound() {
  const { isSignedIn, isLoaded } = useUser();

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  // If user is signed in, show 404 within the app layout
  if (isSignedIn) {
    return (
      <AppLayout>
        <NotFoundComponent />
      </AppLayout>
    );
  }

  // If user is not signed in, show standalone 404 page
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4'>
      <div className='text-center max-w-md mx-auto'>
        <div className='mb-8'>
          <div className='text-8xl font-bold text-gray-300 dark:text-gray-600'>404</div>
        </div>

        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-3'>Page Not Found</h1>
          <p className='text-gray-600 dark:text-gray-400 leading-relaxed'>
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <button
            onClick={() => window.history.back()}
            className='inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
          >
            Go Back
          </button>

          <Link
            href='/'
            className='inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
