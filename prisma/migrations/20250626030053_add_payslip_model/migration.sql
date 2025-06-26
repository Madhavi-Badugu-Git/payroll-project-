-- CreateTable
CREATE TABLE "Payslip" (
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

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_empId_payslipForMonth_year_key" ON "Payslip"("empId", "payslipForMonth", "year");

-- AddForeignKey
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_empId_fkey" FOREIGN KEY ("empId") REFERENCES "Employee"("empId") ON DELETE RESTRICT ON UPDATE CASCADE;
