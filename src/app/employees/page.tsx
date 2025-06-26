'use client';

import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { saveAs } from 'file-saver';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import AppLayout from '../AppLayout';

interface Employee {
  id: string;
  empId: string;
  firstName: string;
  lastName: string;
  officeEmail: string;
  personalEmail: string | null;
  mobileNo: string;
  dateOfBirth: string | null;
  salary: number | null;
  joiningDate: string;
  exitDate: string | null;
  status: string;
  currentDesignation: string;
  employmentType: string;
  stream: string;
  githubUserId: string | null;
  linkedinId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  officeEmail: string;
  personalEmail: string;
  mobileNo: string;
  dateOfBirth: string;
  salary: string;
  joiningDate: string;
  exitDate: string;
  status: string;
  currentDesignation: string;
  employmentType: string;
  stream: string;
  githubUserId: string;
  linkedinId: string;
}

interface ImportEmployeeData {
  'Employee ID'?: string;
  'First Name': string;
  'Last Name': string;
  'Office Email': string;
  'Personal Email'?: string;
  'Mobile Number': string;
  'Date of Birth'?: string;
  Salary?: string | number;
  Designation: string;
  'Employment Type': string;
  Stream: string;
  Status: string;
  'Joining Date': string;
  'Exit Date'?: string;
  'GitHub User ID'?: string;
  'LinkedIn ID'?: string;
}

const initialFormData: EmployeeFormData = {
  firstName: '',
  lastName: '',
  officeEmail: '',
  personalEmail: '',
  mobileNo: '',
  dateOfBirth: '',
  salary: '',
  joiningDate: '',
  exitDate: '',
  status: 'Active',
  currentDesignation: '',
  employmentType: 'Full-time',
  stream: '',
  githubUserId: '',
  linkedinId: '',
};

