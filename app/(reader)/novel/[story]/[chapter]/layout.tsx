"use client";

import SidebarChapter from "@/components/SidebarChapter";
import { CommentsChapter } from "@/components/commentsChapter";
import { TableOfContents } from "lucide-react";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <>
            <SidebarChapter trigger={
                <div className="fixed right-2 top-20 p-2 rounded-md bg-backgroundCustom transition-colors hover:bg-gray-200 hover:text-black shadow-sm">
                    <TableOfContents size={18} />
                </div>
            }
            mode="reader"/>
            <CommentsChapter />
            {children}
        </>
    )
}