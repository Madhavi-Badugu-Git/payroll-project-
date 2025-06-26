// Employee-related type definitions

export interface Employee {
  id: string;
  empId: string;
  firstName: string;
  lastName: string;
  email: string;
  officeEmail: string;
  personalEmail: string | null;
  phone?: string;
  mobileNo: string;
  department: string;
  designation: string;
  currentDesignation: string;
  joiningDate: string;
  exitDate: string | null;
  dateOfBirth: string | null;
  salary: number | null;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'Active' | 'Inactive' | 'On Leave';
  employmentType: string;
  stream: string;
  githubUserId: string | null;
  linkedinId: string | null;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormData {
  empId: string;
  firstName: string;
  lastName: string;
  email: string;
  officeEmail: string;
  personalEmail: string;
  phone?: string;
  mobileNo: string;
  department: string;
  designation: string;
  currentDesignation: string;
  joiningDate: string;
  exitDate: string;
  dateOfBirth: string;
  salary: string; // String for form input, converted to number
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'Active' | 'Inactive' | 'On Leave';
  employmentType: string;
  stream: string;
  githubUserId: string;
  linkedinId: string;
}

export interface EmployeePromotion {
  id: string;
  employeeId: string;
  fromDesignation: string;
  toDesignation: string;
  fromDepartment: string;
  toDepartment: string;
  fromSalary?: number;
  toSalary?: number;
  effectiveDate: string;
  reason?: string;
  approvedBy?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

// Promotion interface used in employee details page
export interface Promotion {
  id: string;
  empId: string;
  salary: number;
  revisionDate: string;
  currentPosition: string;
  previousPosition: string;
  createdAt: string;
  updatedAt: string;
}

// Import employee data structure for bulk import
export interface ImportEmployeeData {
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
