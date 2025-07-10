import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function debugAttendance() {
  try {
    console.log('=== Checking Attendance Record ===');
    const attendance = await prisma.attendance.findUnique({
      where: { id: 'cmcdbtozv00030gtfdh5ch4c2' },
    });

    if (attendance) {
      console.log('Attendance record found:');
      console.log(JSON.stringify(attendance, null, 2));

      console.log('\n=== Looking for Employee with empId ===');
      const employeeByEmpId = await prisma.employee.findFirst({
        where: { empId: attendance.employeeId },
      });

      if (employeeByEmpId) {
        console.log('Employee found by empId:');
        console.log(JSON.stringify(employeeByEmpId, null, 2));
      } else {
        console.log('No employee found with empId:', attendance.employeeId);

        console.log('\n=== Checking if employeeId is a user ID ===');
        if (attendance.employeeId.startsWith('user_')) {
          const user = await prisma.user.findUnique({
            where: { clerkId: attendance.employeeId },
            include: { employee: true },
          });

          if (user) {
            console.log('User found:');
            console.log(JSON.stringify(user, null, 2));
          } else {
            console.log('No user found with clerkId:', attendance.employeeId);
          }
        }

        console.log('\n=== Checking employee by userId ===');
        const employeeByUserId = await prisma.employee.findFirst({
          where: { userId: attendance.employeeId },
        });

        if (employeeByUserId) {
          console.log('Employee found by userId:');
          console.log(JSON.stringify(employeeByUserId, null, 2));
        } else {
          console.log('No employee found with userId:', attendance.employeeId);
        }
      }
    } else {
      console.log('Attendance record not found with ID: cmcdbtozv00030gtfdh5ch4c2');
    }

    console.log('\n=== All Employees ===');
    const allEmployees = await prisma.employee.findMany({
      select: { id: true, empId: true, firstName: true, lastName: true, userId: true },
    });
    console.log('All employees:');
    console.log(JSON.stringify(allEmployees, null, 2));

    console.log('\n=== All Users ===');
    const allUsers = await prisma.user.findMany({
      select: { id: true, clerkId: true, email: true },
    });
    console.log('All users:');
    console.log(JSON.stringify(allUsers, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAttendance();
