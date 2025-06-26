'use client';

import { ArrowLeftIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';
import PlaceholderComponent from '../../../components/PlaceholderComponent';
import AppLayout from '../../AppLayout';

const DocumentsPoliciesPage: React.FC = () => {
  return (
    <AppLayout>
      <div className='w-full max-w-7xl mx-auto p-6'>
        {/* Header with Back Button */}
        <div className='mb-8'>
          <div className='flex items-center mb-4'>
            <Link
              href='/documents'
              className='inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4'
            >
              <ArrowLeftIcon className='w-5 h-5 mr-2' />
              Back to Documents
            </Link>
          </div>

          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
            Company Policies
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>HR policies, guidelines and procedures</p>
        </div>

        {/* Coming Soon */}
        <PlaceholderComponent
          icon={BuildingOfficeIcon}
          title='Coming Soon'
          description='Company policies section is under development.'
        />
      </div>
    </AppLayout>
  );
};

export default DocumentsPoliciesPage;
