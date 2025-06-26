import {
  differenceInHours,
  differenceInMinutes,
  endOfDay,
  endOfMonth,
  format,
  formatISO,
  isValid,
  parse,
  parseISO,
  startOfDay,
  startOfMonth,
  toDate,
} from 'date-fns';

// Standard date formats used across the application
export const DATE_FORMATS = {
  // Display formats
  DISPLAY_DATE: 'MMM dd, yyyy', // Jan 26, 2025
  DISPLAY_DATE_SHORT: 'MM/dd/yyyy', // 01/26/2025
  DISPLAY_DATE_FULL: 'MMMM dd, yyyy', // January 26, 2025
  DISPLAY_DATETIME: 'MMM dd, yyyy hh:mm a', // Jan 26, 2025 09:30 AM
  DISPLAY_DATETIME_FULL: 'MMMM dd, yyyy hh:mm:ss a', // January 26, 2025 09:30:45 AM
  DISPLAY_TIME: 'HH:mm', // 09:30 (24-hour format)
  DISPLAY_TIME_12H: 'hh:mm a', // 09:30 AM

  // ISO formats
  ISO_DATE: 'yyyy-MM-dd', // 2025-01-26
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss", // 2025-01-26T09:30:00
  ISO_DATETIME_WITH_TZ: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", // 2025-01-26T09:30:00.000+05:30

  // API formats
  API_DATE: 'yyyy-MM-dd', // 2025-01-26
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", // 2025-01-26T09:30:00.000Z

  // Input formats
  INPUT_DATE: 'yyyy-MM-dd', // For HTML date inputs
  INPUT_TIME: 'HH:mm', // For HTML time inputs
  INPUT_DATETIME_LOCAL: "yyyy-MM-dd'T'HH:mm", // For HTML datetime-local inputs
} as const;

/**
 * Format a date using predefined formats
 */
export const formatDate = (
  date: Date | string | number,
  formatKey: keyof typeof DATE_FORMATS
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : toDate(date);
  if (!isValid(dateObj)) {
    return 'Invalid Date';
  }
  return format(dateObj, DATE_FORMATS[formatKey]);
};

/**
 * Format a date for display purposes
 */
export const formatDisplayDate = (date: Date | string | number): string => {
  return formatDate(date, 'DISPLAY_DATE');
};

/**
 * Format a datetime for display purposes
 */
export const formatDisplayDateTime = (date: Date | string | number): string => {
  return formatDate(date, 'DISPLAY_DATETIME');
};

/**
 * Format time in 24-hour format (HH:mm)
 */
export const formatTime24 = (date: Date | string | number): string => {
  return formatDate(date, 'DISPLAY_TIME');
};

/**
 * Format time in 12-hour format (hh:mm AM/PM)
 */
export const formatTime12 = (date: Date | string | number): string => {
  return formatDate(date, 'DISPLAY_TIME_12H');
};

/**
 * Format date for API requests (ISO format)
 */
export const formatApiDate = (date: Date | string | number): string => {
  return formatDate(date, 'API_DATE');
};

/**
 * Format datetime for API requests (ISO format with timezone)
 */
export const formatApiDateTime = (date: Date | string | number): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : toDate(date);
  if (!isValid(dateObj)) {
    return '';
  }
  return formatISO(dateObj);
};

/**
 * Format date for HTML input elements
 */
export const formatInputDate = (date: Date | string | number): string => {
  return formatDate(date, 'INPUT_DATE');
};

/**
 * Format time for HTML input elements
 */
export const formatInputTime = (date: Date | string | number): string => {
  return formatDate(date, 'INPUT_TIME');
};

/**
 * Format datetime for HTML datetime-local input elements
 */
export const formatInputDateTime = (date: Date | string | number): string => {
  return formatDate(date, 'INPUT_DATETIME_LOCAL');
};

/**
 * Parse date string safely
 */
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;

  const date = parseISO(dateString);
  return isValid(date) ? date : null;
};

/**
 * Parse time string in various formats
 */
export const parseTime = (timeString: string, referenceDate?: Date): Date | null => {
  if (!timeString) return null;

  const baseDate = referenceDate || new Date();
  const dateStr = formatDate(baseDate, 'ISO_DATE');

  // Try different time formats
  const timeFormats = ['HH:mm', 'HH:mm:ss', 'h:mm a', 'h:mm:ss a'];

  for (const timeFormat of timeFormats) {
    try {
      const parsed = parse(timeString, timeFormat, new Date(`${dateStr}T00:00:00`));
      if (isValid(parsed)) return parsed;
    } catch {
      // Continue to next format
    }
  }

  return null;
};

