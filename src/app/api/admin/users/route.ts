import { PrismaClient } from '@/generated/prisma';
import { authOptions } from '@/lib/auth/config';
import { userHasRole } from '@/lib/roleUtils';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin = await userHasRole(session.user.id!, 'admin');
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
            empId: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (role) {
      whereClause.userRoles = {
        some: {
          role: {
            roleName: role,
          },
        },
      };
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
        employee: {
          select: {
            empId: true,
            firstName: true,
            lastName: true,
            currentDesignation: true,
            status: true,
            dateOfJoining: true,
          },
        },
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                roleName: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    // Transform the data for the frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      employee: user.employee
        ? {
            empId: user.employee.empId,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            currentDesignation: user.employee.currentDesignation,
            status: user.employee.status,
            dateOfJoining: user.employee.dateOfJoining,
          }
        : null,
      roles: user.userRoles.map(ur => ({
        id: ur.role.id,
        roleName: ur.role.roleName,
        description: ur.role.description,
      })),
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
    const isAdmin = await userHasRole(session.user.id!, 'admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
    }

    const { action, userId, isActive } = await request.json();

    switch (action) {
      case 'toggleActive':
        if (!userId) {
          return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { isActive: isActive ?? true },
          include: {
            employee: true,
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        });

        return NextResponse.json({
          message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
          user: updatedUser,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logError('Users API error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
