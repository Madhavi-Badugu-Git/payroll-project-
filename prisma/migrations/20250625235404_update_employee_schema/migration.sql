/*
  Warnings:

  - You are about to drop the column `designation` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNo` on the `Employee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[officeEmail]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currentDesignation` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employmentType` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobileNo` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `officeEmail` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stream` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new columns with default values
ALTER TABLE "Employee" 
ADD COLUMN "currentDesignation" TEXT,
ADD COLUMN "employmentType" TEXT,
ADD COLUMN "exitDate" DATE,
ADD COLUMN "firstName" TEXT,
ADD COLUMN "githubUserId" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "linkedinId" TEXT,
ADD COLUMN "mobileNo" TEXT,
ADD COLUMN "officeEmail" TEXT,
ADD COLUMN "personalEmail" TEXT,
ADD COLUMN "stream" TEXT;

-- Step 2: Migrate existing data
UPDATE "Employee" SET 
  "firstName" = SPLIT_PART("name", ' ', 1),
  "lastName" = COALESCE(NULLIF(SPLIT_PART("name", ' ', 2), ''), 'N/A'),
  "officeEmail" = "email",
  "personalEmail" = "email",
  "mobileNo" = "phoneNo",
  "currentDesignation" = "designation",
  "employmentType" = 'Full-time',
  "stream" = 'Engineering';

-- Step 3: Make required columns NOT NULL
ALTER TABLE "Employee" 
ALTER COLUMN "currentDesignation" SET NOT NULL,
ALTER COLUMN "employmentType" SET NOT NULL,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "mobileNo" SET NOT NULL,
ALTER COLUMN "officeEmail" SET NOT NULL,
ALTER COLUMN "stream" SET NOT NULL;

-- Step 4: Drop old columns and constraints
DROP INDEX "Employee_email_key";
ALTER TABLE "Employee" 
DROP COLUMN "designation",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "phoneNo";

-- Step 5: Create new unique constraint
CREATE UNIQUE INDEX "Employee_officeEmail_key" ON "Employee"("officeEmail");
