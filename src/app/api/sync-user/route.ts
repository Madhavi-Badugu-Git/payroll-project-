import { PrismaClient } from '@/generated/prisma';
import { authOptions } from '@/lib/auth/config';
import { logDebug, logError, logInfo } from '@/lib/logger';
import { UserSyncResponse } from '@/store/userSlice';
import { getServerSession } from 'next-auth/next';
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

    // Get the session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      logError('User sync request without valid session');
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 });
    }

    // Validate that the userId matches the session user
    if (userId !== session.user.id) {
      logError(`User ID mismatch: session=${session.user.id}, requested=${userId}`);
      return NextResponse.json({ error: 'Unauthorized - User ID mismatch' }, { status: 401 });
    }

    // Find the user in the database with roles
    let dbUser;
    try {
      dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!dbUser) {
        logError(`User not found in database: ${userId}`);
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
      }
    } catch (dbError) {
      logError(`Database error while fetching user: ${userId}`, dbError);
      return NextResponse.json({ error: 'Database error while fetching user' }, { status: 500 });
    }

    // Try to find a linked employee by matching email
    let linkedEmployee = null;
    try {
      const employee = await prisma.employee.findFirst({
        where: {
          OR: [{ email: dbUser.email }, { personalEmail: dbUser.email }],
        },
      });

      if (employee) {
        linkedEmployee = {
          id: employee.id,
          empId: employee.empId,
          name: `${employee.firstName} ${employee.lastName}`,
          designation: employee.currentDesignation,
        };

        logInfo('Employee found for user', {
          userId,
          employeeId: employee.id,
          empId: employee.empId,
          email: dbUser.email,
        });
      } else {
        logDebug('No employee found with matching email', {
          email: dbUser.email,
        });
      }
    } catch (employeeLinkError) {
      logError(
        `Error finding employee for user ${userId} with email ${dbUser.email}`,
        employeeLinkError
      );
      // Don't fail the entire sync if employee lookup fails
    }

    logInfo('User synced successfully', {
      userId,
      dbUserId: dbUser.id,
      email: dbUser.email,
      linkedEmployee: linkedEmployee
        ? {
            id: linkedEmployee.id,
            empId: linkedEmployee.empId,
            name: linkedEmployee.name,
          }
        : null,
    });

    const response: UserSyncResponse = {
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        imageUrl: dbUser.imageUrl,
        roles: dbUser.userRoles.map(userRole => userRole.role.roleName),
      },
      linkedEmployee,
    };

    return NextResponse.json(response);
  } catch (error) {
    logError('Error syncing user', error);
    return NextResponse.json({ error: 'Internal server error during user sync' }, { status: 500 });
  }
}
