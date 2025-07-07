import { PrismaClient } from '@/generated/prisma';
// import { assignDefaultUserRole, assignEmployeeRole } from '@/lib/roleUtils'; // Disabled until role system is implemented
import { logError } from '@/lib/logger';
import bcryptjs from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    // Assign default user role
    try {
      // await assignDefaultUserRole(user.id); // Disabled until role system is implemented
    } catch (error) {
      logError('Error assigning default user role', error);
    }

    // Try to link with existing employee record
    const employee = await prisma.employee.findFirst({
      where: {
        email: email,
        userId: null, // Not already linked
      },
    });

    if (employee) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: { userId: user.id },
      });

      // Assign employee role when linking to employee record
      try {
        // await assignEmployeeRole(user.id); // Disabled until role system is implemented
      } catch (error) {
        logError('Error assigning employee role', error);
      }
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    logError('Signup error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
