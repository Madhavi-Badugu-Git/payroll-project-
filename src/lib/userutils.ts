interface UserMetadata {
  empId?: string;
  role?: string[];
}

interface UserEmailAddress {
  emailAddress: string;
}

interface User {
  publicMetadata?: UserMetadata;
  privateMetadata?: UserMetadata;
  emailAddresses?: UserEmailAddress[];
}

export const hasAdminRole = (user: User): boolean => {
  const roles = getUserRoles(user);
  return roles.includes('admin');
};

export function getUserRoles(user: User): string[] {
  if (user) {
    const roles = user.publicMetadata?.role as string[];
    return roles || [];
  }

  return [];
}

export function getEmployeeIdFromUser(user: User): string | null {
  if (!user) return null;

  // Option 1: If you store empId in user metadata
  if (user.publicMetadata?.empId) {
    return user.publicMetadata.empId;
  }

  // Option 2: If you store empId in private metadata
  if (user.privateMetadata?.empId) {
    return user.privateMetadata.empId;
  }

  // Option 3: Simple mapping for demo purposes (remove in production)
  const emailToEmpIdMap: { [key: string]: string } = {
    'john.doe@company.com': 'EMP001',
    'jane.smith@company.com': 'EMP002',
    // Add more mappings as needed
  };

  if (user.emailAddresses?.[0]?.emailAddress) {
    return emailToEmpIdMap[user.emailAddresses[0].emailAddress] || null;
  }

  return null;
}
