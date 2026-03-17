import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('mh_token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If logged in and on login page, redirect to dashboard
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
