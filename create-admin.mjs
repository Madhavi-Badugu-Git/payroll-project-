import bcryptjs from 'bcryptjs';
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('👑 Creating admin user...');

  try {
    const hashedPassword = await bcryptjs.hash('admin123', 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        isActive: true,
      },
    });

    // Assign user role
    const userRole = await prisma.role.findUnique({ where: { roleName: 'user' } });
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: userRole.id,
      },
    });

    // Assign admin role
    const adminRole = await prisma.role.findUnique({ where: { roleName: 'admin' } });
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    // Create admin employee record
    const adminEmployee = await prisma.employee.create({
      data: {
        empId: 'EMP002',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        dateOfJoining: new Date(),
        currentDesignation: 'Admin',
        currentSalary: 100000,
        status: 'Active',
        employmentType: 'Full-time',
        stream: 'Administration',
        mobileNo: '9876543210',
        userId: adminUser.id,
      },
    });

    // Assign employee role
    const employeeRole = await prisma.role.findUnique({ where: { roleName: 'employee' } });
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: employeeRole.id,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: admin123`);
    console.log(`   Employee ID: ${adminEmployee.empId}`);
    console.log(`   Roles: user, employee, admin`);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
