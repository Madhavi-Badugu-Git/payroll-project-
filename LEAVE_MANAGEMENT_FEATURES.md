# Leave Management System - New Features

## 🎉 Recently Added Features

### 1. Enhanced Leave Balance Checking

- **Automatic Balance Validation**: Leave applications now check if the employee
  has sufficient leave balance before creation
- **Real-time Balance Display**: Users can see their current leave balance when
  applying for leave
- **Insufficient Balance Alerts**: Clear error messages when trying to apply for
  more leave than available

### 2. Email Notifications System

- **Application Notifications**: Admins receive email alerts when employees
  apply for leave
- **Decision Notifications**: Employees receive email confirmations when their
  leave is approved/rejected
- **Low Balance Alerts**: Automatic alerts when leave balance drops below 5 days

#### Email Configuration

Add these environment variables to enable email notifications:

```bash
RESEND_API_KEY=your_resend_api_key_here
EMAIL_NOTIFICATIONS_ENABLED=true
FROM_EMAIL=noreply@yourcompany.com
ADMIN_EMAIL=admin@yourcompany.com
```

### 3. Leave Reports & Data Export

- **Comprehensive Reports**: Generate detailed leave reports with filters
- **Excel Export**: Download leave data in Excel format for analysis
- **Multiple Filters**: Filter by date range, employee, year, etc.

#### API Endpoints

- `GET /api/reports/leave?format=json` - JSON format report
- `GET /api/reports/leave?format=excel` - Excel download
- `GET /api/reports/leave?year=2024&empId=EMP001` - Filtered reports

### 4. Automated Leave Management

- **Monthly Allocation**: Automatic monthly leave allocation via cron jobs
- **Year-end Carry Forward**: Handle leave carry-forward at year-end
- **Pro-rata Calculation**: Automatic calculation of leave entitlement based on
  joining date

#### Cron Job Endpoints

- `POST /api/cron/leave-tasks` - Execute scheduled leave tasks
  - `monthly-allocation` - Process monthly leave allocation
  - `year-end-carry-forward` - Handle year-end carry forward

## 🔧 Technical Implementation

### Database Schema

- `LeaveBalance` - Tracks annual leave balance per employee
- `LeaveAccumulation` - Records monthly leave allocations
- `LeaveTransaction` - Logs all leave balance changes
- `LeaveApplication` - Stores leave applications with enhanced tracking

### Services

- `LeaveManagementService` - Core leave management logic
- `EmailService` - Email notification handling
- Enhanced API endpoints with proper error handling and logging

### Frontend Features

- **Enhanced Leave UI** (`/leaves-enhanced`) - Comprehensive leave management
  interface
- **Admin Dashboard** (`/admin/leave-management`) - Administrative leave
  management
- **Real-time Balance Display** - Shows current balance and accumulation history
- **Transaction History** - Detailed view of all leave transactions

## 🚀 Usage

### For Employees

1. Visit `/leaves-enhanced` to manage your leave
2. Apply for leave with automatic balance checking
3. View your leave balance and transaction history
4. Receive email notifications for leave decisions

### For Administrators

1. Visit `/admin/leave-management` for admin functions
2. Process monthly leave allocations
3. Handle year-end carry forwards
4. Generate and export leave reports
5. Receive email notifications for new applications

### For Developers

1. Set up email configuration in environment variables
2. Use cron jobs for automated leave tasks
3. Extend the reporting system with custom filters
4. Add new notification types as needed

## 🔐 Security Features

- **Admin Role Validation**: Proper authorization for administrative functions
- **Employee Data Protection**: Employees can only view their own data
- **Secure API Endpoints**: All endpoints properly authenticated
- **Audit Trail**: Complete transaction logging for compliance

## 📊 Reporting Capabilities

- Employee-wise leave summary
- Department-wise leave analysis
- Leave type breakdown
- Trend analysis by date ranges
- Balance utilization reports

The leave management system is now feature-complete with comprehensive
functionality for both employees and administrators!
