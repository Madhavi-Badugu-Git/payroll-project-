/* eslint-disable @typescript-eslint/no-explicit-any */
export const hasAdminRole = (user: any): boolean => {
  const roles = getUserRoles(user);
  return roles.includes("admin");
};

export function getUserRoles(user: any): string[] {
  if (user) {
    const roles = user.publicMetadata?.role as string[];
    return roles;
  }

  return [];
}
