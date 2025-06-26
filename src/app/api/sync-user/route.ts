import { PrismaClient } from '@/generated/prisma';
import { logDebug, logError, logInfo } from '@/lib/logger';
import { clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      logDebug('User sync request missing userId');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    logDebug(`Attempting to sync user ${userId}`);

    // Get user data from Clerk
    let user;
    try {
      const client = await clerkClient();
      user = await client.users.getUser(userId);
    } catch (clerkError) {
      logError(`Error fetching user from Clerk: ${userId}`, clerkError);
      return NextResponse.json(
        {
          error: 'Failed to fetch user from Clerk',
          details: clerkError instanceof Error ? clerkError.message : 'Unknown Clerk error',
        },
        { status: 500 }
      );
    }

    if (!user) {
      logError(`User not found in Clerk: ${userId}`);
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
    }

    // Check if user has email addresses
    if (!user.emailAddresses || user.emailAddresses.length === 0) {
      logError(`User has no email addresses: ${userId}`);
      return NextResponse.json({ error: 'User has no email addresses' }, { status: 400 });
    }

    // Upsert user in database
    let dbUser;
    try {
      dbUser = await prisma.user.upsert({
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
    } catch (dbError) {
      logError(`Error upserting user in database: ${userId}`, dbError);
      return NextResponse.json(
        {
          error: 'Failed to save user to database',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        },
        { status: 500 }
      );
    }

    // Try to link with employee record by matching email
    let linkedEmployee = null;
    try {
      const employee = await prisma.employee.findUnique({
        where: { officeEmail: dbUser.email },
      });

      if (employee && !employee.userId) {
        // Link the employee with the user
        linkedEmployee = await prisma.employee.update({
          where: { id: employee.id },
          data: { userId: dbUser.id },
        });

        logInfo('Employee linked to user', {
          userId,
          employeeId: employee.id,
          empId: employee.empId,
          email: dbUser.email,
        });
      } else if (employee && employee.userId) {
        logDebug('Employee already linked to another user', {
          employeeId: employee.id,
          existingUserId: employee.userId,
          newUserId: dbUser.id,
        });
      } else {
        logDebug('No employee found with matching email', {
          email: dbUser.email,
        });
      }
    } catch (employeeLinkError) {
      logError(
        `Error linking employee to user for ${userId} with email ${dbUser.email}`,
        employeeLinkError
      );
      // Don't fail the entire sync if employee linking fails
    }

    logInfo('User synced successfully', {
      userId,
      dbUserId: dbUser.id,
      email: dbUser.email,
      isNewUser: dbUser.createdAt.getTime() === dbUser.updatedAt.getTime(),
      linkedEmployee: linkedEmployee
        ? {
            id: linkedEmployee.id,
            empId: linkedEmployee.empId,
            name: `${linkedEmployee.firstName} ${linkedEmployee.lastName}`,
          }
        : null,
    });

    return NextResponse.json({
      success: true,
      user: dbUser,
      linkedEmployee: linkedEmployee
        ? {
            id: linkedEmployee.id,
            empId: linkedEmployee.empId,
            name: `${linkedEmployee.firstName} ${linkedEmployee.lastName}`,
            designation: linkedEmployee.currentDesignation,
          }
        : null,
    });
  } catch (error) {
    logError('Error syncing user', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
