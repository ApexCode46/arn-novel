"use client"

import * as React from "react"

import Link from 'next/link';

import {
  SidebarMenuButton
} from "@/components/ui/sidebar"
import { Book } from "lucide-react"

export function Navlogo() {


  return (
    <SidebarMenuButton
      size="lg"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      <div className="bg-blue-500 dark:bg-backgroundCustom text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
        <Book className="w-4 h-4 text-white" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <Link href="/" className="text-xl font-bold mr-10">
          ARN NOVEL
        </Link>
      </div>
    </SidebarMenuButton>
  )
}
