"use client"

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useEditor } from "@/context/EditorContext";
import { TiptapEditor } from "@/components/editor-bar"
import { Input } from "@/components/ui/input"

export default function Page() {
  const params = useParams();
  const storyId = params.story as string;
  const chapterOrder = parseInt(params.chapter as string);

  const { content, setContent } = useEditor();

  const [nameChapter, setNameChapter] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ดึงข้อมูล chapter เมื่อ component mount
  useEffect(() => {
    const fetchChapter = async () => {
      if (!storyId || isNaN(chapterOrder)) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/writer/stories/${storyId}/chapters/${chapterOrder}`);

        if (response.ok) {
          const chapterData = await response.json();
          setNameChapter(chapterData.title || "");
          setContent(chapterData.content || "");
        } else {
          console.error('Failed to fetch chapter');
        }
      } catch (error) {
        console.error('Error fetching chapter:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapter();
  }, [storyId, chapterOrder, setContent]);

  // ฟังก์ชันบันทึก chapter
  const saveChapter = async () => {
    if (!storyId || isNaN(chapterOrder) || isSaving) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/writer/stories/${storyId}/chapters/${chapterOrder}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: nameChapter,
          content: content,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Chapter saved successfully:", result);
        // แสดงข้อความสำเร็จ (อาจใช้ toast notification)
      } else {
        throw new Error("Failed to save chapter");
      }
    } catch (error) {
      console.error("Error saving chapter:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save เมื่อมีการเปลี่ยนแปลง (debounced)
  useEffect(() => {
    if (isLoading) return; // ไม่ save ขณะกำลังโหลดข้อมูล

    const timeoutId = setTimeout(() => {
      if (nameChapter || content) {
        saveChapter();
      }
    }, 5000); // auto-save หลังจาก 5 วินาที

    return () => clearTimeout(timeoutId);
  }, [nameChapter, content]); // เมื่อ title หรือ content เปลี่ยน

  const handleBlur = () => {
    setIsEditing(false);
    // บันทึกทันทีเมื่อแก้ไขชื่อเสร็จ
    if (nameChapter) {
      saveChapter();
    }
  };

  // แสดง loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-[70rem] my-5 bg-backgroundCustom shadow-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[70rem] my-5 bg-backgroundCustom shadow-2xl">
      {/* Saving indicator */}
      {isSaving && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          กำลังบันทึก...
        </div>
      )}

      <div className="flex justify-center items-center w-full pb-2">
        <div className="text-center">
          <h3
            lang="th"
            className="text-1xl max-w-[20rem] md:text-3xl md:max-w-[36rem] font-bold hyphens-auto break-words "
          >

          </h3>

          <span onClick={() => setIsEditing(true)} className="font-bold cursor-pointer md:text-2xl hover:bg-secondary">
            ลำดับตอนที่ {chapterOrder} |{" "}
          </span>

          {isEditing ? (
            <Input
              autoFocus
              value={nameChapter}
              onChange={(e) => setNameChapter(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleBlur();
                }
              }}
              className="inline w-auto px-1 py-0 md:text-2xl h-auto text-base"
              placeholder="ชื่อตอน"
            />
          ) : (
            <span
              onClick={() => setIsEditing(true)}
              className="cursor-pointer underline md:text-2xl decoration-dotted font-bold break-words whitespace-pre-wrap hyphens-auto max-w-[32rem]"
            >
              {nameChapter || "คลิกเพื่อเพิ่มชื่อตอน"}
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
