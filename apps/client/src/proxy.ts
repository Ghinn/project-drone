import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || '__session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  let userRole: string | null = null;

  if (sessionCookie) {
    try {
      const base64Url = sessionCookie.split('.')[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const parsedClaims = JSON.parse(jsonPayload);
        userRole = parsedClaims.role || (parsedClaims.admin ? 'ADMIN' : null);
      }
    } catch (error) {
      console.warn('[Proxy] Gagal parsing session cookie, anggap Guest.');
    }
  }
  const cleanPath = pathname.replace(/^\/(id|en)(?=\/|$)/, '') || '/';

  const isAdminRoute = cleanPath.startsWith('/admin');
  const isOperatorRoute = cleanPath.startsWith('/monitoringOperator');
  const isFarmerRoute = cleanPath.startsWith('/monitoringFarmer');
  const isAuthRoute = cleanPath.startsWith('/login') || cleanPath.startsWith('/register') || cleanPath.startsWith('/forgot-password') || cleanPath.startsWith('/setup-password');

  if (sessionCookie && userRole && isAuthRoute) {
    return redirectBasedRole(userRole, request.url);
  }

  if (!sessionCookie || !userRole) {
    if (isAdminRoute || isOperatorRoute || isFarmerRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (userRole) {
    if (isAdminRoute && userRole !== 'ADMIN') {
      return redirectBasedRole(userRole, request.url);
    }
    if (isOperatorRoute && userRole !== 'OPERATOR' && userRole !== 'ADMIN') {
      return redirectBasedRole(userRole, request.url);
    }
    if (isFarmerRoute && userRole !== 'FARMER' && userRole !== 'ADMIN') {
      return redirectBasedRole(userRole, request.url);
    }
  }

  return NextResponse.next();
}

function redirectBasedRole(role: string, baseUrl: string) {
  if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/overview', baseUrl));
  if (role === 'OPERATOR') return NextResponse.redirect(new URL('/monitoringOperator', baseUrl));
  if (role === 'FARMER') return NextResponse.redirect(new URL('/monitoringFarmer', baseUrl));
  return NextResponse.redirect(new URL('/', baseUrl));
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
};