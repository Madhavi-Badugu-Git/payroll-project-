import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function seedRoles() {
  console.log('🔐 Seeding default roles...');

  const defaultRoles = [
    {
      name: 'user',
      description: 'Basic user with limited access to the system',
    },
    {
      name: 'employee',
      description: 'Employee with access to leave management and attendance',
    },
    {
      name: 'manager',
      description: 'Manager with team management capabilities',
    },
    {
      name: 'admin',
      description: 'Administrator with full system access',
    },
  ];

  try {
    for (const role of defaultRoles) {
      const existingRole = await prisma.role.findUnique({
        where: { name: role.name },
      });

      if (!existingRole) {
        const createdRole = await prisma.role.create({
          data: role,
        });
        console.log(`✅ Created role: ${createdRole.name}`);
      } else {
        console.log(`⚠️  Role already exists: ${role.name}`);
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
