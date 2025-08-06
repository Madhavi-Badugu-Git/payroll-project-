'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Footer() {
  const { status } = useSession();

  return (
    <footer className='w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
          {/* Company Info */}
          <div>
            <h3 className='text-lg font-semibold mb-2 text-gray-800 dark:text-white'>
              TriNits Technologies Pvt Ltd
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              Empowering businesses with innovative solutions.
            </p>
            <p className='text-sm mt-1 text-gray-600 dark:text-gray-300'>
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className='text-lg font-semibold mb-2 text-gray-800 dark:text-white'>
              Quick Links
            </h3>
            <ul className='space-y-1 text-sm'>
              <li>
                <Link
                  href='/'
                  className='text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href='/holidays'
                  className='text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                >
                  Holidays
                </Link>
              </li>
              
              {status === 'authenticated' && (
                <>
                  <li>
                    <Link
                      href='/leaves'
                      className='text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    >
                      Leaves
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/payslip'
                      className='text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    >
                      Payslips
                    </Link>
                  </li>
                </>
              )}
              {status === 'unauthenticated' && (
                <li>
                  <Link
                    href='/auth/signin'
                    className='text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  >
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className='text-lg font-semibold mb-2 text-gray-800 dark:text-white'>Contact Us</h3>
            <ul className='space-y-1 text-sm'>
              <li>
                <a
                  href='mailto:support@trinitstechnologies.com'
                  className='text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                >
                  support@trinitstechnologies.com
                </a>
              </li>
              <li>
                <a
                  href='https://trinitstechnologies.com/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                >
                  https://trinitstechnologies.com/
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className='mt-4 text-center text-sm text-gray-600 dark:text-gray-300'>
          Built with ❤️ by TriNits Technologies
        </div>
      </div>
    </footer>
  );
}
