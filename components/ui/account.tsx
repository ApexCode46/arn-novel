"use client"

import { CircleUserRound, Users, Coins, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

export default function account() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <CircleUserRound className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <CircleUserRound className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem >
         <CircleUserRound /> ผู้ใช้
        </DropdownMenuItem>
        <DropdownMenuItem >
          <Users /> กำลงติดตาม
        </DropdownMenuItem>
        <DropdownMenuItem >
          <Pencil /> เขียนนิยาย
        </DropdownMenuItem>
        <DropdownMenuItem >
          <Coins /> เติมเหรียญ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}