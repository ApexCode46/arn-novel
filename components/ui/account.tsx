"use client"

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { CircleUserRound, Users, Coins, Pencil, LogIn, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Session } from 'next-auth';

// Interface สำหรับ Session ที่มี user id
interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

// Interface สำหรับข้อมูลผู้ใช้
interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
  joinedAt?: string;
  wallet?: {
    balance: number;
  };
}

export default function Account() {
  const router = useRouter();
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // ดึงข้อมูลผู้ใช้จาก database
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/profile/${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserProfile(data.profile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [session?.user?.id]);

  const handleNavigationToWriter = () => {
    router.push("/writer");
  }

  const handleNavigationToLogin = () => {
    router.push("/login");
  }

  const handleNavigationToWallet = () => {
    router.push("/wallet");
  }

  const handleNavigationToProfile = () => {
    router.push("/profile");
  }

  // ใช้รูปจาก database หรือ fallback ไปที่รูปเริ่มต้น
  const userImage = userProfile?.image || "/profile_user/ARN_profile.png";
  const userName = userProfile?.name || session?.user?.name || "ผู้ใช้";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="bg-backgroundNav">
        <Button variant="outline" size="icon">
          {session ? (
            <Image
              src={userImage}
              alt="User Avatar"
              width={24}
              height={24}
              className="rounded-full object-cover w-6 h-6"
            />
          ) : (
            <CircleUserRound className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="bg-backgroundNav border">
        {session ? (
          <>
            <DropdownMenuItem onClick={handleNavigationToProfile}>
              <div className="flex items-center gap-3">
                <Image
                  src={userImage}
                  alt="User Avatar"
                  width={32}
                  height={32}
                  className="rounded-full object-cover w-8 h-8"
                />
                <div className="flex flex-col">
                  <span className="font-medium">{userName}</span>
                  <span className="text-sm text-muted-foreground">{userProfile?.email || session?.user?.email}</span>
                  <span className="text-sm text-green-600">
                    {userProfile?.wallet?.balance ? `${userProfile.wallet.balance.toLocaleString()} เหรียญ` : '0 เหรียญ'}
                  </span>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users /> กำลังติดตาม
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleNavigationToWriter}>
              <Pencil /> เขียนนิยาย
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleNavigationToWallet}>
              <Coins /> เติมเหรียญ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut /> ออกจากระบบ
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={handleNavigationToLogin}>
            <LogIn /> เข้าสู่ระบบ
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}