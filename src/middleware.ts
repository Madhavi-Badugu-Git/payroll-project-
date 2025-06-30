import { edgeLogHttp } from '@/lib/edge-logger';
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Define routes that should be public (no authentication required)
const publicRoutes = ['/', '/auth/signin', '/auth/signup', '/holidays', '/api/auth', '/api/trpc'];

// Define routes that require authentication
const protectedRoutes = ['/dashboard', '/admin', '/employees', '/leaves', '/documents', '/reports'];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // Log HTTP requests
    const { method, url } = req;
    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    const isPublicRoute = publicRoutes.some(
      route => pathname === route || pathname.startsWith(route + '/')
    );

    edgeLogHttp(`${method} ${url}`, {
      method,
      url,
      userAgent,
      ip,
      isPublicRoute,
    });

    // Allow public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Check if user is authenticated for protected routes
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      if (!req.nextauth.token) {
        // Redirect to sign-in if not authenticated
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('callbackUrl', req.url);
        return NextResponse.redirect(signInUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes
        if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
          return true;
        }

        // Require token for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
