import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from './prisma';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  isWriterApproved?: boolean;
  writerApplication?: {
    registerWriter_id: string;
    status: string;
    created_at: Date;
    updated_at: Date;
  } | null;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  statusCode?: number;
}

/**
 * ตรวจสอบ authentication และ authorization สำหรับ API routes
 */
export async function authorize(
  request: NextRequest,
  requiredRole?: 'admin' | 'writer' | 'user',
): Promise<AuthResult> {
  try {
    // ดึง token จาก NextAuth
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    console.log('Token received:', { token, hasRole: !!token?.role, userId: token?.userId });

    if (!token || !token.sub) {
      console.log('No token or token.sub');
      return {
        success: false,
        error: 'Authentication required',
        statusCode: 401
      };
    }

    // ดึงข้อมูล user จากฐานข้อมูล
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        registerWriter: {
          select: {
            registerWriter_id: true,
            status: true,
            created_at: true,
            updated_at: true
          }
        }
      }
    });

    console.log('User from DB:', { user, requiredRole });

    if (!user) {
      console.log('User not found in DB');
      return {
        success: false,
        error: 'User not found',
        statusCode: 404
      };
    }

    // ตรวจสอบ role ที่ต้องการ
    if (requiredRole) {
      console.log('Checking role:', { userRole: user.role, requiredRole });
      
      if (requiredRole === 'admin' && user.role !== 'admin') {
        console.log('Admin access denied');
        return {
          success: false,
          error: 'Admin access required',
          statusCode: 403
        };
      }

      if (requiredRole === 'writer') {
        // ไม่ต้องตรวจสอบการลงทะเบียนนักเขียน - ทุก role ใช้ได้
        // ผ่านไปเลย
      }
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
      isWriterApproved: user.registerWriter?.status === 'approved',
      writerApplication: user.registerWriter
    };

    return {
      success: true,
      user: authUser
    };

  } catch (error) {
    console.error('Authorization error:', error);
    return {
      success: false,
      error: 'Internal server error',
      statusCode: 500
    };
  }
}

/**
 * Helper function สำหรับสร้าง error response
 */
export function createErrorResponse(error: string, statusCode: number = 400) {
  return new Response(
    JSON.stringify({ error }),
    { 
      status: statusCode,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Helper function สำหรับ validate request method
 */
export function validateMethod(request: NextRequest, allowedMethods: string[]) {
  if (!allowedMethods.includes(request.method)) {
    return createErrorResponse(
      `Method ${request.method} not allowed`, 
      405
    );
  }
  return null;
}

/**
 * Wrapper function สำหรับ API routes ที่ต้องการ authentication
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthUser, params?: Record<string, unknown>) => Promise<Response>,
  options: {
    requiredRole?: 'admin' | 'writer' | 'user';
    allowedMethods?: string[];
  } = {}
) {
  return async (request: NextRequest, params?: Record<string, unknown>) => {
    // ตรวจสอบ method
    if (options.allowedMethods) {
      const methodError = validateMethod(request, options.allowedMethods);
      if (methodError) return methodError;
    }

    // ตรวจสอบ authorization
    const authResult = await authorize(
      request, 
      options.requiredRole
    );

    if (!authResult.success) {
      return createErrorResponse(
        authResult.error!,
        authResult.statusCode!
      );
    }

    // เรียก handler พร้อมส่ง user data
    return handler(request, authResult.user!, params);
  };
}

/**
 * Helper function สำหรับตรวจสอบว่า story เป็นของ user หรือไม่
 */
export async function validateStoryOwnership(storyId: string, userId: string): Promise<boolean> {
  try {
    const story = await prisma.stories.findFirst({
      where: {
        story_id: storyId,
        user_id: userId
      }
    });
    return !!story;
  } catch (error) {
    console.error('Error validating story ownership:', error);
    return false;
  }
}

/**
 * Helper function สำหรับตรวจสอบว่า chapter เป็นของ user หรือไม่
 */
export async function validateChapterOwnership(chapterId: string, userId: string): Promise<boolean> {
  try {
    const chapter = await prisma.chapters.findFirst({
      where: {
        chapter_id: chapterId,
        story: {
          user_id: userId
        }
      }
    });
    return !!chapter;
  } catch (error) {
    console.error('Error validating chapter ownership:', error);
    return false;
  }
}

