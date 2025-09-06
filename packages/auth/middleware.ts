import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { setDatabaseContext } from '@repo/database/nextjs-middleware';

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/health',
    '/api/webhooks(.*)',
  ],
  
  // Routes that require authentication
  protectedRoutes: [
    '/dashboard(.*)',
    '/properties(.*)',
    '/units(.*)',
    '/leases(.*)',
    '/work-orders(.*)',
    '/reports(.*)',
    '/settings(.*)',
    '/api/properties(.*)',
    '/api/units(.*)',
    '/api/leases(.*)',
    '/api/work-orders(.*)',
    '/api/reports(.*)',
  ],

  // Custom logic for handling authenticated requests
  beforeAuth: (req) => {
    // Add any pre-authentication logic here
    return NextResponse.next();
  },

  // Custom logic after authentication
  afterAuth: async (auth, req) => {
    const { userId, orgId } = auth;
    
    // If user is not authenticated and trying to access protected route
    if (!userId && req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If user is not authenticated and trying to access protected page
    if (!userId && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // If user is authenticated but not in an organization
    if (userId && !orgId && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // If user is authenticated and in an organization, set database context
    if (userId && orgId) {
      try {
        // Set database context for RLS
        await setDatabaseContext({
          orgId,
          userId,
          userRole: 'unknown', // Will be determined from database
        });
      } catch (error) {
        console.error('Failed to set database context:', error);
        // Continue with the request even if context setting fails
        // The database queries will handle the error appropriately
      }
    }

    return NextResponse.next();
  },

  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};