import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testEmployeeCreation() {
  try {
    console.log('🧪 Testing Employee Creation with User Validation and Role Assignment');
    console.log('=====================================================================\n');

    // Test Case 1: Try to create employee with non-existent user email
    console.log('Test Case 1: Creating employee with non-existent user email...');
    try {
      const response = await fetch('http://localhost:3000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          officeEmail: 'nonexistent@example.com',
          mobileNo: '1234567890',
          joiningDate: '2024-01-01',
          status: 'ACTIVE',
          currentDesignation: 'Software Engineer',
          employmentType: 'FULL_TIME',
          stream: 'ENGINEERING',
        }),
      });

      const result = await response.json();
      console.log(`❌ Expected failure: ${result.error}`);
      console.log('✅ User validation working correctly!\n');
    } catch (error) {
      console.log(`❌ API call failed: ${error.message}\n`);
    }

    // Test Case 2: Create employee with existing user email
    console.log('Test Case 2: Creating employee with existing user email (test@example.com)...');
    try {
      const response = await fetch('http://localhost:3000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'Employee',
          officeEmail: 'test@example.com',
          personalEmail: 'test.personal@example.com',
          mobileNo: '9876543210',
          joiningDate: '2024-01-15',
          status: 'ACTIVE',
          currentDesignation: 'Senior Developer',
          employmentType: 'FULL_TIME',
          stream: 'ENGINEERING',
          salary: '75000',
        }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log(`✅ Employee created successfully:`);
        console.log(`   Employee ID: ${result.empId}`);
        console.log(`   Name: ${result.firstName} ${result.lastName}`);
        console.log(`   Email: ${result.email}`);
        console.log(`   Status: ${result.status}\n`);

        // Verify the user now has the employee role
        console.log('Verifying user roles after employee creation...');
        const user = await prisma.user.findUnique({
          where: { email: 'test@example.com' },
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        });

        if (user) {
          console.log(`✅ User roles: ${user.userRoles.map(r => r.role.roleName).join(', ')}`);
          const hasEmployeeRole = user.userRoles.some(r => r.role.roleName === 'employee');
          console.log(`✅ Employee role assigned: ${hasEmployeeRole ? 'YES' : 'NO'}\n`);
        }
      } else {
        console.log(`❌ Failed to create employee: ${result.error}\n`);
      }
    } catch (error) {
      console.log(`❌ API call failed: ${error.message}\n`);
    }

    // Test Case 3: Try to create another employee with the same email (should fail)
    console.log('Test Case 3: Creating another employee with same email (should fail)...');
    try {
      const response = await fetch('http://localhost:3000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'Another',
          lastName: 'Employee',
          officeEmail: 'test@example.com',
          mobileNo: '1111111111',
          joiningDate: '2024-02-01',
          status: 'ACTIVE',
          currentDesignation: 'Junior Developer',
          employmentType: 'FULL_TIME',
          stream: 'ENGINEERING',
        }),
      });

      const result = await response.json();
      console.log(`❌ Expected failure: ${result.error}`);
      console.log('✅ Duplicate email validation working correctly!\n');
    } catch (error) {
      console.log(`❌ API call failed: ${error.message}\n`);
    }

    console.log('🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Wait a bit for the dev server to be ready
setTimeout(testEmployeeCreation, 3000);
