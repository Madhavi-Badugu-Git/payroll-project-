// Leave management type definitions

export interface LeaveApplication {
  id: string;
  employeeId: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveType: string;
  allocated: number;
  used: number;
  balance: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveAccumulation {
  id: string;
  employeeId: string;
  leaveType: string;
  accumulatedDays: number;
  accumulationDate: string;
  reason: string;
  createdAt: string;
}

export interface LeaveTransaction {
  id: string;
  employeeId: string;
  leaveType: string;
  transactionType: 'CREDIT' | 'DEBIT' | 'CARRY_FORWARD';
  days: number;
  description: string;
  referenceId?: string;
  transactionDate: string;
  createdAt: string;
}

export interface LeavePolicy {
  id: string;
  leaveType: string;
  description: string;
  maxDaysPerYear: number;
  canCarryForward: boolean;
  maxCarryForwardDays?: number;
  minDaysNotice: number;
  maxConsecutiveDays?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveFormData {
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

// Dashboard-specific leave interfaces
export interface LeaveEntry {
  id: string;
  employeeId: string;
  leaveType: 'Sick' | 'Casual' | 'Earned';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'Cancelled';
  appliedAt?: string; // ISO String from backend
  createdAt?: string; // ISO String
  // Calculated fields for display
  noOfDays: number;
  appliedDate: string; // YYYY-MM-DD from appliedAt
}

export interface LeaveSummary {
  totalSanctioned: number;
  totalUsed: number;
  totalAvailable: number;
  pending: number;
  approved: number;
  rejected: number;
  recentLeaves: LeaveEntry[];
}
