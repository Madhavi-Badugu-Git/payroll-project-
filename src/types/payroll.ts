// Payroll and payslip type definitions

export interface Payslip {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
  taxDeducted: number;
  pfContribution?: number;
  esiContribution?: number;
  bonuses?: number;
  overtime?: number;
  loanDeductions?: number;
  advanceDeductions?: number;
  status: 'DRAFT' | 'GENERATED' | 'SENT' | 'ACKNOWLEDGED';
  generatedDate: string;
  sentDate?: string;
  acknowledgedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayslipFormData {
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  taxDeducted: number;
  pfContribution?: number;
  esiContribution?: number;
  bonuses?: number;
  overtime?: number;
  loanDeductions?: number;
  advanceDeductions?: number;
}

export interface SalaryComponent {
  name: string;
  type: 'EARNING' | 'DEDUCTION';
  amount: number;
  percentage?: number;
  isFixed: boolean;
}

// Detailed payslip interface used in payslip page
export interface DetailedPayslip {
  id: string;
  employeeId: string;
  employeeName: string;
  payslipForMonth: string; // e.g., "May"
  payslipDate: string; // e.g., "01/06/2025"
  location: string;
  department: string;
  designation: string;
  doj: string; // Date of Joining e.g., "24/03/2025"
  gradeBand: string;
  attendedDays: number;
  arrearDays: number;
  daysInMonth: number; // No of days per month
  // Earnings
  basic: number;
  hra: number;
  specialAllowance: number;
  lta: number;
  // Calculated total salary
  totalSalary: number;
  // For internal use, not directly on payslip image but good to have
  year: number;
  // Deductions (can be added later if needed based on a more complex model)
  providentFund?: number;
  professionalTax?: number;
  incomeTax?: number;
  netSalary?: number; // This would be totalSalary - deductions
}

export interface PayslipsResponse {
  payslips: DetailedPayslip[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
