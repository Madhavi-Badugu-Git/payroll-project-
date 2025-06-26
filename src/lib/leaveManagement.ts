import { PrismaClient } from '@/generated/prisma';
import { getAppConfigurations } from './configurations';

const prisma = new PrismaClient();

interface LeaveAccumulation {
  id: string;
  empId: string;
  year: number;
  month: number;
  monthName: string;
  allocatedDays: number;
  reason: string;
  accumulationDate: Date;
  createdAt: Date;
}

interface LeaveTransaction {
  id: string;
  empId: string;
  leaveApplicationId: string | null;
  transactionType: string;
  days: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  transactionDate: Date;
  createdAt: Date;
  leaveApplication?: {
    id: string;
    startDate: Date;
    endDate: Date;
    leaveType: string;
    reason: string;
    status: string;
  } | null;
}

interface LeaveCalculationResult {
  totalAllocated: number;
  totalUsed: number;
  totalAvailable: number;
  carryForward: number;
}

interface ProRataCalculation {
  joiningMonth: number;
  joiningYear: number;
  daysInJoiningMonth: number;
  daysSinceJoining: number;
  proRataLeaves: number;
  remainingMonthsInYear: number;
  totalFirstYearAllocation: number;
}

export class LeaveManagementService {
  /**
   * Calculate pro-rata leaves for a new employee based on joining date
   */
  static calculateProRataLeaves(
    joiningDate: Date,
    sanctionedLeavePerYear: number
  ): ProRataCalculation {
    const joiningMonth = joiningDate.getMonth() + 1; // 1-12
    const joiningYear = joiningDate.getFullYear();
    const joiningDay = joiningDate.getDate();

    // Get total days in joining month
    const daysInJoiningMonth = new Date(joiningYear, joiningMonth, 0).getDate();

    // Calculate days since joining in the current month
    const daysSinceJoining = daysInJoiningMonth - joiningDay + 1;

    // Calculate remaining months in the year (including current month)
    const remainingMonthsInYear = 13 - joiningMonth;

    // Monthly leave allocation
    const monthlyLeaveAllocation = sanctionedLeavePerYear / 12;

    // Pro-rata for joining month
    const proRataForJoiningMonth = (daysSinceJoining / daysInJoiningMonth) * monthlyLeaveAllocation;

    // Full allocation for remaining months
    const leavesForRemainingMonths = (remainingMonthsInYear - 1) * monthlyLeaveAllocation;

    // Total pro-rata allocation for the first year
    const totalFirstYearAllocation =
      Math.round((proRataForJoiningMonth + leavesForRemainingMonths) * 100) / 100;

    return {
      joiningMonth,
      joiningYear,
      daysInJoiningMonth,
      daysSinceJoining,
      proRataLeaves: Math.round(proRataForJoiningMonth * 100) / 100,
      remainingMonthsInYear,
      totalFirstYearAllocation,
    };
  }

  /**
   * Initialize leave balance for a new employee
   */
  static async initializeEmployeeLeaves(empId: string, joiningDate: Date): Promise<void> {
    const configs = await getAppConfigurations();
    const sanctionedLeavePerYear = configs.SANCTIONED_LEAVE_PER_YEAR;

    const proRata = this.calculateProRataLeaves(joiningDate, sanctionedLeavePerYear);
    const currentYear = new Date().getFullYear();

    // Create leave balance record
    await prisma.leaveBalance.upsert({
      where: {
        empId_year: {
          empId,
          year: currentYear,
        },
      },
      create: {
        empId,
        year: currentYear,
        totalAllocated: proRata.totalFirstYearAllocation,
        totalUsed: 0,
        totalAvailable: proRata.totalFirstYearAllocation,
        carryForward: 0,
      },
      update: {
        totalAllocated: proRata.totalFirstYearAllocation,
        totalAvailable: proRata.totalFirstYearAllocation,
      },
    });

    // Create leave accumulation record for joining month
    await prisma.leaveAccumulation.upsert({
      where: {
        empId_year_month: {
          empId,
          year: proRata.joiningYear,
          month: proRata.joiningMonth,
        },
      },
      create: {
        empId,
        year: proRata.joiningYear,
        month: proRata.joiningMonth,
        monthName: new Date(proRata.joiningYear, proRata.joiningMonth - 1).toLocaleString(
          'default',
          { month: 'long' }
        ),
        allocatedDays: proRata.proRataLeaves,
        reason: 'JOINING_PRORATA',
        accumulationDate: joiningDate,
      },
      update: {
        allocatedDays: proRata.proRataLeaves,
        reason: 'JOINING_PRORATA',
      },
    });

    // Create leave transaction for initial allocation
    await prisma.leaveTransaction.create({
      data: {
        empId,
        transactionType: 'CREDIT',
        days: proRata.totalFirstYearAllocation,
        balanceBefore: 0,
        balanceAfter: proRata.totalFirstYearAllocation,
        reason: `Initial leave allocation (pro-rata from ${joiningDate.toLocaleDateString()})`,
        transactionDate: joiningDate,
      },
    });
  }

