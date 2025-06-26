'use client';

import PlaceholderComponent from '@/components/PlaceholderComponent';
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  CogIcon,
  DocumentIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

const PlaceholderExamples: React.FC = () => {
  return (
    <div className='p-8 max-w-6xl mx-auto space-y-12'>
      <div className='text-center mb-12'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
          Placeholder Component Examples
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Reusable placeholder component for unimplemented screens
        </p>
      </div>

      {/* Default Usage */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
        <h2 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>Default Usage</h2>
        <PlaceholderComponent />
      </div>

      {/* Custom Icon and Text */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
        <h2 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
          Custom Icon and Text
        </h2>
        <PlaceholderComponent
          icon={BuildingOfficeIcon}
          title='Company Policies'
          description='HR policies, guidelines and procedures are being developed.'
        />
      </div>

      {/* Different Sizes */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
        <h2 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
          Different Sizes
        </h2>

        <div className='space-y-8'>
          <div>
            <h3 className='text-lg font-medium mb-2 text-gray-700 dark:text-gray-300'>Small</h3>
            <PlaceholderComponent
              icon={DocumentIcon}
              title='Small Placeholder'
              description='This is a small sized placeholder.'
              size='small'
            />
          </div>

          <div>
            <h3 className='text-lg font-medium mb-2 text-gray-700 dark:text-gray-300'>
              Medium (Default)
            </h3>
            <PlaceholderComponent
              icon={DocumentTextIcon}
              title='Medium Placeholder'
              description='This is a medium sized placeholder (default).'
              size='medium'
            />
          </div>

          <div>
            <h3 className='text-lg font-medium mb-2 text-gray-700 dark:text-gray-300'>Large</h3>
            <PlaceholderComponent
              icon={ChartBarIcon}
              title='Large Placeholder'
              description='This is a large sized placeholder for major sections.'
              size='large'
            />
          </div>
        </div>
      </div>

      {/* Real-world Examples */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
        <h2 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>
          Real-world Examples
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Settings Page */}
          <div className='border border-gray-200 dark:border-gray-600 rounded-lg p-4'>
            <h3 className='text-sm font-medium mb-2 text-gray-500 dark:text-gray-400'>
              Settings Page
            </h3>
            <PlaceholderComponent
              icon={CogIcon}
              title='Settings'
              description='User settings and preferences will be available here.'
              size='small'
            />
          </div>

          {/* Team Management */}
          <div className='border border-gray-200 dark:border-gray-600 rounded-lg p-4'>
            <h3 className='text-sm font-medium mb-2 text-gray-500 dark:text-gray-400'>
              Team Management
            </h3>
            <PlaceholderComponent
              icon={UserGroupIcon}
              title='Team Management'
              description='Manage your team members and roles.'
              size='small'
            />
          </div>

          {/* Analytics Dashboard */}
          <div className='border border-gray-200 dark:border-gray-600 rounded-lg p-4 md:col-span-2'>
            <h3 className='text-sm font-medium mb-2 text-gray-500 dark:text-gray-400'>
              Analytics Dashboard
            </h3>
            <PlaceholderComponent
              icon={ChartBarIcon}
              title='Analytics Dashboard'
              description='Comprehensive analytics and reporting tools are coming soon.'
              size='medium'
            />
          </div>
        </div>
      </div>

      {/* Usage Code Examples */}
      <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6'>
        <h2 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>Usage Examples</h2>

        <div className='space-y-4 text-sm'>
          <div>
            <h3 className='font-medium mb-2 text-gray-700 dark:text-gray-300'>Basic Usage:</h3>
            <div className='bg-gray-100 dark:bg-gray-700 p-3 rounded'>
              <code>{`<PlaceholderComponent />`}</code>
            </div>
          </div>

          <div>
            <h3 className='font-medium mb-2 text-gray-700 dark:text-gray-300'>
              With Custom Props:
            </h3>
            <div className='bg-gray-100 dark:bg-gray-700 p-3 rounded'>
              <code>{`<PlaceholderComponent
  icon={BuildingOfficeIcon}
  title="Coming Soon"
  description="This feature is under development."
  size="large"
/>`}</code>
            </div>
          </div>

          <div>
            <h3 className='font-medium mb-2 text-gray-700 dark:text-gray-300'>
              With Custom Styling:
            </h3>
            <div className='bg-gray-100 dark:bg-gray-700 p-3 rounded'>
              <code>{`<PlaceholderComponent
  icon={CogIcon}
  title="Settings"
  description="Configure your preferences here."
  className="bg-blue-50 border border-blue-200"
  size="small"
/>`}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderExamples;
