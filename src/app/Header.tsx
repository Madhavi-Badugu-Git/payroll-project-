'use client';

import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className='w-full flex justify-between items-center p-4 h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-30'>
      <div className='flex items-center'>
        {status === 'authenticated' && (
          <button
            onClick={onToggleSidebar}
            className='mr-3 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
            aria-label='Toggle sidebar'
          >
            {isSidebarOpen ? <XMarkIcon className='h-6 w-6' /> : <Bars3Icon className='h-6 w-6' />}
          </button>
        )}
        <Link href='/dashboard' className='text-xl font-bold text-gray-800 dark:text-white'>
          TriNits Technologies
        </Link>
      </div>
      <div className='flex items-center gap-4'>
        {status === 'unauthenticated' && (
          <>
            <Link
              href='/auth/signin'
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Sign In
            </Link>
            <Link
              href='/auth/signup'
              className='px-4 py-2 text-sm font-medium text-blue-600 bg-transparent border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Sign Up
            </Link>
          </>
        )}
        {status === 'authenticated' && session?.user && (
          <div className='relative'>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className='flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt='Profile'
                  width={32}
                  height={32}
                  className='w-8 h-8 rounded-full'
                />
              ) : (
                <div className='w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center'>
                  <span className='text-sm font-medium'>
                    {session.user.firstName?.[0] || session.user.email?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <ChevronDownIcon className='w-4 h-4' />
            </button>

            {isDropdownOpen && (
              <div className='absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50'>
                <div className='px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700'>
                  <p className='font-medium'>
                    {session.user.firstName} {session.user.lastName}
                  </p>
                  <p className='text-gray-500 dark:text-gray-400'>{session.user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className='block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
