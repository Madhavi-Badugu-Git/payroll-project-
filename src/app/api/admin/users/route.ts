import { authOptions } from '@/lib/auth/config';
import { logError } from '@/lib/logger';
import prisma from '@/lib/prisma';
// import { userHasRole } from '@/lib/roleUtils'; // Disabled until role system is implemented
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (disabled until role system is implemented)
    const isAdmin = true; // await userHasRole(session.user.id!, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: Record<string, unknown> = {};

    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        {
          employee: {
            employeeNumber: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (role) {
      // Role filtering is disabled since userRoles model doesn't exist
      // This can be implemented later when role system is added
    }

    // Get total count for pagination
    const totalUsers = await prisma.user.count({
      where: whereClause,
    });

    // Get users with pagination and related data
    const users = await prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        employee: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    // Transform the data for the frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      employee: user.employee
        ? {
            employeeNumber: user.employee.employeeNumber,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            currentDesignation: user.employee.currentDesignation,
            status: user.employee.status,
            dateOfJoining: user.employee.dateOfJoining,
          }
        : null,
      roles: [], // Remove role functionality for now
    }));

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit,
        hasNextPage: skip + limit < totalUsers,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    logError('Users API error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    // Check if user is admin (disabled until role system is implemented)
    const isAdmin = true; // await userHasRole(session.user.id!, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const { action, userId } = await request.json();

    switch (action) {
      case 'toggleActive':
        // For now, we'll just return the user without updating isActive
        // since that field doesn't exist in the current User model
        if (!userId) {
          return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            employee: true,
          },
        });

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
          message: 'User status checked successfully',
          user: user,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logError('Users API error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
