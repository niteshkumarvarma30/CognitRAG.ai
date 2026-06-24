import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/home(.*)',
  '/knowledge-vault(.*)',
  '/memory-hub(.*)',
  '/graph-explorer(.*)',
  '/timeline(.*)',
  '/integrations(.*)',
  '/settings(.*)',
  '/brain-bills(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const userAuth = await auth();

    // Redirect to landing page with a flag to force the frontend to clear the expired cache
    if (!userAuth.userId) {
      const url = new URL('/', req.url);
      url.searchParams.set('sign_out', 'true');
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
