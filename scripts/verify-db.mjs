import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying database after consolidation...\n');

    // Check employees
    const employeeCount = await prisma.employee.count();
    console.log(`👥 Employees: ${employeeCount} records`);

    // Check holidays
    const holidayCount = await prisma.holiday.count();
    console.log(`🎉 Holidays: ${holidayCount} records`);

    // Check some sample data
    const firstEmployee = await prisma.employee.findFirst({
      select: { empId: true, firstName: true, lastName: true },
    });

    const nextHoliday = await prisma.holiday.findFirst({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      select: { name: true, date: true },
    });

    console.log(
      `📋 Sample Employee: ${firstEmployee?.empId} - ${firstEmployee?.firstName} ${firstEmployee?.lastName}`
    );
    console.log(
      `📅 Next Holiday: ${nextHoliday?.name} on ${nextHoliday?.date?.toISOString().split('T')[0]}`
    );

    // Verify migrations
    const migrationResult = await prisma.$queryRaw`
      SELECT migration_name, finished_at 
      FROM _prisma_migrations 
      ORDER BY finished_at DESC 
      LIMIT 1
    `;

    if (migrationResult.length > 0) {
      console.log(`🔄 Latest Migration: ${migrationResult[0].migration_name}`);
      console.log(`⏰ Applied At: ${migrationResult[0].finished_at.toISOString()}`);
    }

    console.log('\n✅ Database verification complete!');
  } catch (error) {
    console.error('❌ Database verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
