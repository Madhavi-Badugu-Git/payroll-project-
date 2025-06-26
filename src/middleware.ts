import { edgeLogHttp } from '@/lib/edge-logger';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define routes that should be public
const isPublicRoute = createRouteMatcher([
  '/holidays(.*)', // Makes /holidays and its sub-paths public
  '/api/trpc(.*)', // Example: if you have tRPC routes that need to be public
]);

export default clerkMiddleware((auth, request) => {
  // Log HTTP requests
  const { method, url } = request;
  const userAgent = request.headers.get('user-agent') || '';
  const ip =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  edgeLogHttp(`${method} ${url}`, {
    method,
    url,
    userAgent,
    ip,
    isPublicRoute: isPublicRoute(request),
  });

  if (!isPublicRoute(request)) {
    // For routes that are not public, protect them.
    // The auth() call itself, when not in a public route, will trigger authentication.
    auth();
  }
});

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
