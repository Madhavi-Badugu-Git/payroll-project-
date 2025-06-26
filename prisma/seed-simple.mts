import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

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
    configKey: 'COMPANY_NAME',
    configValue: 'Tech Solutions Inc.',
    description: 'Company name for the payroll system',
  },
  {
    configKey: 'WORKING_HOURS_PER_DAY',
    configValue: '8',
    description: 'Standard working hours per day',
  },
  {
    configKey: 'LEAVE_BALANCE_PER_YEAR',
    configValue: '24',
    description: 'Annual leave balance for employees',
  },
  { configKey: 'OVERTIME_MULTIPLIER', configValue: '1.5', description: 'Overtime pay multiplier' },
];

async function main() {
  console.log('Start seeding...');

  // Seed holidays
  for (const h of holidayData) {
    const existingHoliday = await prisma.holiday.findFirst({
      where: { date: h.date },
    });

    if (!existingHoliday) {
      const holiday = await prisma.holiday.create({
        data: h,
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

  // Seed configurations
  for (const config of configurationData) {
    const existingConfig = await prisma.configuration.findFirst({
      where: { configKey: config.configKey },
    });

    if (!existingConfig) {
      const configuration = await prisma.configuration.create({
        data: config,
      });
      console.log(
        `Created configuration '${configuration.configKey}' with value: ${configuration.configValue}`
      );
    } else {
      console.log(`Configuration '${existingConfig.configKey}' already exists. Skipping.`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
