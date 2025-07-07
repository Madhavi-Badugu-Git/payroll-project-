import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testUserSyncLogic() {
  try {
    console.log('🔄 Testing User Sync API Logic...\n');

    const userId = 'cmcsijsv700000gtgct4ohk72'; // The user ID from our previous test

    // Simulate the user-sync API logic
    console.log(`🔍 Looking up user: ${userId}`);

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: true,
      },
    });

    if (!dbUser) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ Found user: ${dbUser.firstName} ${dbUser.lastName}`);
    console.log(`📧 Email: ${dbUser.email}`);

    // Try to find a linked employee
    let linkedEmployee = null;

    // First, check if the user already has a directly linked employee
    if (dbUser.employee) {
      linkedEmployee = {
        id: dbUser.employee.id,
        employeeNumber: dbUser.employee.employeeNumber,
        name: `${dbUser.employee.firstName} ${dbUser.employee.lastName}`,
        designation: dbUser.employee.currentDesignation,
      };

      console.log('✅ Employee found via direct relationship:');
      console.log(`   ID: ${linkedEmployee.id}`);
      console.log(`   Employee Number: ${linkedEmployee.employeeNumber}`);
      console.log(`   Name: ${linkedEmployee.name}`);
      console.log(`   Designation: ${linkedEmployee.designation}`);
    } else {
      console.log('❌ No direct employee relationship found');

      // Fallback: try to find an employee by matching email
      const employee = await prisma.employee.findFirst({
        where: {
          OR: [{ email: dbUser.email }, { personalEmail: dbUser.email }],
          userId: null, // Only consider unlinked employees
        },
      });

      if (employee) {
        console.log('🔗 Found unlinked employee by email, linking...');

        // Link the employee to the user
        await prisma.employee.update({
          where: { id: employee.id },
          data: { userId: dbUser.id },
        });

        linkedEmployee = {
          id: employee.id,
          employeeNumber: employee.employeeNumber,
          name: `${employee.firstName} ${employee.lastName}`,
          designation: employee.currentDesignation,
        };

        console.log('✅ Employee linked successfully:');
        console.log(`   ID: ${linkedEmployee.id}`);
        console.log(`   Employee Number: ${linkedEmployee.employeeNumber}`);
        console.log(`   Name: ${linkedEmployee.name}`);
        console.log(`   Designation: ${linkedEmployee.designation}`);
      } else {
        console.log('❌ No unlinked employee found with matching email');
      }
    }

    // Simulate the API response
    const response = {
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        imageUrl: dbUser.image,
        roles: [],
      },
      linkedEmployee,
    };

    console.log('\n📋 User Sync API Response:');
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('❌ Error testing user sync logic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserSyncLogic();
