import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function seedRoles() {
  console.log('🔐 Seeding default roles...');

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

    console.log('✅ Role seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedRoles();
