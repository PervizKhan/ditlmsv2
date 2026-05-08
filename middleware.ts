// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/utils/jwt';

const PUBLIC_ROUTES = ['/login', '/register', '/verify'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  let payload = null;
  if (token) {
    payload = await verifyToken(token); // Now async
  }

  console.log('Middleware - Path:', pathname);
  console.log('Middleware - Has token:', !!token);
  console.log('Middleware - Payload:', payload);

  // Public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    if (payload) {
      const redirectTo = payload.role === 'admin' ? '/dashboard/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!payload) {
    console.log('Redirecting to login - no valid token');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Role-based protection
  if (pathname.startsWith('/dashboard/admin') && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/verify'],
};