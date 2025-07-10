import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testSessionFlow() {
  try {
    console.log('🔐 Testing Complete Session Flow...\n');

    const email = 'sudhasri321@gmail.com';

    // Step 1: Simulate login (what happens in authorize function)
    console.log('Step 1: Simulating login authorize function...');

    const userForAuth = await prisma.user.findUnique({
      where: { email },
      include: {
        employee: true,
      },
    });

    if (!userForAuth) {
      console.log('❌ User not found during login');
      return;
    }

    // This is what the authorize function returns
    const authUser = {
      id: userForAuth.id,
      email: userForAuth.email,
      firstName: userForAuth.firstName,
      lastName: userForAuth.lastName,
      image: userForAuth.image,
      employee: userForAuth.employee
        ? {
            id: userForAuth.employee.id,
            employeeNumber: userForAuth.employee.employeeNumber,
            firstName: userForAuth.employee.firstName,
            lastName: userForAuth.employee.lastName,
            currentDesignation: userForAuth.employee.currentDesignation,
          }
        : null,
    };

    console.log('✅ Authorize function would return:');
    console.log(JSON.stringify(authUser, null, 2));

    // Step 2: Simulate JWT callback
    console.log('\nStep 2: Simulating JWT callback...');

    const token = {
      id: authUser.id,
      employee: authUser.employee,
    };

    console.log('✅ JWT token would contain:');
    console.log(JSON.stringify(token, null, 2));

    // Step 3: Simulate session callback
    console.log('\nStep 3: Simulating session callback...');

    const session = {
      user: {
        id: token.id,
        email: authUser.email,
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        employee: token.employee || null,
      },
    };

    console.log('✅ Final session would be:');
    console.log(JSON.stringify(session, null, 2));

    // Step 4: Simulate user-sync API call
    console.log('\nStep 4: Simulating user-sync API...');

    // This would be called by the frontend after login
    const userSyncResponse = await simulateUserSync(authUser.id);
    console.log('✅ User-sync API would return:');
    console.log(JSON.stringify(userSyncResponse, null, 2));
  } catch (error) {
    console.error('❌ Error testing session flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function simulateUserSync(userId) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      employee: true,
    },
  });

  if (!dbUser) {
    return { error: 'User not found' };
  }

  let linkedEmployee = null;
  if (dbUser.employee) {
    linkedEmployee = {
      id: dbUser.employee.id,
      employeeNumber: dbUser.employee.employeeNumber,
      name: `${dbUser.employee.firstName} ${dbUser.employee.lastName}`,
      designation: dbUser.employee.currentDesignation,
    };
  }

  return {
    success: true,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      imageUrl: dbUser.image,
      roles: [],
    },
    linkedEmployee,
  };
}

testSessionFlow();
