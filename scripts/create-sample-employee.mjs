import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function createSampleEmployee() {
  try {
    // Create a sample employee with the same email as the user
    const employee = await prisma.employee.create({
      data: {
        employeeNumber: 'EMP001',
        firstName: 'Sudhakar',
        lastName: 'B',
        email: 'sudhasri321@gmail.com',
        personalEmail: 'sudhasri321@gmail.com',
        mobileNo: '+1234567890',
        dateOfJoining: new Date('2024-01-01'),
        status: 'Active',
        currentDesignation: 'Software Developer',
        employmentType: 'Full-time',
        stream: 'Engineering',
        currentSalary: 50000,
      },
    });

    console.log('Created employee:', employee);

    // Now try to link it to the existing user
    const user = await prisma.user.findFirst({
      where: { email: 'sudhasri321@gmail.com' },
    });

    if (user) {
      const updatedEmployee = await prisma.employee.update({
        where: { id: employee.id },
        data: { userId: user.id },
        include: { user: true },
      });

      console.log('Linked employee to user:', {
        employeeId: updatedEmployee.id,
        employeeNumber: updatedEmployee.employeeNumber,
        userId: updatedEmployee.userId,
        userEmail: updatedEmployee.user?.email,
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleEmployee();
