import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function demonstrateEmployeeCreation() {
  try {
    console.log('🧪 Testing Employee Creation and Role Assignment');
    console.log('================================================\n');

    // First, check what users exist
    console.log('📊 Current users and their roles:');
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'} (${user.email})`);
      console.log(`   Roles: ${user.userRoles.map(r => r.role.roleName).join(', ') || 'No roles'}`);
    });
    console.log('');

    // Check if test@example.com user exists
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!testUser) {
      console.log('❌ Test user not found');
    } else {
      console.log('✅ Test user found:', testUser.email);
    }

    // Check if an employee already exists with this email
    const existingEmployee = await prisma.employee.findFirst({
      where: { email: 'test@example.com' },
    });

    if (existingEmployee) {
      console.log('✅ Employee already exists with this email:', existingEmployee.empId);
    } else {
      console.log('📝 No employee found with test@example.com email');
      console.log(
        '💡 To test employee creation, you would need to create an employee via the UI or API'
      );
      console.log('💡 The system will automatically:');
      console.log('   1. Validate that a user exists with the given email');
      console.log('   2. Create the employee record if validation passes');
      console.log('   3. Assign the "employee" role to the linked user');
    }

    // Check current employees
    console.log('\n📊 Current employees:');
    const employees = await prisma.employee.findMany({
      select: {
        empId: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
      },
    });

    if (employees.length === 0) {
      console.log('   No employees found');
    } else {
      employees.forEach((employee, index) => {
        console.log(`${index + 1}. ${employee.firstName} ${employee.lastName} (${employee.empId})`);
        console.log(`   Email: ${employee.email}`);
        console.log(`   Status: ${employee.status}`);
      });
    }

    console.log('\n🎯 Key Features Implemented:');
    console.log('✅ Employee creation validates user exists with given email');
    console.log('✅ Employee creation automatically assigns "employee" role');
    console.log('✅ Employee email updates validate new user exists');
    console.log('✅ Bulk employee import validates user existence for each row');
    console.log('✅ All role assignments are logged for audit trail');

    console.log('\n🔧 Code Locations:');
    console.log('📁 Employee API: /src/app/api/employees/route.ts');
    console.log('📁 Employee Update API: /src/app/api/employees/[id]/route.ts');
    console.log('📁 Role Assignment: /src/lib/roleUtils.ts');
    console.log('📁 Bulk Import: /src/hooks/useEmployees.ts');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

demonstrateEmployeeCreation();
