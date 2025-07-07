import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

// Simulate the permission checking functions
async function userHasPermission(userId, permission) {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        isActive: true,
        role: {
          isActive: true,
        },
      },
      include: {
        role: true,
      },
    });

    for (const userRole of userRoles) {
      if (!userRole.role) continue;

      const permissions = userRole.role.permissions;

      // Check for wildcard permission (admin)
      if (permissions.includes('*')) {
        return true;
      }

      // Check for specific permission
      if (permissions.includes(permission)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`Error checking permission ${permission} for user ${userId}:`, error);
    return false;
  }
}

async function testPermissions() {
  try {
    console.log('🔐 Testing Permission System...\n');

    // Get the test user
    const user = await prisma.user.findUnique({
      where: { email: 'sudhasri321@gmail.com' },
    });

    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`✅ Testing permissions for user: ${user.email} (ID: ${user.id})`);

    // Test various permissions
    const permissions = [
      'users:read',
      'users:write',
      'employees:read',
      'attendance:read',
      'leave:create',
      'payslips:read',
      '*', // admin wildcard
    ];

    console.log('\n🔍 Permission test results:');
    for (const permission of permissions) {
      const hasPermission = await userHasPermission(user.id, permission);
      console.log(`  ${permission}: ${hasPermission ? '✅ GRANTED' : '❌ DENIED'}`);
    }

    // Test admin check specifically
    const isAdmin = await userHasPermission(user.id, '*');
    console.log(`\n👑 Is Admin: ${isAdmin ? '✅ YES' : '❌ NO'}`);

    // Get user roles for verification
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        role: true,
      },
    });

    console.log('\n📋 User roles:');
    userRoles.forEach(ur => {
      console.log(`  - ${ur.role.name}: ${ur.role.permissions.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Error testing permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPermissions();
