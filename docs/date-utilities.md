# Date Utilities Usage Guide

This project uses a centralized date utility system built with `date-fns` for
consistent date and time formatting across the application.

## Quick Start

```typescript
import {
  formatDisplayDate,
  formatDisplayDateTime,
  formatTime24,
  calculateHours,
  combineDateAndTime,
} from '@/lib/dateUtils';

// Format dates for display
const date = formatDisplayDate('2025-06-26'); // "Jun 26, 2025"
const datetime = formatDisplayDateTime('2025-06-26T09:30:00'); // "Jun 26, 2025 09:30 AM"

// Format times
const time = formatTime24('2025-06-26T09:30:00'); // "09:30"

// Calculate working hours
const hours = calculateHours('2025-06-26T09:00:00', '2025-06-26T17:30:00'); // 8.5

// Combine date and time for forms
const datetime = combineDateAndTime('2025-06-26', '09:30'); // "2025-06-26T09:30:00"
```

## Available Formats

### Display Formats

- `DISPLAY_DATE`: 'MMM dd, yyyy' (Jan 26, 2025)
- `DISPLAY_DATE_SHORT`: 'MM/dd/yyyy' (01/26/2025)
- `DISPLAY_DATETIME`: 'MMM dd, yyyy hh:mm a' (Jan 26, 2025 09:30 AM)
- `DISPLAY_TIME`: 'HH:mm' (09:30)
- `DISPLAY_TIME_12H`: 'hh:mm a' (09:30 AM)

### Input Formats

- `INPUT_DATE`: 'yyyy-MM-dd' (for HTML date inputs)
- `INPUT_TIME`: 'HH:mm' (for HTML time inputs)
- `INPUT_DATETIME_LOCAL`: 'yyyy-MM-ddTHH:mm' (for HTML datetime-local inputs)

### API Formats

- `API_DATE`: 'yyyy-MM-dd'
- `API_DATETIME`: 'yyyy-MM-ddTHH:mm:ss.SSSZ'

## Key Functions

### Formatting Functions

- `formatDisplayDate(date)` - Format date for display
- `formatDisplayDateTime(date)` - Format datetime for display
- `formatTime24(date)` - Format time in 24-hour format
- `formatTime12(date)` - Format time in 12-hour format
- `formatInputDate(date)` - Format date for HTML inputs
- `formatInputTime(date)` - Format time for HTML inputs

### Calculation Functions

- `calculateHours(start, end)` - Calculate hours between two times
- `calculateOvertimeHours(totalHours)` - Calculate overtime (hours > 8)
- `getAttendanceStatus(totalHours)` - Get status based on hours worked

### Utility Functions

- `combineDateAndTime(date, time)` - Combine date and time strings
- `parseDate(dateString)` - Safely parse date strings
- `parseTime(timeString)` - Parse time in various formats
- `isValidDate(dateString)` - Validate date strings
- `isValidTime(timeString)` - Validate time strings

### Business Logic Functions

- `isWeekend(date)` - Check if date is weekend
- `isWorkingSaturday(date)` - Check if Saturday is working day (1st & 3rd)

## Timezone Handling

The utilities handle timezone issues properly:

- **Form Inputs**: Use `combineDateAndTime()` to preserve user's intended time
- **Display**: Use `formatTime24()` or `formatTimeWithTimezone()` for consistent
  display
- **API**: Times are stored as entered by users without forced UTC conversion

## Examples in the Codebase

### Attendance Page

```typescript
// Format time for display
const formatTime = (isoString?: string | null) => {
  if (!isoString) return '--:--';
  return formatTime24(isoString);
};

// Handle regularization form submission
const checkInDateTime = requestedCheckIn
  ? combineDateAndTime(entryDate, requestedCheckIn)
  : null;
```

### Admin Regularization Page

```typescript
// Format dates and times for display
const formatDateTime = (dateTimeString: string) => {
  return formatDisplayDateTime(dateTimeString);
};

const formatTime = (timeString: string | null | undefined) => {
  if (!timeString) return '-';
  return formatTime24(timeString);
};
```

### API Routes

```typescript
// Calculate working hours
const totalHours = calculateHours(checkInTime, checkOutTime);
const overtimeHours = calculateOvertimeHours(totalHours);
const status = getAttendanceStatus(totalHours);
```

## Migration Notes

When updating existing code:

1. Replace manual date formatting with utility functions
2. Use `calculateHours()` instead of manual time calculations
3. Use `combineDateAndTime()` for form submissions
4. Use consistent display formats across components

## Benefits

✅ **Consistency**: All dates/times formatted the same way ✅ **Timezone
Safety**: Proper handling of timezone issues ✅ **Maintainability**: Centralized
date logic ✅ **Type Safety**: TypeScript support with date-fns ✅
**Performance**: Optimized date-fns functions ✅ **Testing**: Easier to test
date logic in isolation
