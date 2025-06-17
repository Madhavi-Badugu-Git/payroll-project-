'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../AppLayout';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Employee {
  id: string;
  empId: string;
  name: string;
  email: string;
  phoneNo: string;
  designation: string;
  joiningDate: string;
  status: string;
}

interface EmployeeFormData {
  empId: string;
  name: string;
  email: string;
  phoneNo: string;
  designation: string;
  joiningDate: string;
  status: string;
}

const initialFormData: EmployeeFormData = {
  empId: '',
  name: '',
  email: '',
  phoneNo: '',
  designation: '',
  joiningDate: '',
  status: 'Active'
};

const statusOptions = ['Active', 'Inactive', 'On Leave'];
const designationOptions = [
  'Software Engineer',
  'Senior Developer',
  'Project Manager',
  'UI/UX Designer',
  'DevOps Engineer',
  'Business Analyst',
  'Quality Assurance',
  'HR Manager',
  'Data Scientist',
  'Marketing Specialist',
  'Team Lead',
  'System Administrator'
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Fetch employees
  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data.employees);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open add modal
  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      empId: employee.empId,
      name: employee.name,
      email: employee.email,
      phoneNo: employee.phoneNo,
      designation: employee.designation,
      joiningDate: employee.joiningDate.split('T')[0], // Format date for input
      status: employee.status
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees';
      const method = editingEmployee ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save employee');
      }

      await fetchEmployees();
      setIsModalOpen(false);
      setFormData(initialFormData);
      setEditingEmployee(null);
    } catch (err) {
      console.error('Error saving employee:', err);
      setError(err instanceof Error ? err.message : 'Failed to save employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (employee: Employee) => {
    setDeletingEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  // Handle delete employee
  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/employees/${deletingEmployee.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }

      await fetchEmployees();
      setIsDeleteModalOpen(false);
      setDeletingEmployee(null);      setToastMessage('Employee deleted successfully!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setToastMessage(null);
      }, 3000); // Hide after 3 seconds    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Failed to delete employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modals
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
    setEditingEmployee(null);
    setError(null);    setToastMessage(null); 
    setShowToast(false);  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingEmployee(null);
    setError(null);
    setToastMessage(null); 
    setShowToast(false);
  };

  // Get status color class
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
        <div className="text-center p-10">Loading employees...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Employee Management
          </h1>
          <button
            onClick={handleAddEmployee}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Employee
          </button>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-md shadow-lg z-50">
            <div className="flex justify-between items-center">
              <span>{toastMessage}</span>
              <button 
                onClick={() => {
                  setShowToast(false);
                  setToastMessage(null);
                }} 
                className="ml-4 text-green-100 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phone No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Joining Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {employee.empId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {employee.phoneNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {employee.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {new Date(employee.joiningDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(employee)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    name="empId"
                    value={formData.empId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="EMP001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="john.doe@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="+91-9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Designation
                  </label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Designation</option>
                    {designationOptions.map((designation) => (
                      <option key={designation} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : editingEmployee ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && deletingEmployee && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Confirm Delete
                </h3>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete employee <strong>{deletingEmployee.name}</strong>? 
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEmployee}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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