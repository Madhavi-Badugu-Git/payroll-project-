'use client';

import { useAppSelector } from '@/store/hooks';
import {
  selectEmployeeInfo,
  selectIsUserLinkedToEmployee,
  selectLinkedEmployee,
  selectUser,
  selectUserDisplayName,
  selectUserSyncStatus,
} from '@/store/selectors';

/**
 * Example component showing how to use Redux store to access user data
 * This component can be used in any page/component to access user sync state
 */
export const UserDataExample = () => {
  // Using selectors to get specific data from Redux store
  const user = useAppSelector(selectUser);
  const linkedEmployee = useAppSelector(selectLinkedEmployee);
  const syncStatus = useAppSelector(selectUserSyncStatus);
  const userDisplayName = useAppSelector(selectUserDisplayName);
  const employeeInfo = useAppSelector(selectEmployeeInfo);
  const isLinkedToEmployee = useAppSelector(selectIsUserLinkedToEmployee);

  if (syncStatus.isLoading) {
    return <div className='p-4 bg-blue-100 rounded'>Syncing user data...</div>;
  }

  if (syncStatus.error) {
    return (
      <div className='p-4 bg-red-100 rounded'>
        <strong>Sync Error:</strong> {syncStatus.error}
      </div>
    );
  }

  if (!user) {
    return <div className='p-4 bg-gray-100 rounded'>No user data available</div>;
  }

  return (
    <div className='p-4 space-y-4 bg-white rounded shadow'>
      <h3 className='text-lg font-semibold'>User Data from Redux Store</h3>

      {/* User Information */}
      <div className='p-3 bg-gray-50 rounded'>
        <h4 className='font-medium mb-2'>User Information</h4>
        <p>
          <strong>Display Name:</strong> {userDisplayName}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Database ID:</strong> {user.id}
        </p>
      </div>

      {/* Employee Link Status */}
      <div className='p-3 bg-gray-50 rounded'>
        <h4 className='font-medium mb-2'>Employee Link Status</h4>
        <p>
          <strong>Linked to Employee:</strong>{' '}
          <span className={isLinkedToEmployee ? 'text-green-600' : 'text-red-600'}>
            {isLinkedToEmployee ? 'Yes' : 'No'}
          </span>
        </p>

        {employeeInfo && (
          <div className='mt-2 space-y-1'>
            <p>
              <strong>Employee ID:</strong> {employeeInfo.empId}
            </p>
            <p>
              <strong>Name:</strong> {employeeInfo.name}
            </p>
            <p>
              <strong>Designation:</strong> {employeeInfo.designation}
            </p>
          </div>
        )}
      </div>

      {/* Sync Status */}
      <div className='p-3 bg-gray-50 rounded'>
        <h4 className='font-medium mb-2'>Sync Status</h4>
        <p>
          <strong>Synced:</strong>{' '}
          <span className={syncStatus.isSynced ? 'text-green-600' : 'text-yellow-600'}>
            {syncStatus.isSynced ? 'Yes' : 'No'}
          </span>
        </p>
      </div>

      {/* Raw Data (for debugging) */}
      <details className='p-3 bg-gray-50 rounded'>
        <summary className='font-medium cursor-pointer'>Raw Data (Debug)</summary>
        <pre className='mt-2 text-xs overflow-auto'>
          {JSON.stringify({ user, linkedEmployee, syncStatus }, null, 2)}
        </pre>
      </details>
    </div>
  );
};
