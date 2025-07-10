import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testUserSyncWithRoles() {
  try {
    console.log('🔍 Testing User Sync with Roles...\n');

    // Get the existing user with roles
    const userId = 'cmfbvbkkn00007s16o5tnn1jq'; // Will be dynamically found

    // Find the user first
    const users = await prisma.user.findMany({
      where: { email: 'sudhasri321@gmail.com' },
      include: {
        employee: true,
        userRoles: {
          where: { isActive: true },
          include: {
            role: true,
          },
        },
      },
    });

    if (users.length === 0) {
      console.log('❌ No test user found');
      return;
    }

    const dbUser = users[0];
    console.log(`🔍 Looking up user: ${dbUser.id}`);

    console.log(`✅ Found user: ${dbUser.firstName} ${dbUser.lastName}`);
    console.log(`📧 Email: ${dbUser.email}`);

    // Debug: Log the user data structure
    console.log('🔍 DEBUG: User found in database:', {
      id: dbUser.id,
      email: dbUser.email,
      hasEmployee: !!dbUser.employee,
      hasRoles: dbUser.userRoles.length > 0,
      employeeData: dbUser.employee
        ? {
            id: dbUser.employee.id,
            employeeNumber: dbUser.employee.employeeNumber,
            firstName: dbUser.employee.firstName,
            lastName: dbUser.employee.lastName,
            currentDesignation: dbUser.employee.currentDesignation,
          }
        : null,
      rolesData: dbUser.userRoles.map(ur => ({
        roleName: ur.role.name,
        description: ur.role.description,
        isActive: ur.isActive,
      })),
    });

    // Simulate the linkedEmployee logic from sync-user API
    let linkedEmployee = null;

    if (dbUser.employee) {
      linkedEmployee = {
        id: dbUser.employee.id,
        employeeNumber: dbUser.employee.employeeNumber,
        name: `${dbUser.employee.firstName} ${dbUser.employee.lastName}`,
        designation: dbUser.employee.currentDesignation,
      };

      console.log('🔍 DEBUG: Found linked employee via direct relationship:', linkedEmployee);
    }

    // Extract roles from userRoles
    const roles = dbUser.userRoles.filter(ur => ur.isActive).map(ur => ur.role.name);

    console.log('🔍 DEBUG: Extracted roles:', roles);

    // Simulate the API response
    const response = {
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        imageUrl: dbUser.image,
        roles,
      },
      linkedEmployee,
    };

    console.log('🔍 DEBUG: Final response object:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('❌ Error testing user sync with roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserSyncWithRoles();
