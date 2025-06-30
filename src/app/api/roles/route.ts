import { authOptions } from '@/lib/auth/config';
import {
  assignRoleToUser,
  getUserRoles,
  getUsersWithRole,
  removeRoleFromUser,
  userHasRole,
} from '@/lib/roleUtils';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId') || session.user.id;
    const roleName = searchParams.get('roleName');

    switch (action) {
      case 'getUserRoles':
        if (!userId) {
          return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }
        const roles = await getUserRoles(userId);
        return NextResponse.json({ roles });

      case 'checkRole':
        if (!userId || !roleName) {
          return NextResponse.json({ error: 'userId and roleName are required' }, { status: 400 });
        }
        const hasRole = await userHasRole(userId, roleName);
        return NextResponse.json({ hasRole });

      case 'getUsersWithRole':
        if (!roleName) {
          return NextResponse.json({ error: 'roleName is required' }, { status: 400 });
        }
        const users = await getUsersWithRole(roleName);
        return NextResponse.json({ users });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logError('Role API error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role (only admins can assign/remove roles)
    const isAdmin = await userHasRole(session.user.id!, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const { action, userId, roleName } = await request.json();

    if (!userId || !roleName) {
      return NextResponse.json({ error: 'userId and roleName are required' }, { status: 400 });
    }

    switch (action) {
      case 'assignRole':
        const assignedRole = await assignRoleToUser(userId, roleName);
        return NextResponse.json({
          message: 'Role assigned successfully',
          userRole: assignedRole,
        });

      case 'removeRole':
        await removeRoleFromUser(userId, roleName);
        return NextResponse.json({
          message: 'Role removed successfully',
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logError('Role API error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
