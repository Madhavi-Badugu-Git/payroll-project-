import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

/**
 * Permission constants
 */
export const PERMISSIONS = {
  // User management
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',

  // Employee management
  EMPLOYEES_READ: 'employees:read',
  EMPLOYEES_WRITE: 'employees:write',
  EMPLOYEES_DELETE: 'employees:delete',

  // Attendance
  ATTENDANCE_READ: 'attendance:read',
  ATTENDANCE_WRITE: 'attendance:write',
  ATTENDANCE_APPROVE: 'attendance:approve',

  // Leave management
  LEAVE_READ: 'leave:read',
  LEAVE_CREATE: 'leave:create',
  LEAVE_APPROVE: 'leave:approve',
  LEAVE_DELETE: 'leave:delete',

  // Payroll
  PAYROLL_READ: 'payroll:read',
  PAYROLL_WRITE: 'payroll:write',
  PAYROLL_PROCESS: 'payroll:process',

  // Payslips
  PAYSLIPS_READ: 'payslips:read',
  PAYSLIPS_GENERATE: 'payslips:generate',

  // Promotions
  PROMOTIONS_READ: 'promotions:read',
  PROMOTIONS_WRITE: 'promotions:write',

  // Profile
  PROFILE_READ: 'profile:read',
  PROFILE_WRITE: 'profile:write',

  // System admin
  SYSTEM_ADMIN: '*',
} as const;

/**
 * Check if a user has a specific permission
 */
export async function userHasPermission(userId: string, permission: string): Promise<boolean> {
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

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
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

    const allPermissions = new Set<string>();

    for (const userRole of userRoles) {
      if (!userRole.role) continue;

      const permissions = userRole.role.permissions;

      // If user has wildcard permission, return all permissions
      if (permissions.includes('*')) {
        return Object.values(PERMISSIONS);
      }

      // Add role permissions to the set
      permissions.forEach((permission: string) => allPermissions.add(permission));
    }

    return Array.from(allPermissions);
  } catch (error) {
    console.error(`Error getting permissions for user ${userId}:`, error);
    return [];
  }
}

/**
 * Middleware function to check permissions
 */
export function requirePermission(permission: string) {
  return async (userId: string): Promise<boolean> => {
    return await userHasPermission(userId, permission);
  };
}

/**
 * Check if user is admin (has wildcard permission)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return await userHasPermission(userId, PERMISSIONS.SYSTEM_ADMIN);
}

/**
 * Check multiple permissions (user needs ALL of them)
 */
export async function userHasAllPermissions(
  userId: string,
  permissions: string[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await userHasPermission(userId, permission))) {
      return false;
    }
  }
  return true;
}

/**
 * Check multiple permissions (user needs ANY of them)
 */
export async function userHasAnyPermission(
  userId: string,
  permissions: string[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (await userHasPermission(userId, permission)) {
      return true;
    }
  }
  return false;
}
