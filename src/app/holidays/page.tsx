'use client';

import { useState } from 'react';
import Calendar from 'react-calendar';
import './react-calendar.css';
import holidaysData from './holidays.json';
import AppLayout from '../AppLayout';

interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

const holidays: Holiday[] = holidaysData;
const holidayDatesSet = new Set(holidays.map(h => h.date));

// Helper function to format date to DD-MMM-YYYY and get day name
const formatDateAndGetDay = (dateString: string): { formattedDate: string; dayName: string } => {
  const dateParts = dateString.split('-'); // YYYY-MM-DD
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed for Date constructor
  const day = parseInt(dateParts[2]);
  
  const dateObj = new Date(year, month, day);
  
  const dayStr = String(dateObj.getDate()).padStart(2, '0');
  const monthStr = dateObj.toLocaleDateString('en-IN', { month: 'short' });
  const yearStr = dateObj.getFullYear();
  const formattedDate = `${dayStr}-${monthStr}-${yearStr}`;
  
  const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'long' });
  
  return { formattedDate, dayName };
};

export default function HolidaysPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const tileClassName = ({ date, view }: { date: Date; view: string }): string | null => {
    if (view === 'month') {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const localDateString = `${year}-${month}-${day}`;

      if (holidayDatesSet.has(localDateString)) {
        return 'holiday-tile';
      }
      const dayOfWeek = date.getDay();
      const dayOfMonth = date.getDate();
      if (dayOfWeek === 0) {
        return 'weekend-leave-tile';
      }
      if (dayOfWeek === 6) {
        if (
          (dayOfMonth > 7 && dayOfMonth <= 14) ||
          (dayOfMonth > 21 && dayOfMonth <= 28) ||
          (dayOfMonth > 28)
        ) {
          return 'weekend-leave-tile';
        }
      }
    }
    return null;
  };

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">Indian Holidays 2025</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-auto md:flex-shrink-0 flex flex-col items-center md:items-start">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Calendar View</h2>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <Calendar
                onChange={(value) => setSelectedDate(value as Date)}
                value={selectedDate}
                tileClassName={tileClassName}
                className="border-0"
              />
            </div>
          </div>
          <div className="w-full md:flex-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Holiday List</h2>
            <div className="max-h-[400px] md:max-h-[calc(100vh-250px)] overflow-y-auto bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date (DD-MMM-YYYY)</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Day</th>
                    <th scope="col" className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Holiday</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {holidays.map((holiday) => {
                    const { formattedDate, dayName } = formatDateAndGetDay(holiday.date);
                    return (
                      <tr key={holiday.date}>
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{formattedDate}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{dayName}</td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{holiday.name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
