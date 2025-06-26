'use client'
import { useState } from "react";
import { TiptapEditor } from "@/components/editor-bar"

export default function page() {
  const [editorContent, setEditorContent] = useState("<p>สวัสดีครับ! ลองพิมพ์ข้อความที่นี่...</p>");
  console.log(editorContent);
  return (
    <>
      
      <div className="w-full min-h-[70rem] my-5 bg-background shadow-2xl ">
        <div className="w-full py-[5rem] px-6 sm:py-[7rem] md:py-[10rem] hover:bg-secondary transition-colors">
          Header
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
