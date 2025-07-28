"use client"

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useEditor } from "@/context/EditorContext";
import { TiptapEditor } from "@/components/editor-bar"
import { Input } from "@/components/ui/input"
import { VoiceUpload } from "@/components/VoiceUpload"

interface ChapterData {
  chapter_id: string;
  title: string;
  content: string;
  order: number;
  price: number;
  created_at: string;
  updated_at: string;
}

interface VoiceData {
  voice_id: string;
  file_name: string;
  file_path: string;
  duration?: number;
  created_at: string;
}

export default function Page() {
  const params = useParams();
  const storyId = params.story as string;
  const chapterOrder = parseInt(params.chapter as string);

  const { content, setContent } = useEditor();

  const [nameChapter, setNameChapter] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [existingVoice, setExistingVoice] = useState<VoiceData | null>(null);

  // ฟังก์ชันโหลดเสียงพากย์ที่มีอยู่ - ใช้ useCallback เพื่อ memoize
  const loadExistingVoice = useCallback(async (chapterId: string) => {
    try {
      const response = await fetch(`/api/voice/upload?storyId=${storyId}&chapterId=${chapterId}`);
      if (response.ok) {
        const voiceData = await response.json();
        if (voiceData.data) {
          setExistingVoice(voiceData.data);
        } else {
          setExistingVoice(null); // ไม่มีเสียงพากย์
        }
      }
    } catch (error) {
      console.error('Error loading existing voice:', error);
      setExistingVoice(null);
    }
  }, [storyId]);

  // ดึงข้อมูล chapter เมื่อ component mount
  useEffect(() => {
    const fetchChapter = async () => {
      if (!storyId || isNaN(chapterOrder)) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/writer/stories/${storyId}/chapters/${chapterOrder}`);

        if (response.ok) {
          const data = await response.json();
          setChapterData(data);
          setNameChapter(data.title || "");
          setContent(data.content || "");
          
          // Load existing voice if available
          loadExistingVoice(data.chapter_id);
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
  }, [storyId, chapterOrder, setContent, loadExistingVoice]);

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
        toast.success("บันทึกแล้ว");
      } else {
        throw new Error("Failed to save chapter");
      }
    } catch (error) {
      console.error("Error saving chapter:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

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

      <div className="p-6 space-y-6">
        
        {/* Voice Upload Section */}
        {chapterData && (
          <VoiceUpload
            storyId={storyId}
            chapterId={chapterData.chapter_id}
            chapterOrder={chapterOrder}
            existingVoice={existingVoice ? {
              voice_id: existingVoice.voice_id,
              file_name: existingVoice.file_name,
              duration: existingVoice.duration
            } : undefined}
            onVoiceUploaded={() => {
              if (chapterData?.chapter_id) {
                loadExistingVoice(chapterData.chapter_id);
              }
            }}
          />
        )}

        {/* Editor Section */}
        <TiptapEditor
          content={content}
          onContentChange={(html) => setContent(html)}
        />
      </div>
    </div>

  );
}
