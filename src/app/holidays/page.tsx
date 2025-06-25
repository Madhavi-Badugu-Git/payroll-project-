'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'; // Added useCallback
import Calendar from 'react-calendar';
import './react-calendar.css';
// import holidaysData from './holidays.json'; // Removed mock data import
import { hasAdminRole } from '@/lib/userutils';
import { useUser } from '@clerk/nextjs';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'; // Added icons
import AppLayout from '../AppLayout';

interface Holiday {
  id: string; // Added id
  date: string; // YYYY-MM-DD or ISO string
  name: string;
}

// Helper function to format date to YYYY-MM-DD for API and input
const toYYYYMMDD = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format date to DD-MMM-YYYY and get day name for display
const formatDateAndGetDay = (dateString: string): { formattedDate: string; dayName: string } => {
  const dateObj = new Date(dateString); // Works with YYYY-MM-DD or ISO string

  const dayStr = String(dateObj.getDate()).padStart(2, '0');
  const monthStr = dateObj.toLocaleDateString('en-IN', { month: 'short' });
  const yearStr = dateObj.getFullYear();
  const formattedDate = `${dayStr}-${monthStr}-${yearStr}`;

  const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'long' });

  return { formattedDate, dayName };
};

export default function HolidaysPage() {
  const { user } = useUser();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayDatesSet, setHolidayDatesSet] = useState(new Set<string>());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateInfo, setSelectedDateInfo] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState<Partial<Holiday> | null>(null);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState(toYYYYMMDD(new Date()));
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const isAdmin = useMemo(() => hasAdminRole(user), [user]);

  const getDayInfo = (date: Date, holidayList: Holiday[]): string => {
    const dateString = toYYYYMMDD(date);
    const holiday = holidayList.find(h => h.date === dateString);

    if (holiday) {
      return `Holiday: ${holiday.name}`;
    }

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) {
      return 'Sunday - Weekend Holiday';
    }

    if (dayOfWeek === 6) {
      const dayOfMonth = date.getDate();
      const isFirstSaturday = dayOfMonth >= 1 && dayOfMonth <= 7;
      const isThirdSaturday = dayOfMonth >= 15 && dayOfMonth <= 21;
      if (isFirstSaturday || isThirdSaturday) {
        return 'Working Saturday';
      } else {
        return 'Saturday - Weekend Holiday';
      }
    }

    return 'Regular Working Day';
  };

  const fetchHolidays = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/holidays');
      if (!response.ok) {
        throw new Error(`Failed to fetch holidays: ${response.statusText}`);
      }
      const data: Holiday[] = await response.json();
      const formattedHolidays = data.map(h => ({ ...h, date: toYYYYMMDD(h.date) }));
      setHolidays(formattedHolidays);
      setHolidayDatesSet(new Set(formattedHolidays.map(h => h.date)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  useEffect(() => {
    if (selectedDate) {
      setSelectedDateInfo(getDayInfo(selectedDate, holidays));
    }
  }, [selectedDate, holidays]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddHoliday = () => {
    setIsEditing(false);
    setCurrentHoliday(null);
    setHolidayName('');
    setHolidayDate(toYYYYMMDD(selectedDate || new Date()));
    setShowModal(true);
  };

  const handleEditHoliday = (holiday: Holiday) => {
    setIsEditing(true);
    setCurrentHoliday(holiday);
    setHolidayName(holiday.name);
    setHolidayDate(toYYYYMMDD(holiday.date));
    setShowModal(true);
  };

  const handleDeleteHoliday = (holidayId: string) => {
    const holiday = holidays.find(h => h.id === holidayId) || null;
    setHolidayToDelete(holiday);
    setShowConfirmDialog(true);
  };

  const confirmDeleteHoliday = async () => {
    if (!holidayToDelete) return;
    try {
      const response = await fetch(`/api/holidays/${holidayToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete holiday');
      }
      setShowConfirmDialog(false);
      setHolidayToDelete(null);
      fetchHolidays(); // Refresh list
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error(err);
      alert(`Error: ${message}`);
    }
  };

  const cancelDeleteHoliday = () => {
    setShowConfirmDialog(false);
    setHolidayToDelete(null);
  };

  const handleSubmitHolidayForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!holidayName || !holidayDate) {
      alert('Please provide both name and date for the holiday.');
      return;
    }

    const method = isEditing ? 'PUT' : 'POST';
    const url =
      isEditing && currentHoliday?.id ? `/api/holidays/${currentHoliday.id}` : '/api/holidays';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: holidayName, date: holidayDate }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || (isEditing ? 'Failed to update holiday' : 'Failed to create holiday')
        );
      }
      setShowModal(false);
      fetchHolidays(); // Refresh list
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error(err);
      alert(`Error: ${message}`);
    }
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }): string | null => {
    if (view === 'month') {
      const localDateString = toYYYYMMDD(date);
      if (holidayDatesSet.has(localDateString)) {
        return 'holiday-tile';
      }
      const dayOfWeek = date.getDay();
      const dayOfMonth = date.getDate();

      // Sundays are always holidays
      if (dayOfWeek === 0) {
        return 'weekend-leave-tile';
      }

      // Saturdays: 1st and 3rd are working, others are holidays
      if (dayOfWeek === 6) {
        const isFirstSaturday = dayOfMonth >= 1 && dayOfMonth <= 7;
        const isThirdSaturday = dayOfMonth >= 15 && dayOfMonth <= 21;
        if (isFirstSaturday || isThirdSaturday) {
          return 'working-saturday-tile'; // Special class for working Saturdays
        }
        return 'weekend-leave-tile'; // Other Saturdays are holidays
      }
    }
    return null;
  };

  if (isLoading)
    return (
      <AppLayout>
        <div className='text-center p-10'>Loading holidays...</div>
      </AppLayout>
    );
  if (error && holidays.length === 0)
    return (
      <AppLayout>
        <div className='text-center p-10 text-red-500'>Error: {error}</div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className='w-full max-w-7xl mx-auto p-4 md:p-6'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-800 dark:text-white'>
            Indian Holidays 2025
          </h1>{' '}
          {/* Removed text-center from here */}
          {isAdmin && (
            <button
              onClick={handleAddHoliday}
              className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center'
            >
              <PlusIcon className='h-5 w-5 mr-2' /> Add Holiday
            </button>
          )}
        </div>
        {/* Modal for Add/Edit Holiday */}
        {showModal && (
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center'>
            <div className='bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md mx-4'>
              <h2 className='text-xl font-semibold mb-6 text-gray-800 dark:text-white'>
                {isEditing ? 'Edit Holiday' : 'Add New Holiday'}
              </h2>
              <form onSubmit={handleSubmitHolidayForm}>
                <div className='mb-4'>
                  <label
                    htmlFor='holidayName'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Holiday Name
                  </label>
                  <input
                    type='text'
                    id='holidayName'
                    value={holidayName}
                    onChange={e => setHolidayName(e.target.value)}
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    required
                  />
                </div>
                <div className='mb-6'>
                  <label
                    htmlFor='holidayDate'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Date
                  </label>
                  <input
                    type='date'
                    id='holidayDate'
                    value={holidayDate}
                    onChange={e => setHolidayDate(e.target.value)}
                    className='mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    required
                  />
                </div>
                <div className='flex justify-end gap-3'>
                  <button
                    type='button'
                    onClick={() => setShowModal(false)}
                    className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    {isEditing ? 'Save Changes' : 'Add Holiday'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Dialog for Delete */}
        {showConfirmDialog && (
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center'>
            <div className='bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md mx-4'>
              <h2 className='text-xl font-semibold mb-6 text-gray-800 dark:text-white'>
                Confirm Delete
              </h2>
              <p className='mb-6 text-gray-700 dark:text-gray-300'>
                Are you sure you want to delete the holiday{' '}
                <span className='font-bold'>{holidayToDelete?.name}</span> on{' '}
                <span className='font-bold'>
                  {holidayToDelete ? toYYYYMMDD(holidayToDelete.date) : ''}
                </span>
                ?
              </p>
              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={cancelDeleteHoliday}
                  className='px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={confirmDeleteHoliday}
                  className='px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className='flex flex-col md:flex-row gap-8'>
          <div className='w-full md:w-auto md:flex-shrink-0 flex flex-col items-center md:items-start'>
            <h2 className='text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300'>
              Calendar View
            </h2>
            <div className='bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md'>
              <Calendar
                onChange={value => handleDateChange(value as Date)}
                value={selectedDate}
                tileClassName={tileClassName}
                className='border-0'
              />
            </div>
          </div>
          <div className='w-full md:flex-1'>
            {selectedDateInfo && (
              <div className='mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
                <h3 className='font-semibold text-gray-800 dark:text-white'>
                  Info for{' '}
                  {selectedDate ? formatDateAndGetDay(toYYYYMMDD(selectedDate)).formattedDate : ''}
                </h3>
                <p className='text-gray-600 dark:text-gray-300'>{selectedDateInfo}</p>
              </div>
            )}
            <h2 className='text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300'>
              Holiday List
            </h2>
            {error && holidays.length > 0 && <p className='text-red-500 mb-2'>{error}</p>}{' '}
            {/* Corrected className quotes */}
            <div className='max-h-[400px] md:max-h-[calc(100vh-250px)] overflow-y-auto bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700'>
              <table className='w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-gray-700 sticky top-0 z-10'>
                  <tr>
                    <th
                      scope='col'
                      className='py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                    >
                      Date
                    </th>
                    <th
                      scope='col'
                      className='py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                    >
                      Day
                    </th>
                    <th
                      scope='col'
                      className='py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                    >
                      Holiday
                    </th>
                    {isAdmin && (
                      <th
                        scope='col'
                        className='py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
                      >
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
                  {holidays.length === 0 && !isLoading && (
                    <tr>
                      <td
                        colSpan={isAdmin ? 4 : 3}
                        className='text-center py-4 text-gray-500 dark:text-gray-400'
                      >
                        No holidays found.
                      </td>
                    </tr>
                  )}
                  {holidays.map(holiday => {
                    const { formattedDate, dayName } = formatDateAndGetDay(holiday.date);
                    return (
                      <tr key={holiday.id}>
                        <td className='py-3 px-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200'>
                          {formattedDate}
                        </td>
                        <td className='py-3 px-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200'>
                          {dayName}
                        </td>
                        <td className='py-3 px-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200'>
                          {holiday.name}
                        </td>
                        {isAdmin && (
                          <td className='py-3 px-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200'>
                            <button
                              onClick={() => handleEditHoliday(holiday)}
                              className='text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-2 p-1'
                            >
                              <PencilIcon className='h-5 w-5' />
                            </button>
                            <button
                              onClick={() => handleDeleteHoliday(holiday.id)}
                              className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1'
                            >
                              <TrashIcon className='h-5 w-5' />
                            </button>
                          </td>
                        )}
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
