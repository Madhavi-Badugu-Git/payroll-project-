'use client';

import ConfirmDialog from '@/components/ConfirmDialog';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useEmployees } from '@/hooks/useEmployees';
import { getApiUrl } from '@/lib/api';
import { hasAdminRole } from '@/lib/userutils';
import { Promotion } from '@/types';
import { useUser } from '@clerk/nextjs';
import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AppLayout from '../../AppLayout';

// Designations enum/constants
const DESIGNATIONS = {
  SOFTWARE_ENGINEER: 'Software Engineer',
  SENIOR_DEVELOPER: 'Senior Developer',
  PROJECT_MANAGER: 'Project Manager',
  UI_UX_DESIGNER: 'UI/UX Designer',
  DEVOPS_ENGINEER: 'DevOps Engineer',
  BUSINESS_ANALYST: 'Business Analyst',
  QUALITY_ASSURANCE: 'Quality Assurance',
  HR_MANAGER: 'HR Manager',
  DATA_SCIENTIST: 'Data Scientist',
  MARKETING_SPECIALIST: 'Marketing Specialist',
  TEAM_LEAD: 'Team Lead',
  SYSTEM_ADMINISTRATOR: 'System Administrator',
} as const;

const designationOptions = Object.values(DESIGNATIONS);

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const isAdmin = useMemo(() => (user ? hasAdminRole(user) : false), [user]);

  const { employee, isLoading, error, fetchEmployee } = useEmployees();
  const { confirmDialog, showConfirmDialog, hideConfirmDialog } = useConfirmDialog();

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true);

  // Promotion CRUD states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    salary: '',
    revisionDate: '',
    currentPosition: '',
    previousPosition: '',
  });

  const empId = params.empId as string;

  // Promotion CRUD functions
  const handleAddPromotion = () => {
    setFormData({
      salary: '',
      revisionDate: '',
      currentPosition: '',
      previousPosition: employee?.currentDesignation || '', // Pre-fill with current designation
    });
    setEditingPromotion(null);
    setShowAddModal(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setFormData({
      salary: promotion.salary.toString(),
      revisionDate: promotion.revisionDate.split('T')[0],
      currentPosition: promotion.currentPosition,
      previousPosition: promotion.previousPosition,
    });
    setEditingPromotion(promotion);
    setShowEditModal(true);
  };

  const handleDeletePromotion = async (promotionId: string) => {
    showConfirmDialog({
      title: 'Delete Promotion Record',
      message:
        'Are you sure you want to delete this promotion record? This action cannot be undone.',
      severity: 'error',
      onConfirm: () => confirmDeletePromotion(promotionId),
    });
  };

  const confirmDeletePromotion = async (promotionId: string) => {
    // Close the confirmation dialog
    hideConfirmDialog();

    try {
      const response = await fetch(getApiUrl(`/promotions/${promotionId}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete promotion');
      }

      // Refresh both promotions list and employee data
      await Promise.all([fetchPromotions(), fetchEmployee(empId)]);
      toast.success('Promotion record deleted successfully!');
    } catch (err) {
      console.error('Error deleting promotion:', err);
      toast.error('Failed to delete promotion. Please try again.');
    }
  };

  const handlePromotionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingPromotion ? `/api/promotions/${editingPromotion.id}` : '/api/promotions';
      const method = editingPromotion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          empId: empId,
          ...formData,
          salary: parseFloat(formData.salary),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save promotion');
      }

      // Close modals and refresh data
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingPromotion(null);

      // Refresh both promotions list and employee data
      await Promise.all([fetchPromotions(), fetchEmployee(empId)]);

      // Reset form
      setFormData({
        salary: '',
        revisionDate: '',
        currentPosition: '',
        previousPosition: '',
      });

      toast.success(
        editingPromotion ? 'Promotion updated successfully!' : 'Promotion added successfully!'
      );
    } catch (err) {
      console.error('Error saving promotion:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save promotion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchPromotions = useCallback(async () => {
    if (!empId) return;

    setIsLoadingPromotions(true);

    try {
      const response = await fetch(getApiUrl(`/promotions?empId=${encodeURIComponent(empId)}`));
      if (!response.ok) {
        throw new Error('Failed to fetch promotions data');
      }

      const data = await response.json();
      setPromotions(data.promotions);
    } catch (err) {
      console.error('Error fetching promotions:', err);
    } finally {
      setIsLoadingPromotions(false);
    }
  }, [empId]);

  useEffect(() => {
    if (empId) {
      fetchEmployee(empId);
    }
  }, [empId, fetchEmployee]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'Inactive':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'On Leave':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className='text-center p-10'>Loading employee details...</div>
      </AppLayout>
    );
  }

  if (error || !employee) {
    return (
      <AppLayout>
        <div className='text-center p-10'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>
            {error || 'Employee not found'}
          </h2>
          <button
            onClick={() => router.push('/employees')}
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700'
          >
            <ArrowLeftIcon className='h-4 w-4 mr-2' />
            Back to Employees
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='w-full max-w-4xl mx-auto p-2 sm:p-4 md:p-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:justify-between mb-6'>
          <div className='flex'>
            <button
              onClick={() => router.push('/employees')}
              className='p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md'
            >
              <ArrowLeftIcon className='h-6 w-6' />
            </button>
            <div>
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white'>
                {employee.firstName} {employee.lastName} - {employee.empId}
              </h1>
            </div>
          </div>
        </div>

        {/* Employee Details */}
        <div className='bg-white dark:bg-gray-800 shadow rounded-lg'>
          <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Employee Information
            </h2>
          </div>

          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Personal Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                  Personal Information
                </h3>

                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    First Name
                  </label>
                  <p className='text-base text-gray-900 dark:text-white'>{employee.firstName}</p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Last Name
                  </label>
                  <p className='text-base text-gray-900 dark:text-white'>{employee.lastName}</p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Office Email
                  </label>
                  <p className='text-base text-gray-900 dark:text-white'>{employee.officeEmail}</p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Personal Email
                  </label>
                  <p className='text-base text-gray-900 dark:text-white'>
                    {employee.personalEmail || 'Not provided'}
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Mobile Number
                  </label>
                  <p className='text-base text-gray-900 dark:text-white'>{employee.mobileNo}</p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Date of Birth
                  </label>
                  <p className='text-base text-gray-900 dark:text-white'>
                    {employee.dateOfBirth
                      ? new Date(employee.dateOfBirth).toLocaleDateString()
                      : 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Employment Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                  Employment Information
                </h3>

                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Employee ID
                  </label>
                  <p className='text-base text-gray-900 dark:text-white font-mono'>
                    {employee.empId}
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Salary
                  </label>
                  <p className='text-base text-gray-900 dark:text-white'>
                    {employee.salary ? `₹${employee.salary.toLocaleString()}` : 'Not specified'}
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Designation
                  </label>
                  <p className='text-base text-gray-900 dark:text-white'>
                    {employee.currentDesignation}
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Employment Type
                  </label>
                  <p className='text-base text-gray-900 dark:text-white'>
                    {employee.employmentType}
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Stream
                  </label>
                  <p className='text-base text-gray-900 dark:text-white'>{employee.stream}</p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(employee.status)}`}
                  >
                    {employee.status}
                  </span>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Joining Date
                  </label>
                  <p className='text-base text-gray-900 dark:text-white'>
                    {new Date(employee.joiningDate).toLocaleDateString()}
                  </p>
                </div>

                {employee.exitDate && (
                  <div>
                    <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Exit Date
                    </label>
                    <p className='text-base text-gray-900 dark:text-white'>
                      {new Date(employee.exitDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Promotions */}
            <div className='mt-8 pt-6 border-t border-gray-200 dark:border-gray-700'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                  Promotion History
                </h3>
                {isAdmin && (
                  <button
                    onClick={handleAddPromotion}
                    className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md flex items-center transition-colors'
                  >
                    <PlusIcon className='h-5 w-5 mr-2' />
                    Add Promotion
                  </button>
                )}
              </div>

              {isLoadingPromotions ? (
                <div className='text-center p-8 text-gray-500 dark:text-gray-400'>
                  Loading promotions...
                </div>
              ) : promotions.length === 0 ? (
                <div className='text-center p-8 text-gray-500 dark:text-gray-400'>
                  <p>No promotions found for this employee.</p>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                    <thead className='bg-gray-50 dark:bg-gray-700'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Revision Date
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Salary
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Previous Position
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                          Current Position
                        </th>
                        {isAdmin && (
                          <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                      {promotions.map((promotion, index) => (
                        <tr
                          key={promotion.id}
                          className={
                            index % 2 === 0
                              ? 'bg-white dark:bg-gray-800'
                              : 'bg-gray-50 dark:bg-gray-700'
                          }
                        >
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                            {new Date(promotion.revisionDate).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                            ₹{promotion.salary.toLocaleString('en-IN')}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                            {promotion.previousPosition}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                            <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                              {promotion.currentPosition}
                            </span>
                          </td>
                          {isAdmin && (
                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                              <div className='flex space-x-2'>
                                <button
                                  onClick={() => handleEditPromotion(promotion)}
                                  className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300'
                                >
                                  <PencilIcon className='h-4 w-4' />
                                </button>
                                <button
                                  onClick={() => handleDeletePromotion(promotion.id)}
                                  className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                >
                                  <TrashIcon className='h-4 w-4' />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Social Links */}
            {(employee.githubUserId || employee.linkedinId) && (
              <div className='mt-8 pt-6 border-t border-gray-200 dark:border-gray-700'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                  Social Links
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {employee.githubUserId && (
                    <div>
                      <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                        GitHub
                      </label>
                      <a
                        href={`https://github.com/${employee.githubUserId}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-base text-blue-600 dark:text-blue-400 hover:underline'
                      >
                        @{employee.githubUserId}
                      </a>
                    </div>
                  )}

                  {employee.linkedinId && (
                    <div>
                      <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                        LinkedIn
                      </label>
                      <a
                        href={`https://linkedin.com/in/${employee.linkedinId}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-base text-blue-600 dark:text-blue-400 hover:underline'
                      >
                        {employee.linkedinId}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className='mt-8 pt-6 border-t border-gray-200 dark:border-gray-700'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                Record Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Created At
                  </label>
                  <p className='text-base text-gray-900 dark:text-white'>
                    {new Date(employee.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Last Updated
                  </label>
                  <p className='text-base text-gray-900 dark:text-white'>
                    {new Date(employee.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Promotion Modal */}
        {showAddModal && (
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
            <div className='relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Add Promotion
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                >
                  <XMarkIcon className='h-6 w-6' />
                </button>
              </div>

              <form onSubmit={handlePromotionSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Salary *
                  </label>
                  <input
                    type='number'
                    name='salary'
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                    min='0'
                    step='0.01'
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder='75000'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Revision Date *
                  </label>
                  <input
                    type='date'
                    name='revisionDate'
                    value={formData.revisionDate}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Previous Position *
                  </label>
                  <select
                    name='previousPosition'
                    value={formData.previousPosition}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  >
                    <option value=''>Select Previous Position</option>
                    {designationOptions.map(designation => (
                      <option key={designation} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Current Position *
                  </label>
                  <select
                    name='currentPosition'
                    value={formData.currentPosition}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  >
                    <option value=''>Select Current Position</option>
                    {designationOptions.map(designation => (
                      <option key={designation} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='flex justify-end space-x-3 pt-4'>
                  <button
                    type='button'
                    onClick={() => setShowAddModal(false)}
                    className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md text-sm disabled:opacity-50'
                  >
                    {isSubmitting ? 'Adding...' : 'Add Promotion'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Promotion Modal */}
        {showEditModal && (
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
            <div className='relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Edit Promotion
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                >
                  <XMarkIcon className='h-6 w-6' />
                </button>
              </div>

              <form onSubmit={handlePromotionSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Salary *
                  </label>
                  <input
                    type='number'
                    name='salary'
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                    min='0'
                    step='0.01'
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder='75000'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Revision Date *
                  </label>
                  <input
                    type='date'
                    name='revisionDate'
                    value={formData.revisionDate}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Previous Position *
                  </label>
                  <select
                    name='previousPosition'
                    value={formData.previousPosition}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  >
                    <option value=''>Select Previous Position</option>
                    {designationOptions.map(designation => (
                      <option key={designation} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Current Position *
                  </label>
                  <select
                    name='currentPosition'
                    value={formData.currentPosition}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  >
                    <option value=''>Select Current Position</option>
                    {designationOptions.map(designation => (
                      <option key={designation} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='flex justify-end space-x-3 pt-4'>
                  <button
                    type='button'
                    onClick={() => setShowEditModal(false)}
                    className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md text-sm disabled:opacity-50'
                  >
                    {isSubmitting ? 'Updating...' : 'Update Promotion'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText='Delete'
          cancelText='Cancel'
          severity={confirmDialog.severity}
          onConfirm={confirmDialog.onConfirm}
          onCancel={hideConfirmDialog}
        />
      </div>
    </AppLayout>
  );
}
