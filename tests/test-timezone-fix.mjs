// Test script to verify timezone handling in regularization times
console.log('Testing timezone handling for regularization times...\n');

// Simulate user input: "09:00" (meaning 9 AM local time)
const userTimeInput = '09:00';
const entryDate = '2025-06-26';

// Old way (causing timezone issue)
const oldWay = `${entryDate}T${userTimeInput}:00.000Z`;
console.log('Old way (with Z suffix):', oldWay);
console.log('Old way parsed as Date:', new Date(oldWay).toISOString());
console.log(
  'Old way displayed (UTC hours):',
  new Date(oldWay).getUTCHours() +
    ':' +
    new Date(oldWay).getUTCMinutes().toString().padStart(2, '0')
);
console.log(
  'Old way displayed (local time):',
  new Date(oldWay).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
);

console.log('\n---\n');

// New way (preserving intended time)
const newWay = `${entryDate}T${userTimeInput}:00`;
console.log('New way (without Z suffix):', newWay);
console.log('New way parsed as Date:', new Date(newWay).toISOString());
console.log(
  'New way displayed (UTC hours):',
  new Date(newWay).getUTCHours() +
    ':' +
    new Date(newWay).getUTCMinutes().toString().padStart(2, '0')
);
console.log(
  'New way displayed (local time):',
  new Date(newWay).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
);

console.log('\n---\n');

// Test formatTime function logic
function formatTime(timeString) {
  if (!timeString) return '-';

  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      const timeDate = new Date(`2000-01-01T${timeString}`);
      if (isNaN(timeDate.getTime())) return '-';
      return timeDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Check if the string ends with 'Z' (UTC) or has timezone info
    if (
      timeString.endsWith('Z') ||
      timeString.includes('+') ||
      timeString.match(/T\d{2}:\d{2}:\d{2}\.\d{3}/)
    ) {
      // For UTC times, display the UTC time to avoid timezone conversion
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else {
      // For local times, use local time formatting
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  } catch (_error) {
    return '-';
  }
}

console.log('formatTime with old format:', formatTime(oldWay));
console.log('formatTime with new format:', formatTime(newWay));
console.log('User expected to see:', userTimeInput);
