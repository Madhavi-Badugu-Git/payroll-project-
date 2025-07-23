import * as XLSX from 'xlsx';

// Sample holiday data
const sampleHolidays = [
  {
    'Date': '01-Jan-2025',
    'Day': 'Wednesday',
    'Holiday': 'New Year\'s Day'
  },
  {
    'Date': '26-Jan-2025',
    'Day': 'Sunday',
    'Holiday': 'Republic Day'
  },
  {
    'Date': '15-Aug-2025',
    'Day': 'Friday',
    'Holiday': 'Independence Day'
  },
  {
    'Date': '02-Oct-2025',
    'Day': 'Thursday',
    'Holiday': 'Gandhi Jayanti'
  },
  {
    'Date': '25-Dec-2025',
    'Day': 'Thursday',
    'Holiday': 'Christmas'
  }
];

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(sampleHolidays);

// Set column widths
const columnWidths = [
  { wch: 12 }, // Date column
  { wch: 12 }, // Day column
  { wch: 30 }, // Holiday column
];
worksheet['!cols'] = columnWidths;

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample Holidays');

// Save the file
const filename = 'sample-holidays-import-2025.xlsx';
XLSX.writeFile(workbook, filename);

console.log(`✅ Created sample holiday import file: ${filename}`); 