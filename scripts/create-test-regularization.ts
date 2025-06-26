// Test script to create sample regularization requests
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function createTestData() {
  try {
    // Get some employees
    const employees = await prisma.employee.findMany({
      take: 3,
    });

    if (employees.length === 0) {
      console.log('No employees found. Please run the seed script first.');
      return;
    }

    // Create some attendance records and regularization requests
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      const date = new Date(yesterday);
      date.setDate(date.getDate() - i);

      // Create attendance record
      const attendance = await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          date: date,
          checkIn: null,
          checkOut: null,
          status: 'Absent',
          totalHours: null,
          overtimeHours: null,
        },
      });

      // Create regularization request
      const checkInTime = new Date(date);
      checkInTime.setHours(9, 0, 0, 0);
      const checkOutTime = new Date(date);
      checkOutTime.setHours(18, 0, 0, 0);

      await prisma.attendanceRegularization.create({
        data: {
          attendanceId: attendance.id,
          employeeId: employee.id,
          date: date,
          reason: `Forgot to mark attendance on ${date.toDateString()}. Was working from office.`,
          status: 'Pending',
          requestedCheckIn: checkInTime,
          requestedCheckOut: checkOutTime,
        },
      });

      console.log(
        `Created regularization request for ${employee.firstName} ${employee.lastName} (${employee.empId})`
      );
    }

    console.log('Test data created successfully!');
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