/**
 * Create a datetime string from date and time strings
 * Preserves local time without timezone conversion
 */
export const combineDateAndTime = (dateString: string, timeString: string): string => {
  if (!dateString || !timeString) return '';

  // Simply combine date and time as local datetime without timezone conversion
  return `${dateString}T${timeString}:00`;
};

/**
 * Get the start of a month
 */
export const getMonthStart = (date: Date | string | number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : toDate(date);
  return startOfMonth(dateObj);
};

/**
 * Get the end of a month
 */
export const getMonthEnd = (date: Date | string | number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : toDate(date);
  return endOfMonth(dateObj);
};

/**
 * Get the start of a day
 */
export const getDayStart = (date: Date | string | number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : toDate(date);
  return startOfDay(dateObj);
};

/**
 * Get the end of a day
 */
export const getDayEnd = (date: Date | string | number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : toDate(date);
  return endOfDay(dateObj);
};

/**
 * Calculate hours between two dates/times
 */
export const calculateHours = (start: Date | string, end: Date | string): number => {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;

  if (!isValid(startDate) || !isValid(endDate)) return 0;
  if (endDate < startDate) return 0;

  const hours = differenceInHours(endDate, startDate);
  const minutes = differenceInMinutes(endDate, startDate) % 60;

  return parseFloat((hours + minutes / 60).toFixed(2));
};

/**
 * Calculate overtime hours (hours above 8)
 */
export const calculateOvertimeHours = (totalHours: number): number => {
  return Math.max(0, totalHours - 8);
};

/**
 * Determine attendance status based on total hours
 */
export const getAttendanceStatus = (totalHours: number): string => {
  if (totalHours >= 8) return 'Present';
  if (totalHours >= 4) return 'Half Day';
  if (totalHours > 0) return 'Short Leave';
  return 'Absent';
};

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export const isWeekend = (date: Date | string | number): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : toDate(date);
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
};

/**
 * Check if a Saturday is a working day (1st and 3rd Saturday)
 */
export const isWorkingSaturday = (date: Date | string | number): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : toDate(date);
  const dayOfWeek = dateObj.getDay();

  if (dayOfWeek !== 6) return false; // Not a Saturday

  const dayOfMonth = dateObj.getDate();
  const isFirstSaturday = dayOfMonth >= 1 && dayOfMonth <= 7;
  const isThirdSaturday = dayOfMonth >= 15 && dayOfMonth <= 21;

  return isFirstSaturday || isThirdSaturday;
};

/**
 * Validate if a string is a valid date
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = parseISO(dateString);
  return isValid(date);
};

/**
 * Validate if a string is a valid time
 */
export const isValidTime = (timeString: string): boolean => {
  return parseTime(timeString) !== null;
};

/**
 * Format time handling timezone issues properly
 * For UTC times, displays UTC time to avoid conversion
 * For local times, displays local time
 */
export const formatTimeWithTimezone = (timeString: string | null | undefined): string => {
  if (!timeString) return '-';

  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      // If it's not a valid date, try parsing as time only
      const timeDate = new Date(`2000-01-01T${timeString}`);
      if (isNaN(timeDate.getTime())) return '-';
      const hours = timeDate.getHours().toString().padStart(2, '0');
      const minutes = timeDate.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    // Check if the string ends with 'Z' (UTC) or has timezone info
    if (
      timeString.endsWith('Z') ||
      timeString.includes('+') ||
      timeString.match(/T\d{2}:\d{2}:\d{2}\.\d{3}/)
    ) {
      // For UTC times, display the UTC time to avoid timezone conversion
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else {
      // For local datetime strings, format consistently in 24-hour format
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  } catch (_error) {
    return '-';
  }
};

const dateUtils = {
  DATE_FORMATS,
  formatDate,
  formatDisplayDate,
  formatDisplayDateTime,
  formatTime24,
  formatTime12,
  formatApiDate,
  formatApiDateTime,
  formatInputDate,
  formatInputTime,
  formatInputDateTime,
  parseDate,
  parseTime,
  combineDateAndTime,
  getMonthStart,
  getMonthEnd,
  getDayStart,
  getDayEnd,
  calculateHours,
  calculateOvertimeHours,
  getAttendanceStatus,
  isWeekend,
  isWorkingSaturday,
  isValidDate,
  isValidTime,
  formatTimeWithTimezone,
};

export default dateUtils;
