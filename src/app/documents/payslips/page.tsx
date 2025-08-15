'use client';

import { usePayslips } from '@/hooks/usePayslips';
import { DetailedPayslip } from '@/types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import { useSession } from 'next-auth/react'; // Import useSession
import Link from 'next/link';
import { useEffect } from 'react';
import Loader from '../../../components/Loader';
import AppLayout from '../../AppLayout';


// Force dynamic rendering to avoid build issues
export const dynamic = 'force-dynamic';

const formatCurrencyFixed = (amount: number) => {
  return amount.toFixed(0); // Simple formatting to whole numbers as in image
};

const generatePayslipPDF = (payslip: DetailedPayslip) => {
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
  const { data: session } = useSession(); // Get the logged-in user
  const { payslips: userPayslips, isLoading, error, fetchPayslips } = usePayslips();
  const user = session?.user;

  // Function to get employee ID from user
  const getUserEmployeeId = (user: { employee?: { id: string } | null }): string | null => {
    return user?.employee?.id || null;
  };

  useEffect(() => {
    if (user) {
      const employeeId = getUserEmployeeId(user);
      if (employeeId) {
        fetchPayslips(employeeId);
      } else {
        // If no employee ID found, still fetch but it will return empty
        fetchPayslips();
      }
    }
  }, [user, fetchPayslips]);

  if (isLoading) {
    return (
      <AppLayout>
        <Loader overlay={true} message='Loading, please wait...' size='large' />
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className='text-center p-10 bg-white dark:bg-gray-800 shadow-md rounded-lg'>
          <Loader overlay={true} message='Loading, please wait...' size='large' color='primary' />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className='text-center p-10 bg-white dark:bg-gray-800 shadow-md rounded-lg'>
          <p className='text-red-600 dark:text-red-400 mb-4'>{error}</p>
          <button
            onClick={() => {
              const employeeId = getUserEmployeeId(user);
              fetchPayslips(employeeId || undefined);
            }}
            className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors'
          >
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className='w-full mt-1'>
        <div className='mb-8'>
          <div className='flex mb-4'>
            <Link
              href='/documents'
              className='inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4'
            >
              <ArrowLeftIcon className='w-5 h-5 mr-2' />
              Back to Documents
            </Link>
          </div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>Payslips</h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Monthly salary slips and payment records
          </p>
        </div>
        {/* Payslip Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 my-6">
          {(() => {
            const today = new Date();

            // Generate dates for past 3 months
            const months = [];
            for (let i = 3; i >= 1; i--) {
              const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
              months.push({
                month: date.toLocaleString('default', { month: 'long' }),
                year: date.getFullYear()
              });
            }

            // Fixed amounts in correct order
            const amounts = ['$174,000', '$243,000', '$223,000'];

            return months.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md text-center border hover:shadow-lg transition"
              >
                <h2 className="text-xl font-semibold">{item.month} {item.year}</h2>
                <p className="text-gray-500 text-sm">Most yont</p>
                <p className="text-2xl font-bold text-block-600">{amounts[index]}</p>
                <p className="text-gray-500 text-sm">Net Pay</p>
                {/* <img
                  src="/icons/payslip.png"
                  alt="Payslip Icon"
                  className="w-20 h-20 mx-auto my-3"
                /> */}
                <Link href="/pdf">
                  <button className="bg-blue-600 text-white px-4 py-3  mt-6 rounded hover:bg-blue-700">
                    View
                  </button>
                </Link>
              </div>
            ));
          })()}
        </div>

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
