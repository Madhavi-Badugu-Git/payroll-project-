import bcryptjs from 'bcryptjs';
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function createDefaultRoles() {
  const defaultRoles = [
    {
      name: 'admin',
      description: 'Administrator with full system access',
      permissions: ['*'], // Wildcard for all permissions
    },
    {
      name: 'hr',
      description: 'Human Resources staff',
      permissions: [
        'users:read',
        'users:write',
        'employees:read',
        'employees:write',
        'payroll:read',
      ],
    },
    {
      name: 'manager',
      description: 'Team manager',
      permissions: ['attendance:read', 'leave:approve', 'employees:read'],
    },
    {
      name: 'employee',
      description: 'Regular employee',
      permissions: ['attendance:read', 'leave:create', 'payslips:read'],
    },
    {
      name: 'user',
      description: 'Basic user access',
      permissions: ['profile:read'],
    },
  ];

  for (const roleData of defaultRoles) {
    try {
      const existingRole = await prisma.role.findUnique({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        await prisma.role.create({
          data: roleData,
        });
        console.log(`✅ Created default role: ${roleData.name}`);
      } else {
        console.log(`✓ Role already exists: ${roleData.name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating role ${roleData.name}:`, error);
    }
  }
}

async function setupRolesAndTestUser() {
  try {
    console.log('🔄 Setting up roles and test user...\n');

    // Create default roles
    await createDefaultRoles();

    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'sudhasri321@gmail.com' },
    });

    if (existingUser) {
      console.log(`✓ Test user already exists: ${existingUser.email}`);

      // Just assign roles if user exists
      const adminRole = await prisma.role.findUnique({
        where: { name: 'admin' },
      });

      const employeeRole = await prisma.role.findUnique({
        where: { name: 'employee' },
      });

      if (adminRole) {
        const existingAdminRole = await prisma.userRole.findUnique({
          where: { userId_roleId: { userId: existingUser.id, roleId: adminRole.id } },
        });

        if (!existingAdminRole) {
          await prisma.userRole.create({
            data: {
              userId: existingUser.id,
              roleId: adminRole.id,
              isActive: true,
            },
          });
          console.log(`✅ Assigned admin role to existing test user`);
        }
      }

      if (employeeRole) {
        const existingEmployeeRole = await prisma.userRole.findUnique({
          where: { userId_roleId: { userId: existingUser.id, roleId: employeeRole.id } },
        });

        if (!existingEmployeeRole) {
          await prisma.userRole.create({
            data: {
              userId: existingUser.id,
              roleId: employeeRole.id,
              isActive: true,
            },
          });
          console.log(`✅ Assigned employee role to existing test user`);
        }
      }

      // Verify setup
      const userWithRoles = await prisma.user.findUnique({
        where: { id: existingUser.id },
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

      console.log('\n📋 Test user roles updated:');
      console.log(`   Email: ${userWithRoles.email}`);
      console.log(`   Employee: ${userWithRoles.employee?.employeeNumber || 'None'}`);
      console.log(`   Roles: ${userWithRoles.userRoles.map(ur => ur.role.name).join(', ')}`);

      return;
    }

    // Hash password for test user
    const hashedPassword = await bcryptjs.hash('password123', 12);

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'sudhasri321@gmail.com',
        firstName: 'Sudhakar',
        lastName: 'B',
        hashedPassword,
      },
    });

    console.log(`✅ Created test user: ${testUser.email}`);

    // Create test employee
    const testEmployee = await prisma.employee.create({
      data: {
        employeeNumber: 'EMP001',
        firstName: 'Sudhakar',
        lastName: 'B',
        email: 'sudhasri321@gmail.com',
        personalEmail: 'sudhasri321@gmail.com',
        mobileNo: '1234567890',
        dateOfJoining: new Date('2024-01-01'),
        status: 'Active',
        currentDesignation: 'Software Developer',
        employmentType: 'Full-time',
        stream: 'Technology',
        userId: testUser.id,
      },
    });

    console.log(`✅ Created test employee: ${testEmployee.employeeNumber}`);

    // Assign admin role to test user
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' },
    });

    if (adminRole) {
      await prisma.userRole.create({
        data: {
          userId: testUser.id,
          roleId: adminRole.id,
          isActive: true,
        },
      });
      console.log(`✅ Assigned admin role to test user`);
    }

    // Assign employee role to test user
    const employeeRole = await prisma.role.findUnique({
      where: { name: 'employee' },
    });

    if (employeeRole) {
      await prisma.userRole.create({
        data: {
          userId: testUser.id,
          roleId: employeeRole.id,
          isActive: true,
        },
      });
      console.log(`✅ Assigned employee role to test user`);
    }

    // Verify setup
    const userWithRoles = await prisma.user.findUnique({
      where: { id: testUser.id },
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

    console.log('\n📋 Test user setup complete:');
    console.log(`   Email: ${userWithRoles.email}`);
    console.log(`   Employee: ${userWithRoles.employee?.employeeNumber}`);
    console.log(`   Roles: ${userWithRoles.userRoles.map(ur => ur.role.name).join(', ')}`);
  } catch (error) {
    console.error('❌ Error setting up roles and test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupRolesAndTestUser();
