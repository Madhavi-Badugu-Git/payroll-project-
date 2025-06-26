'use client';

import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';
import AppLayout from '../AppLayout';

interface DocumentCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  color: string;
  bgColor: string;
}

const documentCategories: DocumentCard[] = [
  {
    id: 'documents',
    title: 'Documents',
    description: 'General documents and files',
    icon: DocumentIcon,
    href: '/documents/general',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
  },
  {
    id: 'payslips',
    title: 'Payslips',
    description: 'Monthly salary slips and payment records',
    icon: CurrencyDollarIcon,
    href: '/documents/payslips',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
  },
  {
    id: 'form16',
    title: 'Form 16',
    description: 'Annual tax certificates and TDS documents',
    icon: DocumentTextIcon,
    href: '/documents/form16',
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
  },
  {
    id: 'policies',
    title: 'Company Policies',
    description: 'HR policies, guidelines and procedures',
    icon: BuildingOfficeIcon,
    href: '/documents/policies',
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
  },
];

const DocumentsPage: React.FC = () => {
  return (
    <AppLayout>
      <div className='w-full max-w-7xl mx-auto p-6'>
        {/* Page Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>Documents</h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Access your documents, payslips, tax forms, and company policies
          </p>
        </div>

        {/* Document Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {documentCategories.map(category => {
            const IconComponent = category.icon;

            return (
              <Link key={category.id} href={category.href} className='group'>
                <div
                  className={`
                ${category.bgColor} 
                border border-gray-200 dark:border-gray-700 
                rounded-lg p-6 
                transition-all duration-200 
                shadow-sm hover:shadow-md 
                dark:bg-gray-800 dark:hover:bg-gray-750
                cursor-pointer
              `}
                >
                  {/* Icon */}
                  <div className='mb-4'>
                    <div
                      className={`
                    w-12 h-12 
                    ${category.bgColor.replace('bg-', 'bg-').replace('50', '100')} 
                    rounded-lg 
                    flex items-center justify-center
                    group-hover:scale-105 transition-transform duration-200
                  `}
                    >
                      <IconComponent className={`w-6 h-6 ${category.color}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-opacity-80'>
                      {category.title}
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
                      {category.description}
                    </p>
                  </div>

                  {/* View All Link */}
                  <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-600'>
                    <span
                      className={`
                    text-sm font-medium ${category.color} 
                    group-hover:underline 
                    inline-flex items-center
                  `}
                    >
                      View All
                      <svg
                        className='w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <DocumentIcon className='w-8 h-8 text-blue-600' />
              </div>
              <div className='ml-4'>
                <h4 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Total Documents
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  All your documents in one place
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <CurrencyDollarIcon className='w-8 h-8 text-green-600' />
              </div>
              <div className='ml-4'>
                <h4 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Recent Payslips
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Latest salary information
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <DocumentTextIcon className='w-8 h-8 text-orange-600' />
              </div>
              <div className='ml-4'>
                <h4 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Tax Documents
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Form 16 and tax certificates
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className='mt-12'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-6'>
            Recent Activity
          </h2>
          <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
            <div className='p-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0'>
                  <div className='flex items-center'>
                    <div className='w-2 h-2 bg-green-500 rounded-full mr-3'></div>
                    <span className='text-sm text-gray-900 dark:text-white'>
                      New payslip uploaded for June 2025
                    </span>
                  </div>
                  <span className='text-xs text-gray-500 dark:text-gray-400'>2 days ago</span>
                </div>

                <div className='flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0'>
                  <div className='flex items-center'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full mr-3'></div>
                    <span className='text-sm text-gray-900 dark:text-white'>
                      Form 16 for FY 2024-25 available
                    </span>
                  </div>
                  <span className='text-xs text-gray-500 dark:text-gray-400'>1 week ago</span>
                </div>

                <div className='flex items-center justify-between py-3'>
                  <div className='flex items-center'>
                    <div className='w-2 h-2 bg-orange-500 rounded-full mr-3'></div>
                    <span className='text-sm text-gray-900 dark:text-white'>
                      Updated company policy document
                    </span>
                  </div>
                  <span className='text-xs text-gray-500 dark:text-gray-400'>2 weeks ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DocumentsPage;
