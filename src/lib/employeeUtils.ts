import { PrismaClient } from '../generated/prisma';
import { getConfigurationValue } from './configurations';

const prisma = new PrismaClient();

/**
 * Generates the next employee ID using the configuration prefix
 * Format: {EMPLOYEE_ID_PREFIX}-{incrementing number}
 * Example: TRINITS-001, TRINITS-002, etc.
 */
export async function generateEmployeeId(): Promise<string> {
  try {
    // Get the prefix from configuration
    const prefix = (await getConfigurationValue('EMPLOYEE_ID_PREFIX')) || 'EMP';

    // Get the count of existing employees to determine the next number
    const employeeCount = await prisma.employee.count();

    // Generate the next ID with padding
    const nextNumber = employeeCount + 1;
    const paddedNumber = nextNumber.toString().padStart(3, '0');

    const employeeId = `${prefix}-${paddedNumber}`;

    // Ensure the generated ID is unique (in case of race conditions)
    const existingEmployee = await prisma.employee.findUnique({
      where: { empId: employeeId },
    });

    if (existingEmployee) {
      // If ID exists, try with a higher number
      const allEmployees = await prisma.employee.findMany({
        select: { empId: true },
        where: {
          empId: {
            startsWith: `${prefix}-`,
          },
        },
        orderBy: { empId: 'desc' },
      });

      let maxNumber = 0;
      for (const emp of allEmployees) {
        const numberPart = emp.empId.split('-')[1];
        if (numberPart && !isNaN(parseInt(numberPart))) {
          maxNumber = Math.max(maxNumber, parseInt(numberPart));
        }
      }

      const newNumber = maxNumber + 1;
      const newPaddedNumber = newNumber.toString().padStart(3, '0');
      return `${prefix}-${newPaddedNumber}`;
    }

    return employeeId;
  } catch (error) {
    console.error('Error generating employee ID:', error);

    // Fallback: generate a random ID
    const timestamp = Date.now().toString().slice(-6);
    return `EMP-${timestamp}`;
  }
}

/**
 * Validates if an employee ID follows the correct format
 */
export function validateEmployeeId(empId: string): boolean {
  const pattern = /^[A-Z]+(-\d{3,})$/;
  return pattern.test(empId);
}
