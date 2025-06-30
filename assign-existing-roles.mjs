import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function assignRoleToUser(userId, roleName) {
  try {
    // Find the role by name
    const role = await prisma.role.findUnique({
      where: { roleName },
    });

    if (!role) {
      throw new Error(`Role '${roleName}' not found`);
    }

    // Check if user already has this role
    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
    });

    if (existingUserRole) {
      return existingUserRole;
    }

    // Assign the role to the user
    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
      },
    });

    return userRole;
  } catch (error) {
    throw error;
  }
}

async function assignRolesToExistingUsers() {
  console.log('🔄 Assigning roles to existing users...');

  try {
    // Get all users
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

    console.log(`Found ${users.length} users`);

    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.email}`);

      const existingRoles = user.userRoles.map(ur => ur.role.roleName);
      console.log(`   Current roles: ${existingRoles.join(', ') || 'none'}`);

      // Assign user role if not already assigned
      if (!existingRoles.includes('user')) {
        try {
          await assignRoleToUser(user.id, 'user');
          console.log('   ✅ Assigned user role');
        } catch (error) {
          console.log('   ❌ Error assigning user role:', error.message);
        }
      } else {
        console.log('   ✓ User role already assigned');
      }

      // Assign employee role if user has employee record and role not already assigned
      if (user.employee && !existingRoles.includes('employee')) {
        try {
          await assignRoleToUser(user.id, 'employee');
          console.log('   ✅ Assigned employee role');
        } catch (error) {
          console.log('   ❌ Error assigning employee role:', error.message);
        }
      } else if (user.employee) {
        console.log('   ✓ Employee role already assigned');
      } else {
        console.log('   ⚠️  No employee record found');
      }
    }

    console.log('\n✅ Role assignment completed!');
  } catch (error) {
    console.error('❌ Error assigning roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignRolesToExistingUsers();
