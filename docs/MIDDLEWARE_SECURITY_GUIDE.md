# Middleware และ Authentication System

## ไฟล์ที่สร้างขึ้น

### 1. `middleware.ts` - Core Middleware
ไฟล์หลักสำหรับจัดการ authentication และ authorization ระดับ application

**คุณสมบัติ:**
- ป้องกัน admin paths (`/admin`, `/api/admin`)
- ป้องกัน writer paths (`/writer`, `/editor`, `/api/writer`)
- ป้องกัน user paths (`/profile`, `/wallet`, `/api/users`)
- Redirect คนที่ login แล้วออกจากหน้า login
- เพิ่ม security headers
- จัดการ CORS สำหรับ API routes

### 2. `lib/auth.ts` - Authentication Utilities
Utility functions สำหรับ API routes

**คุณสมบัติ:**
- `authorize()` - ตรวจสอบ authentication และ authorization
- `withAuth()` - Wrapper สำหรับ API routes
- `validateStoryOwnership()` - ตรวจสอบความเป็นเจ้าของ story
- `validateChapterOwnership()` - ตรวจสอบความเป็นเจ้าของ chapter
- `createErrorResponse()` - สร้าง error response
- `validateMethod()` - ตรวจสอบ HTTP method

### 3. `hooks/useAuth.ts` - React Hooks
Hooks สำหรับ frontend authentication

**คุณสมบัติ:**
- `useAuth()` - Hook หลักสำหรับตรวจสอบสิทธิ์
- `useAdminAuth()` - Hook สำหรับ admin
- `useWriterAuth()` - Hook สำหรับ writer
- `useStoryOwnership()` - Hook ตรวจสอบความเป็นเจ้าของ story

### 4. `components/ProtectedRoute.tsx` - React Components
Components สำหรับป้องกันการเข้าถึง

**คุณสมบัติ:**
- `ProtectedRoute` - Component หลักสำหรับป้องกัน
- `AdminOnly` - Component สำหรับ admin เท่านั้น
- `WriterOnly` - Component สำหรับ writer เท่านั้น
- `AuthenticatedOnly` - Component สำหรับ user ที่ login แล้ว
- `LoadingSpinner` - Component แสดงการโหลด
- `ErrorMessage` - Component แสดงข้อผิดพลาด

### 5. `app/api/auth/check-access/route.js` - Access Check API
API สำหรับตรวจสอบสิทธิ์

### 6. ตัวอย่าง API Routes ใหม่
- `app/api/admin/novels/route.js` - Admin novel management
- `app/api/writer/stories/[storyId]/route.js` - Writer story management

## การใช้งาน

### 1. ใน API Routes

```javascript
import { withAuth } from '@/lib/auth'

// Admin only API
export const GET = withAuth(
  async (request, user) => {
    // user.role จะเป็น 'admin' แน่นอน
    return Response.json({ data: 'admin data' })
  },
  {
    requiredRole: 'admin',
    allowedMethods: ['GET']
  }
)

// Writer only API (ไม่ต้องอนุมัติ)
export const POST = withAuth(
  async (request, user) => {
    // user เป็น writer ที่ login แล้ว
    return Response.json({ success: true })
  },
  {
    requiredRole: 'writer',
    requireWriterApproval: false, // ไม่ต้องอนุมัติ
    allowedMethods: ['POST']
  }
)

// User API (ต้อง login เท่านั้น)
export const GET = withAuth(
  async (request, user) => {
    return Response.json({ user })
  },
  {
    allowedMethods: ['GET']
  }
)
```

### 2. ใน React Components

```tsx
import { ProtectedRoute, AdminOnly, WriterOnly } from '@/components/ProtectedRoute'
import { useWriterAuth, useStoryOwnership } from '@/hooks/useAuth'

// ป้องกันหน้าด้วย Component
export default function AdminPage() {
  return (
    <AdminOnly>
      <h1>Admin Dashboard</h1>
    </AdminOnly>
  )
}

// ใช้ Hook ในการตรวจสอบ
export default function WriterPage() {
  const auth = useWriterAuth()

  if (auth.isLoading) return <div>Loading...</div>
  if (!auth.hasAccess) return <div>No access</div>

  return <h1>Writer Dashboard</h1>
}

// ตรวจสอบความเป็นเจ้าของ
export default function EditStory({ storyId }) {
  const { isOwner, isLoading } = useStoryOwnership(storyId)

  if (isLoading) return <div>Loading...</div>
  if (!isOwner) return <div>Not your story</div>

  return <div>Edit story form</div>
}
```

### 3. ใน Pages

```tsx
// app/(admin)/admin/page.tsx
import { AdminOnly } from '@/components/ProtectedRoute'

export default function AdminDashboard() {
  return (
    <AdminOnly fallback={<div>กำลังตรวจสอบสิทธิ์...</div>}>
      <div>
        <h1>Admin Dashboard</h1>
        {/* Admin content */}
      </div>
    </AdminOnly>
  )
}

// app/(writer)/writer/page.tsx
import { WriterOnly } from '@/components/ProtectedRoute'

export default function WriterDashboard() {
  return (
    <WriterOnly>
      <div>
        <h1>Writer Dashboard</h1>
        {/* Writer content */}
      </div>
    </WriterOnly>
  )
}
```

## การกำหนดค่า

### Environment Variables ที่ต้องการ:
```env
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=your_database_url
```

### Middleware Configuration:
- ป้องกันไฟล์ static: `_next/static`, `_next/image`, `favicon.ico`
- ป้องกันโฟลเดอร์ public: `public`, `novelImg`, `imgArn`, `adsImg`, `profile_user`, `voice`

## Security Features

1. **Path Protection**: ป้องกัน sensitive paths
2. **Role-based Access**: ควบคุมการเข้าถึงตาม role
3. **Writer Approval**: ตรวจสอบการอนุมัตินักเขียน
4. **Ownership Validation**: ตรวจสอบความเป็นเจ้าของ content
5. **Security Headers**: เพิ่ม security headers ทุก response
6. **CORS Control**: ควบคุม CORS สำหรับ API
7. **Method Validation**: ตรวจสอบ HTTP methods ที่อนุญาต

## Error Handling

- **401 Unauthorized**: ไม่ได้ login
- **403 Forbidden**: ไม่มีสิทธิ์เข้าถึง
- **404 Not Found**: ไม่พบข้อมูล
- **405 Method Not Allowed**: HTTP method ไม่ถูกต้อง
- **500 Internal Server Error**: ข้อผิดพลาดของระบบ

## การ Debug

เปิด debug mode ในไฟล์ middleware และ auth utilities:
```javascript
console.log('Auth check:', { user, requiredRole, hasAccess })
```

ระบบ middleware และ authentication นี้ให้การป้องกันที่ครอบคลุมทั้งในระดับ application และ component level พร้อมด้วย error handling และ user experience ที่ดี
