import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('📊 Current Users in Database:');
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Roles: ${user.userRoles.map(r => r.role.roleName).join(', ') || 'No roles'}`);
      console.log('');
    });

    console.log('📊 Current Employees in Database:');
    const employees = await prisma.employee.findMany({
      select: {
        empId: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
      },
    });

    employees.forEach((employee, index) => {
      console.log(`${index + 1}. ${employee.firstName} ${employee.lastName} (${employee.empId})`);
      console.log(`   Email: ${employee.email}`);
      console.log(`   Status: ${employee.status}`);
      console.log('');
    });

    console.log(`Total Users: ${users.length}`);
    console.log(`Total Employees: ${employees.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
