'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Footer() {
  const { status } = useSession();

  return (
    <footer className='w-full bg-gray-800 text-white py-6 mt-auto'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
          {/* Company Info */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>TriNits Technologies Pvt Ltd</h3>
            <p className='text-sm'>Empowering businesses with innovative solutions.</p>
            <p className='text-sm mt-1'>© {new Date().getFullYear()} All rights reserved.</p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>Quick Links</h3>
            <ul className='space-y-1 text-sm'>
              <li>
                <Link href='/' className='hover:text-blue-300'>
                  Home
                </Link>
              </li>
              <li>
                <Link href='/holidays' className='hover:text-blue-300'>
                  Holidays
                </Link>
              </li>
              {status === 'authenticated' && (
                <>
                  <li>
                    <Link href='/leaves' className='hover:text-blue-300'>
                      Leaves
                    </Link>
                  </li>
                  <li>
                    <Link href='/payslip' className='hover:text-blue-300'>
                      Payslips
                    </Link>
                  </li>
                </>
              )}
              {status === 'unauthenticated' && (
                <li>
                  <Link href='/auth/signin' className='hover:text-blue-300'>
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className='text-lg font-semibold mb-2'>Contact Us</h3>
            <ul className='space-y-1 text-sm'>
              <li>
                <a href='mailto:support@trinitstechnologies.com' className='hover:text-blue-300'>
                  support@trinitstechnologies.com
                </a>
              </li>
              <li>
                <a
                  href='https://trinitstechnologies.com/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-blue-300'
                >
                  https://trinitstechnologies.com/
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className='mt-4 text-center text-sm'>Built with ❤️ by TriNits Technologies</div>
      </div>
    </footer>
  );
}
