"use client";

import SidebarChapter from "@/components/SidebarChapter";
import { CommentsChapter } from "@/components/commentsChapter";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <>
            <SidebarChapter />
            <CommentsChapter />
            {children}
        </>
    )
}