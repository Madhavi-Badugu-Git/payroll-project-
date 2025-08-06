export function getApiUrl(path: string): string {
  // Check if path is not starting with / then add /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // Use basePath in all environments now
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/payroll';
  return `${basePath}/api${path}`;
}
