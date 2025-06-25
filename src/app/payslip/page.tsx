'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../AppLayout';
import initialPayslipsData from './payslips-data.json';
import jsPDF from 'jspdf';
import { useUser } from '@clerk/nextjs'; // Import useUser

interface Payslip {
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
  // providentFund?: number;
  // professionalTax?: number;
  // incomeTax?: number;
  // netSalary: number; // This would be totalSalary - deductions
}

const formatCurrencyFixed = (amount: number) => {
  return amount.toFixed(0); // Simple formatting to whole numbers as in image
};

const generatePayslipPDF = (payslip: Payslip) => {
  const doc = new jsPDF();
  const marL = 15; // Left margin
  const marR = doc.internal.pageSize.getWidth() - 15; // Right margin
  const midPoint = doc.internal.pageSize.getWidth() / 2;

  // Header
  doc.setFillColor(255, 204, 0); // Yellow background for header
  doc.rect(0, 5, doc.internal.pageSize.getWidth(), 10, 'F');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0); // Black text
  doc.text('Trinits Technologies payslip', midPoint, 12, { align: 'center' });

  // Employee Details Section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let yPos = 25;

  const detailStartY = yPos;
  const col1X = marL;
  const col1ValX = marL + 50; // Increased from marL + 35
  const col2X = midPoint - 10;
  const col2ValX = midPoint + 20;
  const rowHeight = 6;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.text('Payslip for', col1X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(payslip.payslipForMonth, col1ValX, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', col2X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(payslip.payslipDate, col2ValX, yPos);
  yPos += rowHeight;

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.text('Name', col1X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(payslip.employeeName, col1ValX, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text('Designation', col2X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(payslip.designation, col2ValX, yPos);
  yPos += rowHeight;

  // Row 3
  doc.setFont('helvetica', 'bold');
  doc.text('Location', col1X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(payslip.location, col1ValX, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text('Department', col2X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(payslip.department, col2ValX, yPos);
  yPos += rowHeight;

  // Row 4
  doc.setFont('helvetica', 'bold');
  doc.text('DOJ', col1X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(payslip.doj, col1ValX, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text('Grade/Band', col2X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(payslip.gradeBand, col2ValX, yPos);
  yPos += rowHeight;

  // Row 5
  doc.setFont('helvetica', 'bold');
  doc.text('Attended days', col1X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(String(payslip.attendedDays), col1ValX, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text('Arrear days', col2X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(String(payslip.arrearDays), col2ValX, yPos);
  yPos += rowHeight;

  // Row 6
  doc.setFont('helvetica', 'bold');
  doc.text('No of days per month', col1X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(String(payslip.daysInMonth), col1ValX, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text('Total days', col2X, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(String(payslip.daysInMonth), col2ValX, yPos); // Assuming total days is same as days in month for this format
  yPos += rowHeight;

  // Draw border around employee details
  doc.rect(
    marL - 2,
    detailStartY - rowHeight + 2,
    marR - marL + 4,
    yPos - detailStartY + rowHeight - 4
  );

  // Earnings Section Header
  yPos += 5; // Space before earnings table
  const earningsHeaderY = yPos;
  doc.setFillColor(255, 204, 0); // Yellow background
  doc.rect(marL - 2, earningsHeaderY, marR - marL + 4, rowHeight + 1, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Sr. No', marL + 5, earningsHeaderY + rowHeight - 1);
  doc.text('Particular', marL + 30, earningsHeaderY + rowHeight - 1);
  doc.text('Monthly', midPoint + 25, earningsHeaderY + rowHeight - 1, { align: 'right' });
  doc.text('Actual monthly valule', marR - 5, earningsHeaderY + rowHeight - 1, { align: 'right' });
  yPos += rowHeight + 1;

  // Earnings Data
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const earnings = [
    { sr: 1, particular: 'Basic', monthly: payslip.basic, actual: payslip.basic },
    { sr: 2, particular: 'HRA', monthly: payslip.hra, actual: payslip.hra },
    {
      sr: 3,
      particular: 'Special Allowance',
      monthly: payslip.specialAllowance,
      actual: payslip.specialAllowance,
    },
    { sr: 4, particular: 'LTA', monthly: payslip.lta, actual: payslip.lta },
  ];

  const earningsStartY = yPos;
  earnings.forEach(item => {
    doc.text(String(item.sr), marL + 5, yPos + rowHeight - 2);
    doc.text(item.particular, marL + 30, yPos + rowHeight - 2);
    doc.text(formatCurrencyFixed(item.monthly), midPoint + 25, yPos + rowHeight - 2, {
      align: 'right',
    });
    doc.text(formatCurrencyFixed(item.actual), marR - 5, yPos + rowHeight - 2, { align: 'right' });
    yPos += rowHeight;
  });
  // Draw border for earnings items
  doc.rect(marL - 2, earningsStartY, marR - marL + 4, yPos - earningsStartY);
  // Draw vertical lines for earnings table
  doc.line(marL + 25, earningsHeaderY, marL + 25, yPos); // After Sr. No
  doc.line(midPoint + 10, earningsHeaderY, midPoint + 10, yPos); // After Particular
  doc.line(midPoint + 40, earningsHeaderY, midPoint + 40, yPos); // After Monthly

  // Total Salary Section
  const totalSalaryY = yPos;
  doc.setFillColor(255, 204, 0); // Yellow background
  doc.rect(marL - 2, totalSalaryY, marR - marL + 4, rowHeight + 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Total salary', marL + 30, totalSalaryY + rowHeight - 1);
  doc.text(formatCurrencyFixed(payslip.totalSalary), midPoint + 25, totalSalaryY + rowHeight - 1, {
    align: 'right',
  });
  doc.text(formatCurrencyFixed(payslip.totalSalary), marR - 5, totalSalaryY + rowHeight - 1, {
    align: 'right',
  });
  yPos += rowHeight + 1;

  doc.save(
    `Payslip_${payslip.employeeName.replace(/ /g, '_')}_${payslip.payslipForMonth}_${payslip.year}.pdf`
  );
};

export default function PayslipsPage() {
  const [allPayslips, setAllPayslips] = useState<Payslip[]>([]);
  const [userPayslips, setUserPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser(); // Get the logged-in user

  useEffect(() => {
    // Simulate fetching data
    const payslipsData = initialPayslipsData as Payslip[];
    setAllPayslips(payslipsData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user && allPayslips.length > 0) {
      // Filter payslips for the logged-in user
      // Assuming employeeId 'EMP001' is for the primary test user (e.g., John Doe)
      // and 'EMP002' for another.
      // In a real app, you'd match user.id with payslip.employeeId
      // For this example, let's filter by a known employeeId if user.fullName matches,
      // or default to 'EMP001' if no direct match for simplicity with mock data.
      let loggedInUserEmployeeId = 'EMP001'; // Default for testing
      if (user.fullName === 'Jane Smith') {
        loggedInUserEmployeeId = 'EMP002';
      } else if (user.fullName === 'John Doe') {
        // Or whatever the primary test user's name is
        loggedInUserEmployeeId = 'EMP001';
      }
      // Add more sophisticated mapping if needed, or directly use user.id if it's stored as employeeId

      const filteredPayslips = allPayslips.filter(
        payslip => payslip.employeeId === loggedInUserEmployeeId
      );
      setUserPayslips(filteredPayslips);
    } else if (!user && allPayslips.length > 0) {
      // Handle case where user is not logged in but data is loaded (e.g., show no payslips or a message)
      setUserPayslips([]);
    }
  }, [user, allPayslips]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className='text-center p-10'>Loading payslips...</div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className='text-center p-10'>Please log in to view your payslips.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className='w-full max-w-4xl mx-auto p-4 md:p-6'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-8'>
          My Payslips
        </h1>

        {userPayslips.length === 0 && !isLoading && (
          <div className='text-center p-10 bg-white dark:bg-gray-800 shadow-md rounded-lg'>
            <p className='text-gray-600 dark:text-gray-300'>No payslips found for your account.</p>
          </div>
        )}

        {userPayslips.length > 0 && (
          <div className='bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-gray-50 dark:bg-gray-700'>
                <tr>
                  {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th> */}
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                  >
                    Month/Year
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                  >
                    Total Salary
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                  >
                    Payslip Date
                  </th>
                  <th
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                  >
                    Download
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {userPayslips.map(payslip => (
                  <tr key={payslip.id}>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{payslip.employeeName}</td> */}
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {payslip.payslipForMonth}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {formatCurrencyFixed(payslip.totalSalary)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300'>
                      {payslip.payslipDate}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button
                        onClick={() => generatePayslipPDF(payslip)}
                        className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300'
                      >
                        Generate & Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
