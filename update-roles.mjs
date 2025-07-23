import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

const rolesData = [
  {
    name: 'user',
    description: 'Basic user with limited access to the system',
    permissions: ['view_profile', 'edit_profile'],
  },
  {
    name: 'employee',
    description: 'Employee with access to leave management and attendance',
    permissions: [
      'view_profile',
      'edit_profile',
      'view_leaves',
      'create_leave',
      'view_attendance',
      'view_holidays',
      'view_documents',
    ],
  },
  {
    name: 'manager',
    description: 'Manager with team management capabilities',
    permissions: [
      'view_profile',
      'edit_profile',
      'view_leaves',
      'create_leave',
      'approve_leave',
      'view_team_leaves',
      'view_attendance',
      'view_team_attendance',
      'view_holidays',
      'view_documents',
      'view_reports',
    ],
  },
  {
    name: 'admin',
    description: 'Administrator with full system access',
    permissions: [
      'view_profile',
      'edit_profile',
      'view_leaves',
      'create_leave',
      'approve_leave',
      'manage_leaves',
      'view_attendance',
      'manage_attendance',
      'view_holidays',
      'manage_holidays',
      'view_documents',
      'manage_documents',
      'view_reports',
      'manage_reports',
      'manage_users',
      'manage_roles',
      'manage_employees',
      'manage_configurations',
      'full_system_access',
    ],
  },
];

async function updateRolePermissions() {
  console.log('🔄 Updating role permissions...');

  for (const roleData of rolesData) {
    try {
      const updatedRole = await prisma.role.update({
        where: { name: roleData.name },
        data: {
          permissions: roleData.permissions,
          description: roleData.description,
        },
      });
      console.log(
        `✅ Updated role: ${updatedRole.name} with ${updatedRole.permissions.length} permissions`
      );
    } catch (error) {
      console.error(`❌ Error updating role ${roleData.name}:`, error);
    }
  }

  console.log('🎉 Role permissions update complete!');
  await prisma.$disconnect();
}

updateRolePermissions();
