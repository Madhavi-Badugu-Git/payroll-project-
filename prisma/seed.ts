import bcryptjs from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma'; // Assuming your Prisma Client is generated here

const prisma = new PrismaClient();

// Role data
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

// Super user data
const superUserData = {
  email: 'admin@trinitstechnologies.com',
  firstName: 'Super',
  lastName: 'Admin',
  hashedPassword: '', // Will be set in the seeding function
};

const holidayData = [
  { date: new Date('2025-01-01T00:00:00.000Z'), name: 'New Year' },
  { date: new Date('2025-01-14T00:00:00.000Z'), name: 'Pongal' },
  { date: new Date('2025-03-31T00:00:00.000Z'), name: 'Ramzan Id/Eid-ul-Fitar' },
  { date: new Date('2025-05-01T00:00:00.000Z'), name: 'May Day' },
  { date: new Date('2025-08-15T00:00:00.000Z'), name: 'Independence Day' },
  { date: new Date('2025-08-27T00:00:00.000Z'), name: 'Vinayaka Chavithi' },
  { date: new Date('2025-10-02T00:00:00.000Z'), name: 'Gandhi Jayanthi/Dussehra' },
  { date: new Date('2025-10-20T00:00:00.000Z'), name: 'Deepavali' },
  { date: new Date('2025-12-25T00:00:00.000Z'), name: 'Christmas' },
];

const configurationData = [
  {
    configKey: 'EMPLOYEE_ID_PREFIX',
    configValue: 'TRINITS',
    description: 'Prefix used for generating employee IDs',
  },
  {
    configKey: 'SANCTIONED_LEAVE_PER_YEAR',
    configValue: '24',
    description: 'Total number of sanctioned leaves per year for each employee',
  },
  {
    configKey: 'WORKING_HOURS_PER_DAY',
    configValue: '8',
    description: 'Standard working hours per day',
  },
  {
    configKey: 'OVERTIME_THRESHOLD',
    configValue: '8.5',
    description: 'Hours threshold after which overtime calculation begins',
  },
];

async function main() {
  console.log(`Start seeding ...`);

  // 1. Seed roles first
  console.log('🔐 Seeding roles...');
  for (const roleData of rolesData) {
    const existingRole = await prisma.role.findUnique({
      where: { name: roleData.name },
    });

    if (!existingRole) {
      const role = await prisma.role.create({
        data: {
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
        },
      });
      console.log(`✅ Created role: ${role.name} with id: ${role.id}`);
    } else {
      console.log(`⚠️  Role already exists: ${roleData.name}`);
    }
  }

  // 2. Seed super user
  console.log('👤 Seeding super user...');
  const existingUser = await prisma.user.findUnique({
    where: { email: superUserData.email },
  });

  let adminUser;
  if (!existingUser) {
    // Hash the password
    const hashedPassword = await bcryptjs.hash('Admin123#!@#', 12);

    adminUser = await prisma.user.create({
      data: {
        email: superUserData.email,
        firstName: superUserData.firstName,
        lastName: superUserData.lastName,
        hashedPassword: hashedPassword,
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Created super user: ${adminUser.email} with id: ${adminUser.id}`);
    console.log(`🔑 Default password: admin123 (Please change after first login)`);
  } else {
    adminUser = existingUser;
    console.log(`⚠️  Super user already exists: ${superUserData.email}`);
  }

  // 3. Assign admin role to super user
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' },
  });

  if (adminRole && adminUser) {
    const existingUserRole = await prisma.userRole.findFirst({
      where: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    if (!existingUserRole) {
      const userRole = await prisma.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: adminRole.id,
          assignedBy: 'system',
          isActive: true,
        },
      });
      console.log(`✅ Assigned admin role to super user: ${userRole.id}`);
    } else {
      console.log(`⚠️  Admin role already assigned to super user`);
    }
  }

  // 4. Seed holidays
  console.log('🎉 Seeding holidays...');
  for (const h of holidayData) {
    const existingHoliday = await prisma.holiday.findFirst({
      where: { date: h.date },
    });

    if (!existingHoliday) {
      const holiday = await prisma.holiday.create({
        data: {
          name: h.name,
          date: h.date,
        },
      });
      console.log(
        `Created holiday '${holiday.name}' with id: ${holiday.id} for date ${h.date.toISOString().substring(0, 10)}`
      );
    } else {
      console.log(
        `Holiday for date ${h.date.toISOString().substring(0, 10)} ('${existingHoliday.name}') already exists with id: ${existingHoliday.id}. Skipping.`
      );
    }
  }

  // 5. Seed configurations
  console.log('⚙️  Seeding configurations...');
  for (const config of configurationData) {
    const existingConfig = await prisma.configuration.findUnique({
      where: { configKey: config.configKey },
    });

    if (!existingConfig) {
      const configuration = await prisma.configuration.create({
        data: {
          configKey: config.configKey,
          configValue: config.configValue,
          description: config.description,
        },
      });
      console.log(
        `Created configuration '${configuration.configKey}' with value: ${configuration.configValue}`
      );
    } else {
      console.log(
        `Configuration '${config.configKey}' already exists with value: ${existingConfig.configValue}. Skipping.`
      );
    }
  }

  console.log(`Seeding finished.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
