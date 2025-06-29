// Debug script to test API URL generation
console.log('Testing API URL generation...');

// Simulate the getApiUrl function
function getApiUrl(path) {
  // Check if path is not starting with / then add /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // Next.js automatically handles basePath for all routes including API routes
  // So we just return the API path and let Next.js add the basePath
  return `/api${path}`;
}

console.log('getApiUrl("/sync-user"):', getApiUrl('/sync-user'));
console.log('getApiUrl("sync-user"):', getApiUrl('sync-user'));

// Test what happens with different base URLs
const testUrls = [
  'http://localhost:3000',
  'http://localhost:3000/payroll',
  'http://localhost:3000/payroll/',
];

testUrls.forEach(baseUrl => {
  const apiPath = getApiUrl('/sync-user');
  const fullUrl = baseUrl + apiPath;
  console.log(`${baseUrl} + ${apiPath} = ${fullUrl}`);
});