const statusOptions = ['Active', 'Inactive', 'On Leave'];
const employmentTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Intern'];
const streamOptions = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Data Science',
  'DevOps',
  'Quality Assurance',
];
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
  'System Administrator',
];

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [_currentPage, _setCurrentPage] = useState(1);
  const [_itemsPerPage, _setItemsPerPage] = useState(20);
  const [_totalCount, setTotalCount] = useState(0);
  const [_searchTerm, _setSearchTerm] = useState('');
  const [_debouncedSearchTerm, _setDebouncedSearchTerm] = useState('');
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ImportEmployeeData[]>([]);
  const [isImporting, setIsImporting] = useState(false);

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
      [name]: value,
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
      firstName: employee.firstName,
      lastName: employee.lastName,
      officeEmail: employee.officeEmail,
      personalEmail: employee.personalEmail || '',
      mobileNo: employee.mobileNo,
      dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
      salary: employee.salary ? employee.salary.toString() : '',
      joiningDate: employee.joiningDate.split('T')[0], // Format date for input
      exitDate: employee.exitDate ? employee.exitDate.split('T')[0] : '',
      status: employee.status,
      currentDesignation: employee.currentDesignation,
      employmentType: employee.employmentType,
      stream: employee.stream,
      githubUserId: employee.githubUserId || '',
      linkedinId: employee.linkedinId || '',
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
      setDeletingEmployee(null);
      setToastMessage('Employee deleted successfully!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setToastMessage(null);
      }, 3000); // Hide after 3 seconds
    } catch (err) {
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
    setError(null);
    setToastMessage(null);
    setShowToast(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingEmployee(null);
    setError(null);
    setToastMessage(null);
    setShowToast(false);
  };

  // Handle Excel export
  const handleExportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = employees.map(employee => ({
        'Employee ID': employee.empId,
        'First Name': employee.firstName,
        'Last Name': employee.lastName,
        'Office Email': employee.officeEmail,
        'Personal Email': employee.personalEmail || '',
        'Mobile Number': employee.mobileNo,
        'Date of Birth': employee.dateOfBirth
          ? new Date(employee.dateOfBirth).toLocaleDateString()
          : '',
        Salary: employee.salary || '',
        Designation: employee.currentDesignation,
        'Employment Type': employee.employmentType,
        Stream: employee.stream,
        Status: employee.status,
        'Joining Date': new Date(employee.joiningDate).toLocaleDateString(),
        'Exit Date': employee.exitDate ? new Date(employee.exitDate).toLocaleDateString() : '',
        'GitHub User ID': employee.githubUserId || '',
        'LinkedIn ID': employee.linkedinId || '',
        'Created At': new Date(employee.createdAt).toLocaleDateString(),
        'Updated At': new Date(employee.updatedAt).toLocaleDateString(),
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const colWidths: Array<{ wch: number }> = [];
      const headers = Object.keys(exportData[0] || {});
      headers.forEach((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...exportData.map(row => String(row[header as keyof typeof row]).length)
        );
        colWidths[index] = { wch: Math.min(maxLength + 2, 30) }; // Cap at 30 characters
      });
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Employees');

      // Generate file name with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const fileName = `employees_export_${currentDate}.xlsx`;

      // Save the file
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, fileName);

      // Show success message
      setToastMessage('Employee data exported successfully!');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setToastMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setError('Failed to export employee data');
    }
  };

  // Handle file selection for import
  const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      handleFilePreview(file);
    }
  };

  // Preview Excel file content
  const handleFilePreview = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ImportEmployeeData[];

      setImportPreview(jsonData.slice(0, 10)); // Show only first 10 rows for preview
    } catch (error) {
      console.error('Error reading Excel file:', error);
      setError('Failed to read Excel file');
    }
  };

  // Handle import employees
  const handleImportEmployees = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setError(null);

    try {
      const data = await importFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ImportEmployeeData[];

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const [index, row] of jsonData.entries()) {
        try {
          // Validate required fields
          if (
            !row['First Name'] ||
            !row['Last Name'] ||
            !row['Office Email'] ||
            !row['Mobile Number'] ||
            !row['Joining Date'] ||
            !row['Status'] ||
            !row['Designation'] ||
            !row['Employment Type'] ||
            !row['Stream']
          ) {
            throw new Error(`Row ${index + 2}: Missing required fields`);
          }

          // Convert date format
          const joiningDate = new Date(row['Joining Date']);
          if (isNaN(joiningDate.getTime())) {
            throw new Error(`Row ${index + 2}: Invalid joining date format`);
          }

          let exitDate = null;
          if (row['Exit Date']) {
            exitDate = new Date(row['Exit Date']);
            if (isNaN(exitDate.getTime())) {
              throw new Error(`Row ${index + 2}: Invalid exit date format`);
            }
          }

          let dateOfBirth = null;
          if (row['Date of Birth']) {
            dateOfBirth = new Date(row['Date of Birth']);
            if (isNaN(dateOfBirth.getTime())) {
              throw new Error(`Row ${index + 2}: Invalid date of birth format`);
            }
          }

          // Prepare employee data
          const employeeData = {
            firstName: row['First Name'],
            lastName: row['Last Name'],
            officeEmail: row['Office Email'],
            personalEmail: row['Personal Email'] || '',
            mobileNo: row['Mobile Number'],
            dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : '',
            salary: row['Salary'] ? row['Salary'].toString() : '',
            joiningDate: joiningDate.toISOString().split('T')[0],
            exitDate: exitDate ? exitDate.toISOString().split('T')[0] : '',
            status: row['Status'],
            currentDesignation: row['Designation'],
            employmentType: row['Employment Type'],
            stream: row['Stream'],
            githubUserId: row['GitHub User ID'] || '',
            linkedinId: row['LinkedIn ID'] || '',
          };

          // Create employee via API
          const response = await fetch('/api/employees', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Row ${index + 2}: ${errorData.error || 'Failed to create employee'}`);
          }

          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(error instanceof Error ? error.message : `Row ${index + 2}: Unknown error`);
        }
      }

      // Show results
      if (successCount > 0) {
        await fetchEmployees(); // Refresh the employee list
        setToastMessage(`Successfully imported ${successCount} employees`);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setToastMessage(null);
        }, 3000);
      }

      if (errorCount > 0) {
        const errorMessage = `${errorCount} employees failed to import:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...and more' : ''}`;
        setError(errorMessage);
      }

      // Close import modal
      setIsImportModalOpen(false);
      setImportFile(null);
      setImportPreview([]);
    } catch (error) {
      console.error('Error importing employees:', error);
      setError('Failed to import employees');
    } finally {
      setIsImporting(false);
    }
  };

  // Open import modal
  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
    setImportFile(null);
    setImportPreview([]);
    setError(null);
  };

  // Close import modal
  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setImportFile(null);
    setImportPreview([]);
    setError(null);
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

  // Navigate to employee details
  const handleEmployeeIdClick = (empId: string) => {
    router.push(`/employees/${empId}`);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className='text-center p-10'>Loading employees...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4'>
          <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white'>
            Employee Management
          </h1>
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
            <button
              onClick={handleExportToExcel}
              className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md flex items-center transition-colors w-full sm:w-auto justify-center sm:justify-start order-3 sm:order-1'
            >
              <ArrowDownTrayIcon className='h-5 w-5 mr-2' />
              Export Excel
            </button>
            <button
              onClick={handleOpenImportModal}
              className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md flex items-center transition-colors w-full sm:w-auto justify-center sm:justify-start order-2 sm:order-2'
            >
              <ArrowUpTrayIcon className='h-5 w-5 mr-2' />
              Import Excel
            </button>
            <button
              onClick={handleAddEmployee}
              className='bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md flex items-center transition-colors w-full sm:w-auto justify-center sm:justify-start order-1 sm:order-3'
            >
              <PlusIcon className='h-5 w-5 mr-2' />
              Add Employee
            </button>
          </div>
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
              {employees.map(employee => (
                <div key={employee.id} className='p-4 hover:bg-gray-50 dark:hover:bg-gray-700'>
                  <div className='flex justify-between items-start mb-3'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <button
                        onClick={() => handleEmployeeIdClick(employee.empId)}
                        className='text-sm text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:underline'
                        title='Click to view employee details'
                      >
                        {employee.empId}
                      </button>
                    </div>
                    <div className='flex space-x-2 flex-shrink-0'>
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className='p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md'
                      >
                        <PencilIcon className='h-5 w-5' />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(employee)}
                        className='p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md'
                      >
                        <TrashIcon className='h-5 w-5' />
                      </button>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
                    <div>
                      <span className='font-medium text-gray-500 dark:text-gray-400'>
                        Office Email:
                      </span>
                      <p className='text-gray-900 dark:text-white break-all'>
                        {employee.officeEmail}
                      </p>
                    </div>
                    <div>
                      <span className='font-medium text-gray-500 dark:text-gray-400'>Mobile:</span>
                      <p className='text-gray-900 dark:text-white'>{employee.mobileNo}</p>
                    </div>
                    <div>
                      <span className='font-medium text-gray-500 dark:text-gray-400'>
                        Designation:
                      </span>
                      <p className='text-gray-900 dark:text-white'>{employee.currentDesignation}</p>
                    </div>
                    <div>
                      <span className='font-medium text-gray-500 dark:text-gray-400'>Stream:</span>
                      <p className='text-gray-900 dark:text-white'>{employee.stream}</p>
                    </div>
                    <div>
                      <span className='font-medium text-gray-500 dark:text-gray-400'>
                        Employment Type:
                      </span>
                      <p className='text-gray-900 dark:text-white'>{employee.employmentType}</p>
                    </div>
                    <div>
                      <span className='font-medium text-gray-500 dark:text-gray-400'>
                        Joining Date:
                      </span>
                      <p className='text-gray-900 dark:text-white'>
                        {new Date(employee.joiningDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className='mt-3'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(employee.status)}`}
                    >
                      {employee.status}
                    </span>
                  </div>
                </div>
              ))}
              {employees.length === 0 && (
                <div className='p-8 text-center text-sm text-gray-500 dark:text-gray-300'>
                  No employees found.
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
                    Employee ID
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Name
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Office Email
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Mobile No
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Designation
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Stream
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {employees.map(employee => (
                  <tr key={employee.id} className='hover:bg-gray-50 dark:hover:bg-gray-700'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                      <button
                        onClick={() => handleEmployeeIdClick(employee.empId)}
                        className='underline text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300'
                        title='Click to view employee details'
                      >
                        {employee.empId}
                      </button>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                      {employee.firstName} {employee.lastName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {employee.officeEmail}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {employee.mobileNo}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {employee.currentDesignation}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {employee.stream}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(employee.status)}`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <div className='flex space-x-2'>
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                        >
                          <PencilIcon className='h-5 w-5' />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(employee)}
                          className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                        >
                          <TrashIcon className='h-5 w-5' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className='px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300'
                    >
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
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
            <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h3>
                <button
                  onClick={closeModal}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                >
                  <XMarkIcon className='h-6 w-6' />
                </button>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      First Name *
                    </label>
                    <input
                      type='text'
                      name='firstName'
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                      placeholder='John'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Last Name *
                    </label>
                    <input
                      type='text'
                      name='lastName'
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                      placeholder='Doe'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Office Email *
                  </label>
                  <input
                    type='email'
                    name='officeEmail'
                    value={formData.officeEmail}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder='john.doe@company.com'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Personal Email
                  </label>
                  <input
                    type='email'
                    name='personalEmail'
                    value={formData.personalEmail}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder='john.doe@gmail.com'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Mobile Number *
                  </label>
                  <input
                    type='tel'
                    name='mobileNo'
                    value={formData.mobileNo}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    placeholder='+91-9876543210'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Date of Birth
                    </label>
                    <input
                      type='date'
                      name='dateOfBirth'
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Salary
                    </label>
                    <input
                      type='number'
                      name='salary'
                      value={formData.salary}
                      onChange={handleInputChange}
                      min='0'
                      step='0.01'
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                      placeholder='50000'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Current Designation *
                    </label>
                    <select
                      name='currentDesignation'
                      value={formData.currentDesignation}
                      onChange={handleInputChange}
                      required
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    >
                      <option value=''>Select Designation</option>
                      {designationOptions.map(designation => (
                        <option key={designation} value={designation}>
                          {designation}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Employment Type *
                    </label>
                    <select
                      name='employmentType'
                      value={formData.employmentType}
                      onChange={handleInputChange}
                      required
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    >
                      {employmentTypeOptions.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Stream *
                  </label>
                  <select
                    name='stream'
                    value={formData.stream}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  >
                    <option value=''>Select Stream</option>
                    {streamOptions.map(stream => (
                      <option key={stream} value={stream}>
                        {stream}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Joining Date *
                    </label>
                    <input
                      type='date'
                      name='joiningDate'
                      value={formData.joiningDate}
                      onChange={handleInputChange}
                      required
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Exit Date
                    </label>
                    <input
                      type='date'
                      name='exitDate'
                      value={formData.exitDate}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Status *
                  </label>
                  <select
                    name='status'
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      GitHub User ID
                    </label>
                    <input
                      type='text'
                      name='githubUserId'
                      value={formData.githubUserId}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                      placeholder='johndoe'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      LinkedIn ID
                    </label>
                    <input
                      type='text'
                      name='linkedinId'
                      value={formData.linkedinId}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                      placeholder='john-doe-123456'
                    />
                  </div>
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
                    {isSubmitting ? 'Saving...' : editingEmployee ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && deletingEmployee && (
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
                  Are you sure you want to delete employee{' '}
                  <strong>
                    {deletingEmployee.firstName} {deletingEmployee.lastName}
                  </strong>
                  ? This action cannot be undone.
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
                  onClick={handleDeleteEmployee}
                  disabled={isSubmitting}
                  className='px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {isImportModalOpen && (
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
            <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                  Import Employees from Excel
                </h3>
                <button
                  onClick={handleCloseImportModal}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                >
                  <XMarkIcon className='h-6 w-6' />
                </button>
              </div>

              <div className='mb-4'>
                <p className='text-sm text-gray-600 dark:text-gray-300'>
                  Upload an Excel file to import employees. Please ensure the file is in the correct
                  format.
                </p>
              </div>

              <div className='mb-4'>
                <input
                  type='file'
                  accept='.xlsx, .xls'
                  onChange={handleImportFileSelect}
                  className='w-full text-sm file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                />
              </div>

              {importPreview.length > 0 && (
                <div className='mb-4'>
                  <h4 className='text-md font-medium text-gray-900 dark:text-white mb-2'>
                    Import Preview
                  </h4>
                  <div className='bg-gray-100 dark:bg-gray-700 rounded-md p-3 max-h-60 overflow-auto'>
                    <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                      <thead className='bg-gray-50 dark:bg-gray-700'>
                        <tr>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                            First Name
                          </th>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                            Last Name
                          </th>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                            Office Email
                          </th>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                            Mobile Number
                          </th>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                            Date of Birth
                          </th>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                            Salary
                          </th>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                            Designation
                          </th>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                            Employment Type
                          </th>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                            Stream
                          </th>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                        {importPreview.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                              {row['First Name']}
                            </td>
                            <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                              {row['Last Name']}
                            </td>
                            <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                              {row['Office Email']}
                            </td>
                            <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                              {row['Mobile Number']}
                            </td>
                            <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                              {row['Date of Birth'] || 'N/A'}
                            </td>
                            <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                              {row['Salary'] || 'N/A'}
                            </td>
                            <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                              {row['Designation']}
                            </td>
                            <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                              {row['Employment Type']}
                            </td>
                            <td className='px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                              {row['Stream']}
                            </td>
                            <td className='px-4 py-2 whitespace-nowrap'>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(row['Status'])}`}
                              >
                                {row['Status']}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className='flex justify-end space-x-3'>
                <button
                  onClick={handleCloseImportModal}
                  className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md'
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportEmployees}
                  disabled={isImporting}
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isImporting ? 'Importing...' : 'Import Employees'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
