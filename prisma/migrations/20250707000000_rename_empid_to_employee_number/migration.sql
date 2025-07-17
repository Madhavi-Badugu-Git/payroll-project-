-- Rename empId to employeeNumber and fix foreign key relationships

-- Step 1: Rename empId column to employeeNumber in Employee table
ALTER TABLE "Employee" RENAME COLUMN "empId" TO "employeeNumber";

-- Step 2: Update foreign key relationships to use Employee.id instead of Employee.empId
-- Drop existing foreign key constraints that reference empId
ALTER TABLE "EmployeePromotion" DROP CONSTRAINT IF EXISTS "EmployeePromotion_empId_fkey";
ALTER TABLE "LeaveBalance" DROP CONSTRAINT IF EXISTS "LeaveBalance_empId_fkey";
ALTER TABLE "LeaveAccumulation" DROP CONSTRAINT IF EXISTS "LeaveAccumulation_empId_fkey";
ALTER TABLE "LeaveTransaction" DROP CONSTRAINT IF EXISTS "LeaveTransaction_empId_fkey";
ALTER TABLE "Payslip" DROP CONSTRAINT IF EXISTS "Payslip_empId_fkey";

-- Step 3: Rename empId columns to employeeId in related tables
ALTER TABLE "EmployeePromotion" RENAME COLUMN "empId" TO "employeeId";
ALTER TABLE "LeaveBalance" RENAME COLUMN "empId" TO "employeeId";
ALTER TABLE "LeaveAccumulation" RENAME COLUMN "empId" TO "employeeId";
ALTER TABLE "LeaveTransaction" RENAME COLUMN "empId" TO "employeeId";
ALTER TABLE "Payslip" RENAME COLUMN "empId" TO "employeeId";

-- Step 4: Drop old unique indexes
DROP INDEX IF EXISTS "Employee_empId_key";
DROP INDEX IF EXISTS "LeaveBalance_empId_year_key";
DROP INDEX IF EXISTS "LeaveAccumulation_empId_year_month_key";
DROP INDEX IF EXISTS "Payslip_empId_payslipForMonth_year_key";

-- Step 5: Create new unique indexes
CREATE UNIQUE INDEX "Employee_employeeNumber_key" ON "Employee"("employeeNumber");
CREATE UNIQUE INDEX "LeaveBalance_employeeId_year_key" ON "LeaveBalance"("employeeId", "year");
CREATE UNIQUE INDEX "LeaveAccumulation_employeeId_year_month_key" ON "LeaveAccumulation"("employeeId", "year", "month");
CREATE UNIQUE INDEX "Payslip_employeeId_payslipForMonth_year_key" ON "Payslip"("employeeId", "payslipForMonth", "year");

-- Step 6: Add new foreign key constraints referencing Employee.id
ALTER TABLE "EmployeePromotion" ADD CONSTRAINT "EmployeePromotion_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaveAccumulation" ADD CONSTRAINT "LeaveAccumulation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LeaveTransaction" ADD CONSTRAINT "LeaveTransaction_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
