'use client';

import Image from 'next/image';

export default function Payslip() {
  return (
    <div className='p-4 bg-gray-100  w-[900px] flex justify-center'>
      <div className='bg-white p-4  border border-gray-300'>
        {/* Header */}
        <div className='flex justify-between border border-gray-400 p-2'>
          <div className='flex items-center gap-2'>
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
          <div className='text-right'>
            <h2 className='font-bold text-red-600'>TriNitS Technologies 0</h2>
            <p className='text-sm'>Naidupeta 0, Nellore 0, Andhra Pradesh, 524421.</p>
            <p className='text-blue-600 text-sm'>Pay Slip for the month of 2025-08-04</p>
          </div>
        </div>

        {/* Employee Info */}
        <table className='w-full border border-gray-400 border-collapse text-sm mt-2'>
          <tbody>
            <tr>
              <td className='border p-1 font-bold'>Emp Code</td>
              <td className='border p-1 font-bold'>TRINITS-1</td>
              <td className='border p-1 font-bold'>DOJ</td>
              <td className='border p-1 font-bold'>2025-05-07</td>
            </tr>
            <tr>
              <td className='border p-1 font-bold'>Global Id</td>
              <td className='border p-1 '></td>
              <td className='border p-1 font-bold'>Global DOJ</td>
              <td className='border p-1'></td>
            </tr>
            <tr>
              <td className='border p-1 font-bold'>Emp Name</td>
              <td className='border p-1 font-bold'>TriNitS0</td>
              <td className='border p-1 font-bold'>DOB</td>
              <td className='border p-1'></td>
            </tr>
            <tr>
              <td className='border p-1 font-bold'>Location</td>
              <td className='border p-1'></td>
              <td className='border p-1 font-bold'>Gender</td>
              <td className='border p-1'></td>
            </tr>
            <tr>
              <td className='border p-1 font-bold'>Unit Code</td>
              <td className='border p-1'></td>
              <td className='border p-1 font-bold'>PAN</td>
              <td className='border p-1 font-bold'>PAN34162</td>
            </tr>
            <tr>
              <td className='border p-1 font-bold'>Designation</td>
              <td className='border p-1 font-bold'>Software engineer</td>
              <td className='border p-1 font-bold'>PF No</td>
              <td className='border p-1'></td>
            </tr>
            <tr>
              <td className='border p-1 font-bold'>Bank Ac No</td>
              <td className='border p-1 font-bold'>50202238836</td>
              <td className='border p-1 font-bold'>PF UAN</td>
              <td className='border p-1'></td>
            </tr>
            <tr>
              <td className='border p-1 font-bold'>Bank Ac Name</td>
              <td className='border p-1'></td>
              <td className='border p-1 font-bold'>EPS NO</td>
              <td className='border p-1'></td>
            </tr>
            <tr>
              <td className='border p-1 font-bold'>Grade</td>
              <td className='border p-1'></td>
              <td className='border p-1 font-bold'>ESI NO</td>
              <td className='border p-1'></td>
            </tr>
          </tbody>
        </table>

        {/* Days Info */}
        <div className='bg-blue-100 border border-gray-400 p-1 mt-0   text-xs'>
          Standard Days: 31, Payable Days: 31.00, Loss of Pay Days: 0.00, LOP Reversal Days: 0.00,
          Arrear Days: 0.00
        </div>

        {/* Earnings & Deductions */}
        <table className='w-full border border-gray-400 border-collapse text-sm mt-0'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='border p-1'>EARNINGS</th>
              <th className='border p-1'>MONTHLY RATE</th>
              <th className='border p-1'>CURRENT MONTH</th>
              <th className='border p-1'>ARREAR(+/-)</th>
              <th className='border p-1'>TOTAL</th>
              <th className='border p-1'>DEDUCTIONS</th>
              <th className='border p-1'>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='border p-1'>BASIC</td>
              <td className='border p-1'>11613</td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'>P.F.</td>
              <td className='border p-1'></td>
            </tr>
            <tr>
              <td className='border p-1'>HOUSE RENT ALLOWANCE</td>
              <td className='border p-1'>4645</td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'>PROFESSION TAX</td>
              <td className='border p-1'>200</td>
            </tr>
            <tr>
              <td className='border p-1'>PERSONAL ALLOWANCE</td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
            </tr>
            <tr>
              <td className='border p-1'>ADVANCE STATUTORY BONUS</td>
              <td className='border p-1'>290</td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
            </tr>
            <tr>
              <td className='border p-1'>REMOTE WORKING ALLOWANCE</td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
            </tr>
            <tr>
              <td className='border p-1'>BOOKS AND JOURNALS</td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
            </tr>
            <tr>
              <td className='border p-1'>PROFESSIONAL PURSUIT</td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
            </tr>
            <tr>
              <td className='border p-1 font-bold '>PROFESSIONAL PURSUIT</td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1'></td>
              <td className='border p-1 font-bold'>TOTAL DEDUCATIONS</td>
              <td className='border p-1 font-bold'>200</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className='border p-1 text-left font-bold'>
                NET PAY : (... RUPEES ONLY)
              </td>
              <td className='border p-1 font-bold' colSpan={2}>
                28832
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
      </div>
    </div>
  );
}
