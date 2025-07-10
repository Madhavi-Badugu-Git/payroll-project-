const { PrismaClient } = require('./src/generated/prisma');

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
    configKey: 'EMPLOYEE_ID_PREFIX',
    configValue: 'TRINITS',
    description: 'Prefix used for generating employee IDs',
  },
  {
    configKey: 'SANCTIONED_LEAVE_PER_YEAR',
    configValue: '24',
    description: 'Total number of sanctioned leaves per year for each employee',
  },
  {
    configKey: 'WORKING_HOURS_PER_DAY',
    configValue: '8',
    description: 'Standard working hours per day',
  },
  {
    configKey: 'OVERTIME_THRESHOLD',
    configValue: '8.5',
    description: 'Hours threshold after which overtime calculation begins',
  },
];

async function main() {
  console.log(`Start seeding holidays and configuration...`);

  // Seed holidays
  for (const h of holidayData) {
    const existingHoliday = await prisma.holiday.findFirst({
      where: { date: h.date },
    });

    if (!existingHoliday) {
      const holiday = await prisma.holiday.create({
        data: {
          name: h.name,
          date: h.date,
        },
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
    const existingConfig = await prisma.configuration.findUnique({
      where: { configKey: config.configKey },
    });

    if (!existingConfig) {
      const configuration = await prisma.configuration.create({
        data: {
          configKey: config.configKey,
          configValue: config.configValue,
          description: config.description,
        },
      });
      console.log(
        `Created configuration '${configuration.configKey}' with value: ${configuration.configValue}`
      );
    } else {
      console.log(
        `Configuration '${config.configKey}' already exists with value: ${existingConfig.configValue}. Skipping.`
      );
    }
  }

  console.log(`Seeding finished.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
