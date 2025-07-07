import { PrismaClient } from '@/generated/prisma';
import { authOptions } from '@/lib/auth/config';
import { logError, logInfo } from '@/lib/logger';
import { userHasRole } from '@/lib/roleUtils';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/user-roles - Get user roles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId') || session.user.id;

    // Check if current user has permission to view other users' roles
    if (targetUserId !== session.user.id) {
      const isAdmin = await userHasRole(session.user.id, 'admin');
      const isHr = await userHasRole(session.user.id, 'hr');

      if (!isAdmin && !isHr) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: targetUserId,
        isActive: true,
      },
      include: {
        role: true,
      },
      orderBy: {
        assignedAt: 'asc',
      },
    });

    const roles = userRoles.map(ur => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description,
      permissions: ur.role.permissions,
      assignedAt: ur.assignedAt,
      assignedBy: ur.assignedBy,
    }));

    return NextResponse.json({ roles });
  } catch (error) {
    logError('Error fetching user roles', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user-roles - Assign role to user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin permissions
    const isAdmin = await userHasRole(session.user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions - Admin role required' },
        { status: 403 }
      );
    }

    const { userId, roleId } = await request.json();

    if (!userId || !roleId) {
      return NextResponse.json({ error: 'userId and roleId are required' }, { status: 400 });
    }

    // Check if role exists and is active
    const role = await prisma.role.findUnique({
      where: { id: roleId, isActive: true },
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found or inactive' }, { status: 404 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has this role
    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (existingUserRole) {
      if (existingUserRole.isActive) {
        return NextResponse.json({ error: 'User already has this role' }, { status: 400 });
      } else {
        // Reactivate the role
        const reactivated = await prisma.userRole.update({
          where: { id: existingUserRole.id },
          data: {
            isActive: true,
            assignedBy: session.user.id,
            assignedAt: new Date(),
          },
        });

        logInfo('User role reactivated', {
          userId,
          roleId,
          roleName: role.name,
          assignedBy: session.user.id,
        });

        return NextResponse.json({
          message: 'Role reactivated successfully',
          userRole: reactivated,
        });
      }
    }

    // Create new user role assignment
    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId,
        assignedBy: session.user.id,
        isActive: true,
      },
    });

    logInfo('User role assigned', {
      userId,
      roleId,
      roleName: role.name,
      assignedBy: session.user.id,
    });

    return NextResponse.json(
      {
        message: 'Role assigned successfully',
        userRole,
      },
      { status: 201 }
    );
  } catch (error) {
    logError('Error assigning user role', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/user-roles - Remove role from user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin permissions
    const isAdmin = await userHasRole(session.user.id, 'admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions - Admin role required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roleId = searchParams.get('roleId');

    if (!userId || !roleId) {
      return NextResponse.json({ error: 'userId and roleId are required' }, { status: 400 });
    }

    // Find the user role assignment
    const userRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
      include: {
        role: true,
      },
    });

    if (!userRole || !userRole.isActive) {
      return NextResponse.json({ error: 'User role assignment not found' }, { status: 404 });
    }

    // Deactivate the role instead of deleting
    await prisma.userRole.update({
      where: { id: userRole.id },
      data: { isActive: false },
    });

    logInfo('User role removed', {
      userId,
      roleId,
      roleName: userRole.role.name,
      removedBy: session.user.id,
    });

    return NextResponse.json({ message: 'Role removed successfully' });
  } catch (error) {
    logError('Error removing user role', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
