import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AuthOptions {
  requiredRole?: 'admin' | 'writer' | 'user' | null
  requireWriterApproval?: boolean
  redirectTo?: string
  onUnauthorized?: (data: any) => void
}

interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  hasAccess: boolean
  user: any
  error: string | null
  writerApplication?: any
}

export function useAuth(options: AuthOptions = {}) {
  const { 
    requiredRole = null, 
    requireWriterApproval = false,
    redirectTo = '/login',
    onUnauthorized = null
  } = options

  const { data: session, status } = useSession()
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    hasAccess: false,
    user: null,
    error: null,
    writerApplication: null
  })

  useEffect(() => {
    if (status === 'loading') {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      return
    }

    if (!session) {
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        hasAccess: false,
        user: null,
        error: 'Authentication required',
        writerApplication: null
      })
      
      if (redirectTo) {
        const callbackUrl = encodeURIComponent(window.location.href)
        router.push(`${redirectTo}?callbackUrl=${callbackUrl}`)
      }
      return
    }

    // ถ้ามี session แต่ไม่ต้องการตรวจสอบ role
    if (!requiredRole) {
      setAuthState({
        isLoading: false,
        isAuthenticated: true,
        hasAccess: true,
        user: session.user,
        error: null,
        writerApplication: null
      })
      return
    }

    // ตรวจสอบสิทธิ์กับ API
    checkAccess()
  }, [session, status, requiredRole, requireWriterApproval])

  const checkAccess = async () => {
    try {
      const checkType = requiredRole || 'user'
      const response = await fetch(`/api/auth/check-access?type=${checkType}`)
      const data = await response.json()

      if (response.ok && data.hasAccess) {
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          hasAccess: true,
          user: data.user,
          error: null,
          writerApplication: data.application || null
        })
      } else {
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          hasAccess: false,
          user: data.user,
          error: data.message,
          writerApplication: data.application || null
        })

        if (onUnauthorized) {
          onUnauthorized(data)
        }
      }
    } catch (error) {
      console.error('Error checking access:', error)
      setAuthState({
        isLoading: false,
        isAuthenticated: true,
        hasAccess: false,
        user: session?.user || null,
        error: 'Failed to verify access',
        writerApplication: null
      })
    }
  }

  const refetch = () => {
    if (session) {
      checkAccess()
    }
  }

  return {
    ...authState,
    refetch
  }
}

// Hook สำหรับ admin เฉพาะ
export function useAdminAuth(options: Omit<AuthOptions, 'requiredRole'> = {}) {
  return useAuth({
    requiredRole: 'admin',
    redirectTo: '/login',
    ...options
  })
}

// Hook สำหรับ writer เฉพาะ
export function useWriterAuth(options: Omit<AuthOptions, 'requiredRole' | 'requireWriterApproval'> = {}) {
  return useAuth({
    requiredRole: 'writer',
    requireWriterApproval: false, // ไม่ต้องตรวจสอบการอนุมัติ
    redirectTo: '/login',
    ...options
  })
}

// Hook สำหรับตรวจสอบว่าเป็นเจ้าของ story หรือไม่
export function useStoryOwnership(storyId: string) {
  const [isOwner, setIsOwner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session || !storyId) {
      setIsLoading(false)
      return
    }

    checkOwnership()
  }, [session, storyId])

  const checkOwnership = async () => {
    try {
      const response = await fetch(`/api/writer/stories/${storyId}`)
      if (response.ok) {
        setIsOwner(true)
      } else {
        setIsOwner(false)
      }
    } catch (error) {
      console.error('Error checking story ownership:', error)
      setIsOwner(false)
    } finally {
      setIsLoading(false)
    }
  }

  return { isOwner, isLoading }
}
