-- Migration: Remove Clerk and Add NextAuth.js Support
-- This migration consolidates all changes needed to migrate from Clerk to NextAuth.js

-- Drop existing migrations state to start fresh
DROP TABLE IF EXISTS "_prisma_migrations";

-- Step 1: Update User table - Remove Clerk fields and add NextAuth fields
ALTER TABLE "User" DROP COLUMN IF EXISTS "clerkId";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isEmailVerified" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);

-- Step 2: Create NextAuth.js required tables
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- Step 3: Create indexes for NextAuth tables
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- Step 4: Add foreign key constraints for NextAuth tables
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Update Employee table to use proper field names
ALTER TABLE "Employee" RENAME COLUMN "joiningDate" TO "dateOfJoining";
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "currentSalary" DOUBLE PRECISION;

-- Step 6: Ensure all required tables exist with proper structure
CREATE TABLE IF NOT EXISTS "Attendance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "totalHours" DOUBLE PRECISION,
    "overtimeHours" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Holiday" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Employee" (
    "id" TEXT NOT NULL,
    "empId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobileNo" TEXT,
    "dateOfBirth" DATE,
    "currentSalary" DOUBLE PRECISION,
    "dateOfJoining" DATE NOT NULL,
    "exitDate" DATE,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "currentDesignation" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL DEFAULT 'Full-time',
    "stream" TEXT NOT NULL DEFAULT 'Engineering',
    "githubUserId" TEXT,
    "linkedinId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AttendanceRegularization" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestedCheckIn" TIMESTAMP(3),
    "requestedCheckOut" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRegularization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeaveApplication" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "leaveType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,

    CONSTRAINT "LeaveApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Configuration" (
    "id" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "configValue" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EmployeePromotion" (
    "id" TEXT NOT NULL,
    "empId" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "revisionDate" DATE NOT NULL,
    "currentPosition" TEXT NOT NULL,
    "previousPosition" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeePromotion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeaveBalance" (
    "id" TEXT NOT NULL,
    "empId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalAllocated" DOUBLE PRECISION NOT NULL,
    "totalUsed" DOUBLE PRECISION NOT NULL,
    "totalAvailable" DOUBLE PRECISION NOT NULL,
    "carryForward" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeaveAccumulation" (
    "id" TEXT NOT NULL,
    "empId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "monthName" TEXT NOT NULL,
    "allocatedDays" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "accumulationDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveAccumulation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeaveTransaction" (
    "id" TEXT NOT NULL,
    "empId" TEXT NOT NULL,
    "leaveApplicationId" TEXT,
    "transactionType" TEXT NOT NULL,
    "days" DOUBLE PRECISION NOT NULL,
    "balanceBefore" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "transactionDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveTransaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Payslip" (
    "id" TEXT NOT NULL,
    "empId" TEXT NOT NULL,
    "payslipForMonth" TEXT NOT NULL,
    "payslipDate" DATE NOT NULL,
    "location" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "doj" DATE NOT NULL,
    "gradeBand" TEXT NOT NULL,
    "attendedDays" INTEGER NOT NULL,
    "arrearDays" INTEGER NOT NULL DEFAULT 0,
    "daysInMonth" INTEGER NOT NULL,
    "basic" DOUBLE PRECISION NOT NULL,
    "hra" DOUBLE PRECISION NOT NULL,
    "specialAllowance" DOUBLE PRECISION NOT NULL,
    "lta" DOUBLE PRECISION NOT NULL,
    "totalSalary" DOUBLE PRECISION NOT NULL,
    "providentFund" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "professionalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "incomeTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- Step 7: Create all required indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_employeeId_date_key" ON "Attendance"("employeeId", "date");
CREATE UNIQUE INDEX IF NOT EXISTS "Employee_empId_key" ON "Employee"("empId");
CREATE UNIQUE INDEX IF NOT EXISTS "Employee_email_key" ON "Employee"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Employee_userId_key" ON "Employee"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Configuration_configKey_key" ON "Configuration"("configKey");
CREATE UNIQUE INDEX IF NOT EXISTS "LeaveBalance_empId_year_key" ON "LeaveBalance"("empId", "year");
CREATE UNIQUE INDEX IF NOT EXISTS "LeaveAccumulation_empId_year_month_key" ON "LeaveAccumulation"("empId", "year", "month");
CREATE UNIQUE INDEX IF NOT EXISTS "Payslip_empId_payslipForMonth_year_key" ON "Payslip"("empId", "payslipForMonth", "year");

-- Step 8: Add all foreign key constraints
ALTER TABLE "Employee" ADD CONSTRAINT IF NOT EXISTS "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AttendanceRegularization" ADD CONSTRAINT IF NOT EXISTS "AttendanceRegularization_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AttendanceRegularization" ADD CONSTRAINT IF NOT EXISTS "AttendanceRegularization_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaveApplication" ADD CONSTRAINT IF NOT EXISTS "LeaveApplication_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmployeePromotion" ADD CONSTRAINT IF NOT EXISTS "EmployeePromotion_empId_fkey" FOREIGN KEY ("empId") REFERENCES "Employee"("empId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaveBalance" ADD CONSTRAINT IF NOT EXISTS "LeaveBalance_empId_fkey" FOREIGN KEY ("empId") REFERENCES "Employee"("empId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaveAccumulation" ADD CONSTRAINT IF NOT EXISTS "LeaveAccumulation_empId_fkey" FOREIGN KEY ("empId") REFERENCES "Employee"("empId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaveTransaction" ADD CONSTRAINT IF NOT EXISTS "LeaveTransaction_empId_fkey" FOREIGN KEY ("empId") REFERENCES "Employee"("empId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaveTransaction" ADD CONSTRAINT IF NOT EXISTS "LeaveTransaction_leaveApplicationId_fkey" FOREIGN KEY ("leaveApplicationId") REFERENCES "LeaveApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payslip" ADD CONSTRAINT IF NOT EXISTS "Payslip_empId_fkey" FOREIGN KEY ("empId") REFERENCES "Employee"("empId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 9: Migrate any existing data (update this based on your existing data structure)
-- If you have existing users without passwords, you might want to set temporary passwords
-- UPDATE "User" SET "password" = '$2a$12$defaulthashedpassword' WHERE "password" IS NULL;

-- Step 10: Make password field required for new users (optional - depends on your needs)
-- ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;
