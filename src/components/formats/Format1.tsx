'use client';
import Image from 'next/image';
export default function Payslip() {
  return (
    <div className='bg-blue-30 min-h-screen p-6'>
      <div className='bg-white p-6 w-[900px] shadow-lg border border-gray-300'>
        <div className='flex justify-between items-start border-b border-gray-300 pb-6'>
          {/* Left Logo & Name */}
          <div className='flex items-center'>
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

          {/* Right Address */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2 className='text-lg font-bold text-red-600'>TriNitS Technologies 0</h2>
            <p className='text-sm text-gray-700'>
              Naidupeta 0, Nellore 0, 524421, Andhra pradesh.
              <br />
              <span className='text-red-500 text-sm'>Pay Slip for the month of 2025-08-04</span>
            </p>
          </div>
        </div>

        {/* Employee Details */}
        <div className='grid grid-cols-2 gap-4 py-4 border-b border-gray-300'>
          <div>
            <p>
              <span className='font-bold text-pink-700'>Emp No</span> : TRINITS-1
            </p>
            <p>
              <span className='font-bold text-pink-700'>Location</span> : Naidupeta 0
            </p>
          </div>
          <div>
            <p>
              <span className='font-bold text-pink-700'>Name</span> : TriNitS0
            </p>
            <p>
              <span className='font-bold text-pink-700'>Designation</span> : Software engineer
            </p>
          </div>
        </div>

        {/* Full-Width Table */}
        <table className='w-full border border-gray-400 border-collapse text-sm mt-4'>
          <thead>
            <tr>
              <th className='border border-gray-400 p-2 text-left'>Earnings</th>
              <th className='border border-gray-400 p-2 text-right'>Amount</th>
              <th className='border border-gray-400 p-2 text-left'>Deductions</th>
              <th className='border border-gray-400 p-2 text-right'>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='border border-gray-400 p-2'>Basic</td>
              <td className='border border-gray-400 p-2 text-right'>11613</td>
              <td className='border border-gray-400 p-2'>Prof Tax</td>
              <td className='border border-gray-400 p-2 text-right'>200</td>
            </tr>
            <tr>
              <td className='border border-gray-400 p-2'>HRA</td>
              <td className='border border-gray-400 p-2 text-right'>4645</td>
              <td className='border border-gray-400 p-2'>Other Ded</td>
              <td className='border border-gray-400 p-2 text-right'></td>
            </tr>
            <tr>
              <td className='border border-gray-400 p-2'>Conveyance</td>
              <td className='border border-gray-400 p-2 text-right'>1161</td>
              <td className='border border-gray-400 p-2'></td>
              <td className='border border-gray-400 p-2 text-right'></td>
            </tr>
            <tr>
              <td className='border border-gray-400 p-2'>Special Allowance</td>
              <td className='border border-gray-400 p-2 text-right'>4065</td>
              <td className='border border-gray-400 p-2'></td>
              <td className='border border-gray-400 p-2 text-right'></td>
            </tr>
            <tr>
              <td className='border border-gray-400 p-2'>Medical</td>
              <td className='border border-gray-400 p-2 text-right'>871</td>
              <td className='border border-gray-400 p-2'></td>
              <td className='border border-gray-400 p-2 text-right'></td>
            </tr>
            <tr className='font-bold'>
              <td className='border border-gray-400 p-2'>Total Earnings</td>
              <td className='border border-gray-400 p-2 text-right'>29032</td>
              <td className='border border-gray-400 p-2'>Total Deductions</td>
              <td className='border border-gray-400 p-2 text-right'>200</td>
            </tr>
            <tr>
              <td className='border border-gray-400 p-2'>Workdays:</td>
              <td className='border border-gray-400 p-2 text-right'>30</td>
              <td className='border border-gray-400 p-2'>Net Pay :</td>
              <td className='border border-gray-400 p-2 text-right'>28832</td>
            </tr>
          </tbody>
        </table>

        {/* Net Pay in Words */}
        <div className='text-center mt-4 font-bold'>NET PAY: (Rupees ... Only)</div>
      </div>
    </div>
  );
}
