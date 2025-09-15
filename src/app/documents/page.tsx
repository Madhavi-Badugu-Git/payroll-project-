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
  {
    id: 'reimbursement',
    title: 'Reimbursement',
    description: 'Money returned for approved expenses',
    icon: DocumentIcon,
    href: '/documents/reimbursement',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
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
      </div>
    </AppLayout>
  );
};

export default DocumentsPage;
