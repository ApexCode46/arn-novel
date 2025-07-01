"use client"

import { useParams } from "next/navigation";
import { useState } from "react";
import { useEditor } from "@/context/EditorContext";
import { TiptapEditor } from "@/components/editor-bar"
import { Input } from "@/components/ui/input"

export default function Page() {
  const params = useParams();
  const storyId = decodeURIComponent(params.story as string);
  const chapterId = decodeURIComponent(params.chapter as string);
  const { content, setContent } = useEditor();

  const [nameChapter, setNameChapter] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <div className="w-full min-h-[70rem] my-5 bg-background shadow-2xl">
      <div className="flex justify-center items-center w-full pb-2">
        <div className="text-center">
          <h3
            lang="th"
            className="text-1xl max-w-[20rem] md:text-3xl md:max-w-[36rem] font-bold hyphens-auto break-words "
          >
            {storyId}
          </h3>

          <span onClick={() => setIsEditing(true)} className= " font-bold cursor-pointer md:text-2xl hover:bg-secondary ">ลำดับตอนที่ {chapterId} | </span>

          {isEditing ? (
            <Input
              autoFocus
              value={nameChapter}
              onChange={(e) => setNameChapter(e.target.value)}
              onBlur={handleBlur}
              className="inline w-auto px-1 py-0  md:text-2xl h-auto text-base"
            />
          ) : (
            <span
            onClick={() => setIsEditing(true)}
              className="cursor-pointer underlin md:text-2xl decoration-dotted font-bold break-words whitespace-pre-wrap hyphens-auto max-w-[32rem]"
            >
              {nameChapter}
            </span>
          )}

        </div>
      </div>

      <hr className="py-2 " />

      <div className="p-6">
        <TiptapEditor
          content={content}
          onContentChange={(html) => setContent(html)}
        />
      </div>
    </div>
  );
}
