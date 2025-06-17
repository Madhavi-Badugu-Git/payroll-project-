import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

const holidayData = [
  { date: new Date("2025-01-01T00:00:00.000Z"), name: "New Year" },
  { date: new Date("2025-01-14T00:00:00.000Z"), name: "Pongal" },
  { date: new Date("2025-03-31T00:00:00.000Z"), name: "Ramzan Id/Eid-ul-Fitar" },
  { date: new Date("2025-05-01T00:00:00.000Z"), name: "May Day" },
  { date: new Date("2025-08-15T00:00:00.000Z"), name: "Independence Day" },
  { date: new Date("2025-08-27T00:00:00.000Z"), name: "Vinayaka Chavithi" },
  { date: new Date("2025-10-02T00:00:00.000Z"), name: "Gandhi Jayanthi/Dussehra" },
  { date: new Date("2025-10-20T00:00:00.000Z"), name: "Deepavali" },
  { date: new Date("2025-12-25T00:00:00.000Z"), name: "Christmas" }
];

const employeeData = [
  {
    empId: "EMP001",
    name: "Aarav Sharma",
    email: "aarav.sharma@company.com",
    phoneNo: "+91-9876543210",
    designation: "Software Engineer",
    joiningDate: new Date("2023-01-15T00:00:00.000Z"),
    status: "Active"
  },
  {
    empId: "EMP002",
    name: "Diya Patel",
    email: "diya.patel@company.com",
    phoneNo: "+91-9876543211",
    designation: "Senior Developer",
    joiningDate: new Date("2022-08-20T00:00:00.000Z"),
    status: "Active"
  },
  {
    empId: "EMP003",
    name: "Rohan Mehta",
    email: "rohan.mehta@company.com",
    phoneNo: "+91-9876543212",
    designation: "Project Manager",
    joiningDate: new Date("2021-11-10T00:00:00.000Z"),
    status: "Active"
  },
  {
    empId: "EMP004",
    name: "Priya Singh",
    email: "priya.singh@company.com",
    phoneNo: "+91-9876543213",
    designation: "UI/UX Designer",
    joiningDate: new Date("2023-03-05T00:00:00.000Z"),
    status: "Active"
  },
  {
    empId: "EMP005",
    name: "Vikram Reddy",
    email: "vikram.reddy@company.com",
    phoneNo: "+91-9876543214",
    designation: "DevOps Engineer",
    joiningDate: new Date("2022-12-01T00:00:00.000Z"),
    status: "Active"
  },
  {
    empId: "EMP006",
    name: "Ananya Gupta",
    email: "ananya.gupta@company.com",
    phoneNo: "+91-9876543215",
    designation: "Business Analyst",
    joiningDate: new Date("2023-06-15T00:00:00.000Z"),
    status: "On Leave"
  },
  {
    empId: "EMP007",
    name: "Arjun Kumar",
    email: "arjun.kumar@company.com",
    phoneNo: "+91-9876543216",
    designation: "Quality Assurance",
    joiningDate: new Date("2022-04-18T00:00:00.000Z"),
    status: "Active"
  },
  {
    empId: "EMP008",
    name: "Kavya Nair",
    email: "kavya.nair@company.com",
    phoneNo: "+91-9876543217",
    designation: "HR Manager",
    joiningDate: new Date("2021-09-12T00:00:00.000Z"),
    status: "Active"
  },
  {
    empId: "EMP009",
    name: "Siddharth Joshi",
    email: "siddharth.joshi@company.com",
    phoneNo: "+91-9876543218",
    designation: "Data Scientist",
    joiningDate: new Date("2023-02-28T00:00:00.000Z"),
    status: "Inactive"
  },
  {
    empId: "EMP010",
    name: "Riya Agarwal",
    email: "riya.agarwal@company.com",
    phoneNo: "+91-9876543219",
    designation: "Marketing Specialist",
    joiningDate: new Date("2022-10-05T00:00:00.000Z"),
    status: "Active"
  }
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
      console.log(`Created holiday '${holiday.name}' with id: ${holiday.id} for date ${h.date.toISOString().substring(0,10)}`);
    } else {
      console.log(`Holiday for date ${h.date.toISOString().substring(0,10)} ('${existingHoliday.name}') already exists with id: ${existingHoliday.id}. Skipping.`);
    }
  }

  // Seed employees
  for (const emp of employeeData) {
    const existingEmployee = await prisma.employee.findFirst({
      where: { 
        OR: [
          { empId: emp.empId },
          { email: emp.email }
        ]
      },
    });

    if (!existingEmployee) {
      const employee = await prisma.employee.create({
        data: {
          empId: emp.empId,
          name: emp.name,
          email: emp.email,
          phoneNo: emp.phoneNo,
          designation: emp.designation,
          joiningDate: emp.joiningDate,
          status: emp.status,
        },
      });
      console.log(`Created employee '${employee.name}' (${employee.empId}) with id: ${employee.id}`);
    } else {
      console.log(`Employee with empId '${emp.empId}' or email '${emp.email}' already exists. Skipping.`);
    }
  }
  
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
