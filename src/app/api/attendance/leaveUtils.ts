import prisma from '@/lib/prisma';

export async function getLeaveMap(employeeId: string, startDate: Date, endDate: Date) {
  const leaves = await prisma.leaveApplication.findMany({
    where: {
      employeeId,
      OR: [
        { startDate: { gte: startDate, lt: endDate } },
        { endDate: { gte: startDate, lt: endDate } },
        { startDate: { lte: startDate }, endDate: { gte: endDate } },
      ],
    },
  });
  // Map: date string (YYYY-MM-DD) => { status, leaveType }
  const leaveMap = new Map<string, { status: string; leaveType: string }>();
  for (const leave of leaves) {
    const current = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      leaveMap.set(dateStr, { status: leave.status, leaveType: leave.leaveType });
      current.setDate(current.getDate() + 1);
    }
  }
  return leaveMap;
}
