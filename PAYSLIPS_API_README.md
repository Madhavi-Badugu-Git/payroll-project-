# Payslips API Documentation

This document describes the Payslips API endpoints and their usage.

## Database Schema

The Payslip model includes the following fields:

```prisma
model Payslip {
  id               String   @id @default(cuid())
  empId            String
  employee         Employee @relation(fields: [empId], references: [empId])
  payslipForMonth  String   // e.g., "May 2025"
  payslipDate      DateTime @db.Date
  location         String
  department       String
  designation      String
  doj              DateTime @db.Date // Date of Joining
  gradeBand        String
  attendedDays     Int
  arrearDays       Int      @default(0)
  daysInMonth      Int
  // Earnings
  basic            Float
  hra              Float
  specialAllowance Float
  lta              Float
  totalSalary      Float
  year             Int
  // Optional deductions
  providentFund    Float?   @default(0)
  professionalTax  Float?   @default(0)
  incomeTax        Float?   @default(0)
  netSalary        Float?   // totalSalary - deductions
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([empId, payslipForMonth, year])
}
```

## API Endpoints

### 1. Get Payslips

**GET** `/api/payslips`

Fetch payslips with optional filtering and pagination.

#### Query Parameters:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `empId` (optional): Filter by employee ID
- `year` (optional): Filter by year
- `month` (optional): Filter by month (partial match)

#### Example Requests:

```bash
# Get all payslips
GET /api/payslips

# Get payslips for specific employee
GET /api/payslips?empId=EMP001

# Get payslips for specific year
GET /api/payslips?year=2025

# Get payslips with pagination
GET /api/payslips?page=2&limit=10

# Combined filters
GET /api/payslips?empId=EMP001&year=2025&page=1&limit=5
```

#### Response:

```json
{
  "payslips": [
    {
      "id": "payslip_id",
      "employeeId": "EMP001",
      "employeeName": "John Doe",
      "payslipForMonth": "May 2025",
      "payslipDate": "01/06/2025",
      "location": "Head Office",
      "department": "Technology",
      "designation": "Software Engineer",
      "doj": "15/01/2024",
      "gradeBand": "G5",
      "attendedDays": 22,
      "arrearDays": 0,
      "daysInMonth": 22,
      "basic": 50000,
      "hra": 20000,
      "specialAllowance": 10000,
      "lta": 5000,
      "totalSalary": 85000,
      "year": 2025,
      "providentFund": 0,
      "professionalTax": 0,
      "incomeTax": 0,
      "netSalary": 85000
    }
  ],
  "totalCount": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### 2. Create Payslip

**POST** `/api/payslips`

Create a new payslip.

#### Request Body:

```json
{
  "empId": "EMP001",
  "payslipForMonth": "May 2025",
  "payslipDate": "2025-06-01",
  "location": "Head Office",
  "department": "Technology",
  "designation": "Software Engineer",
  "doj": "2024-01-15",
  "gradeBand": "G5",
  "attendedDays": 22,
  "arrearDays": 0,
  "daysInMonth": 22,
  "basic": 50000,
  "hra": 20000,
  "specialAllowance": 10000,
  "lta": 5000,
  "year": 2025,
  "providentFund": 0,
  "professionalTax": 0,
  "incomeTax": 0
}
```

#### Response:

Returns the created payslip object with calculated `totalSalary` and
`netSalary`.

### 3. Get Single Payslip

**GET** `/api/payslips/[id]`

Fetch a specific payslip by ID.

#### Response:

Returns a single payslip object.

### 4. Update Payslip

**PUT** `/api/payslips/[id]`

Update an existing payslip.

#### Request Body:

Same as create payslip, but all fields are optional.

### 5. Delete Payslip

**DELETE** `/api/payslips/[id]`

Delete a specific payslip.

#### Response:

```json
{
  "message": "Payslip deleted successfully"
}
```

### 6. Bulk Operations

**POST** `/api/payslips/bulk`

Create multiple payslips at once.

#### Request Body:

```json
{
  "payslips": [
    {
      "empId": "EMP001",
      "payslipForMonth": "May 2025"
      // ... other payslip fields
    },
    {
      "empId": "EMP002",
      "payslipForMonth": "May 2025"
      // ... other payslip fields
    }
  ]
}
```

#### Response:

```json
{
  "message": "Processed 2 payslips",
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "index": 0,
      "success": true,
      "payslipId": "payslip_id_1",
      "empId": "EMP001",
      "payslipForMonth": "May 2025",
      "year": 2025
    }
  ],
  "errors": []
}
```

**DELETE** `/api/payslips/bulk`

Delete multiple payslips.

#### Request Body:

```json
{
  "payslipIds": ["payslip_id_1", "payslip_id_2"]
}
```

## Frontend Integration

The payslips page (`/payslip`) has been updated to use the API instead of static
JSON data. Key features:

1. **User Authentication**: Uses Clerk to identify the logged-in user
2. **Employee Mapping**: Maps Clerk user to employee ID using utility functions
3. **API Integration**: Fetches payslips from the API based on user's employee
   ID
4. **Error Handling**: Displays loading states and error messages
5. **PDF Generation**: Maintains the existing PDF generation functionality

### User-Employee Mapping

The system uses the `getEmployeeIdFromUser` utility function to map Clerk users
to employee IDs:

1. **Metadata Approach**: Stores `empId` in user's public or private metadata
2. **Email Mapping**: Simple mapping based on email addresses (for demo)

To set up proper user-employee mapping:

```javascript
// Option 1: Set empId in user metadata
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    empId: 'EMP001',
  },
});

// Option 2: Update the email mapping in userutils.ts
const emailToEmpIdMap = {
  'john.doe@company.com': 'EMP001',
  'jane.smith@company.com': 'EMP002',
};
```

## Migration

To migrate existing payslip data from JSON to the database:

1. Ensure employees exist in the database
2. Run the migration script:

```bash
npx ts-node src/lib/migrate-payslips.ts
```

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Missing required fields or validation errors
- **404 Not Found**: Employee or payslip not found
- **500 Internal Server Error**: Database or server errors

## Security Considerations

1. **Authentication**: Implement proper authentication middleware
2. **Authorization**: Ensure users can only access their own payslips
3. **Input Validation**: Validate all input data
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Audit Logging**: Log all payslip operations for compliance

## Next Steps

1. **Database Migration**: Run Prisma migrations to create the Payslip table
2. **Data Migration**: Migrate existing JSON data to the database
3. **Authentication**: Implement proper user-employee mapping
4. **Testing**: Test all API endpoints thoroughly
5. **Admin Interface**: Create admin interface for managing payslips
6. **Notifications**: Add email notifications for new payslips
7. **Reporting**: Add payslip reporting and analytics features
