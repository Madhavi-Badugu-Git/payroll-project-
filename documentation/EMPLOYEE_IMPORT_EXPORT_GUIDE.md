# Employee Import/Export Documentation

## Overview

The Employee Management system now supports both exporting existing employee
data to Excel format and importing new employees from Excel files.

## Export Functionality

- Click the "Export Excel" button (green button with download icon) in the
  Employee Management page
- This will download an Excel file named `employees_export_YYYY-MM-DD.xlsx`
  containing all current employee data
- The exported file includes all employee fields with proper formatting

## Import Functionality

- Click the "Import Excel" button (blue button with upload icon) in the Employee
  Management page
- Select an Excel file (.xlsx or .xls) that matches the export format
- The system will preview the first 10 rows of data for verification
- Click "Import Employees" to process the file

## Excel File Format

The Excel file must contain the following columns (exact headers required):

### Required Columns:

- **Employee ID** (optional - auto-generated if empty)
- **First Name** (required)
- **Last Name** (required)
- **Office Email** (required - must be unique)
- **Personal Email** (optional)
- **Mobile Number** (required)
- **Date of Birth** (optional - format: MM/DD/YYYY or YYYY-MM-DD)
- **Salary** (optional - numeric value)
- **Designation** (required)
- **Employment Type** (required: Full-time, Part-time, Contract, Intern)
- **Stream** (required: Engineering, Design, Marketing, HR, Finance, etc.)
- **Status** (required: Active, Inactive, On Leave)
- **Joining Date** (required - format: MM/DD/YYYY or YYYY-MM-DD)
- **Exit Date** (optional - format: MM/DD/YYYY or YYYY-MM-DD)
- **GitHub User ID** (optional)
- **LinkedIn ID** (optional)

### Sample Data Format:

```
Employee ID | First Name | Last Name | Office Email        | Mobile Number | Date of Birth | Salary | Designation      | Employment Type | Stream      | Status | Joining Date | Exit Date | GitHub User ID | LinkedIn ID
           | John       | Doe       | john.doe@company.com| +1234567890   | 1990-05-15   | 75000  | Software Engineer| Full-time      | Engineering | Active | 2024-01-15   |           | johndoe       | johndoe123
           | Jane       | Smith     | jane.smith@company.com| +1987654321  | 1992-08-22   | 65000  | UI/UX Designer   | Full-time      | Design      | Active | 2024-02-01   |           | janesmith     | janesmith456
```

## Import Process

1. The system validates all required fields
2. Checks for unique email addresses
3. Validates date formats
4. Auto-generates Employee IDs using the configured prefix
5. Creates employees via the API
6. Shows success/error messages for each row

## Error Handling

- Invalid data formats will show specific error messages
- Duplicate email addresses will be rejected
- Missing required fields will cause import failure for that row
- The system continues processing other rows even if some fail

## Tips for Successful Import

1. Use the exported file as a template
2. Ensure all required fields are filled
3. Use proper date formats (MM/DD/YYYY or YYYY-MM-DD)
4. Check for duplicate email addresses
5. Verify employment types and statuses match allowed values

## Validation Rules

- Office Email must be unique across all employees
- Employment Type: Full-time, Part-time, Contract, Intern
- Status: Active, Inactive, On Leave
- Dates must be valid date formats
- Employee ID will be auto-generated if not provided
