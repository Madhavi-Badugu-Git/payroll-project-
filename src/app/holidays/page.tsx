'use client';

import { useHolidays } from '@/hooks/useHolidays';
import { hasAdminRoleClient } from '@/lib/clientRoleUtils';
import { RootState } from '@/store';
import { Holiday } from '@/types';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TableChart as TableChartIcon,
  Upload as UploadIcon,
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
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
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
import { FormEvent, useCallback, useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';
import AppLayout from '../AppLayout';
import './react-calendar.css';

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

// Type for import data
interface ImportHolidayData {
  Date: string;
  Day: string;
  Holiday: string;
}

export default function HolidaysPage() {
  const reduxUser = useSelector((state: RootState) => state.user.user);
  const currentYear = new Date().getFullYear();

  // Use custom hook for holidays data management
  const { holidays, isLoading, error, createHoliday, updateHoliday, deleteHoliday, fetchHolidays } =
    useHolidays();

  const [holidayDatesSet, setHolidayDatesSet] = useState(new Set<string>());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedDateInfo, setSelectedDateInfo] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState<Partial<Holiday> | null>(null);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState(toYYYYMMDD(new Date()));
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const [downloadMenuAnchorEl, setDownloadMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportHolidayData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const isAdmin = hasAdminRoleClient(reduxUser);

  // Update holiday dates set when holidays change
  useEffect(() => {
    setHolidayDatesSet(new Set(holidays.map(h => h.date)));
  }, [holidays]);

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
      doc.text(`Indian Holidays ${currentYear}`, 14, 22);

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
      const filename = `holidays-${currentYear}-${new Date().toISOString().split('T')[0]}.pdf`;

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
  }, [currentYear, holidays]);

  const downloadHolidaysExcel = useCallback(async () => {
    try {
      // Check if we have data
      if (holidays.length === 0) {
        toast.error('No holidays data to export');
        return;
      }

      console.log('Generating Excel for', holidays.length, 'holidays');

      // Prepare data for Excel
      const excelData = holidays.map(holiday => {
        const { formattedDate, dayName } = formatDateAndGetDay(holiday.date);
        return {
          Date: formattedDate,
          Day: dayName,
          Holiday: holiday.name,
        };
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 15 }, // Date column
        { wch: 15 }, // Day column
        { wch: 30 }, // Holiday column
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, `Holidays ${currentYear}`);

      // Generate filename
      const filename = `holidays-${currentYear}-${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, filename);

      toast.success('Holidays Excel file downloaded successfully!');
      console.log('Excel downloaded successfully');
    } catch (error) {
      console.error('Excel generation failed:', error);
      toast.error(
        `Failed to generate Excel: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }, [currentYear, holidays]);

  const handleDownloadMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadMenuAnchorEl(event.currentTarget);
  };

  const handleDownloadMenuClose = () => {
    setDownloadMenuAnchorEl(null);
  };

  const handleDownloadPDF = () => {
    downloadHolidaysPDF();
    handleDownloadMenuClose();
  };

  const handleDownloadExcel = () => {
    downloadHolidaysExcel();
    handleDownloadMenuClose();
  };

  const handleImportClick = () => {
    setShowImportDialog(true);
  };

  const handleImportDialogClose = () => {
    setShowImportDialog(false);
    setImportPreview([]);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as ImportHolidayData[];

      // Validate data structure
      if (jsonData.length === 0) {
        toast.error('The Excel file is empty');
        return;
      }

      const firstRow = jsonData[0];
      if (!firstRow.Date || !firstRow.Day || !firstRow.Holiday) {
        toast.error('Invalid Excel format. Expected columns: Date, Day, Holiday');
        return;
      }

      setImportPreview(jsonData);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      toast.error('Error reading Excel file. Please check the file format.');
    }
  };

  const convertDateFormat = (dateStr: string): string => {
    // Convert from DD-MMM-YYYY to YYYY-MM-DD
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) throw new Error('Invalid date format');

      const day = parts[0].padStart(2, '0');
      const monthName = parts[1];
      const year = parts[2];

      // Convert month name to number
      const monthMap: { [key: string]: string } = {
        Jan: '01',
        Feb: '02',
        Mar: '03',
        Apr: '04',
        May: '05',
        Jun: '06',
        Jul: '07',
        Aug: '08',
        Sep: '09',
        Oct: '10',
        Nov: '11',
        Dec: '12',
      };

      const month = monthMap[monthName];
      if (!month) throw new Error('Invalid month name');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Date conversion error:', error);
      return dateStr; // Return original if conversion fails
    }
  };
  const handleImportConfirm = async () => {
    if (!importPreview.length) return;

    setIsImporting(true);
    let successCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    try {
      // Refresh holidays data to ensure we have the latest list
      await fetchHolidays();

      for (const row of importPreview) {
        try {
          const convertedDate = convertDateFormat(row.Date);

          const result = await createHoliday({
            name: row.Holiday,
            date: convertedDate,
          });

          if (result === 'success') {
            successCount++;
          } else if (result === 'duplicate') {
            duplicateCount++;
            console.log(`Holiday already exists for ${convertedDate}: ${row.Holiday}`);
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Error importing holiday ${row.Holiday}:`, error);
          errorCount++;
        }
      }

      // Show appropriate success/warning messages
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} holidays`);
      }
      if (duplicateCount > 0) {
        toast.info(`Skipped ${duplicateCount} holidays that already exist`);
      }
      if (errorCount > 0) {
        toast.warning(`Failed to import ${errorCount} holidays`);
      }

      if (successCount === 0 && duplicateCount === 0 && errorCount === 0) {
        toast.info('No holidays were imported');
      }

      handleImportDialogClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import holidays');
    } finally {
      setIsImporting(false);
    }
  };

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
    const success = await deleteHoliday(holidayToDelete.id);
    if (success) {
      setShowConfirmDialog(false);
      setHolidayToDelete(null);
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

    let success = false;
    if (isEditing && currentHoliday?.id) {
      success = await updateHoliday(currentHoliday.id, { name: holidayName, date: holidayDate });
    } else {
      const result = await createHoliday({ name: holidayName, date: holidayDate });

      if (result === 'success') {
        success = true;
        toast.success('Holiday created successfully!');
      } else if (result === 'duplicate') {
        toast.warning('A holiday already exists on this date');
        return;
      } else {
        toast.error('Failed to create holiday');
        return;
      }
    }

    if (success) {
      setShowModal(false);
      // Reset form
      setHolidayName('');
      setHolidayDate(toYYYYMMDD(new Date()));
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

      <Box
        sx={{
          width: '100%',
          maxWidth: '1400px',
          mx: 'auto',
          p: { xs: 2, md: 3 },
          position: 'relative',
        }}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <Box textAlign='center'>
              <CircularProgress size={60} />
              <Typography variant='body1' sx={{ mt: 2 }}>
                Loading holidays...
              </Typography>
            </Box>
          </Box>
        )}

        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Typography variant='h4' component='h1' fontWeight='bold' color='primary'>
            Indian Holidays {currentYear}
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

        {/* Material-UI Import Dialog */}
        <Dialog open={showImportDialog} onClose={handleImportDialogClose} maxWidth='md' fullWidth>
          <DialogTitle>Import Holidays from Excel</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle1' gutterBottom>
                Follow these steps to import holidays:
              </Typography>
              <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                <li>Download the sample template using the button below</li>
                <li>Fill in your holiday data following the same format</li>
                <li>Upload your completed file using the browse button</li>
                <li>Review the preview and click Import to proceed</li>
              </ol>
              <Alert severity='info' sx={{ mb: 2 }}>
                <Typography variant='body2' gutterBottom>
                  Required format:
                </Typography>
                <Box component="ul" sx={{ mt: 1, mb: 1, pl: 2 }}>
                  <li>Date: DD-MMM-YYYY (e.g., 01-Jan-{currentYear})</li>
                  <li>Day: Day of the week</li>
                  <li>Holiday: Name of the holiday</li>
                </Box>
              </Alert>
              <Button
                component='a'
                href='/sample-holidays-import-2025.xlsx'
                download
                variant='outlined'
                size='medium'
                color='primary'
                startIcon={<DownloadIcon />}
                sx={{ mt: 1 }}
              >
                Download Sample Template
              </Button>
            </Box>

            <Box sx={{ mt: 3, mb: 3 }}>
              <Typography variant='subtitle1' gutterBottom>
                Upload Your File:
              </Typography>
              <input
                type='file'
                accept='.xlsx,.xls'
                onChange={handleFileChange}
                style={{
                  marginBottom: '16px',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '100%'
                }}
              />
            </Box>

            {importPreview.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant='h6' gutterBottom>
                  Preview ({importPreview.length} holidays)
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Day</TableCell>
                        <TableCell>Holiday</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importPreview.slice(0, 10).map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.Date}</TableCell>
                          <TableCell>{row.Day}</TableCell>
                          <TableCell>{row.Holiday}</TableCell>
                        </TableRow>
                      ))}
                      {importPreview.length > 10 && (
                        <TableRow>
                          <TableCell colSpan={3} align='center' sx={{ fontStyle: 'italic' }}>
                            ... and {importPreview.length - 10} more holidays
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #eee' }}>
            <Button onClick={handleImportDialogClose} variant='outlined'>
              Cancel
            </Button>
            {importPreview.length > 0 && (
              <Button
                onClick={handleImportConfirm}
                variant='contained'
                disabled={isImporting}
                startIcon={isImporting ? <CircularProgress size={20} /> : <UploadIcon />}
              >
                {isImporting ? 'Importing...' : `Import ${importPreview.length} Holidays`}
              </Button>
            )}
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
                    onClick={handleDownloadMenuClick}
                    variant='contained'
                    color='success'
                    startIcon={<DownloadIcon />}
                    endIcon={<ExpandMoreIcon />}
                    title='Download Holidays'
                  >
                    Download
                  </Button>
                  <Menu
                    anchorEl={downloadMenuAnchorEl}
                    open={Boolean(downloadMenuAnchorEl)}
                    onClose={handleDownloadMenuClose}
                    PaperProps={{
                      elevation: 3,
                    }}
                  >
                    <MenuItem onClick={handleDownloadPDF}>
                      <ListItemIcon>
                        <PictureAsPdfIcon fontSize='small' />
                      </ListItemIcon>
                      <ListItemText>PDF</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleDownloadExcel}>
                      <ListItemIcon>
                        <TableChartIcon fontSize='small' />
                      </ListItemIcon>
                      <ListItemText>Excel</ListItemText>
                    </MenuItem>
                  </Menu>
                  {isAdmin && (
                    <>
                      <Button
                        onClick={handleImportClick}
                        variant='outlined'
                        startIcon={<UploadIcon />}
                        color='primary'
                      >
                        Import
                      </Button>
                      <Button
                        onClick={handleAddHoliday}
                        variant='contained'
                        startIcon={<AddIcon />}
                      >
                        Add
                      </Button>
                    </>
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
