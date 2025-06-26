'use client';

import { PencilIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AppLayout from '../../AppLayout';

interface Configuration {
  id: string;
  configKey: string;
  configValue: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ConfigurationFormData {
  configKey: string;
  configValue: string;
  description: string;
}

const initialFormData: ConfigurationFormData = {
  configKey: '',
  configValue: '',
  description: '',
};

export default function ConfigurationsPage() {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingConfiguration, setEditingConfiguration] = useState<Configuration | null>(null);
  const [deletingConfiguration, setDeletingConfiguration] = useState<Configuration | null>(null);
  const [formData, setFormData] = useState<ConfigurationFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Fetch configurations
  const fetchConfigurations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/configurations');
      if (!response.ok) {
        throw new Error('Failed to fetch configurations');
      }
      const data = await response.json();
      setConfigurations(data.configurations);
    } catch (err) {
      console.error('Error fetching configurations:', err);
      setError('Failed to load configurations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open add modal
  const handleAddConfiguration = () => {
    setEditingConfiguration(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleEditConfiguration = (configuration: Configuration) => {
    setEditingConfiguration(configuration);
    setFormData({
      configKey: configuration.configKey,
      configValue: configuration.configValue,
      description: configuration.description || '',
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingConfiguration
        ? `/api/configurations/${editingConfiguration.id}`
        : '/api/configurations';
      const method = editingConfiguration ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      await fetchConfigurations();
      setIsModalOpen(false);
      setFormData(initialFormData);
      setEditingConfiguration(null);
      setToastMessage(
        editingConfiguration
          ? 'Configuration updated successfully!'
          : 'Configuration created successfully!'
      );
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setToastMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (configuration: Configuration) => {
    setDeletingConfiguration(configuration);
    setIsDeleteModalOpen(true);
  };

  // Handle delete configuration
  const handleDeleteConfiguration = async () => {
    if (!deletingConfiguration) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/configurations/${deletingConfiguration.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete configuration');
      }

      await fetchConfigurations();
      setIsDeleteModalOpen(false);
      setDeletingConfiguration(null);
      setToastMessage('Configuration deleted successfully!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setToastMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting configuration:', err);
      setError('Failed to delete configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modals
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
    setEditingConfiguration(null);
    setError(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingConfiguration(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className='text-center p-10'>Loading configurations...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4'>
          <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white'>
            System Configurations
          </h1>
          <button
            onClick={handleAddConfiguration}
            className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md flex items-center transition-colors w-full sm:w-auto justify-center sm:justify-start'
          >
            <PlusIcon className='h-5 w-5 mr-2' />
            Add Configuration
          </button>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className='fixed top-4 right-4 left-4 sm:left-auto sm:right-5 bg-green-500 text-white py-3 px-4 rounded-md shadow-lg z-50 mx-auto sm:mx-0 max-w-sm'>
            <div className='flex justify-between items-center'>
              <span className='text-sm'>{toastMessage}</span>
              <button
                onClick={() => {
                  setShowToast(false);
                  setToastMessage(null);
                }}
                className='ml-4 text-green-100 hover:text-white flex-shrink-0'
              >
                <XMarkIcon className='h-5 w-5' />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className='mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded'>
            {error}
          </div>
        )}

        <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden'>
          {/* Mobile Card Layout */}
          <div className='block lg:hidden'>
            <div className='divide-y divide-gray-200 dark:divide-gray-700'>
              {configurations.map(config => (
                <div key={config.id} className='p-4 hover:bg-gray-50 dark:hover:bg-gray-700'>
                  <div className='flex justify-between items-start mb-3'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                        {config.configKey}
                      </h3>
                      <p className='text-sm text-gray-500 dark:text-gray-300'>
                        {config.configValue}
                      </p>
                    </div>
                    <div className='flex space-x-2 flex-shrink-0'>
                      <button
                        onClick={() => handleEditConfiguration(config)}
                        className='p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md'
                      >
                        <PencilIcon className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(config)}
                        className='p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md'
                      >
                        <TrashIcon className='h-5 w-5' />
                      </button>
                    </div>
                  </div>

                  {config.description && (
                    <div className='mb-3'>
                      <span className='font-medium text-gray-500 dark:text-gray-400'>
                        Description:
                      </span>
                      <p className='text-gray-900 dark:text-white text-sm'>{config.description}</p>
                    </div>
                  )}

                  <div className='text-xs text-gray-500 dark:text-gray-400'>
                    Last updated: {new Date(config.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {configurations.length === 0 && (
                <div className='p-8 text-center text-sm text-gray-500 dark:text-gray-300'>
                  No configurations found.
                </div>
              )}
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className='hidden lg:block overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-700'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Configuration Key
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Value
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Description
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Last Updated
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {configurations.map(config => (
                  <tr key={config.id} className='hover:bg-gray-50 dark:hover:bg-gray-700'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                      {config.configKey}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {config.configValue}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-300'>
                      {config.description || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {new Date(config.updatedAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <div className='flex space-x-2'>
                        <button
                          onClick={() => handleEditConfiguration(config)}
                          className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                        >
                          <PencilIcon className='h-5 w-5' />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(config)}
                          className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                        >
                          <TrashIcon className='h-5 w-5' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {configurations.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className='px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300'
                    >
                      No configurations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
            <div className='relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                  {editingConfiguration ? 'Edit Configuration' : 'Add New Configuration'}
                </h3>
                <button
                  onClick={closeModal}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                >
                  <XMarkIcon className='h-6 w-6' />
                </button>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Configuration Key
                  </label>
                  <input
                    type='text'
                    name='configKey'
                    value={formData.configKey}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder='EMPLOYEE_ID_PREFIX'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Configuration Value
                  </label>
                  <input
                    type='text'
                    name='configValue'
                    value={formData.configValue}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder='TRINITS'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Description
                  </label>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder='Description of this configuration...'
                  />
                </div>

                <div className='flex justify-end space-x-3 pt-4'>
                  <button
                    type='button'
                    onClick={closeModal}
                    className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isSubmitting ? 'Saving...' : editingConfiguration ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && deletingConfiguration && (
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
            <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                  Confirm Delete
                </h3>
                <button
                  onClick={closeDeleteModal}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                >
                  <XMarkIcon className='h-6 w-6' />
                </button>
              </div>

              <div className='mb-4'>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  Are you sure you want to delete the configuration{' '}
                  <strong>{deletingConfiguration.configKey}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className='flex justify-end space-x-3'>
                <button
                  onClick={closeDeleteModal}
                  className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md'
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfiguration}
                  disabled={isSubmitting}
                  className='px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
