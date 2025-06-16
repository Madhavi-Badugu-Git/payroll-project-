import { clerkClient } from '@clerk/nextjs/server';

export async function setUserRole(userId: string, role: 'employee' | 'admin') {
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });
}

export async function getUserRole(userId: string): Promise<string | undefined> {
  const user = await clerkClient.users.getUser(userId);
  return user.publicMetadata.role as string | undefined;
}