# Types Organization Documentation

## Overview

This project uses a centralized type system organized in the `/src/types`
directory for better maintainability, reusability, and consistency across the
application.

## Directory Structure

```
src/types/
├── index.ts           # Main export file - exports all types
├── user.ts           # User authentication and profile types
├── employee.ts       # Employee management types
├── holiday.ts        # Holiday management types
├── leave.ts          # Leave management types
├── attendance.ts     # Attendance tracking types
├── payroll.ts        # Payroll and payslip types
├── configuration.ts  # System configuration types
└── common.ts         # Common utility types
```

## Type Categories

### User Types (`user.ts`)

- **UserMetadata**: User metadata structure
- **UserEmailAddress**: Email address structure
- **User**: Main user interface for authentication
- **UserSession**: Session management types

### Employee Types (`employee.ts`)

- **Employee**: Complete employee information
- **EmployeeFormData**: Form data for employee creation/editing
- **EmployeePromotion**: Employee promotion records

### Holiday Types (`holiday.ts`)

- **Holiday**: Holiday information structure
- **HolidayFormData**: Form data for holiday management
- **UseHolidaysReturn**: Custom hook return type

### Leave Management Types (`leave.ts`)

- **LeaveApplication**: Leave application records
- **LeaveBalance**: Employee leave balances
- **LeaveAccumulation**: Leave accumulation records
- **LeaveTransaction**: Leave transaction history
- **LeavePolicy**: Leave policy definitions
- **LeaveFormData**: Form data for leave applications

### Attendance Types (`attendance.ts`)

- **Attendance**: Daily attendance records
- **AttendanceRegularization**: Attendance correction requests
- **AttendanceFormData**: Form data for attendance management

### Payroll Types (`payroll.ts`)

- **Payslip**: Payslip information structure
- **PayslipFormData**: Form data for payslip generation
- **SalaryComponent**: Salary component definitions

### Configuration Types (`configuration.ts`)

- **Configuration**: System configuration settings
- **ConfigurationFormData**: Form data for configuration management
- **SystemSettings**: Global system settings

### Common Types (`common.ts`)

- **ApiResponse<T>**: Standardized API response format
- **PaginationParams**: Pagination parameters
- **PaginatedResponse<T>**: Paginated API responses
- **FilterParams**: Search and filter parameters
- **SelectOption**: Form select option structure
- **TableColumn**: Data table column definitions
- **ValidationRule**: Form validation rules
- **FormField**: Dynamic form field definitions

## Usage Examples

### Basic Import

```typescript
import { Employee, Holiday, User } from '@/types';
```

### Specific Category Import

```typescript
import { LeaveApplication, LeaveBalance } from '@/types/leave';
```

### Generic Types Usage

```typescript
import { ApiResponse, PaginatedResponse } from '@/types';

const employeeResponse: ApiResponse<Employee[]> = await fetch('/api/employees');
const paginatedHolidays: PaginatedResponse<Holiday> = await fetch(
  '/api/holidays?page=1'
);
```

## Benefits

### 1. **Centralized Management**

- All type definitions in one location
- Easy to find and modify types
- Consistent naming conventions

### 2. **Better IntelliSense**

- Improved autocomplete in IDEs
- Better error detection during development
- Enhanced code navigation

### 3. **Reusability**

- Types can be shared across components
- Reduced code duplication
- Consistent data structures

### 4. **Maintainability**

- Single source of truth for data structures
- Easy to update types across the application
- Version control friendly

### 5. **Type Safety**

- Compile-time error checking
- Prevents runtime errors
- Better refactoring support

## Migration Guide

### Before (Scattered Types)

```typescript
// In component file
interface Employee {
  id: string;
  name: string;
  // ... other properties
}

// Same interface repeated in multiple files
```

### After (Centralized Types)

```typescript
// In types/employee.ts
export interface Employee {
  id: string;
  name: string;
  // ... other properties
}

// In component files
import { Employee } from '@/types';
```

## Best Practices

### 1. **Naming Conventions**

- Use PascalCase for interface names
- Use descriptive names that reflect the domain
- Add suffixes like `FormData`, `Response`, etc. for clarity

### 2. **Organization**

- Group related types in the same file
- Keep files focused on a single domain
- Export everything through `index.ts`

### 3. **Documentation**

- Add JSDoc comments for complex types
- Include usage examples in comments
- Document breaking changes

### 4. **Versioning**

- Use optional properties for backward compatibility
- Add new properties as optional initially
- Deprecate old properties before removing

## File Integration

### Updated Files

- ✅ `/src/lib/userutils.ts` - Now uses `User` from types
- ✅ `/src/hooks/useHolidays.ts` - Now uses `Holiday` and `UseHolidaysReturn`
  from types
- ✅ `/src/app/holidays/page.tsx` - Updated to import from types
- ✅ `/src/app/employees/page.tsx` - Updated to use centralized `Employee` types
- ✅ `/src/app/employees/[empId]/page.tsx` - Updated to use centralized types

### API Integration

All API routes can now import standardized types:

```typescript
import { Employee, ApiResponse } from '@/types';

export async function GET(): Promise<ApiResponse<Employee[]>> {
  // Implementation
}
```

## Future Enhancements

1. **Runtime Validation**: Add Zod schemas for runtime type checking
2. **API Documentation**: Generate OpenAPI specs from TypeScript types
3. **Database Integration**: Sync types with Prisma schema
4. **Testing**: Use types for test data generation
5. **Code Generation**: Generate forms and components from types

This centralized type system provides a solid foundation for scaling the
application while maintaining type safety and developer productivity.
