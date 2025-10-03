"use client"

import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import {
  CircleUserRound,
  Users,
  Coins,
  Pencil,
  LogIn,
  LogOut,
  Settings,
  MessageCircleQuestionIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Session } from 'next-auth'

// Interface สำหรับ Session ที่มี user id
interface ExtendedSession extends Session {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

// Interface สำหรับข้อมูลผู้ใช้
interface UserProfile {
  id: string
  name: string
  email: string
  image?: string
  role?: string
  joinedAt?: string
  wallet?: {
    balance: number
  }
}

// ฟังก์ชันช่วยสำหรับจัดการรูปภาพผู้ใช้
function getUserImage(image?: string | null): string {
  if (!image || image.trim() === "") return "/profile_user/ARN_profile.png"
  if (image.startsWith("http")) return image         
  if (image.startsWith("/uploads")) return `/api${image}` 
  return `/api/uploads/${image.replace(/^\/+/, "")}`
}

export default function Account() {
  const router = useRouter()
  const { data: session } = useSession() as { data: ExtendedSession | null }
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // ดึงข้อมูลผู้ใช้จาก database
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/profile/${session.user.id}`)
          if (response.ok) {
            const data = await response.json()
            setUserProfile(data.profile)
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      }
    }

    fetchUserProfile()
  }, [session?.user?.id])

  // data สำหรับ UI
  const userImage = getUserImage(userProfile?.image || session?.user?.image)
  const userName = userProfile?.name || session?.user?.name || "ผู้ใช้"
  const userEmail = userProfile?.email || session?.user?.email || ""
  const userBalance = userProfile?.wallet?.balance?.toLocaleString() || "0"

  // routes handler
  const go = (path: string) => router.push(path)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="bg-backgroundNav">
        <Button variant="outline" size="icon">
          {session ? (
            <Image
              src={userImage}
              alt={"User Avatar"}
              width={24}
              height={24}
              className="rounded-full object-cover w-6 h-6"
              unoptimized
            />
          ) : (
            <CircleUserRound className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="bg-backgroundNav border">
        {session ? (
          <>
            <DropdownMenuItem onClick={() => go("/profile")}>
              <div className="flex items-center gap-3">
                <Image
                  src={userImage}
                  alt={"User Avatar"}
                  width={32}
                  height={32}
                  className="rounded-full object-cover w-8 h-8"
                  unoptimized
                />
                <div className="flex flex-col">
                  <span className="font-medium">{userName}</span>
                  <span className="text-sm text-muted-foreground">{userEmail}</span>
                  <span className="text-sm text-green-600">
                    {userBalance} เหรียญ
                  </span>
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => go("/category/following")}>
              <Users /> กำลังติดตาม
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => go("/writer")}>
              <Pencil /> เขียนนิยาย
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => go("/wallet")}>
              <Coins /> เติมเหรียญ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => go("/help")}>
              <MessageCircleQuestionIcon /> ช่วยเหลือ
            </DropdownMenuItem>

            {(userProfile?.role === 'admin' || session?.user?.role === 'admin') && (
              <DropdownMenuItem onClick={() => go("/admin")}>
                <Settings /> Admin
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut /> ออกจากระบบ
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={() => go("/login")}>
            <LogIn /> เข้าสู่ระบบ
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
