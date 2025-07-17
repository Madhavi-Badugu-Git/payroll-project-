import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkUserEmployeeLinks() {
  try {
    console.log('=== Checking Users ===');
    const users = await prisma.user.findMany({
      include: {
        employee: true,
      },
    });

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- User: ${user.email} (ID: ${user.id})`);
      console.log(`  Employee linked: ${user.employee ? 'YES' : 'NO'}`);
      if (user.employee) {
        console.log(
          `  Employee: ${user.employee.employeeNumber} - ${user.employee.firstName} ${user.employee.lastName}`
        );
      }
    });

    console.log('\n=== Checking Employees ===');
    const employees = await prisma.employee.findMany({
      include: {
        user: true,
      },
    });

    console.log(`Found ${employees.length} employees:`);
    employees.forEach(employee => {
      console.log(
        `- Employee: ${employee.employeeNumber} - ${employee.firstName} ${employee.lastName}`
      );
      console.log(`  Email: ${employee.email}`);
      console.log(`  Personal Email: ${employee.personalEmail}`);
      console.log(`  User linked: ${employee.user ? 'YES' : 'NO'}`);
      if (employee.user) {
        console.log(`  User: ${employee.user.email} (ID: ${employee.user.id})`);
      }
    });

    console.log('\n=== Checking for Email Matches ===');
    for (const user of users) {
      const matchingEmployee = await prisma.employee.findFirst({
        where: {
          OR: [{ email: user.email }, { personalEmail: user.email }],
        },
      });

      console.log(
        `User ${user.email} -> Employee match: ${matchingEmployee ? `${matchingEmployee.employeeNumber} (${matchingEmployee.firstName} ${matchingEmployee.lastName})` : 'NONE'}`
      );
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserEmployeeLinks();
