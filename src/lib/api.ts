export function getApiUrl(path: string): string {
  // Check if path is not starting with / then add /
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // Only use basePath in production
  const basePath =
    process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_BASE_PATH || '/payroll' : '';
  return `${basePath}/api${path}`;
}
