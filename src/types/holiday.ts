// Holiday-related type definitions

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD or ISO string
  name: string;
  description?: string;
  isNational?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HolidayFormData {
  name: string;
  date: string;
  description?: string;
  isNational?: boolean;
}

export interface UseHolidaysReturn {
  holidays: Holiday[];
  isLoading: boolean;
  error: string | null;
  fetchHolidays: () => Promise<void>;
  createHoliday: (holiday: Omit<Holiday, 'id'>) => Promise<'success' | 'duplicate' | 'error'>;
  updateHoliday: (id: string, holiday: Omit<Holiday, 'id'>) => Promise<boolean>;
  deleteHoliday: (id: string) => Promise<boolean>;
}
