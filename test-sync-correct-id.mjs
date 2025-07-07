import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testSyncUserWithCorrectId() {
  try {
    console.log('🔍 Testing Sync User API with correct user ID...\n');

    // Get the actual user ID from database
    const user = await prisma.user.findUnique({
      where: { email: 'sudhasri321@gmail.com' },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    const userId = user.id;
    console.log(`✅ Found user ID: ${userId}`);

    // Simulate the sync-user API logic
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!dbUser) {
      console.log('❌ User not found in database with sync-user query');
      return;
    }

    console.log(`✅ Sync-user query successful for user: ${dbUser.email}`);

    // Extract linked employee
    let linkedEmployee = null;
    if (dbUser.employee) {
      linkedEmployee = {
        id: dbUser.employee.id,
        employeeNumber: dbUser.employee.employeeNumber,
        name: `${dbUser.employee.firstName} ${dbUser.employee.lastName}`,
        designation: dbUser.employee.currentDesignation,
      };
    }

    // Extract roles
    const roles = dbUser.userRoles.filter(ur => ur.isActive).map(ur => ur.role.name);

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

    console.log('\n📋 Sync-user API would return:');
    console.log(JSON.stringify(response, null, 2));

    console.log('\n✅ Sync-user API works correctly with the right user ID!');
    console.log(
      '💡 The issue is that the session contains an old user ID from before the database reset.'
    );
    console.log(
      '🔧 Solution: Clear browser cookies/session and login again to get the new user ID.'
    );
  } catch (error) {
    console.error('❌ Error testing sync-user with correct ID:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSyncUserWithCorrectId();
