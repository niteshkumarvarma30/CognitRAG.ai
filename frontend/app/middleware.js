import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/ask(.*)',
  '/knowledge(.*)',
  '/integrations(.*)',
  '/security(.*)',
  '/settings(.*)',
  '/billing(.*)',
  '/ai(.*)',
  '/onboarding(.*)',
  '/metrics(.*)',
  '/playground(.*)',
  // Legacy routes kept for safety
  '/home(.*)',
  '/memory-hub(.*)',
  '/timeline(.*)',
  '/brain-bills(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const userAuth = await auth();
    if (!userAuth.userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
