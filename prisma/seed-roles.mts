import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

const defaultRoles = [
  {
    roleName: 'user',
    description: 'Basic user with limited access to the system',
  },
  {
    roleName: 'employee',
    description: 'Employee with access to leave management and attendance',
  },
  {
    roleName: 'manager',
    description: 'Manager with team management capabilities',
  },
  {
    roleName: 'admin',
    description: 'Administrator with full system access',
  },
];

async function seedRoles() {
  console.log('🔐 Seeding roles...');

  try {
    for (const role of defaultRoles) {
      const existingRole = await prisma.role.findUnique({
        where: { roleName: role.roleName },
      });

      if (!existingRole) {
        const createdRole = await prisma.role.create({
          data: role,
        });
        console.log(`✅ Created role: ${createdRole.roleName}`);
      } else {
        console.log(`⚠️  Role already exists: ${role.roleName}`);
      }
    }

    // Assign roles to existing users
    const users = await prisma.user.findMany({
      include: {
        employee: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    console.log(`\n👥 Assigning roles to ${users.length} existing users...`);

    for (const user of users) {
      const existingRoles = user.userRoles.map(ur => ur.role.roleName);

      // Assign user role if not already assigned
      if (!existingRoles.includes('user')) {
        const userRole = await prisma.role.findUnique({ where: { roleName: 'user' } });
        if (userRole) {
          await prisma.userRole.create({
            data: {
              userId: user.id,
              roleId: userRole.id,
            },
          });
          console.log(`   ✅ Assigned user role to ${user.email}`);
        }
      }

      // Assign employee role if user has employee record and role not already assigned
      if (user.employee && !existingRoles.includes('employee')) {
        const employeeRole = await prisma.role.findUnique({ where: { roleName: 'employee' } });
        if (employeeRole) {
          await prisma.userRole.create({
            data: {
              userId: user.id,
              roleId: employeeRole.id,
            },
          });
          console.log(`   ✅ Assigned employee role to ${user.email}`);
        }
      }

      // Assign admin role based on designation or email
      if (!existingRoles.includes('admin')) {
        const shouldBeAdmin =
          user.employee?.currentDesignation?.toLowerCase().includes('admin') ||
          user.employee?.currentDesignation?.toLowerCase().includes('ceo') ||
          user.employee?.currentDesignation?.toLowerCase().includes('cto') ||
          user.employee?.currentDesignation?.toLowerCase().includes('hr manager') ||
          user.employee?.currentDesignation?.toLowerCase().includes('director') ||
          user.email.toLowerCase().includes('admin');

        if (shouldBeAdmin) {
          const adminRole = await prisma.role.findUnique({ where: { roleName: 'admin' } });
          if (adminRole) {
            await prisma.userRole.create({
              data: {
                userId: user.id,
                roleId: adminRole.id,
              },
            });
            console.log(`   ✅ Assigned admin role to ${user.email}`);
          }
        }
      }
    }

    console.log('\n✅ Role seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedRoles();
