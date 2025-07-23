# Base Path Configuration

## Overview

This application now uses `/payroll` as the base path in both development and
production environments for consistency.

## Development Setup

### URLs

- **Application**: http://localhost:3000/payroll
- **API Routes**: http://localhost:3000/payroll/api/\*
- **Authentication**: http://localhost:3000/payroll/auth/\*

### Environment Variables

Make sure your `.env.local` file contains:

```bash
NEXTAUTH_URL="http://localhost:3000/payroll"
NEXT_PUBLIC_BASE_PATH="/payroll"
```

### Testing Base Path Setup

You can test the following URLs in development:

- http://localhost:3000/payroll (main app)
- http://localhost:3000/payroll/api/test (API test endpoint)
- http://localhost:3000/payroll/api/nextauth-debug (NextAuth debug info)
- http://localhost:3000/payroll/auth/signin (sign in page)

## Production Setup

### URLs

- **Application**: https://trinitstechnologies.com/payroll
- **API Routes**: https://trinitstechnologies.com/payroll/api/*
- **Authentication**: https://trinitstechnologies.com/payroll/auth/*

### Environment Variables

Production `.env.production` should contain:

```bash
NEXTAUTH_URL="https://trinitstechnologies.com/payroll"
NEXT_PUBLIC_BASE_PATH="/payroll"
```

## Important Notes

1. **Consistent Base Path**: Both development and production now use the same
   `/payroll` base path for better consistency.

2. **NextAuth Configuration**: NextAuth is configured to work with the base path
   automatically.

3. **Middleware**: The middleware is aware of the base path and handles routing
   correctly.

4. **API Calls**: All API calls use the `getApiUrl()` function which
   automatically includes the base path.

5. **Direct URL Access**: Accessing http://localhost:3000 (without /payroll)
   will show a 404 page. Always use the full URL with the base path.

## Troubleshooting

If you encounter issues:

1. Make sure your `.env.local` file has the correct `NEXTAUTH_URL` and
   `NEXT_PUBLIC_BASE_PATH`
2. Clear your browser cache and cookies
3. Restart the development server
4. Check that all API calls are using the `getApiUrl()` function
