import React from 'react'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'writer' | 'user' | null
  requireWriterApproval?: boolean
  fallback?: React.ReactNode
  onUnauthorized?: (data: { error: string; statusCode: number }) => void
}

export function ProtectedRoute({ 
  children, 
  requiredRole = null, 
  requireWriterApproval = false,
  fallback = null,
  onUnauthorized
}: ProtectedRouteProps) {
  const authState = useAuth({ 
    requiredRole, 
    requireWriterApproval,
    onUnauthorized
  })

  if (authState.isLoading) {
    return fallback || (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!authState.isAuthenticated) {
    return fallback || (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h1>
        <p>คุณต้องเข้าสู่ระบบเพื่อเข้าถึงหน้านี้</p>
      </div>
    )
  }

  if (!authState.hasAccess) {
    // ไม่ต้องตรวจสอบสถานะการอนุมัติ writer อีกต่อไป
    // เนื่องจากทุก role ใช้ได้แล้ว
    
    return fallback || (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
        <p>{authState.error}</p>
      </div>
    )
  }

  return <>{children}</>
}

// Component สำหรับแสดงสถานะการโหลด
export function LoadingSpinner({ message = 'กำลังโหลด...' }: { message?: string }) {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  )
}

// Component สำหรับแสดงข้อผิดพลาด
export function ErrorMessage({ 
  title = 'เกิดข้อผิดพลาด', 
  message, 
  onRetry 
}: { 
  title?: string
  message: string
  onRetry?: () => void 
}) {
  return (
    <div className="text-center p-8">
      <h1 className="text-2xl font-bold mb-4 text-red-600">{title}</h1>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          ลองใหม่
        </button>
      )}
    </div>
  )
}

// Component สำหรับ Admin เท่านั้น
export function AdminOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin" fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}

// Component สำหรับ Writer เท่านั้น
export function WriterOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="writer" requireWriterApproval={false} fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}

// Component สำหรับ User ที่ login แล้วเท่านั้น
export function AuthenticatedOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}
