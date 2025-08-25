// ตัวอย่างการใช้งาน middleware และ auth utilities

// 1. ตัวอย่าง API route ที่ต้องการ admin access
// file: app/api/admin/example/route.ts
import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(
  async (request: NextRequest, user) => {
    // user จะมีข้อมูลครบถ้วนแล้ว และ role เป็น admin
    return Response.json({ 
      message: 'Admin only content',
      user: user 
    });
  },
  {
    requiredRole: 'admin',
    allowedMethods: ['GET']
  }
);

// 2. ตัวอย่าง API route สำหรับ writer ที่ต้องการการอนุมัติ
// file: app/api/writer/stories/route.ts
import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';

export const POST = withAuth(
  async (request: NextRequest, user) => {
    // user ต้องมีการลงทะเบียนนักเขียนที่อนุมัติแล้ว
    const body = await request.json();
    
    // สร้างเรื่องใหม่
    // ...
    
    return Response.json({ success: true });
  },
  {
    requiredRole: 'writer',
    requireWriterApproval: true,
    allowedMethods: ['POST']
  }
);

// 3. ตัวอย่าง API route ที่ตรวจสอบ ownership
// file: app/api/writer/stories/[storyId]/route.ts
import { NextRequest } from 'next/server';
import { withAuth, validateStoryOwnership, createErrorResponse } from '@/lib/auth';

export const PUT = withAuth(
  async (request: NextRequest, user, { params }) => {
    const storyId = params.storyId;
    
    // ตรวจสอบว่าเรื่องนี้เป็นของ user หรือไม่
    const isOwner = await validateStoryOwnership(storyId, user.id);
    if (!isOwner) {
      return createErrorResponse('Forbidden: You can only edit your own stories', 403);
    }
    
    // อัพเดทเรื่อง
    // ...
    
    return Response.json({ success: true });
  },
  {
    requiredRole: 'writer',
    requireWriterApproval: true,
    allowedMethods: ['PUT', 'DELETE']
  }
);

// 4. ตัวอย่าง API route ที่ไม่ต้องการ authentication
// file: app/api/public/stories/route.ts
export async function GET(request: NextRequest) {
  // API สาธารณะไม่ต้องใช้ withAuth
  return Response.json({ stories: [] });
}

// 5. ตัวอย่าง API route ที่ต้องการ login เท่านั้น
// file: app/api/user/profile/route.ts
import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(
  async (request: NextRequest, user) => {
    // ต้อง login เท่านั้น ไม่เจาะจง role
    return Response.json({ user });
  },
  {
    // ไม่ระบุ requiredRole = ต้อง login เท่านั้น
    allowedMethods: ['GET', 'PUT']
  }
);

// 6. ตัวอย่างการใช้งานใน page component
// file: app/(writer)/writer/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WriterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [writerStatus, setWriterStatus] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    // ตรวจสอบสถานะการลงทะเบียนนักเขียน
    fetch('/api/users/register-writer')
      .then(res => res.json())
      .then(data => {
        if (!data.application) {
          router.push('/writer/register');
        } else if (data.application.status !== 'approved') {
          setWriterStatus(data.application.status);
        }
      })
      .catch(err => {
        console.error('Error checking writer status:', err);
      });
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (writerStatus === 'pending') {
    return (
      <div className="text-center p-8">
        <h1>รอการอนุมัติ</h1>
        <p>กรุณารอการอนุมัติจากผู้ดูแลระบบ</p>
      </div>
    );
  }

  if (writerStatus === 'rejected') {
    return (
      <div className="text-center p-8">
        <h1>การสมัครถูกปฏิเสธ</h1>
        <p>กรุณาติดต่อผู้ดูแลระบบหรือสมัครใหม่</p>
      </div>
    );
  }

  return (
    <div>
      <h1>หน้านักเขียน</h1>
      {/* เนื้อหาสำหรับนักเขียนที่อนุมัติแล้ว */}
    </div>
  );
}
