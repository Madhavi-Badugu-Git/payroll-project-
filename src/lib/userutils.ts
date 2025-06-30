import { User } from 'next-auth';
import { getUserRoles as getUserRolesFromDB, userHasRole } from './roleUtils';

export const hasAdminRole = async (user: User): Promise<boolean> => {
  if (!user.id) return false;

  // Check if user has admin role in the database
  const isAdmin = await userHasRole(user.id, 'admin');
  if (isAdmin) return true;

  // Fallback: check if the user has an admin designation or specific admin criteria
  if (user.employee?.currentDesignation) {
    const adminDesignations = ['CEO', 'CTO', 'HR Manager', 'Admin', 'Director'];
    const hasAdminDesignation = adminDesignations.some(designation =>
      user.employee?.currentDesignation.toLowerCase().includes(designation.toLowerCase())
    );
    if (hasAdminDesignation) return true;
  }

  // Fallback: check if email contains admin indicators (temporary solution)
  if (user.email) {
    return user.email.toLowerCase().includes('admin') || user.email.toLowerCase().includes('hr');
  }

  return false;
};

export async function getUserRolesAsync(user: User): Promise<string[]> {
  if (!user.id) return [];

  try {
    const roles = await getUserRolesFromDB(user.id);
    return roles.map(role => role.roleName);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
}

export async function hasRole(user: User, roleName: string): Promise<boolean> {
  if (!user.id) return false;
  return userHasRole(user.id, roleName);
}

export async function isEmployee(user: User): Promise<boolean> {
  return hasRole(user, 'employee');
}

export async function isManager(user: User): Promise<boolean> {
  return hasRole(user, 'manager');
}

export function getUserRoles(user: User): string[] {
  const roles: string[] = [];

  // This is the legacy function - keeping for backward compatibility
  // But recommend using getUserRolesAsync for database-based roles

  if (user.employee) {
    roles.push('employee');
  }

  return roles;
}

export function getEmployeeIdFromUser(user: User): string | null {
  if (!user) return null;

  // Get empId from employee relation
  if (user.employee?.empId) {
    return user.employee.empId;
  }

  return null;
}
