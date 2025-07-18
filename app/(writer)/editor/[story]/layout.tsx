"use client";

import { useParams } from "next/navigation";
import { Save, TableOfContents } from "lucide-react";
import { useEditor } from "@/context/EditorContext";
import { EditorProvider } from "@/context/EditorContext";
import SidebarChapter from "@/components/SidebarChapter";

function StoryLayoutInner({
    children,
}: {
    children: React.ReactNode;
}) {
    const { content } = useEditor();

    const params = useParams();
    const storyId = params.story as string;
    const chapterOrder = params.chapter as string;

    const handleSave = async () => {
        try {
            let saveResponse;
            
            if (chapterOrder) {
                // บันทึก chapter
                saveResponse = await fetch(`/api/writer/stories/${storyId}/chapters/${chapterOrder}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: content,
                    }),
                });
            } else {
                // บันทึก story (เมื่ออยู่ในหน้า story)
                saveResponse = await fetch(`/api/writer/stories/${storyId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: content,
                    }),
                });
            }

            if (saveResponse.ok) {
                const saveResult = await saveResponse.json();
                console.log("Save Result:", saveResult);
            } else {
                console.log("Failed to save data");
            }
        } catch (error) {
            console.log("Error in handleSave:", error);
        }
    };

    return (
        <>
            <SidebarChapter trigger={
                <div className="fixed right-2 top-2 p-2 rounded-md bg-backgroundCustom transition-colors hover:bg-gray-200 hover:text-black shadow-sm">
                    <TableOfContents size={18} />
                </div>
            }
            mode="writer" />
            <button onClick={handleSave} className="fixed right-2 top-12 p-2 rounded-md bg-backgroundCustom transition-colors hover:bg-gray-200 hover:text-black shadow-sm">
                <Save size={18} />
            </button>
            {children}
        </>
    );
}

export default function Layout({
    children,
}: {
    children: React.ReactNode;
    params?: Promise<{ story: string }>;
}) {
    return (
        <EditorProvider>
            <StoryLayoutInner>
                {children}
            </StoryLayoutInner>
        </EditorProvider>
    );
}