  /**
   * Add monthly leave allocation for all active employees
   */
  static async processMonthlyLeaveAllocation(): Promise<void> {
    const configs = await getAppConfigurations();
    const sanctionedLeavePerYear = configs.SANCTIONED_LEAVE_PER_YEAR;
    const monthlyAllocation = sanctionedLeavePerYear / 12;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    // Get all active employees
    const activeEmployees = await prisma.employee.findMany({
      where: {
        status: 'Active',
        joiningDate: {
          lt: new Date(currentYear, currentMonth - 1, 1), // Joined before this month
        },
      },
      select: {
        empId: true,
        joiningDate: true,
      },
    });

    for (const employee of activeEmployees) {
      // Check if allocation already exists for this month
      const existingAllocation = await prisma.leaveAccumulation.findUnique({
        where: {
          empId_year_month: {
            empId: employee.empId,
            year: currentYear,
            month: currentMonth,
          },
        },
      });

      if (!existingAllocation) {
        // Get current balance
        const currentBalance = await prisma.leaveBalance.findUnique({
          where: {
            empId_year: {
              empId: employee.empId,
              year: currentYear,
            },
          },
        });

        if (currentBalance) {
          // Create leave accumulation record
          await prisma.leaveAccumulation.create({
            data: {
              empId: employee.empId,
              year: currentYear,
              month: currentMonth,
              monthName,
              allocatedDays: monthlyAllocation,
              reason: 'MONTHLY_ALLOCATION',
              accumulationDate: new Date(currentYear, currentMonth - 1, 1),
            },
          });

          // Update leave balance
          const newTotalAllocated = currentBalance.totalAllocated + monthlyAllocation;
          const newTotalAvailable = currentBalance.totalAvailable + monthlyAllocation;

          await prisma.leaveBalance.update({
            where: {
              empId_year: {
                empId: employee.empId,
                year: currentYear,
              },
            },
            data: {
              totalAllocated: newTotalAllocated,
              totalAvailable: newTotalAvailable,
            },
          });

          // Create leave transaction
          await prisma.leaveTransaction.create({
            data: {
              empId: employee.empId,
              transactionType: 'CREDIT',
              days: monthlyAllocation,
              balanceBefore: currentBalance.totalAvailable,
              balanceAfter: newTotalAvailable,
              reason: `Monthly leave allocation for ${monthName} ${currentYear}`,
              transactionDate: new Date(currentYear, currentMonth - 1, 1),
            },
          });
        }
      }
    }
  }

  /**
   * Deduct leaves when leave application is approved
   */
  static async deductLeaves(
    empId: string,
    leaveApplicationId: string,
    days: number
  ): Promise<boolean> {
    const currentYear = new Date().getFullYear();

    // Get current balance
    const currentBalance = await prisma.leaveBalance.findUnique({
      where: {
        empId_year: {
          empId,
          year: currentYear,
        },
      },
    });

    if (!currentBalance || currentBalance.totalAvailable < days) {
      return false; // Insufficient leave balance
    }

    // Update leave balance
    const newTotalUsed = currentBalance.totalUsed + days;
    const newTotalAvailable = currentBalance.totalAvailable - days;

    await prisma.leaveBalance.update({
      where: {
        empId_year: {
          empId,
          year: currentYear,
        },
      },
      data: {
        totalUsed: newTotalUsed,
        totalAvailable: newTotalAvailable,
      },
    });

    // Create leave transaction
    await prisma.leaveTransaction.create({
      data: {
        empId,
        leaveApplicationId,
        transactionType: 'DEBIT',
        days: -days, // Negative for deduction
        balanceBefore: currentBalance.totalAvailable,
        balanceAfter: newTotalAvailable,
        reason: `Leave deduction for approved application`,
        transactionDate: new Date(),
      },
    });

    return true;
  }

