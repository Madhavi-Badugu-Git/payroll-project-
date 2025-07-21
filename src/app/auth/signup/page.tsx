'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          // Handle field-specific errors from API
          setErrors(result.errors);
        } else {
          setErrors({ general: result.error || 'An error occurred during signup' });
        }
        return;
      }

      // Success - redirect to sign in page with success message
      router.push('/auth/signin?message=Account created successfully. Please sign in.');
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-300 py-12 px-4 sm:px-6 lg:px-8'>
      <div className=' bg-white shadow-md rounded-lg p-5 max-w-md w-full'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>Create Account</h2>
          <p className='mt-2 text-center text-sm text-gray-400 dark:text-gray-500'>
            Please enter your details to create account
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {errors.general && (
            <div className='rounded-md bg-red-50 p-4'>
              <div className='text-sm text-red-700'>{errors.general}</div>
            </div>
          )}

          <div className='space-y-4 mb-4'>
            <div className='mb-4'>
              <label
                htmlFor='firstName'
                className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2'
              >
                First Name
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
                      d='M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z'
                    />
                  </svg>
                </span>
                <input
                  id='firstName'
                  name='firstName'
                  type='text'
                  required
                  className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  placeholder='First Name'
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              {errors.firstName && <p className='mt-1 text-sm text-red-600'>{errors.firstName}</p>}
            </div>

            <div className='mt-4'>
              <label
                htmlFor='lastName'
                className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2'
              >
                Last Name
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
                      d='M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z'
                    />
                  </svg>
                </span>
                <input
                  id='lastName'
                  name='lastName'
                  type='text'
                  required
                  className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  placeholder='Last Name'
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              {errors.lastName && <p className='mt-1 text-sm text-red-600'>{errors.lastName}</p>}
            </div>

            <div className='mb-4'>
              <label
                htmlFor='email'
                className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2'
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
                      d='M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75'
                    />
                  </svg>
                </span>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  placeholder='Email address'
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <p className='mt-1 text-sm text-red-600'>{errors.email}</p>}
            </div>

            <div className='mb-4'>
              <label
                htmlFor='password'
                className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2'
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
                      d='M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z'
                    />
                  </svg>
                </span>

                <input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='new-password'
                  required
                  className={`w-full pl-10 pr-3 py-2 border ${
                    errors.password
                      ? 'border-red-300 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder='Password'
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {errors.password && <p className='mt-1 text-sm text-red-600'>{errors.password}</p>}
            </div>

            <div className='mb-4'>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2'
              >
                Confirm Password
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
                      d='M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z'
                    />
                  </svg>
                </span>

                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type='password'
                  autoComplete='new-password'
                  required
                  className={`w-full pl-10 pr-3 py-2 border ${errors.password ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder='Confirm Password'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              {errors.confirmPassword && (
                <p className='mt-1 text-sm text-red-600'>{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={isLoading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className='text-center mt-4'>
              <Link href='/auth/signin' className='text-black font-medium '>
                Already have an account? <span className='text-indigo-600 underline'>Login</span>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
