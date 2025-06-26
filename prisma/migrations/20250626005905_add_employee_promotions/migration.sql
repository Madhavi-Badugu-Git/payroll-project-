-- CreateTable
CREATE TABLE "EmployeePromotion" (
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

-- AddForeignKey
ALTER TABLE "EmployeePromotion" ADD CONSTRAINT "EmployeePromotion_empId_fkey" FOREIGN KEY ("empId") REFERENCES "Employee"("empId") ON DELETE RESTRICT ON UPDATE CASCADE;
