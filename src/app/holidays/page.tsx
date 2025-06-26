'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'; // Added useCallback
import Calendar from 'react-calendar';
import './react-calendar.css';
// import holidaysData from './holidays.json'; // Removed mock data import
import { hasAdminRole } from '@/lib/userutils';
import { useUser } from '@clerk/nextjs';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const isAdmin = useMemo(() => (user ? hasAdminRole(user) : false), [user]);

  const downloadHolidaysPDF = useCallback(async () => {
    try {
      // Check if we have data
      if (holidays.length === 0) {
        toast.error('No holidays data to export');
        return;
      }

      console.log('Generating PDF for', holidays.length, 'holidays');

      // Create PDF
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Indian Holidays 2025', 14, 22);

      // Add generation date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 32);

      // Prepare table data
      const tableData = holidays.map(holiday => {
        const { formattedDate, dayName } = formatDateAndGetDay(holiday.date);
        return [formattedDate, dayName, holiday.name];
      });

      // Add table
      autoTable(doc, {
        head: [['Date', 'Day', 'Holiday']],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 40, left: 14, right: 14 },
      });

      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${i} of ${pageCount} | Payroll Management System`,
          14,
          doc.internal.pageSize.height - 10
        );
      }

      // Generate filename
      const filename = `holidays-2025-${new Date().toISOString().split('T')[0]}.pdf`;

      // Try multiple download methods
      try {
        // Method 1: Direct save (works in most browsers)
        doc.save(filename);
        console.log('PDF downloaded successfully');
      } catch (directError) {
        console.warn('Direct save failed, using fallback:', directError);

        // Method 2: Blob download (more compatible)
        const pdfOutput = doc.output('blob');
        const blob = new Blob([pdfOutput], { type: 'application/pdf' });

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);
        console.log('PDF downloaded using fallback method');
      }

      toast.success('Holidays PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);

      toast.error(
        `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the help section above.`
      );
    }
  }, [holidays]);

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

  // Debug holidays data when it changes
  useEffect(() => {
    console.log('Holidays loaded:', holidays.length, 'entries');
  }, [holidays]);

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
      toast.success('Holiday deleted successfully!');
      fetchHolidays(); // Refresh list
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error(err);
      toast.error(`Error: ${message}`);
    }
  };

  const cancelDeleteHoliday = () => {
    setShowConfirmDialog(false);
    setHolidayToDelete(null);
  };

  const handleSubmitHolidayForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!holidayName || !holidayDate) {
      toast.error('Please provide both name and date for the holiday.');
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
      toast.success(isEditing ? 'Holiday updated successfully!' : 'Holiday created successfully!');
      fetchHolidays(); // Refresh list
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error(err);
      toast.error(`Error: ${message}`);
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
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  if (error && holidays.length === 0)
    return (
      <AppLayout>
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
          <Alert severity='error'>Error: {error}</Alert>
        </Box>
      </AppLayout>
    );

  return (
    <AppLayout>
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />

      <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', p: { xs: 2, md: 3 } }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Typography variant='h4' component='h1' fontWeight='bold' color='primary'>
            Indian Holidays 2025
          </Typography>
        </Box>

        {/* Material-UI Modal for Add/Edit Holiday */}
        <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth='sm' fullWidth>
          <DialogTitle>{isEditing ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
          <form onSubmit={handleSubmitHolidayForm}>
            <DialogContent>
              <TextField
                autoFocus
                margin='dense'
                id='holidayName'
                label='Holiday Name'
                type='text'
                fullWidth
                variant='outlined'
                value={holidayName}
                onChange={e => setHolidayName(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                margin='dense'
                id='holidayDate'
                label='Date'
                type='date'
                fullWidth
                variant='outlined'
                value={holidayDate}
                onChange={e => setHolidayDate(e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowModal(false)} variant='outlined'>
                Cancel
              </Button>
              <Button type='submit' variant='contained'>
                {isEditing ? 'Save Changes' : 'Add Holiday'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Material-UI Confirmation Dialog for Delete */}
        <Dialog open={showConfirmDialog} onClose={cancelDeleteHoliday} maxWidth='sm' fullWidth>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the holiday <strong>{holidayToDelete?.name}</strong>{' '}
              on <strong>{holidayToDelete ? toYYYYMMDD(holidayToDelete.date) : ''}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDeleteHoliday} variant='outlined'>
              Cancel
            </Button>
            <Button onClick={confirmDeleteHoliday} variant='contained' color='error'>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Container maxWidth='xl'>
          <Box display='flex' flexDirection={{ xs: 'column' }} gap={4}>
            <Box sx={{ width: { xs: '100%', md: 'auto' }, flexShrink: 0 }}>
              <Card>
                <CardContent sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ width: '60%' }}>
                    <Calendar
                      onChange={value => handleDateChange(value as Date)}
                      value={selectedDate}
                      tileClassName={tileClassName}
                      className='border-0 w-full'
                    />
                  </Box>
                  {selectedDateInfo && (
                    <Box sx={{ width: '40%' }}>
                      <Card variant='outlined'>
                        <CardContent>
                          <Typography variant='h6' gutterBottom>
                            Info for{' '}
                            {selectedDate
                              ? formatDateAndGetDay(toYYYYMMDD(selectedDate)).formattedDate
                              : ''}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {selectedDateInfo}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ width: '100%', flex: 1 }}>
              <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                <Typography variant='h5' component='h2' color='text.secondary'>
                  Holiday List
                </Typography>
                <Box display='flex' gap={1}>
                  <Button
                    onClick={downloadHolidaysPDF}
                    variant='contained'
                    color='success'
                    startIcon={<DownloadIcon />}
                    title='Download Holidays PDF'
                  >
                    Download PDF
                  </Button>
                  {isAdmin && (
                    <Button onClick={handleAddHoliday} variant='contained' startIcon={<AddIcon />}>
                      Add Holiday
                    </Button>
                  )}
                </Box>
              </Box>

              {error && holidays.length > 0 && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: { xs: 400, md: 'calc(100vh - 250px)' },
                  overflow: 'auto',
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Day</TableCell>
                      <TableCell>Holiday</TableCell>
                      {isAdmin && <TableCell>Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {holidays.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell
                          colSpan={isAdmin ? 4 : 3}
                          align='center'
                          sx={{ py: 4, color: 'text.secondary' }}
                        >
                          No holidays found.
                        </TableCell>
                      </TableRow>
                    )}
                    {holidays.map(holiday => {
                      const { formattedDate, dayName } = formatDateAndGetDay(holiday.date);
                      return (
                        <TableRow key={holiday.id} hover>
                          <TableCell>{formattedDate}</TableCell>
                          <TableCell>{dayName}</TableCell>
                          <TableCell>{holiday.name}</TableCell>
                          {isAdmin && (
                            <TableCell>
                              <IconButton
                                onClick={() => handleEditHoliday(holiday)}
                                color='primary'
                                size='small'
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteHoliday(holiday.id)}
                                color='error'
                                size='small'
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Container>
      </Box>
    </AppLayout>
  );
}
