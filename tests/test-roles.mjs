import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testRoles() {
  console.log('🧪 Testing role assignments...');

  try {
    // Get all users with their roles
    const users = await prisma.user.findMany({
      include: {
        employee: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    console.log('\n📊 User Role Summary:');
    console.log('====================');

    for (const user of users) {
      console.log(`\n👤 User: ${user.email}`);
      console.log(`   Employee ID: ${user.employee?.empId || 'None'}`);
      console.log(`   Roles: ${user.userRoles.map(ur => ur.role.roleName).join(', ') || 'None'}`);
    }

    // Get all roles and their users
    const roles = await prisma.role.findMany({
      include: {
        userRoles: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log('\n🎭 Role Summary:');
    console.log('================');
    for (const role of roles) {
      console.log(`\n🔖 Role: ${role.roleName}`);
      console.log(`   Description: ${role.description || 'No description'}`);
      console.log(`   Users: ${role.userRoles.length}`);
      if (role.userRoles.length > 0) {
        role.userRoles.forEach(ur => {
          console.log(`     - ${ur.user.email}`);
        });
      }
    }

    console.log('\n✅ Role testing completed!');
  } catch (error) {
    console.error('❌ Error testing roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRoles();
