import bcryptjs from 'bcryptjs';
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const hashedPassword = await bcryptjs.hash('password123', 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: hashedPassword,
        isActive: true,
      },
    });

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        empId: 'EMP001',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        dateOfJoining: new Date(),
        currentDesignation: 'Developer',
        currentSalary: 50000,
        status: 'Active',
        employmentType: 'Full-time',
        stream: 'Engineering',
        mobileNo: '1234567890',
        userId: user.id,
      },
    });

    console.log('Test user created:', { user: user.email, employee: employee.empId });
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
