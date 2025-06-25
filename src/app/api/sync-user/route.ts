import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { logError, logInfo, logDebug } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      logDebug('User sync request missing userId');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    logDebug(`Attempting to sync user ${userId}`);

    // Get user data from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    if (!user) {
      logError(`User not found in Clerk: ${userId}`);
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
    }

    // Upsert user in database
    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
      create: {
        clerkId: userId,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
    });

    logInfo('User synced successfully', {
      userId,
      dbUserId: dbUser.id,
      email: dbUser.email,
      isNewUser: dbUser.createdAt.getTime() === dbUser.updatedAt.getTime(),
    });

    return NextResponse.json({
      success: true,
      user: dbUser,
    });
  } catch (error) {
    logError('Error syncing user', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
