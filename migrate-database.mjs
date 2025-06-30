#!/usr/bin/env node

/**
 * Comprehensive Prisma Migration Script
 * This script applies all necessary database changes to migrate from Clerk to NextAuth.js
 */

import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function runMigration() {
  console.log('🚀 Starting comprehensive database migration...');

  try {
    // Step 1: Reset migration state
    console.log('📝 Resetting migration state...');
    await prisma.$executeRaw`DROP TABLE IF EXISTS "_prisma_migrations";`;

    // Step 2: Update User table structure
    console.log('👤 Updating User table structure...');

    // Check if clerkId column exists and drop it
    try {
      await prisma.$executeRaw`ALTER TABLE "User" DROP COLUMN IF EXISTS "clerkId";`;
    } catch (_e) {
      console.log("   - clerkId column already removed or doesn't exist");
    }

    // Add NextAuth fields
    const userFields = [
      'ADD COLUMN IF NOT EXISTS "password" TEXT',
      'ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true',
      'ADD COLUMN IF NOT EXISTS "isEmailVerified" BOOLEAN DEFAULT false',
      'ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT',
      'ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT',
      'ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP(3)',
      'ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3)',
    ];

    for (const field of userFields) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ${field};`);
      } catch (_e) {
        console.log(`   - Field already exists: ${field}`);
      }
    }

    // Step 3: Create NextAuth tables
    console.log('🔐 Creating NextAuth tables...');

    // Account table
    await prisma.$executeRaw`
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
    `;

    // Session table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
      );
    `;

    // VerificationToken table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL
      );
    `;

    // Step 4: Create NextAuth indexes
    console.log('📊 Creating NextAuth indexes...');
    const nextAuthIndexes = [
      'CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");',
      'CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");',
      'CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");',
      'CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");',
    ];

    for (const index of nextAuthIndexes) {
      try {
        await prisma.$executeRawUnsafe(index);
      } catch (_e) {
        console.log(`   - Index already exists: ${index.split(' ')[5]}`);
      }
    }

    // Step 5: Add NextAuth foreign keys
    console.log('🔗 Adding NextAuth foreign key constraints...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `;
    } catch (_e) {
      console.log('   - Account foreign key already exists');
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `;
    } catch (_e) {
      console.log('   - Session foreign key already exists');
    }

    // Step 6: Update Employee table
    console.log('👥 Updating Employee table structure...');

    // Check if we need to rename joiningDate to dateOfJoining
    try {
      await prisma.$executeRaw`ALTER TABLE "Employee" RENAME COLUMN "joiningDate" TO "dateOfJoining";`;
    } catch (_e) {
      console.log("   - dateOfJoining column already exists or joiningDate doesn't exist");
    }

    // Add currentSalary if it doesn't exist
    try {
      await prisma.$executeRaw`ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "currentSalary" DOUBLE PRECISION;`;
    } catch (_e) {
      console.log('   - currentSalary column already exists');
    }

    // Update Employee email field if needed (remove officeEmail, use email)
    try {
      await prisma.$executeRaw`ALTER TABLE "Employee" RENAME COLUMN "officeEmail" TO "email";`;
    } catch (_e) {
      console.log("   - email column already exists or officeEmail doesn't exist");
    }

    // Step 7: Ensure all core tables exist
    console.log('🏗️  Ensuring all core tables exist...');

    // This will create tables if they don't exist, but won't affect existing ones
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Holiday" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "date" DATE NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Configuration" (
        "id" TEXT NOT NULL,
        "configKey" TEXT NOT NULL,
        "configValue" TEXT NOT NULL,
        "description" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
      );
    `;

    // Step 8: Recreate important indexes
    console.log('📇 Ensuring all indexes exist...');
    const coreIndexes = [
      'CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");',
      'CREATE UNIQUE INDEX IF NOT EXISTS "Employee_empId_key" ON "Employee"("empId");',
      'CREATE UNIQUE INDEX IF NOT EXISTS "Employee_email_key" ON "Employee"("email");',
      'CREATE UNIQUE INDEX IF NOT EXISTS "Employee_userId_key" ON "Employee"("userId");',
      'CREATE UNIQUE INDEX IF NOT EXISTS "Configuration_configKey_key" ON "Configuration"("configKey");',
    ];

    for (const index of coreIndexes) {
      try {
        await prisma.$executeRawUnsafe(index);
      } catch (_e) {
        console.log(`   - Index already exists: ${index.split(' ')[5]}`);
      }
    }

    // Step 9: Data migration (if needed)
    console.log('📊 Checking for data migration needs...');

    // Check if there are users without passwords
    const usersWithoutPasswords = await prisma.user.count({
      where: {
        OR: [{ password: null }, { password: '' }],
      },
    });

    if (usersWithoutPasswords > 0) {
      console.log(`   - Found ${usersWithoutPasswords} users without passwords`);
      console.log('   - These users will need to reset their passwords');

      // Optionally set a temporary password hash for existing users
      // const tempPasswordHash = '$2a$12$defaulttemporarypasswordhash';
      // await prisma.user.updateMany({
      //   where: { password: null },
      //   data: { password: tempPasswordHash, isActive: false }
      // });
    }

    console.log('✅ Database migration completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('   - Removed Clerk dependencies from User table');
    console.log('   - Added NextAuth.js tables (Account, Session, VerificationToken)');
    console.log('   - Updated User table with authentication fields');
    console.log('   - Updated Employee table structure');
    console.log('   - Ensured all required indexes and constraints exist');

    // Final verification
    console.log('\n🔍 Verifying database state...');
    const userCount = await prisma.user.count();
    const employeeCount = await prisma.employee.count();
    const holidayCount = await prisma.holiday.count();

    console.log(`   - Users: ${userCount}`);
    console.log(`   - Employees: ${employeeCount}`);
    console.log(`   - Holidays: ${holidayCount}`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('\n🎉 Migration script completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
