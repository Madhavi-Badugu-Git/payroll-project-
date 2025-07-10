import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testSyncUserLogic() {
  try {
    console.log('🔍 Testing Sync User Logic...\n');

    // Get the existing user
    const userId = 'cmcsijsv700000gtgct4ohk72'; // The user ID from our previous test

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

    // Debug: Log the user data structure
    console.log('🔍 DEBUG: User found in database:', {
      id: dbUser.id,
      email: dbUser.email,
      hasEmployee: !!dbUser.employee,
      employeeData: dbUser.employee
        ? {
            id: dbUser.employee.id,
            employeeNumber: dbUser.employee.employeeNumber,
            firstName: dbUser.employee.firstName,
            lastName: dbUser.employee.lastName,
            currentDesignation: dbUser.employee.currentDesignation,
          }
        : null,
    });

    // Simulate the linkedEmployee logic from sync-user API
    let linkedEmployee = null;

    // First, check if the user already has a directly linked employee
    if (dbUser.employee) {
      linkedEmployee = {
        id: dbUser.employee.id,
        employeeNumber: dbUser.employee.employeeNumber,
        name: `${dbUser.employee.firstName} ${dbUser.employee.lastName}`,
        designation: dbUser.employee.currentDesignation,
      };

      console.log('🔍 DEBUG: Found linked employee via direct relationship:', linkedEmployee);
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
        console.log('🔗 Found unlinked employee by email:', {
          id: employee.id,
          employeeNumber: employee.employeeNumber,
          email: employee.email,
        });
      } else {
        console.log('❓ No unlinked employee found with matching email');
      }
    }

    console.log('🔍 DEBUG: Final linkedEmployee:', linkedEmployee);

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

    console.log('🔍 DEBUG: Final response object:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('❌ Error testing sync user logic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSyncUserLogic();
