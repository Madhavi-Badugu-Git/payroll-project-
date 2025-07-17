# Holiday Import Functionality Documentation

## ✅ Overview

The Holiday Import feature allows administrators to bulk import holidays from
Excel files, matching the same format as the exported files. This enables easy
management of holiday data through Excel spreadsheets.

## 🎯 **Features Added**

### 📊 **Excel Import Capability**

- **File Support**: .xlsx and .xls formats
- **Column Structure**: Date, Day, Holiday
- **Date Format**: DD-MMM-YYYY (e.g., 01-Jan-2025)
- **Data Validation**: Automatic validation of file structure and data format

### 🎨 **User Interface**

- **Import Button**: Added for admin users next to Add/Download buttons
- **Upload Dialog**: Clean interface for file selection and preview
- **Data Preview**: Shows first 10 rows of imported data for verification
- **Progress Indicator**: Loading state during import process

### 🔧 **Import Process**

1. **File Selection**: Choose Excel file with proper format
2. **Data Validation**: Automatic validation of column structure
3. **Preview Display**: Review data before importing
4. **Duplicate Handling**: Skips holidays that already exist
5. **Batch Processing**: Imports all valid holidays at once
6. **Progress Feedback**: Real-time status updates

## 📁 **File Format Requirements**

### **Required Columns:**

- **Date**: DD-MMM-YYYY format (e.g., 01-Jan-2025, 14-Feb-2025)
- **Day**: Day of the week (e.g., Monday, Tuesday)
- **Holiday**: Name of the holiday

### **Sample Data:**

```
Date         | Day       | Holiday
01-Jan-2025  | Wednesday | New Year's Day
26-Jan-2025  | Sunday    | Republic Day
14-Feb-2025  | Friday    | Valentine's Day
15-Aug-2025  | Friday    | Independence Day
02-Oct-2025  | Thursday  | Gandhi Jayanti
25-Dec-2025  | Thursday  | Christmas Day
```

## 🔄 **Import Workflow**

### **Step 1: Access Import**

- Navigate to Holidays page
- Click "Import" button (admin users only)

### **Step 2: Select File**

- Choose Excel file (.xlsx or .xls)
- File is automatically validated

### **Step 3: Preview Data**

- Review imported data structure
- Check for any formatting issues
- Verify holiday names and dates

### **Step 4: Confirm Import**

- Click "Import X Holidays" button
- System processes each holiday
- Duplicate holidays are automatically skipped

### **Step 5: Completion**

- Success/error notifications displayed
- Import dialog closes automatically
- Holiday list refreshes with new data

## 🛡️ **Error Handling**

### **File Validation:**

- **Invalid Format**: Shows error for non-Excel files
- **Empty File**: Alerts if no data found
- **Missing Columns**: Validates required column structure

### **Data Processing:**

- **Date Conversion**: Automatically converts DD-MMM-YYYY to YYYY-MM-DD
- **Duplicate Detection**: Skips holidays that already exist
- **Error Recovery**: Continues processing even if individual holidays fail

### **User Feedback:**

- **Success Messages**: "Successfully imported X holidays"
- **Warning Messages**: "Failed to import X holidays"
- **Error Messages**: Specific error details for troubleshooting

## 🔧 **Technical Implementation**

### **File Processing:**

```typescript
// Read Excel file
const data = await file.arrayBuffer();
const workbook = XLSX.read(data);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = XLSX.utils.sheet_to_json(worksheet);

// Convert date format
const convertedDate = convertDateFormat(row.Date); // DD-MMM-YYYY → YYYY-MM-DD

// Create holiday
await createHoliday({
  name: row.Holiday,
  date: convertedDate,
});
```

### **Date Conversion:**

```typescript
const convertDateFormat = (dateStr: string): string => {
  const parts = dateStr.split('-');
  const day = parts[0].padStart(2, '0');
  const monthName = parts[1];
  const year = parts[2];

  const monthMap = {
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

  return `${year}-${monthMap[monthName]}-${day}`;
};
```

## 📱 **User Experience**

### **Admin Features:**

- Import button visible only to admin users
- Streamlined upload process
- Clear preview before confirmation
- Batch import capability

### **Data Integrity:**

- Prevents duplicate holidays
- Validates date formats
- Maintains data consistency
- Error recovery mechanisms

## 🚀 **Testing**

### **Sample File Creation:**

```bash
node scripts/create-sample-import.js
```

This creates `sample-holidays-import-YYYY.xlsx` with proper format for testing.

### **Test Scenarios:**

1. **Valid Import**: Upload sample file with correct format
2. **Invalid Format**: Test with incorrect column names
3. **Duplicate Data**: Import holidays that already exist
4. **Mixed Data**: Combination of new and duplicate holidays

## 🔮 **Future Enhancements**

### **Potential Improvements:**

- **CSV Import Support**: Add support for CSV files
- **Template Download**: Provide empty template for users
- **Custom Date Formats**: Support multiple date formats
- **Data Mapping**: Allow column mapping for different structures
- **Validation Rules**: Custom validation for holiday names/dates
- **Import History**: Track import operations and changes

## 📋 **Files Modified**

### `/src/app/holidays/page.tsx`

- Added import state management
- Implemented file upload and processing
- Added import dialog UI
- Created date conversion utilities
- Integrated with existing holiday management

### `/scripts/create-sample-import.js`

- Sample Excel file generator
- Demonstrates correct import format
- Testing utility for import functionality
