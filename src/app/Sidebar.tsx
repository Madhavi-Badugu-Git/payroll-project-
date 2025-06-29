import { hasAdminRole } from '@/lib/userutils';
import { SignedIn, useUser } from '@clerk/nextjs';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  DocumentIcon,
  HomeIcon,
  SunIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname(); // Get current pathname
  const { user } = useUser();
  const isAdmin = useMemo(() => (user ? hasAdminRole(user) : false), [user]);

  const linkClasses = (path: string) => {
    const isActive =
      pathname === path ||
      (path === '/dashboard' && pathname === '/') ||
      (path !== '/dashboard' && pathname.startsWith(path + '/'));
    return `block px-3 py-2 rounded-md transition-colors duration-200 font-medium ${
      isActive
        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold border-l-4 border-blue-500'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
    }`;
  };

  return (
    <SignedIn>
      <aside
        className={`w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg flex flex-col fixed top-0 left-0 z-20 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='p-6 mt-16'>
          {' '}
          {/* Add padding and margin-top to avoid header overlap */}
          <nav className='flex flex-col space-y-2'>
            <Link href='/dashboard' className={linkClasses('/dashboard')}>
              <div className='flex items-center space-x-3'>
                <HomeIcon className='h-5 w-5' />
                <span>Dashboard</span>
              </div>
            </Link>
            {isAdmin && (
              <Link href='/employees' className={linkClasses('/employees')}>
                <div className='flex items-center space-x-3'>
                  <UsersIcon className='h-5 w-5' />
                  <span>Employees</span>
                </div>
              </Link>
            )}
            <Link href='/attendance' className={linkClasses('/attendance')}>
              <div className='flex items-center space-x-3'>
                <ClockIcon className='h-5 w-5' />
                <span>Attendance</span>
              </div>
            </Link>
            <Link href='/leaves' className={linkClasses('/leaves')}>
              <div className='flex items-center space-x-3'>
                <CalendarDaysIcon className='h-5 w-5' />
                <span>Leaves</span>
              </div>
            </Link>
            <Link href='/documents' className={linkClasses('/documents')}>
              <div className='flex items-center space-x-3'>
                <DocumentIcon className='h-5 w-5' />
                <span>Documents</span>
              </div>
            </Link>
            <Link href='/holidays' className={linkClasses('/holidays')}>
              <div className='flex items-center space-x-3'>
                <SunIcon className='h-5 w-5' />
                <span>Holidays</span>
              </div>
            </Link>
            {isAdmin && (
              <Link href='/admin/regularization' className={linkClasses('/admin/regularization')}>
                <div className='flex items-center space-x-3'>
                  <CheckCircleIcon className='h-5 w-5' />
                  <span>Regularization</span>
                </div>
              </Link>
            )}
            {isAdmin && (
              <Link
                href='/admin/leave-management'
                className={linkClasses('/admin/leave-management')}
              >
                <div className='flex items-center space-x-3'>
                  <CalendarDaysIcon className='h-5 w-5' />
                  <span>Leave Admin</span>
                </div>
              </Link>
            )}
            {isAdmin && (
              <Link href='/admin/configurations' className={linkClasses('/admin/configurations')}>
                <div className='flex items-center space-x-3'>
                  <CogIcon className='h-5 w-5' />
                  <span>Configurations</span>
                </div>
              </Link>
            )}
          </nav>
        </div>
      </aside>
    </SignedIn>
  );
}
