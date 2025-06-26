-- CreateTable
CREATE TABLE "LeaveBalance" (
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

-- CreateTable
CREATE TABLE "LeaveAccumulation" (
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

-- CreateTable
CREATE TABLE "LeaveTransaction" (
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

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_empId_year_key" ON "LeaveBalance"("empId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveAccumulation_empId_year_month_key" ON "LeaveAccumulation"("empId", "year", "month");

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_empId_fkey" FOREIGN KEY ("empId") REFERENCES "Employee"("empId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveAccumulation" ADD CONSTRAINT "LeaveAccumulation_empId_fkey" FOREIGN KEY ("empId") REFERENCES "Employee"("empId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveTransaction" ADD CONSTRAINT "LeaveTransaction_empId_fkey" FOREIGN KEY ("empId") REFERENCES "Employee"("empId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveTransaction" ADD CONSTRAINT "LeaveTransaction_leaveApplicationId_fkey" FOREIGN KEY ("leaveApplicationId") REFERENCES "LeaveApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
