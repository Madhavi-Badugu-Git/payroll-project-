'use client';

import { ArrowLeftIcon, DocumentIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';
import PlaceholderComponent from '../../../components/PlaceholderComponent';
import AppLayout from '../../AppLayout';

const DocumentsGeneralPage: React.FC = () => {
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
            General Documents
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>Access general documents and files</p>
        </div>

        {/* Coming Soon */}
        <PlaceholderComponent
          icon={DocumentIcon}
          title='Coming Soon'
          description='General documents section is under development.'
        />
      </div>
    </AppLayout>
  );
};

export default DocumentsGeneralPage;
