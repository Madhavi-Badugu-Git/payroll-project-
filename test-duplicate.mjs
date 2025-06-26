import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function testDuplicateRegularization() {
  try {
    // Try to create another regularization for the same attendance record
    console.log('=== Testing duplicate regularization prevention ===');

    const attendanceId = 'cmcdbtozv00030gtfdh5ch4c2';

    // Check existing regularizations
    const existing = await prisma.attendanceRegularization.findMany({
      where: { attendanceId },
      include: {
        employee: {
          select: { empId: true, firstName: true, lastName: true },
        },
      },
    });

    console.log('Existing regularizations for this attendance:', JSON.stringify(existing, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDuplicateRegularization();
