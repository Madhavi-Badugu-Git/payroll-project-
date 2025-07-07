import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

/**
 * Assign a role to a user
 */
export async function assignRoleToUser(userId: string, roleName: string) {
  try {
    // Find the role by name
    const role = await prisma.role.findUnique({
      where: { name: roleName, isActive: true },
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
      if (existingUserRole.isActive) {
        console.log(`User already has active role: ${roleName}`);
        return existingUserRole;
      } else {
        // Reactivate the role
        const reactivated = await prisma.userRole.update({
          where: { id: existingUserRole.id },
          data: { isActive: true },
        });
        console.log(`✅ Reactivated role '${roleName}' for user ${userId}`);
        return reactivated;
      }
    }

    // Assign the role to the user
    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
        isActive: true,
      },
    });

    console.log(`✅ Assigned role '${roleName}' to user ${userId}`);
    return userRole;
  } catch (error) {
    console.error(`❌ Error assigning role '${roleName}' to user ${userId}:`, error);
    throw error;
  }
}

/**
 * Remove a role from a user (deactivate)
 */
export async function removeRoleFromUser(userId: string, roleName: string) {
  try {
    // Find the role by name
    const role = await prisma.role.findUnique({
      where: { name: roleName, isActive: true },
    });

    if (!role) {
      throw new Error(`Role '${roleName}' not found`);
    }

    // Deactivate the user role instead of deleting
    const updatedUserRole = await prisma.userRole.updateMany({
      where: {
        userId,
        roleId: role.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    console.log(`✅ Removed role '${roleName}' from user ${userId}`);
    return updatedUserRole;
  } catch (error) {
    console.error(`❌ Error removing role '${roleName}' from user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get all active roles for a user
 */
export async function getUserRoles(userId: string) {
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

    return userRoles.map(ur => ur.role);
  } catch (error) {
    console.error(`❌ Error getting roles for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Check if user has a specific role
 */
export async function userHasRole(userId: string, roleName: string): Promise<boolean> {
  try {
    const role = await prisma.role.findUnique({
      where: { name: roleName, isActive: true },
    });

    if (!role) {
      return false;
    }

    const userRole = await prisma.userRole.findFirst({
      where: {
        userId,
        roleId: role.id,
        isActive: true,
      },
    });

    return !!userRole;
  } catch (error) {
    console.error(`❌ Error checking role '${roleName}' for user ${userId}:`, error);
    return false;
  }
}

/**
 * Assign default user role when a new user is created
 */
export async function assignDefaultUserRole(userId: string) {
  return assignRoleToUser(userId, 'user');
}

/**
 * Assign employee role when an employee record is created
 */
export async function assignEmployeeRole(userId: string) {
  return assignRoleToUser(userId, 'employee');
}

/**
 * Get users with a specific role
 */
export async function getUsersWithRole(roleName: string) {
  try {
    const role = await prisma.role.findUnique({
      where: { name: roleName, isActive: true },
      include: {
        userRoles: {
          where: { isActive: true },
          include: {
            user: true,
          },
        },
      },
    });

    if (!role) {
      return [];
    }

    return role.userRoles.map(ur => ur.user);
  } catch (error) {
    console.error(`❌ Error getting users with role '${roleName}':`, error);
    throw error;
  }
}

/**
 * Create default roles if they don't exist
 */
export async function createDefaultRoles() {
  const defaultRoles = [
    {
      name: 'admin',
      description: 'Administrator with full system access',
      permissions: ['*'], // Wildcard for all permissions
    },
    {
      name: 'hr',
      description: 'Human Resources staff',
      permissions: [
        'users:read',
        'users:write',
        'employees:read',
        'employees:write',
        'payroll:read',
      ],
    },
    {
      name: 'manager',
      description: 'Team manager',
      permissions: ['attendance:read', 'leave:approve', 'employees:read'],
    },
    {
      name: 'employee',
      description: 'Regular employee',
      permissions: ['attendance:read', 'leave:create', 'payslips:read'],
    },
    {
      name: 'user',
      description: 'Basic user access',
      permissions: ['profile:read'],
    },
  ];

  for (const roleData of defaultRoles) {
    try {
      const existingRole = await prisma.role.findUnique({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        await prisma.role.create({
          data: roleData,
        });
        console.log(`✅ Created default role: ${roleData.name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating role ${roleData.name}:`, error);
    }
  }
}
