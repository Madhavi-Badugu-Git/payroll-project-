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

    // Find the user in the database
    let dbUser;
    try {
      dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          employee: true,
          userRoles: {
            where: { isActive: true },
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

      // Debug: Log the user data structure
      console.log('🔍 DEBUG: User found in database:', {
        id: dbUser.id,
        email: dbUser.email,
        hasEmployee: !!dbUser.employee,
        employeeData: dbUser.employee
          ? {
              id: dbUser.employee.id,
              employeeNumber: dbUser.employee.employeeNumber,
              firstName: dbUser.employee.firstName,
              lastName: dbUser.employee.lastName,
            }
          : null,
      });
    } catch (dbError) {
      logError(`Database error while fetching user: ${userId}`, dbError);
      return NextResponse.json({ error: 'Database error while fetching user' }, { status: 500 });
    }

    // Try to find a linked employee
    let linkedEmployee = null;
    try {
      // First, check if the user already has a directly linked employee
      if (dbUser.employee) {
        linkedEmployee = {
          id: dbUser.employee.id,
          employeeNumber: dbUser.employee.employeeNumber,
          name: `${dbUser.employee.firstName} ${dbUser.employee.lastName}`,
          designation: dbUser.employee.currentDesignation,
        };

        console.log('🔍 DEBUG: Found linked employee via direct relationship:', linkedEmployee);

        logInfo('Employee found via direct relationship', {
          userId,
          employeeId: dbUser.employee.id,
          employeeNumber: dbUser.employee.employeeNumber,
        });
      } else {
        // Fallback: try to find an employee by matching email
        const employee = await prisma.employee.findFirst({
          where: {
            OR: [{ email: dbUser.email }, { personalEmail: dbUser.email }],
            userId: null, // Only consider unlinked employees
          },
        });

        if (employee) {
          // Link the employee to the user
          await prisma.employee.update({
            where: { id: employee.id },
            data: { userId: dbUser.id },
          });

          linkedEmployee = {
            id: employee.id,
            employeeNumber: employee.employeeNumber,
            name: `${employee.firstName} ${employee.lastName}`,
            designation: employee.currentDesignation,
          };

          console.log(
            '🔗 DEBUG: Linked employee found by email and linked to user:',
            linkedEmployee
          );

          logInfo('Employee found by email and linked to user', {
            userId,
            employeeId: employee.id,
            employeeNumber: employee.employeeNumber,
            email: dbUser.email,
          });
        } else {
          logDebug('No unlinked employee found with matching email', {
            email: dbUser.email,
          });
        }
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
            employeeNumber: linkedEmployee.employeeNumber,
            name: linkedEmployee.name,
          }
        : null,
    });

    console.log('🔍 DEBUG: Final linkedEmployee before response:', linkedEmployee);

    // Extract roles from userRoles
    const roles = dbUser.userRoles.filter(ur => ur.isActive).map(ur => ur.role.name);

    const response: UserSyncResponse = {
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        imageUrl: dbUser.image, // Map database 'image' field to interface 'imageUrl'
        roles, // Include actual roles from database
      },
      linkedEmployee,
    };

    console.log('🔍 DEBUG: Final response object:', JSON.stringify(response, null, 2));

    return NextResponse.json(response);
  } catch (error) {
    logError('Error syncing user', error);
    return NextResponse.json({ error: 'Internal server error during user sync' }, { status: 500 });
  }
}
