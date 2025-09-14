import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// กำหนด paths ที่ต้องการป้องกัน
const protectedPaths = {
  // Admin paths - ต้องมี role admin
  admin: [
    '/admin',
    '/api/admin'
  ],
  // Writer paths - ต้อง login เท่านั้น
  writer: [
    '/writer',
    '/editor',
    '/api/writer'
  ],
  // User paths - ต้อง login
  user: [
    '/profile',
    '/wallet',
    '/api/users'
  ],
  // Auth paths - เมื่อ login แล้วไม่ควรเข้าได้
  auth: [
    '/login'
  ]
};

// Helper function สำหรับตรวจสอบว่า path ตรงกับ pattern หรือไม่
function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => pathname.startsWith(pattern));
}

// Helper function สำหรับ redirect กลับไปหน้าเดิมหลัง login
function createRedirectUrl(request: NextRequest, loginPath: string): string {
  const callbackUrl = encodeURIComponent(request.url);
  return `${loginPath}?callbackUrl=${callbackUrl}`;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  try {
    // ดึง token จาก NextAuth
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // ตรวจสอบ Admin paths
    if (matchesPath(pathname, protectedPaths.admin)) {
      // ยกเว้น novel-management API และ transactions API
      if (pathname === '/api/admin/novel-management' || pathname === '/api/admin/transactions') {
        return NextResponse.next();
      }
      
      if (!token) {
        return NextResponse.redirect(
          new URL(createRedirectUrl(request, '/login'), request.url)
        );
      }
      
      if (token.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // ตรวจสอบ Writer paths
    if (matchesPath(pathname, protectedPaths.writer)) {
      if (!token) {
        return NextResponse.redirect(
          new URL(createRedirectUrl(request, '/login'), request.url)
        );
      }
      // ไม่ต้องตรวจสอบการลงทะเบียนนักเขียน - ทุก role ใช้ได้
    }

    // ตรวจสอบ User paths
    if (matchesPath(pathname, protectedPaths.user)) {
      if (!token) {
        return NextResponse.redirect(
          new URL(createRedirectUrl(request, '/login'), request.url)
        );
      }
    }

    // ตรวจสอบ Auth paths (ป้องกันไม่ให้คนที่ login แล้วเข้าหน้า login)
    if (matchesPath(pathname, protectedPaths.auth)) {
      if (token) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // เพิ่ม security headers
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // CORS headers สำหรับ API
    if (pathname.startsWith('/api/')) {
      response.headers.set('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || 'http://localhost:3000');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');
      
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: response.headers });
      }
    }

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // ในกรณีที่เกิดข้อผิดพลาด ให้ผ่านไปได้
    // แต่ถ้าเป็น admin path ให้ block
    if (matchesPath(pathname, protectedPaths.admin)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return NextResponse.next();
  }
}

// กำหนด matcher สำหรับ paths ที่ต้องการให้ middleware ทำงาน
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|novelImg|imgArn|adsImg|profile_user|voice).*)',
  ],
};
