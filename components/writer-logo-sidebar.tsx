"use client"

import * as React from "react"

import Link from 'next/link';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function Navlogo() {
  const { isMobile } = useSidebar()


  return (
    <SidebarMenuButton
      size="lg"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
        img
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <Link href="/" className="text-xl font-bold mr-10">
          ARN NOVEL
        </Link>
      </div>
    </SidebarMenuButton>
  )
}
