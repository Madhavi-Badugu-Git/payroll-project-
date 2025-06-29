export function getApiUrl(path: string): string {
  // Check if path is not starting with / then add /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // Next.js automatically handles basePath for all routes including API routes
  // So we just return the API path and let Next.js add the basePath
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/payroll';
  return `${basePath}/api${path}`;
}
