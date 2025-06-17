-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "empId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "joiningDate" DATE NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_empId_key" ON "Employee"("empId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
