// Attendance-related type definitions

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'HOLIDAY' | 'WEEKEND';
  isRegularized: boolean;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRegularization {
  id: string;
  attendanceId: string;
  employeeId: string;
  date: string; // Fixed: was incorrectly named appliedDate
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
  // Related data that might be included from API
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  attendance?: {
    id: string;
    checkIn?: string;
    checkOut?: string;
    status: string;
  };
}

export interface AttendanceFormData {
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'HOLIDAY' | 'WEEKEND';
  remarks?: string;
}
