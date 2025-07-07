/*
  Warnings:

  - You are about to drop the column `empId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `joiningDate` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `officeEmail` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `empId` on the `EmployeePromotion` table. All the data in the column will be lost.
  - You are about to drop the column `empId` on the `LeaveAccumulation` table. All the data in the column will be lost.
  - You are about to drop the column `empId` on the `LeaveBalance` table. All the data in the column will be lost.
  - You are about to drop the column `empId` on the `LeaveTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `empId` on the `Payslip` table. All the data in the column will be lost.
  - You are about to drop the column `clerkId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[employeeNumber]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeeId,year,month]` on the table `LeaveAccumulation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeeId,year]` on the table `LeaveBalance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeeId,payslipForMonth,year]` on the table `Payslip` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dateOfJoining` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeNumber` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `EmployeePromotion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `LeaveAccumulation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `LeaveBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `LeaveTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `Payslip` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EmployeePromotion" DROP CONSTRAINT "EmployeePromotion_empId_fkey";

-- DropForeignKey
ALTER TABLE "LeaveAccumulation" DROP CONSTRAINT "LeaveAccumulation_empId_fkey";

-- DropForeignKey
ALTER TABLE "LeaveBalance" DROP CONSTRAINT "LeaveBalance_empId_fkey";

-- DropForeignKey
ALTER TABLE "LeaveTransaction" DROP CONSTRAINT "LeaveTransaction_empId_fkey";

-- DropForeignKey
ALTER TABLE "Payslip" DROP CONSTRAINT "Payslip_empId_fkey";

-- DropIndex
DROP INDEX "Employee_empId_key";

-- DropIndex
DROP INDEX "Employee_officeEmail_key";

-- DropIndex
DROP INDEX "LeaveAccumulation_empId_year_month_key";

-- DropIndex
DROP INDEX "LeaveBalance_empId_year_key";

-- DropIndex
DROP INDEX "Payslip_empId_payslipForMonth_year_key";

-- DropIndex
DROP INDEX "User_clerkId_key";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "empId",
DROP COLUMN "joiningDate",
DROP COLUMN "officeEmail",
DROP COLUMN "salary",
ADD COLUMN     "currentSalary" DOUBLE PRECISION,
ADD COLUMN     "dateOfJoining" DATE NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "employeeNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EmployeePromotion" DROP COLUMN "empId",
ADD COLUMN     "employeeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LeaveAccumulation" DROP COLUMN "empId",
ADD COLUMN     "employeeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LeaveBalance" DROP COLUMN "empId",
ADD COLUMN     "employeeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LeaveTransaction" DROP COLUMN "empId",
ADD COLUMN     "employeeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payslip" DROP COLUMN "empId",
ADD COLUMN     "employeeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "clerkId",
DROP COLUMN "imageUrl",
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "hashedPassword" TEXT,
ADD COLUMN     "image" TEXT;

-- CreateTable
CREATE TABLE "Account" (
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

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeNumber_key" ON "Employee"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveAccumulation_employeeId_year_month_key" ON "LeaveAccumulation"("employeeId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_employeeId_year_key" ON "LeaveBalance"("employeeId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_employeeId_payslipForMonth_year_key" ON "Payslip"("employeeId", "payslipForMonth", "year");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePromotion" ADD CONSTRAINT "EmployeePromotion_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveAccumulation" ADD CONSTRAINT "LeaveAccumulation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveTransaction" ADD CONSTRAINT "LeaveTransaction_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
