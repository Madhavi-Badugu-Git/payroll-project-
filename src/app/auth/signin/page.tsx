'use client';

import { getSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShowPass, setIsShowPass] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    getSession().then(session => {
      if (session) {
        router.push(callbackUrl);
      }
    });
  }, [router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
      } else {
        toast.success('Signed in successfully!');
        router.push(callbackUrl);
      }
    } catch (_error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-300 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='bg-white shadow-md rounded-lg p-8 max-w-md w-full'>
        <div>
          <h2 className='mt-4 text-center text-xl font-bold text-gray-900 dark:text-white'>
            Sign In
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600 dark:text-gray-400'>
            Or{' '}
            <Link
              href='/auth/signup'
              className='font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400'
            >
              create a new account
            </Link>
          </p>
          <p className='mt-2 text-center text-sm text-gray-400 dark:text-gray-500'>
            Please enter the below details to access the dashboard
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='rounded-md shadow-sm'>
            <div className='mb-4'>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Email address
              </label>
              <div className='relative'>
                <span className='absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75
                      m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25
                      m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91
                      a2.25 2.25 0 0 1-1.07-1.916V6.75'
                    />
                  </svg>
                </span>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  placeholder='Enter your email'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Password
              </label>
              <div className='relative'>
                <span className='absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0
                      2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25
                      2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z'
                    />
                  </svg>
                </span>

                <input
                  id='password'
                  name='password'
                  type={isShowPass ? 'text' : 'password'}
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className='w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  placeholder='••••••••'
                />

                <span
                  onClick={() => setIsShowPass(prev => !prev)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer'
                >
                  {isShowPass ? (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='w-5 h-5'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M2.25 12s3.75-7.5 9.75-7.5
                        9.75 7.5 9.75 7.5-3.75 7.5-9.75
                        7.5S2.25 12 2.25 12z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth={1.5}
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='w-5 h-5'
                    >
                      <path d='M17.94 17.94A10.94 10.94 0 0112 19.5c-5.25 0-9.67-3.11-11.25-7.5a10.43 10.43 0 012.42-3.81M6.42 6.42A10.93 10.93 0 0112 4.5c5.25 0 9.67 3.11 11.25 7.5a10.47 10.47 0 01-4.25 5.25' />
                      <path d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                      <line x1='3' y1='3' x2='21' y2='21' />
                    </svg>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={isLoading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
