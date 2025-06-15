import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Check if the path starts with /admin
  if (path.startsWith('/admin')) {
    // Get the user from cookies
    const user = request.cookies.get('user')?.value;
    
    if (!user) {
      // If no user is found, redirect to login
      return NextResponse.redirect(new URL('/form/login', request.url));
    }

    try {
      const userData = JSON.parse(user);
      if (userData.mb_level < 8) {
        // If user is not an admin (mb_level < 8), redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // If there's an error parsing the user data, redirect to login
      return NextResponse.redirect(new URL('/form/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ['/admin/:path*']
}; 