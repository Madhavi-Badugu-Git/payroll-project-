#!/usr/bin/env node

// Test script to verify Excel functionality
const XLSX = require('xlsx');

console.log('Testing Excel functionality...');

const currentYear = new Date().getFullYear();

// Test data
const testData = [
  { Date: `01-Jan-${currentYear}`, Day: 'Wednesday', Holiday: 'New Year' },
  { Date: `14-Jan-${currentYear}`, Day: 'Tuesday', Holiday: 'Pongal' },
  { Date: `31-Mar-${currentYear}`, Day: 'Monday', Holiday: 'Ramzan Id/Eid-ul-Fitar' },
];

try {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(testData);

  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Date column
    { wch: 15 }, // Day column
    { wch: 30 }, // Holiday column
  ];
  worksheet['!cols'] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, `Holidays Test ${currentYear}`);

  // Generate filename
  const filename = `test-holidays-${currentYear}-${new Date().toISOString().split('T')[0]}.xlsx`;

  // Save the file
  XLSX.writeFile(workbook, filename);

  console.log('✅ Excel functionality test passed!');
  console.log(`📁 Test file created: ${filename}`);
} catch (error) {
  console.error('❌ Excel functionality test failed:', error);
}