  /**
   * Credit leaves when leave application is rejected or cancelled
   */
  static async creditLeaves(
    empId: string,
    leaveApplicationId: string,
    days: number
  ): Promise<void> {
    const currentYear = new Date().getFullYear();

    // Get current balance
    const currentBalance = await prisma.leaveBalance.findUnique({
      where: {
        empId_year: {
          empId,
          year: currentYear,
        },
      },
    });

    if (currentBalance) {
      // Update leave balance
      const newTotalUsed = Math.max(0, currentBalance.totalUsed - days);
      const newTotalAvailable = currentBalance.totalAvailable + days;

      await prisma.leaveBalance.update({
        where: {
          empId_year: {
            empId,
            year: currentYear,
          },
        },
        data: {
          totalUsed: newTotalUsed,
          totalAvailable: newTotalAvailable,
        },
      });

      // Create leave transaction
      await prisma.leaveTransaction.create({
        data: {
          empId,
          leaveApplicationId,
          transactionType: 'CREDIT',
          days: days,
          balanceBefore: currentBalance.totalAvailable,
          balanceAfter: newTotalAvailable,
          reason: `Leave credit for rejected/cancelled application`,
          transactionDate: new Date(),
        },
      });
    }
  }

  /**
   * Get employee leave balance and history
   */
  static async getEmployeeLeaveInfo(
    empId: string,
    year?: number
  ): Promise<{
    balance: LeaveCalculationResult | null;
    accumulations: LeaveAccumulation[];
    transactions: LeaveTransaction[];
  }> {
    const targetYear = year || new Date().getFullYear();

    // Get leave balance
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        empId_year: {
          empId,
          year: targetYear,
        },
      },
    });

    // Get leave accumulations
    const accumulations = await prisma.leaveAccumulation.findMany({
      where: {
        empId,
        year: targetYear,
      },
      orderBy: {
        month: 'asc',
      },
    });

    // Get leave transactions
    const transactions = await prisma.leaveTransaction.findMany({
      where: {
        empId,
        transactionDate: {
          gte: new Date(targetYear, 0, 1),
          lte: new Date(targetYear, 11, 31),
        },
      },
      include: {
        leaveApplication: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            leaveType: true,
            reason: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      balance: balance
        ? {
            totalAllocated: balance.totalAllocated,
            totalUsed: balance.totalUsed,
            totalAvailable: balance.totalAvailable,
            carryForward: balance.carryForward,
          }
        : null,
      accumulations,
      transactions,
    };
  }

  /**
   * Handle carry forward leaves to next year
   */
  static async processYearEndCarryForward(maxCarryForwardDays: number = 10): Promise<void> {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const configs = await getAppConfigurations();
    // Note: sanctionedLeavePerYear available for future enhancements
    const _sanctionedLeavePerYear = configs.SANCTIONED_LEAVE_PER_YEAR;

    // Get all employee balances for current year
    const employeeBalances = await prisma.leaveBalance.findMany({
      where: {
        year: currentYear,
      },
      include: {
        employee: {
          select: {
            empId: true,
            status: true,
          },
        },
      },
    });

    for (const balance of employeeBalances) {
      if (balance.employee.status === 'Active') {
        // Calculate carry forward (min of available balance and max carry forward allowed)
        const carryForward = Math.min(balance.totalAvailable, maxCarryForwardDays);

        // Create next year's balance
        await prisma.leaveBalance.upsert({
          where: {
            empId_year: {
              empId: balance.empId,
              year: nextYear,
            },
          },
          create: {
            empId: balance.empId,
            year: nextYear,
            totalAllocated: carryForward,
            totalUsed: 0,
            totalAvailable: carryForward,
            carryForward: carryForward,
          },
          update: {
            carryForward: carryForward,
            totalAllocated: carryForward,
            totalAvailable: carryForward,
          },
        });

        // Create carry forward transaction if there are leaves to carry
        if (carryForward > 0) {
          await prisma.leaveTransaction.create({
            data: {
              empId: balance.empId,
              transactionType: 'CREDIT',
              days: carryForward,
              balanceBefore: 0,
              balanceAfter: carryForward,
              reason: `Carry forward from ${currentYear}`,
              transactionDate: new Date(nextYear, 0, 1),
            },
          });

          // Create accumulation record for carry forward
          await prisma.leaveAccumulation.create({
            data: {
              empId: balance.empId,
              year: nextYear,
              month: 1,
              monthName: 'January',
              allocatedDays: carryForward,
              reason: 'CARRY_FORWARD',
              accumulationDate: new Date(nextYear, 0, 1),
            },
          });
        }
      }
    }
  }
}
