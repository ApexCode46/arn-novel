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

export default function Account() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleNavigationToWriter = () => {
    router.push("/writer");
  }

  const handleNavigationToLogin = () => {
    router.push("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="bg-backgroundNav">
        <Button variant="outline" size="icon">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt="User Avatar"
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <CircleUserRound className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="bg-backgroundNav border">
        {session ? (
          <>
            <DropdownMenuItem>
              <Image
                src={session?.user?.image || "/profile_user/ARN_profile.png"}
                alt="User Avatar"
                width={24}
                height={24}
                className="rounded-full"
              /> {session?.user?.name}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users /> กำลังติดตาม
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleNavigationToWriter}>
              <Pencil /> เขียนนิยาย
            </DropdownMenuItem>
            <DropdownMenuItem>
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
