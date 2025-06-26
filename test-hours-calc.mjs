// Test the hours calculation logic used in regularization approval
const testCalculation = () => {
  // Example from the regularization request:
  // requestedCheckIn: "2025-06-26T02:25:00.000Z"
  // requestedCheckOut: "2025-06-26T17:26:00.000Z"

  const checkInTime = new Date('2025-06-26T02:25:00.000Z');
  const checkOutTime = new Date('2025-06-26T17:26:00.000Z');

  const diffMs = checkOutTime.getTime() - checkInTime.getTime();
  const calculatedHours = Math.max(0, diffMs / (1000 * 60 * 60));
  const totalHours = parseFloat(calculatedHours.toFixed(2));
  const overtimeHours = parseFloat(Math.max(0, calculatedHours - 8).toFixed(2));

  let status = 'Present';
  if (calculatedHours >= 8) {
    status = 'Present';
  } else if (calculatedHours >= 4) {
    status = 'Half Day';
  } else if (calculatedHours > 0) {
    status = 'Short Leave';
  } else {
    status = 'Absent';
  }

  console.log('Test Calculation Results:');
  console.log('Check In:', checkInTime.toISOString());
  console.log('Check Out:', checkOutTime.toISOString());
  console.log('Time Difference (ms):', diffMs);
  console.log('Total Hours:', totalHours);
  console.log('Overtime Hours:', overtimeHours);
  console.log('Status:', status);
  console.log('Expected: 15.02 hours total, 7.02 overtime hours, Present status');
};

testCalculation();
