// Example: Using date utilities in a component
import {
  calculateHours,
  combineDateAndTime,
  formatDisplayDate,
  formatDisplayDateTime,
  formatTime24,
} from '@/lib/dateUtils';

// Example component showing common date utility usage
export const DateUtilityExample = () => {
  // Sample data
  const sampleDate = '2025-06-26T09:30:00.000Z';
  const sampleCheckIn = '2025-06-26T09:00:00';
  const sampleCheckOut = '2025-06-26T17:30:00';

  // Calculate working hours
  const totalHours = calculateHours(sampleCheckIn, sampleCheckOut);

  // For form inputs
  const dateInput = '2025-06-26';
  const timeInput = '09:30';
  const combinedDateTime = combineDateAndTime(dateInput, timeInput);

  return (
    <div className='p-4 space-y-4'>
      <h2 className='text-xl font-bold'>Date Utility Examples</h2>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h3 className='font-semibold'>Display Formatting:</h3>
          <p>Display Date: {formatDisplayDate(sampleDate)}</p>
          <p>Display DateTime: {formatDisplayDateTime(sampleDate)}</p>
          <p>Time (24h): {formatTime24(sampleDate)}</p>
        </div>

        <div>
          <h3 className='font-semibold'>Calculations:</h3>
          <p>Check-in: {formatTime24(sampleCheckIn)}</p>
          <p>Check-out: {formatTime24(sampleCheckOut)}</p>
          <p>Total Hours: {totalHours} hours</p>
        </div>

        <div>
          <h3 className='font-semibold'>Form Data:</h3>
          <p>Date Input: {dateInput}</p>
          <p>Time Input: {timeInput}</p>
          <p>Combined: {combinedDateTime}</p>
        </div>
      </div>
    </div>
  );
};

// Example API usage in server component
export const serverSideExample = async () => {
  const { calculateHours, getAttendanceStatus } = await import('@/lib/dateUtils');

  const checkIn = '2025-06-26T09:00:00';
  const checkOut = '2025-06-26T17:30:00';

  const totalHours = calculateHours(checkIn, checkOut);
  const status = getAttendanceStatus(totalHours);

  console.log(`Worked ${totalHours} hours - Status: ${status}`);
  // Output: "Worked 8.5 hours - Status: Present"
};

export default DateUtilityExample;
