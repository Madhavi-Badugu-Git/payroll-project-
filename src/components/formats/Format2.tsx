'use client';
import React from 'react';
import Image from 'next/image';

const Payslip: React.FC = () => {
  return (
    <div className='max-w-4xl mx-auto p-6 border-2 border-gray rounded-lg shadow-lg bg-white'>
      {/* Header */}
      <div className='flex justify-between items-center border-b-2 border-gray pb-4 mb-4'>
        <div>
          <Image
            src='/payroll/imglogo.png'
            alt='TriNitS Technologies Logo'
            width={120}
            height={60}
            unoptimized
            style={{
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h2 className='text-lg font-bold text-red-600'>TriNitS Technologies</h2>
          <p className='text-sm'>
            Naidupeta 0, Nellore 0,
            <br />
            Andhra Pradesh, 524421
          </p>
        </div>
      </div>

      {/* Title */}
      <h3 className='text-center font-bold text-lg mb-4'>
        PAY SLIP <br />
        <span className='text-sm font-normal'>FOR THE MONTH OF November 2022</span>
      </h3>

      {/* Employee Info */}
      <table className='w-full border-2 border-black border-collapse mb-6 text-sm'>
        <tbody>
          <tr>
            <td className='border-2 border-black p-2 font-semibold bg-gray-100'>Emp Code</td>
            <td className='border-2 border-black p-2'>TRINITS-1</td>
            <td className='border-2 border-black p-2 font-semibold bg-gray-100'>Name</td>
            <td className='border-2 border-black p-2'>TriNitS0</td>
          </tr>
          <tr>
            <td className='border-2 border-black p-2 font-semibold bg-gray-100'>Date of Joining</td>
            <td className='border-2 border-black p-2'>2025-05-07</td>
            <td className='border-2 border-black p-2 font-semibold bg-gray-100'>Designation</td>
            <td className='border-2 border-black p-2'>Software Engineer</td>
          </tr>
          <tr>
            <td className='border-2 border-black p-2 font-semibold bg-gray-100'>Bank Name</td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2 font-semibold bg-gray-100'>Bank A/c No</td>
            <td className='border-2 border-black p-2'>50202238836</td>
          </tr>
          <tr>
            <td className='border-2 border-black p-2 font-semibold bg-gray-100'>LOP Credit Days</td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2 font-semibold bg-gray-100'>LOP Debit Days</td>
            <td className='border-2 border-black p-2'></td>
          </tr>
          <tr>
            <td className='border-2 border-black p-2 font-semibold bg-gray-100'>PF Number</td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2' colSpan={2}></td>
          </tr>
        </tbody>
      </table>

      {/* Earnings & Deductions */}
      <table className='w-full border-2 border-black border-collapse text-sm mb-6'>
        <thead className='bg-gray-100'>
          <tr>
            <th className='border-2 border-black p-2'>Earnings</th>
            <th className='border-2 border-black p-2'>Amount (Rs)</th>
            <th className='border-2 border-black p-2'>Cumulative (Rs)</th>
            <th className='border-2 border-black p-2'>Deductions</th>
            <th className='border-2 border-black p-2'>Amount (Rs)</th>
            <th className='border-2 border-black p-2'>Cumulative (Rs)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className='border-2 border-black p-2'>Basic</td>
            <td className='border-2 border-black p-2'>11613</td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'>Provident Fund</td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
          </tr>
          <tr>
            <td className='border-2 border-black p-2'>House Rent Allowance</td>
            <td className='border-2 border-black p-2'>4645</td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'>Tax Deducted at Source</td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
          </tr>
          <tr>
            <td className='border-2 border-black p-2'>Conveyance Allowance</td>
            <td className='border-2 border-black p-2'>1161</td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
          </tr>
          <tr>
            <td className='border-2 border-black p-2'>Medical Reimbursement</td>
            <td className='border-2 border-black p-2'>871</td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
          </tr>
          <tr>
            <td className='border-2 border-black p-2'>Professional Development Allowance</td>
            <td className='border-2 border-black p-2'>200</td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
          </tr>
          <tr>
            <td className='border-2 border-black p-2'>Professional Attire Allowance</td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
          </tr>
          <tr>
            <td className='border-2 border-black p-2'>Leave Travel Allowance</td>
            <td className='border-2 border-black p-2'>1742</td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'></td>
          </tr>
          <tr className='font-bold bg-gray-100'>
            <td className='border-2 border-black p-2'>Gross Total</td>
            <td className='border-2 border-black p-2'>29032</td>
            <td className='border-2 border-black p-2'></td>
            <td className='border-2 border-black p-2'>Total Deductions</td>
            <td className='border-2 border-black p-2'>200</td>
            <td className='border-2 border-black p-2'></td>
          </tr>
          <tr>
            <td className='border-2 border-black p-2 font-semibold' colSpan={6}>
              Net Pay: Rs. 28832
            </td>
          </tr>
          <tr>
            <td className='border-2 border-black p-2 font-semibold' colSpan={6}>
              In Words: Rupees ....Only.
            </td>
          </tr>
          <tr>
            <td className='border-2 border-black p-2 font-semibold' colSpan={6}>
              Remarks:
            </td>
          </tr>
        </tbody>
      </table>

      {/* Remarks */}
      <p className='text-xs block font-semibold'>
        This is a computer-generated pay slip. Signature is not required. Your salary is strictly
        confidential and you are expected to maintain its confidentiality. Company reserves the
        right to take disciplinary action in case of breach of confidence. 01-November-2022.
      </p>
    </div>
  );
};

export default Payslip;
