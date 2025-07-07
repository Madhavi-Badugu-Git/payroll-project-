import bcryptjs from 'bcryptjs';
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testAuthFlow() {
  try {
    console.log('🔐 Testing Fresh Auth Flow...\n');

    const email = 'sudhasri321@gmail.com';
    const password = 'password123';

    console.log(`🔍 Simulating login for: ${email}`);

    // Find user with roles (simulate NextAuth authorize function)
    const user = await prisma.user.findUnique({
      where: { email },
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

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);

    // Test password
    const isPasswordValid = await bcryptjs.compare(password, user.hashedPassword || '');
    console.log(`🔑 Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return;
    }

    // Extract roles (simulate what authorize function does)
    const roles = user.userRoles.filter(ur => ur.isActive).map(ur => ur.role.name);

    console.log('\n🔍 DEBUG: User roles extracted:');
    console.log(
      'User roles:',
      user.userRoles.map(ur => ({
        roleName: ur.role.name,
        isActive: ur.isActive,
      }))
    );
    console.log('Extracted roles array:', roles);

    // Simulate the user object returned by authorize
    const authUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      roles,
      employee: user.employee
        ? {
            id: user.employee.id,
            employeeNumber: user.employee.employeeNumber,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            currentDesignation: user.employee.currentDesignation,
          }
        : null,
    };

    console.log('\n📋 Auth user object that would be passed to JWT callback:');
    console.log(JSON.stringify(authUser, null, 2));

    // Simulate JWT callback
    const token = {
      id: authUser.id,
      roles: authUser.roles,
      employee: authUser.employee,
    };

    console.log('\n🎫 JWT token that would be created:');
    console.log(JSON.stringify(token, null, 2));

    // Simulate session callback
    const session = {
      user: {
        id: token.id,
        email: authUser.email,
        roles: token.roles || [],
        employee: token.employee || null,
      },
    };

    console.log('\n👤 Session that would be created:');
    console.log(JSON.stringify(session, null, 2));
  } catch (error) {
    console.error('❌ Error testing auth flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthFlow();
