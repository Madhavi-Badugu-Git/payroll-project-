import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkUserEmployeeMapping() {
  try {
    console.log('🔍 Checking User-Employee mapping...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    console.log('📊 Users in system:');
    users.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.firstName || ''} ${user.lastName || ''} (${user.email}) - ID: ${user.id}`
      );
    });

    console.log('\n📊 Employees in system:');
    const employees = await prisma.employee.findMany({
      select: {
        empId: true,
        firstName: true,
        lastName: true,
        email: true,
        userId: true,
      },
    });

    employees.forEach((employee, index) => {
      console.log(`${index + 1}. ${employee.firstName} ${employee.lastName} (${employee.empId})`);
      console.log(`   Email: ${employee.email}`);
      console.log(`   Linked User ID: ${employee.userId || 'Not linked'}`);
      console.log('');
    });

    console.log('🔗 Checking for email matches between users and employees:');
    for (const user of users) {
      const matchingEmployee = employees.find(emp => emp.email === user.email);
      if (matchingEmployee) {
        console.log(`✅ ${user.email} - User ID: ${user.id}, Employee: ${matchingEmployee.empId}`);
      } else {
        console.log(`❌ ${user.email} - No matching employee found`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserEmployeeMapping();
