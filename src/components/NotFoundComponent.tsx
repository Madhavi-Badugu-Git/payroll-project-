'use client';

import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface NotFoundComponentProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export default function NotFoundComponent({
  title = 'Page Not Found',
  description = 'Sorry, we couldn&apos;t find the page you&apos;re looking for.',
  showBackButton = true,
  showHomeButton = true,
}: NotFoundComponentProps) {
  const { status } = useSession();
  const isSignedIn = status === 'authenticated';

  return (
    <div className='min-h-[60vh] flex items-center justify-center px-4'>
      <div className='text-center max-w-md mx-auto'>
        {/* 404 Icon */}
        <div className='mb-8'>
          <div className='text-8xl font-bold text-gray-300 dark:text-gray-600'>404</div>
        </div>

        {/* Error Message */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-3'>{title}</h1>
          <p className='text-gray-600 dark:text-gray-400 leading-relaxed'>{description}</p>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          {showBackButton && (
            <button
              onClick={() => window.history.back()}
              className='inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              <ArrowLeftIcon className='h-4 w-4 mr-2' />
              Go Back
            </button>
          )}

          {showHomeButton && (
            <Link
              href={isSignedIn ? '/dashboard' : '/'}
              className='inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              <HomeIcon className='h-4 w-4 mr-2' />
              {isSignedIn ? 'Go to Dashboard' : 'Go Home'}
            </Link>
          )}
        </div>

        {/* Helpful Links for Authenticated Users */}
        {isSignedIn && (
          <div className='mt-8 pt-8 border-t border-gray-200 dark:border-gray-700'>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>Quick links:</p>
            <div className='flex flex-wrap justify-center gap-4 text-sm'>
              <Link
                href='/attendance'
                className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
              >
                Attendance
              </Link>
              <Link
                href='/leaves'
                className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
              >
                Leaves
              </Link>
              <Link
                href='/employees'
                className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
              >
                Employees
              </Link>
              <Link
                href='/payslip'
                className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
              >
                Payslip
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
