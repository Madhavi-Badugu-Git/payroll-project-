'use client';

import {
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  TagIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import AppLayout from '../../AppLayout';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  employee: {
    empId: string;
    firstName: string;
    lastName: string;
    currentDesignation: string;
    status: string;
    dateOfJoining: string;
  } | null;
  roles: {
    id: string;
    roleName: string;
    description: string;
  }[];
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async (page = 1, search = '', role = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(role && { role }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchUsers(currentPage, searchTerm, selectedRole);
    }
  }, [session, currentPage, searchTerm, selectedRole]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchTerm, selectedRole);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggleActive',
          userId,
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      // Refresh the user list
      fetchUsers(currentPage, searchTerm, selectedRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'employee':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!session) {
    return (
      <AppLayout>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>Access Denied</h1>
            <p className='text-gray-600'>Please sign in to access this page.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2'>
            User Management
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Manage system users and their permissions
          </p>
        </div>

        {/* Search and Filters */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6'>
          <form onSubmit={handleSearch} className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
                <input
                  type='text'
                  placeholder='Search by email, name, or employee ID...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
                />
              </div>
            </div>
            <div className='sm:w-48'>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
              >
                <option value=''>All Roles</option>
                <option value='admin'>Admin</option>
                <option value='manager'>Manager</option>
                <option value='employee'>Employee</option>
                <option value='user'>User</option>
              </select>
            </div>
            <button
              type='submit'
              className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'
            >
              Search
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className='bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6'>
            <div className='flex'>
              <XCircleIcon className='h-5 w-5 text-red-400 mt-0.5' />
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800 dark:text-red-200'>Error</h3>
                <p className='text-sm text-red-700 dark:text-red-300 mt-1'>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden'>
          <div className='px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Users ({pagination.totalUsers})
            </h2>
          </div>

          {loading ? (
            <div className='flex items-center justify-center p-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              <span className='ml-2 text-gray-600 dark:text-gray-400'>Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className='text-center p-12'>
              <UserIcon className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-2 text-sm font-medium text-gray-900 dark:text-white'>
                No users found
              </h3>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                {searchTerm || selectedRole
                  ? 'Try adjusting your search criteria.'
                  : 'No users have been created yet.'}
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-gray-700'>
                  <tr>
                    <th className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      User
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Employee Info
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Roles
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Last Login
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                  {users.map(user => (
                    <tr key={user.id} className='hover:bg-gray-50 dark:hover:bg-gray-700'>
                      <td className='px-4 sm:px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-10 w-10'>
                            <div className='h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center'>
                              <UserIcon className='h-5 w-5 text-gray-600 dark:text-gray-400' />
                            </div>
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900 dark:text-white'>
                              {user.firstName || user.lastName
                                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                : 'N/A'}
                            </div>
                            <div className='text-sm text-gray-500 dark:text-gray-400 flex items-center'>
                              <EnvelopeIcon className='h-4 w-4 mr-1' />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 sm:px-6 py-4 whitespace-nowrap'>
                        {user.employee ? (
                          <div>
                            <div className='text-sm font-medium text-gray-900 dark:text-white flex items-center'>
                              <TagIcon className='h-4 w-4 mr-1' />
                              {user.employee.empId}
                            </div>
                            <div className='text-sm text-gray-500 dark:text-gray-400 flex items-center'>
                              <BriefcaseIcon className='h-4 w-4 mr-1' />
                              {user.employee.currentDesignation}
                            </div>
                            <div className='text-xs text-gray-400 dark:text-gray-500 flex items-center'>
                              <CalendarIcon className='h-3 w-3 mr-1' />
                              Joined: {formatDate(user.employee.dateOfJoining)}
                            </div>
                          </div>
                        ) : (
                          <span className='text-sm text-gray-400 dark:text-gray-500'>
                            No employee record
                          </span>
                        )}
                      </td>
                      <td className='px-4 sm:px-6 py-4 whitespace-nowrap'>
                        <div className='flex flex-wrap gap-1'>
                          {user.roles.map(role => (
                            <span
                              key={role.id}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(role.roleName)}`}
                            >
                              {role.roleName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className='px-4 sm:px-6 py-4 whitespace-nowrap'>
                        <div className='flex flex-col'>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}
                          >
                            {user.isActive ? (
                              <>
                                <CheckCircleIcon className='h-3 w-3 mr-1' />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircleIcon className='h-3 w-3 mr-1' />
                                Inactive
                              </>
                            )}
                          </span>
                          <span
                            className={`text-xs mt-1 ${
                              user.isEmailVerified
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                          >
                            {user.isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
                          </span>
                        </div>
                      </td>
                      <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                      </td>
                      <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <button
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            user.isActive
                              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                              : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className='bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6'>
              <div className='flex-1 flex justify-between sm:hidden'>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className='relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Next
                </button>
              </div>
              <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
                <div>
                  <p className='text-sm text-gray-700 dark:text-gray-300'>
                    Showing{' '}
                    <span className='font-medium'>{(currentPage - 1) * pagination.limit + 1}</span>{' '}
                    to{' '}
                    <span className='font-medium'>
                      {Math.min(currentPage * pagination.limit, pagination.totalUsers)}
                    </span>{' '}
                    of <span className='font-medium'>{pagination.totalUsers}</span> results
                  </p>
                </div>
                <div>
                  <nav
                    className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                    aria-label='Pagination'
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <ChevronLeftIcon className='h-5 w-5' />
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-200'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <ChevronRightIcon className='h-5 w-5' />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
