"use client"
import { useParams } from "next/navigation";
import { useState } from "react";
import { TiptapEditor } from "@/components/editor-bar"
import { Separator } from "@/components/ui/separator"

export default function page() {
  const params = useParams();
  const storyId = decodeURIComponent(params.story as string)
  const chapterId = decodeURIComponent(params.chapter as string)
  const [editorContent, setEditorContent] = useState("<p>สวัสดีครับ! ลองพิมพ์ข้อความที่นี่...</p>");
  console.log(editorContent);
  return (
    <>
      <div className="w-full min-h-[70rem] my-5 bg-background shadow-2xl ">
        <div className="flex justify-center items-center w-full ">
          <div className="text-center">
            <h3 className="my-2 text-3xl md:text-1xl font-bold">{storyId}</h3>
            <h4>ตอนที่ #1 | {chapterId}</h4>
          </div>
        </div>

        <hr className="py-2" />

        <div className="p-6">
          <TiptapEditor
            content={editorContent}
            onContentChange={(html) => setEditorContent(html)}
          />
        </div>
      </div>
    </>
  )
}
