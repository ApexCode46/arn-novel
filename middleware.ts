import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// กำหนด paths ที่ต้องการป้องกัน
const protectedPaths = {
  admin: ['/admin', '/api/admin'],       // ต้องมี role admin
  writer: ['/writer', '/editor', '/api/writer'], // แค่ login
  user: ['/profile', '/wallet', '/api/users'],   // แค่ login
  auth: ['/login'] // login แล้วห้ามเข้า
};

// Helper function
function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => pathname.startsWith(pattern));
}

function createRedirectUrl(request: NextRequest, loginPath: string): string {
  const callbackUrl = encodeURIComponent(request.url);
  return `${loginPath}?callbackUrl=${callbackUrl}`;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const staticPaths = [
    '/uploads/',
    '/adsImg/',
    '/novelImg/',
    '/imgArn/',
    '/profile_user/',
    '/voice/',
    '/BankAccount/',
    '/IDCard/',
    '/SelfiewithIDcard/'
  ];
  if (staticPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // ตรวจสอบ Admin
    if (matchesPath(pathname, protectedPaths.admin)) {
      if (pathname === '/api/admin/novel-management' || pathname === '/api/admin/transactions') {
        return NextResponse.next();
      }
      if (!token) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL(createRedirectUrl(request, '/login'), request.url));
      }
      if (token.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // ตรวจสอบ Writer
    if (matchesPath(pathname, protectedPaths.writer)) {
      if (!token) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL(createRedirectUrl(request, '/login'), request.url));
      }
    }

    // ตรวจสอบ User
    if (matchesPath(pathname, protectedPaths.user)) {
      if (!token) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL(createRedirectUrl(request, '/login'), request.url));
      }
    }

    // ตรวจสอบ Auth path
    if (matchesPath(pathname, protectedPaths.auth)) {
      if (token) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // ✅ Security headers
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    );
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

    // ✅ CORS headers สำหรับ API
    if (pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || 'http://localhost:3000');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Vary', 'Origin');

      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: response.headers });
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);

    // ถ้า error และเป็น admin path → block
    if (matchesPath(pathname, protectedPaths.admin)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/writer/:path*',
    '/editor/:path*',
    '/api/writer/:path*',
    '/profile/:path*',
    '/wallet/:path*',
    '/api/users/:path*',
    '/login'
  ],
};
