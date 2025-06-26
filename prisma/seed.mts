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

const employeeData = [
  {
    empId: 'EMP001',
    firstName: 'Aarav',
    lastName: 'Sharma',
    officeEmail: 'aarav.sharma@company.com',
    mobileNo: '+91-9876543210',
    currentDesignation: 'Software Engineer',
    joiningDate: new Date('2023-01-15T00:00:00.000Z'),
    status: 'Active',
    employmentType: 'Full-time',
    stream: 'Engineering',
  },
  {
    empId: 'EMP002',
    firstName: 'Diya',
    lastName: 'Patel',
    officeEmail: 'diya.patel@company.com',
    mobileNo: '+91-9876543211',
    currentDesignation: 'Senior Developer',
    joiningDate: new Date('2022-08-20T00:00:00.000Z'),
    status: 'Active',
    employmentType: 'Full-time',
    stream: 'Engineering',
  },
  {
    empId: 'EMP003',
    firstName: 'Rohan',
    lastName: 'Mehta',
    officeEmail: 'rohan.mehta@company.com',
    mobileNo: '+91-9876543212',
    currentDesignation: 'Project Manager',
    joiningDate: new Date('2021-11-10T00:00:00.000Z'),
    status: 'Active',
    employmentType: 'Full-time',
    stream: 'Management',
  },
  {
    empId: 'EMP004',
    firstName: 'Priya',
    lastName: 'Singh',
    officeEmail: 'priya.singh@company.com',
    mobileNo: '+91-9876543213',
    currentDesignation: 'UI/UX Designer',
    joiningDate: new Date('2023-03-05T00:00:00.000Z'),
    status: 'Active',
    employmentType: 'Full-time',
    stream: 'Design',
  },
  {
    empId: 'EMP005',
    firstName: 'Vikram',
    lastName: 'Reddy',
    officeEmail: 'vikram.reddy@company.com',
    mobileNo: '+91-9876543214',
    currentDesignation: 'DevOps Engineer',
    joiningDate: new Date('2022-12-01T00:00:00.000Z'),
    status: 'Active',
    employmentType: 'Full-time',
    stream: 'Engineering',
  },
  {
    empId: 'EMP006',
    firstName: 'Ananya',
    lastName: 'Gupta',
    officeEmail: 'ananya.gupta@company.com',
    mobileNo: '+91-9876543215',
    currentDesignation: 'Business Analyst',
    joiningDate: new Date('2023-06-15T00:00:00.000Z'),
    status: 'On Leave',
    employmentType: 'Full-time',
    stream: 'Business',
  },
  {
    empId: 'EMP007',
    firstName: 'Arjun',
    lastName: 'Kumar',
    officeEmail: 'arjun.kumar@company.com',
    mobileNo: '+91-9876543216',
    currentDesignation: 'Quality Assurance',
    joiningDate: new Date('2022-04-18T00:00:00.000Z'),
    status: 'Active',
    employmentType: 'Full-time',
    stream: 'Quality',
  },
  {
    empId: 'EMP008',
    firstName: 'Kavya',
    lastName: 'Nair',
    officeEmail: 'kavya.nair@company.com',
    mobileNo: '+91-9876543217',
    currentDesignation: 'HR Manager',
    joiningDate: new Date('2021-09-12T00:00:00.000Z'),
    status: 'Active',
    employmentType: 'Full-time',
    stream: 'HR',
  },
  {
    empId: 'EMP009',
    firstName: 'Siddharth',
    lastName: 'Joshi',
    officeEmail: 'siddharth.joshi@company.com',
    mobileNo: '+91-9876543218',
    currentDesignation: 'Data Scientist',
    joiningDate: new Date('2023-02-28T00:00:00.000Z'),
    status: 'Inactive',
    employmentType: 'Full-time',
    stream: 'Data Science',
  },
  {
    empId: 'EMP010',
    firstName: 'Riya',
    lastName: 'Agarwal',
    officeEmail: 'riya.agarwal@company.com',
    mobileNo: '+91-9876543219',
    currentDesignation: 'Marketing Specialist',
    joiningDate: new Date('2022-10-05T00:00:00.000Z'),
    status: 'Active',
    employmentType: 'Full-time',
    stream: 'Marketing',
  },
];

async function main() {
  console.log(`Start seeding ...`);

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

  // Seed employees
  for (const emp of employeeData) {
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [{ empId: emp.empId }, { officeEmail: emp.officeEmail }],
      },
    });

    if (!existingEmployee) {
      const employee = await prisma.employee.create({
        data: {
          empId: emp.empId,
          firstName: emp.firstName,
          lastName: emp.lastName,
          officeEmail: emp.officeEmail,
          mobileNo: emp.mobileNo,
          currentDesignation: emp.currentDesignation,
          joiningDate: emp.joiningDate,
          status: emp.status,
          employmentType: emp.employmentType,
          stream: emp.stream,
        },
      });
      console.log(
        `Created employee '${employee.firstName} ${employee.lastName}' (${employee.empId}) with id: ${employee.id}`
      );
    } else {
      console.log(
        `Employee with empId '${emp.empId}' or email '${emp.officeEmail}' already exists. Skipping.`
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
