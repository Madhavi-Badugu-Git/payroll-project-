import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function listRoles() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { userRoles: true },
        },
      },
    });

    console.log('🔐 Available Roles:');
    console.log('==================');
    roles.forEach(role => {
      console.log(`📋 Name: ${role.name}`);
      console.log(`📝 Description: ${role.description}`);
      console.log(`👥 Users assigned: ${role._count.userRoles}`);
      console.log(
        `✨ Permissions: ${role.permissions.slice(0, 3).join(', ')}${role.permissions.length > 3 ? '...' : ''} (${role.permissions.length} total)`
      );
      console.log(`📅 Created: ${role.createdAt.toLocaleDateString()}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listRoles();
