# API BasePath Double Prefix Fix

## Problem

The application was showing double basePath prefixes in API URLs:

- Expected: `http://localhost:3000/api/sync-user` (dev) or
  `http://trinitstechnologies.com/payroll/api/sync-user` (prod)
- Actual: `http://localhost:3000/payroll/payroll/api/sync-user`

## Root Cause

The issue occurred because:

1. Next.js config had `basePath: '/payroll'` enabled for all environments
2. When accessing the app at `http://localhost:3000` in development, Next.js
   still applied the basePath internally
3. This caused the double `/payroll/payroll/` prefix in API URLs

## Solution

Modified `next.config.ts` to conditionally apply basePath only in production:

```typescript
// Base path for subdirectory deployment (only in production)
...(process.env.NODE_ENV === 'production' && {
  basePath: '/payroll',
  assetPrefix: '/payroll',
}),
```

## Benefits

1. **Development**: Access app at `http://localhost:3000` without basePath
   issues
2. **Production**: BasePath correctly applied for deployment at `/payroll`
   subdirectory
3. **API URLs**: No more double prefixes - URLs are clean and correct
4. **Consistent**: All API calls through `getApiUrl()` work correctly in both
   environments

## Testing

- ✅ Development build works at `http://localhost:3000`
- ✅ Production build compiles successfully
- ✅ All API calls use correct URLs
- ✅ No double basePath prefixes

## Files Modified

1. `/next.config.ts` - Conditional basePath configuration
2. `/src/lib/api.ts` - Updated comments for clarity

## Result

The application now correctly handles API URLs in both development and
production environments without double basePath prefixes.
