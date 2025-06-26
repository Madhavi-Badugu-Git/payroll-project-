import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testUserEmployeeLinking() {
  try {
    console.log('Testing User-Employee linking functionality...\n');

    // Create a test user (simulating what sync-user would do)
    const testEmail = 'aarav.sharma@company.com';

    // Find employee with matching email
    const employee = await prisma.employee.findUnique({
      where: { officeEmail: testEmail },
    });

    if (!employee) {
      console.log(`❌ No employee found with email: ${testEmail}`);

      // Create a test employee
      const newEmployee = await prisma.employee.create({
        data: {
          empId: 'TEST001',
          firstName: 'Test',
          lastName: 'Employee',
          officeEmail: testEmail,
          mobileNo: '1234567890',
          currentDesignation: 'Software Engineer',
          employmentType: 'Full-time',
          stream: 'Engineering',
          joiningDate: new Date(),
          status: 'Active',
        },
      });

      console.log(
        `✅ Created test employee: ${newEmployee.firstName} ${newEmployee.lastName} (${newEmployee.empId})`
      );
    } else {
      console.log(
        `✅ Found employee: ${employee.firstName} ${employee.lastName} (${employee.empId}) with email: ${employee.officeEmail}`
      );
    }

    // Create a test user
    const testUser = await prisma.user.upsert({
      where: { email: testEmail },
      update: {
        firstName: 'Test',
        lastName: 'User',
      },
      create: {
        clerkId: 'test_clerk_id_12345',
        email: testEmail,
        firstName: 'Test',
        lastName: 'User',
        imageUrl: null,
      },
    });

    console.log(
      `✅ Created/Updated user: ${testUser.firstName} ${testUser.lastName} (${testUser.email})`
    );

    // Try to link employee with user
    const updatedEmployee = await prisma.employee.findUnique({
      where: { officeEmail: testEmail },
    });

    if (updatedEmployee && !updatedEmployee.userId) {
      const linkedEmployee = await prisma.employee.update({
        where: { id: updatedEmployee.id },
        data: { userId: testUser.id },
      });

      console.log(
        `✅ Successfully linked employee ${linkedEmployee.empId} with user ${testUser.id}`
      );
    } else if (updatedEmployee && updatedEmployee.userId) {
      console.log(
        `ℹ️  Employee ${updatedEmployee.empId} is already linked to user: ${updatedEmployee.userId}`
      );
    }

    // Verify the relationship
    const userWithEmployee = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: { employee: true },
    });

    if (userWithEmployee?.employee) {
      console.log(
        `✅ Verification successful! User ${userWithEmployee.email} is linked to employee ${userWithEmployee.employee.empId} (${userWithEmployee.employee.firstName} ${userWithEmployee.employee.lastName})`
      );
    } else {
      console.log(`❌ Verification failed! User is not properly linked to employee.`);
    }

    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserEmployeeLinking();
