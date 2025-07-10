import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testUserSync() {
  try {
    console.log('🔍 Testing User-Employee Sync...\n');

    // Find all users with their linked employees
    const users = await prisma.user.findMany({
      include: {
        employee: true,
      },
    });

    console.log(`Found ${users.length} users in database:`);

    for (const user of users) {
      console.log(`\n👤 User: ${user.email} (ID: ${user.id})`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);

      if (user.employee) {
        console.log(
          `   ✅ Linked Employee: ${user.employee.employeeNumber} - ${user.employee.firstName} ${user.employee.lastName}`
        );
        console.log(`   📧 Employee Email: ${user.employee.email || 'N/A'}`);
        console.log(`   📧 Employee Personal Email: ${user.employee.personalEmail || 'N/A'}`);
      } else {
        console.log(`   ❌ No linked employee`);

        // Try to find a matching employee by email
        const matchingEmployee = await prisma.employee.findFirst({
          where: {
            OR: [{ email: user.email }, { personalEmail: user.email }],
          },
        });

        if (matchingEmployee) {
          console.log(
            `   🔗 Found potential match: ${matchingEmployee.employeeNumber} - ${matchingEmployee.firstName} ${matchingEmployee.lastName}`
          );
          if (matchingEmployee.userId) {
            console.log(
              `   ⚠️  But this employee is already linked to user: ${matchingEmployee.userId}`
            );
          }
        } else {
          console.log(`   ❓ No matching employee found for email: ${user.email}`);
        }
      }
    }

    // Find all employees and their linkage status
    console.log('\n\n📋 All Employees and their linkage status:');
    const employees = await prisma.employee.findMany({
      include: {
        user: true,
      },
    });

    for (const employee of employees) {
      console.log(
        `\n👨‍💼 Employee: ${employee.employeeNumber} - ${employee.firstName} ${employee.lastName}`
      );
      console.log(`   📧 Email: ${employee.email || 'N/A'}`);
      console.log(`   📧 Personal Email: ${employee.personalEmail || 'N/A'}`);

      if (employee.user) {
        console.log(`   ✅ Linked to User: ${employee.user.email} (ID: ${employee.user.id})`);
      } else {
        console.log(`   ❌ Not linked to any user`);
      }
    }
  } catch (error) {
    console.error('❌ Error testing user sync:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserSync();
