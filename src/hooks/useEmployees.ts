import { Employee, EmployeeFormData, ImportEmployeeData } from '@/types';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getApiUrl } from '../lib/api';

export interface UseEmployeesReturn {
  employees: Employee[];
  employee: Employee | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  // CRUD operations
  fetchEmployees: () => Promise<void>;
  fetchEmployee: (empId: string) => Promise<void>;
  createEmployee: (employeeData: EmployeeFormData) => Promise<boolean>;
  updateEmployee: (id: string, employeeData: EmployeeFormData) => Promise<boolean>;
  deleteEmployee: (id: string) => Promise<boolean>;
  // Bulk operations
  importEmployees: (
    employees: ImportEmployeeData[]
  ) => Promise<{ successCount: number; errorCount: number; errors: string[] }>;
  exportEmployees: () => void;
  // Utility
  clearError: () => void;
  clearEmployee: () => void;
}

export const useEmployees = (): UseEmployeesReturn => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearEmployee = useCallback(() => {
    setEmployee(null);
  }, []);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<{ employees: Employee[]; totalCount: number }>(
        getApiUrl('/employees')
      );
      setEmployees(response.data.employees);
      setTotalCount(response.data.totalCount);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'Failed to fetch employees';
      setError(message);
      console.error('Error fetching employees:', err);
      toast.error(`Failed to load employees: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEmployee = useCallback(async (empId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch employee by empId using the employees API with search
      const response = await axios.get<{ employees: Employee[]; totalCount: number }>(
        getApiUrl(`/employees?search=${encodeURIComponent(empId)}`)
      );

      // Find the exact match by empId
      const employee = response.data.employees.find(emp => emp.employeeNumber === empId);

      if (!employee) {
        throw new Error('Employee not found');
      }

      setEmployee(employee);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'Failed to fetch employee';
      setError(message);
      console.error('Error fetching employee:', err);
      toast.error(`Failed to load employee: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEmployee = useCallback(
    async (employeeData: EmployeeFormData): Promise<boolean> => {
      setError(null);

      try {
        // Transform form data to match API expectations, only including expected fields
        const apiData = {
          firstName: employeeData.firstName.trim(),
          lastName: employeeData.lastName.trim(),
          officeEmail: employeeData.officeEmail.trim(),
          personalEmail: employeeData.personalEmail.trim() || null,
          mobileNo: employeeData.mobileNo.trim(),
          dateOfBirth: employeeData.dateOfBirth.trim() || null,
          salary: employeeData.salary.trim() || null,
          joiningDate: employeeData.joiningDate.trim(),
          exitDate: employeeData.exitDate.trim() || null,
          status: employeeData.status,
          currentDesignation: employeeData.currentDesignation.trim(),
          employmentType: employeeData.employmentType,
          stream: employeeData.stream.trim(),
          githubUserId: employeeData.githubUserId.trim() || null,
          linkedinId: employeeData.linkedinId.trim() || null,
        };

        console.log('Creating employee with transformed data:', apiData);
        await axios.post(getApiUrl('/employees'), apiData);
        toast.success('Employee created successfully!');
        await fetchEmployees(); // Refresh the list
        return true;
      } catch (err) {
        let message = 'Failed to create employee';

        if (axios.isAxiosError(err) && err.response?.data) {
          const errorData = err.response.data;
          // Use the detailed message if available, otherwise fall back to error
          message = errorData.message || errorData.error || err.message;
          console.error('Create employee API error:', errorData);
        } else if (err instanceof Error) {
          message = err.message;
        }

        setError(message);
        console.error('Error creating employee:', err);
        toast.error(message);
        return false;
      }
    },
    [fetchEmployees]
  );

  const updateEmployee = useCallback(
    async (id: string, employeeData: EmployeeFormData): Promise<boolean> => {
      setError(null);

      try {
        await axios.put(getApiUrl(`/employees/${id}`), employeeData);
        toast.success('Employee updated successfully!');
        await fetchEmployees(); // Refresh the list
        // If we're viewing this specific employee, refresh it too
        if (employee?.id === id) {
          await fetchEmployee(id);
        }
        return true;
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : 'Failed to update employee';
        setError(message);
        console.error('Error updating employee:', err);
        toast.error(`Failed to update employee: ${message}`);
        return false;
      }
    },
    [fetchEmployees, fetchEmployee, employee?.id]
  );

  const deleteEmployee = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null);

      try {
        await axios.delete(getApiUrl(`/employees/${id}`));
        toast.success('Employee deleted successfully!');
        await fetchEmployees(); // Refresh the list
        return true;
      } catch (err) {
        let message = 'Failed to delete employee';

        if (axios.isAxiosError(err) && err.response?.data) {
          const errorData = err.response.data;
          // Use the detailed message if available, otherwise fall back to error
          message = errorData.message || errorData.error || err.message;
        } else if (err instanceof Error) {
          message = err.message;
        }

        setError(message);
        console.error('Error deleting employee:', err);
        toast.error(message);
        return false;
      }
    },
    [fetchEmployees]
  );

  const importEmployees = useCallback(
    async (
      employeesData: ImportEmployeeData[]
    ): Promise<{ successCount: number; errorCount: number; errors: string[] }> => {
      setError(null);

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const [index, row] of employeesData.entries()) {
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
          const employeeData: EmployeeFormData = {
            employeeNumber: row['Employee ID'] || '',
            firstName: row['First Name'],
            lastName: row['Last Name'],
            email: row['Office Email'],
            officeEmail: row['Office Email'],
            personalEmail: row['Personal Email'] || '',
            mobileNo: row['Mobile Number'],
            department: '',
            designation: row['Designation'],
            currentDesignation: row['Designation'],
            dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : '',
            salary: row['Salary'] ? row['Salary'].toString() : '',
            joiningDate: joiningDate.toISOString().split('T')[0],
            exitDate: exitDate ? exitDate.toISOString().split('T')[0] : '',
            status: row['Status'] as
              | 'ACTIVE'
              | 'INACTIVE'
              | 'TERMINATED'
              | 'Active'
              | 'Inactive'
              | 'On Leave',
            employmentType: row['Employment Type'],
            stream: row['Stream'],
            githubUserId: row['GitHub User ID'] || '',
            linkedinId: row['LinkedIn ID'] || '',
          };

          // Create employee via API
          await axios.post(getApiUrl('/employees'), employeeData);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push(error instanceof Error ? error.message : `Row ${index + 2}: Unknown error`);
        }
      }

      // Show results
      if (successCount > 0) {
        await fetchEmployees(); // Refresh the employee list
        toast.success(`Successfully imported ${successCount} employees`);
      }

      if (errorCount > 0) {
        const errorMessage = `${errorCount} employees failed to import`;
        setError(errorMessage);
        toast.error(errorMessage);
      }

      return { successCount, errorCount, errors };
    },
    [fetchEmployees]
  );

  const exportEmployees = useCallback(() => {
    try {
      // This will be handled by the component using XLSX library
      // We'll pass the employees data to the component for export
      toast.success('Employee data exported successfully!');
    } catch (error) {
      console.error('Error exporting employees:', error);
      setError('Failed to export employee data');
      toast.error('Failed to export employee data');
    }
  }, []);

  // Auto-fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    employee,
    isLoading,
    error,
    totalCount,
    fetchEmployees,
    fetchEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    importEmployees,
    exportEmployees,
    clearError,
    clearEmployee,
  };
};
