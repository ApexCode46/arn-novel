"use client"

import { ChartColumnBig, Book, UserCheck, MessageCircleQuestion } from "lucide-react"
import { useRouter } from 'next/navigation';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton
} from "@/components/ui/sidebar"

export function NavMain() {
  const router = useRouter();

  const handleNavigationToDashBoard = () => {
        router.push("/writer");
    }

    const handleNavigationToStories = () => {
        router.push("/writer/stories");
    }

    const handleNavigationToRegisterWriter = () => {
        router.push("/writer/registerWriter");
    }

    const handleNavigationToHelp = () => {
        router.push("/writer/help");
    }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>โหมดนักเขียน</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuButton onClick={handleNavigationToDashBoard}>
          <ChartColumnBig /> <strong>สรุปภาพรวม</strong>
        </SidebarMenuButton>
        
        <SidebarMenuButton onClick={handleNavigationToStories}>
          <Book /> <strong>นิยายของฉัน</strong>
        </SidebarMenuButton>

        <SidebarMenuButton onClick={handleNavigationToRegisterWriter}>
          <UserCheck /> <strong>ลงทะเบียนนักเขียน</strong>
        </SidebarMenuButton>

        <SidebarMenuButton onClick={handleNavigationToHelp}>
          <MessageCircleQuestion /> <strong>ช่วยเหลือ</strong>
        </SidebarMenuButton>
      </SidebarMenu> 
    </SidebarGroup>
  )
}
