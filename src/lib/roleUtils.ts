import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

/**
 * Assign a role to a user
 */
export async function assignRoleToUser(userId: string, roleName: string) {
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
      console.log(`User already has role: ${roleName}`);
      return existingUserRole;
    }

    // Assign the role to the user
    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
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
 * Remove a role from a user
 */
export async function removeRoleFromUser(userId: string, roleName: string) {
  try {
    // Find the role by name
    const role = await prisma.role.findUnique({
      where: { roleName },
    });

    if (!role) {
      throw new Error(`Role '${roleName}' not found`);
    }

    // Remove the role from the user
    const deletedUserRole = await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
    });

    console.log(`✅ Removed role '${roleName}' from user ${userId}`);
    return deletedUserRole;
  } catch (error) {
    console.error(`❌ Error removing role '${roleName}' from user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get all roles for a user
 */
export async function getUserRoles(userId: string) {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
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
      where: { roleName },
    });

    if (!role) {
      return false;
    }

    const userRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
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
      where: { roleName },
      include: {
        userRoles: {
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
