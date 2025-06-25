import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'; // Corrected import for heroicons v2

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  return (
    <header className='w-full flex justify-between items-center p-4 h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-30'>
      <div className='flex items-center'>
        <SignedIn>
          <button
            onClick={onToggleSidebar}
            className='mr-3 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'
            aria-label='Toggle sidebar'
          >
            {isSidebarOpen ? <XMarkIcon className='h-6 w-6' /> : <Bars3Icon className='h-6 w-6' />}
          </button>
        </SignedIn>
        <Link href='/dashboard' className='text-xl font-bold text-gray-800 dark:text-white'>
          TriNits Technologies
        </Link>
      </div>
      <div className='flex items-center gap-4'>
        <SignedOut>
          <SignInButton mode='modal'>
            <button className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode='modal'>
            <button className='px-4 py-2 text-sm font-medium text-blue-600 bg-transparent border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-8 h-8' } }} />
        </SignedIn>
      </div>
    </header>
  );
}
