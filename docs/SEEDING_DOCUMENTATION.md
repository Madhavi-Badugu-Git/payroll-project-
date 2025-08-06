# Database Seeding Documentation

## Overview

This document describes the seeded data in the Trinits Technologies Payroll
System database.

## Seeded Data

### 1. Roles and Permissions

#### **User Role**

- **Name**: `user`
- **Description**: Basic user with limited access to the system
- **Permissions** (2):
  - `view_profile` - View own profile
  - `edit_profile` - Edit own profile

#### **Employee Role**

- **Name**: `employee`
- **Description**: Employee with access to leave management and attendance
- **Permissions** (7):
  - `view_profile` - View own profile
  - `edit_profile` - Edit own profile
  - `view_leaves` - View own leaves
  - `create_leave` - Create leave requests
  - `view_attendance` - View own attendance
  - `view_holidays` - View company holidays
  - `view_documents` - View documents

#### **Manager Role**

- **Name**: `manager`
- **Description**: Manager with team management capabilities
- **Permissions** (11):
  - `view_profile` - View own profile
  - `edit_profile` - Edit own profile
  - `view_leaves` - View own leaves
  - `create_leave` - Create leave requests
  - `approve_leave` - Approve team member leaves
  - `view_team_leaves` - View team leaves
  - `view_attendance` - View own attendance
  - `view_team_attendance` - View team attendance
  - `view_holidays` - View company holidays
  - `view_documents` - View documents
  - `view_reports` - View reports

#### **Admin Role**

- **Name**: `admin`
- **Description**: Administrator with full system access
- **Permissions** (19):
  - All employee and manager permissions, plus:
  - `manage_leaves` - Full leave management
  - `manage_attendance` - Full attendance management
  - `manage_holidays` - Manage company holidays
  - `manage_documents` - Manage documents
  - `manage_reports` - Manage reports
  - `manage_users` - User management
  - `manage_roles` - Role management
  - `manage_employees` - Employee management
  - `manage_configurations` - System configuration
  - `full_system_access` - Complete system access

### 2. Super User Account

#### **Administrator Account**

- **Email**: `admin@trinitstechnologies.com`
- **Name**: Super Admin
- **Default Password**: `admin123`
- **Role**: Admin (full system access)
- **Status**: Active

> **⚠️ Security Note**: Please change the default password after first login!

### 3. Company Holidays (2025)

The following holidays are pre-configured:

- **January 1, 2025** - New Year
- **January 14, 2025** - Pongal
- **March 31, 2025** - Ramzan Id/Eid-ul-Fitar
- **May 1, 2025** - May Day
- **August 15, 2025** - Independence Day
- **August 27, 2025** - Vinayaka Chavithi
- **October 2, 2025** - Gandhi Jayanthi/Dussehra
- **October 20, 2025** - Deepavali
- **December 25, 2025** - Christmas

### 4. System Configurations

- **EMPLOYEE_ID_PREFIX**: `TRINITS` - Prefix for employee IDs
- **SANCTIONED_LEAVE_PER_YEAR**: `24` - Annual leave quota
- **WORKING_HOURS_PER_DAY**: `8` - Standard work hours
- **OVERTIME_THRESHOLD**: `8.5` - Hours after which overtime applies

## Usage Instructions

### First Time Login

1. Navigate to the login page: `http://localhost:3000/payroll/auth/signin`
2. Use credentials:
   - **Email**: `admin@trinitstechnologies.com`
   - **Password**: `admin123`
3. **Important**: Change the password immediately after login

### Running the Seed Script

To re-run the seeding process:

```bash
npx tsx prisma/seed.ts
```

### Database Management

- View data: `npx prisma studio`
- Reset database: `npx prisma db push --force-reset`
- Generate client: `npx prisma generate`

## Role-Based Access Control

The system uses a flexible role-based permission system where:

- Each user can have multiple roles
- Each role has specific permissions
- Permissions control access to features and data
- The admin role has complete system access

## Next Steps

1. **Change Default Password**: Update the super user password
2. **Create Additional Users**: Add more users as needed
3. **Assign Roles**: Configure user roles based on responsibilities
4. **Customize Permissions**: Modify role permissions as needed
5. **Add Employees**: Create employee records linked to users

## Support

For questions about the seeded data or system setup, contact the development
team.
