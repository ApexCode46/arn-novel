"use client"

import { ChartColumnBig, Book, UserCheck, MessageCircleQuestion, Scroll } from "lucide-react"
import { useRouter } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton
} from "@/components/ui/sidebar"

export function NavMain() {
  const router = useRouter();

  const handleNavigationToDashBoard = async () => {
        router.push("/writer");
    }

    const handleNavigationToStories = async () => {
        router.push("/writer/stories");
    }
  return (
    <SidebarGroup>
      <SidebarGroupLabel>โหมดนักเขียน</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuButton onClick={handleNavigationToDashBoard}>
          <ChartColumnBig /> <strong>หน้าหลัก</strong>
        </SidebarMenuButton>
        
        <SidebarMenuButton onClick={handleNavigationToStories}>
          <Book /> <strong>นิยายของฉัน</strong>
        </SidebarMenuButton>

        <SidebarMenuButton >
          <UserCheck /> <strong>ลงทะเบียนนักเขียน</strong>
        </SidebarMenuButton>

        <SidebarMenuButton >
          <MessageCircleQuestion /> <strong>ช่วยเหลือ</strong>
        </SidebarMenuButton>
      </SidebarMenu> 
    </SidebarGroup>
  )
}
