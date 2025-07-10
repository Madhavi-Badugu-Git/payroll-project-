#!/usr/bin/env node

// Script to create a sample Excel file for testing holiday import
const XLSX = require('xlsx');

console.log('Creating sample holiday import Excel file...');

const currentYear = new Date().getFullYear();

// Sample holiday data in the import format
const sampleData = [
  { Date: `01-Jan-${currentYear}`, Day: 'Monday', Holiday: "New Year's Day" },
  { Date: `26-Jan-${currentYear}`, Day: 'Sunday', Holiday: 'Republic Day' },
  { Date: `14-Feb-${currentYear}`, Day: 'Friday', Holiday: "Valentine's Day" },
  { Date: `08-Mar-${currentYear}`, Day: 'Saturday', Holiday: "International Women's Day" },
  { Date: `15-Aug-${currentYear}`, Day: 'Friday', Holiday: 'Independence Day' },
  { Date: `02-Oct-${currentYear}`, Day: 'Thursday', Holiday: 'Gandhi Jayanti' },
  { Date: `25-Dec-${currentYear}`, Day: 'Thursday', Holiday: 'Christmas Day' },
];

try {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(sampleData);

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
  const filename = `sample-holidays-import-${currentYear}.xlsx`;

  // Save the file
  XLSX.writeFile(workbook, filename);

  console.log('✅ Sample Excel file created successfully!');
  console.log(`📁 File: ${filename}`);
  console.log('📝 This file can be used to test the holiday import functionality');
  console.log('📋 Format: Date (DD-MMM-YYYY), Day, Holiday');
} catch (error) {
  console.error('❌ Failed to create sample file:', error);
}
