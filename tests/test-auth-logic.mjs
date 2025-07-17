import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testAuthLogic() {
  try {
    console.log('🔍 Testing Auth Logic for NextAuth...\n');

    const email = 'sudhasri321@gmail.com';

    console.log(`🔍 Looking up user for login: ${email}`);

    // Simulate the exact query from NextAuth config
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
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

    console.log(`✅ Found user: ${user.firstName} ${user.lastName}`);
    console.log(`📧 Email: ${user.email}`);

    // Debug: Log the user data structure
    console.log('🔍 DEBUG: User data from auth query:', {
      id: user.id,
      email: user.email,
      hasEmployee: !!user.employee,
      hasRoles: user.userRoles.length > 0,
      employeeData: user.employee
        ? {
            id: user.employee.id,
            employeeNumber: user.employee.employeeNumber,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            currentDesignation: user.employee.currentDesignation,
          }
        : null,
      rolesData: user.userRoles.map(ur => ({
        roleName: ur.role.name,
        description: ur.role.description,
        isActive: ur.isActive,
      })),
    });

    // Extract roles from userRoles (same logic as in auth config)
    const roles = user.userRoles.filter(ur => ur.isActive).map(ur => ur.role.name);

    console.log('🔍 DEBUG: Extracted roles for auth:', roles);

    // Simulate what NextAuth would return
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

    console.log('🔍 DEBUG: NextAuth user object would be:', JSON.stringify(authUser, null, 2));

    // Test password (you can comment this out if you don't want to test password)
    /*
    const isPasswordValid = await bcryptjs.compare('password123', user.hashedPassword || '');
    console.log(`🔑 Password test: ${isPasswordValid ? 'Valid' : 'Invalid'}`);
    */
  } catch (error) {
    console.error('❌ Error testing auth logic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthLogic();
