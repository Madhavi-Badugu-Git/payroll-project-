import bcryptjs from 'bcryptjs';
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testAuthFlow() {
  try {
    console.log('🔐 Testing Auth Flow...\n');

    // Simulate the login process
    const email = 'sudhasri321@gmail.com';
    const password = 'password123'; // Assuming this is the password

    console.log(`🔍 Looking up user: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        employee: true,
      },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ Found user: ${user.firstName} ${user.lastName}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Has password: ${user.hashedPassword ? 'Yes' : 'No'}`);

    if (user.employee) {
      console.log(`\n👨‍💼 Linked Employee:`);
      console.log(`   ID: ${user.employee.id}`);
      console.log(`   Employee Number: ${user.employee.employeeNumber}`);
      console.log(`   Name: ${user.employee.firstName} ${user.employee.lastName}`);
      console.log(`   Designation: ${user.employee.currentDesignation}`);
      console.log(`   Email: ${user.employee.email}`);
      console.log(`   Personal Email: ${user.employee.personalEmail}`);
    } else {
      console.log(`❌ No linked employee found`);
    }

    // Test password verification
    if (user.hashedPassword) {
      try {
        const isPasswordValid = await bcryptjs.compare(password, user.hashedPassword);
        console.log(`\n🔑 Password verification: ${isPasswordValid ? 'Valid' : 'Invalid'}`);
      } catch (error) {
        console.log(`\n❌ Password verification failed: ${error.message}`);
      }
    }

    // Simulate what NextAuth would return
    const authUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      employee: user.employee
        ? {
            id: user.employee.id,
            employeeNumber: user.employee.employeeNumber,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            currentDesignation: user.employee.currentDesignation,
          }
        : null,
    };

    console.log(`\n📋 NextAuth user object would be:`);
    console.log(JSON.stringify(authUser, null, 2));
  } catch (error) {
    console.error('❌ Error testing auth flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthFlow();
