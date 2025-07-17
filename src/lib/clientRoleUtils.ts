// Client-side role utilities that use Redux/session data instead of PrismaClient
import { User } from '@/store/userSlice';

export const hasAdminRoleClient = (user: User | null): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.includes('admin');
};

export const hasEmployeeRoleClient = (user: User | null): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.includes('employee');
};

export const hasManagerRoleClient = (user: User | null): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.includes('manager');
};

export const hasRoleClient = (user: User | null, roleName: string): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.includes(roleName);
};

export const getUserRolesClient = (user: User | null): string[] => {
  if (!user || !user.roles) return [];
  return user.roles;
};

export const hasAnyRoleClient = (user: User | null, roleNames: string[]): boolean => {
  if (!user || !user.roles) return false;
  return roleNames.some(role => user.roles!.includes(role));
};
