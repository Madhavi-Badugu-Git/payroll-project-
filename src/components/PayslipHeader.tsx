'use client';

import { useRouter } from 'next/navigation';
export default function PayslipHeader() {
  const router = useRouter();
  return (
    <div className='flex justify-center gap-4 p-3 border-t border-gray-200 bg-gray-50'>
      {Array.from({ length: 6 }, (_, index) => (
        <button
          key={index}
          onClick={() => {
            if (index === 0) {
              router.push('/pdf'); // Navigate to PDF page
            } else if (index === 1) {
              router.push('/format2');
            } else if (index === 2) {
              router.push('/format3');
            } else if (index === 3) {
              router.push('/format4');
            } else if (index === 4) {
              router.push('/format5');
            } else if (index === 5) {
              router.push('/format6');
            } else if (index === 6) {
              router.push('/format7');
            }
          }}
          className='px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-700'
        >
          Format {index + 1}
        </button>
      ))}
    </div>
  );
}
