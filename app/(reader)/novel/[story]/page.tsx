"use client";

import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area"
import { SetStateAction, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align'

interface Chapter {
  chapter_id: string;
  title: string;
  order: number;
  price: number;
  created_at: string;
  updated_at: string;
}

interface Author {
  id: string;
  name: string;
  penName: string;
  image?: string;
}

interface Story {
  story_id: string;
  title: string;
  blurb: string;
  category: string;
  type: string;
  contentLevel: string;
  tags: string[];
  storyInfo?: string;
  verticalImage: string;
  horizontalImage?: string;
  views: number;
  created_at: string;
  updated_at: string;
  author: Author;
  chapters: Chapter[];
  stats: {
    totalChapters: number;
    totalComments: number;
    totalFavorites: number;
    totalFollows: number;
  };
}

// Component สำหรับแสดงข้อมูลเรื่องด้วย Tiptap
function StoryInfoDisplay({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content || '<p>ไม่มีข้อมูลเพิ่มเติมเกี่ยวกับเรื่องนี้</p>',
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none',
      },
    },
  });

  return (
    <div className="w-full min-h-[70rem] my-5 bg-backgroundCustom shadow-xl">
      <div className="p-6">
        <EditorContent
          editor={editor}
          className="text-foreground leading-relaxed [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror]:min-h-[65rem]"
        />
      </div>
    </div>
  );
}

export default function Page() {
  const params = useParams();
  const storyId = params.story as string;
  const router = useRouter();

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ดึงข้อมูลนิยายจาก API
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reader/stories/${storyId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch story');
        }

        const data = await response.json();
        setStory(data.data); // เปลี่ยนจาก data.story เป็น data.data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (storyId) {
      fetchStory();
    }
  }, [storyId]);

  // ตัวแปรสำหรับ pagination
  const chaptersPerPage = 20;
  const totalChapters = story?.chapters.length || 0;
  const totalPages = Math.ceil(totalChapters / chaptersPerPage);

  // สร้างตัวเลือกสำหรับ dropdown ด้วย useMemo
  const pageOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < totalPages; i++) {
      const startChapter = i * chaptersPerPage + 1;
      const endChapter = Math.min((i + 1) * chaptersPerPage, totalChapters);
      options.push({
        value: `page-${i + 1}`,
        label: `ตอนที่ ${startChapter}-${endChapter}`
      });
    }
    return options;
  }, [totalPages, totalChapters]);

  // State สำหรับเก็บหน้าปัจจุบัน
  const [currentPage, setCurrentPage] = useState('page-1');

  // Reset currentPage เมื่อได้ข้อมูลใหม่
  useEffect(() => {
    if (story && pageOptions.length > 0) {
      setCurrentPage(pageOptions[0].value);
    }
  }, [story, pageOptions]);

  // ฟังก์ชันสำหรับการเปลี่ยนหน้า
  const handlePageChange = (value: SetStateAction<string>) => {
    setCurrentPage(value);
  };

  // คำนวณตอนที่จะแสดงในหน้าปัจจุบัน
  const getCurrentPageChapters = () => {
    if (!story) return [];
    const pageIndex = parseInt(currentPage.split('-')[1]) - 1;
    const startIndex = pageIndex * chaptersPerPage;
    const endIndex = Math.min(startIndex + chaptersPerPage, totalChapters);
    return story.chapters.slice(startIndex, endIndex);
  };

  const currentChapters = getCurrentPageChapters();

  const handleChapterClick = (chapterOrder: number) => {
    router.push(`/novel/${storyId}/${chapterOrder}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  // Error state
  if (error || !story) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-500">เกิดข้อผิดพลาด: {error || 'ไม่พบข้อมูลนิยาย'}</div>
      </div>
    );
  }

  return (
    <>
      <Card className="w-full bg-backgroundCustom border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image Section */}
            <div className="lg:col-span-1">
              <div className="relative aspect-[3/4] w-full max-w-sm mx-auto lg:mx-0">
                <Image
                  src={story.verticalImage ||  "/novelImg/Test-novel.png"}
                  alt={story.title}
                  fill
                  className="object-cover rounded-lg shadow-md"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <CardTitle className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight break-words hyphens-auto">
                {story.title}
              </CardTitle>

              <div className="space-y-3 text-sm md:text-base">
                <div className="flex flex-wrap items-start gap-2">
                  <span className="font-semibold text-muted-foreground min-w-0">ผู้แต่ง:</span>
                  <span className="text-foreground">{story.author.penName}</span>
                </div>

                <div className="flex flex-wrap items-start gap-2">
                  <span className="font-semibold text-muted-foreground min-w-0">แนว:</span>
                  <span className="text-foreground">{story.category}</span>
                </div>

                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap items-start gap-2">
                    <span className="font-semibold text-muted-foreground min-w-0">แท็ก:</span>
                    <div className="flex flex-wrap gap-1">
                      {story.tags.map((tag) => (
                        <span key={tag} className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-start gap-2">
                  <span className="font-semibold text-muted-foreground min-w-0">ประเภท:</span>
                  <span className="text-foreground">{story.type}</span>
                </div>

                <div className="flex flex-wrap items-start gap-2">
                  <span className="font-semibold text-muted-foreground min-w-0">เรต:</span>
                  <span className="text-foreground">{story.contentLevel}</span>
                </div>

                <div className="flex flex-wrap items-start gap-2">
                  <span className="font-semibold text-muted-foreground min-w-0">จำนวนการดู:</span>
                  <span className="text-foreground">{story.views.toLocaleString()} ครั้ง</span>
                </div>

                {story.blurb && (
                  <div className="space-y-2">
                    <span className="font-semibold text-muted-foreground">เรื่องย่อ:</span>
                    <p className="text-foreground leading-relaxed text-justify hyphens-auto">
                      {story.blurb}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h4 className="font-bold">ข้อมูลเรื่องนี้</h4>
      <StoryInfoDisplay content={story.storyInfo || ''} />

      <div className="my-4">
        <div className="flex justify-between my-4">
          <h3 className="text-lg font-medium">สารบัญ (ทั้งหมด {totalChapters} ตอน)</h3>
          {pageOptions.length > 1 && (
            <Select value={currentPage} onValueChange={handlePageChange}>
              <SelectTrigger className="w-auto bg-backgroundCustom border shadow-xl">
                <SelectValue placeholder="เลือกตอน" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>เลือกช่วงตอน</SelectLabel>
                  {pageOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>

        <ScrollArea className="h-165 w-full bg-backgroundCustom border shadow-xl rounded">
          <div className="p-4">
            {pageOptions.length > 1 && (
              <>
                <h3 className="mb-4 text-sm font-bold leading-none">
                  {pageOptions.find(option => option.value === currentPage)?.label}
                </h3>
                <hr />
              </>
            )}
            {currentChapters.length > 0 ? (
              currentChapters.map((chapter) => (
                <div
                  key={chapter.chapter_id}
                  onClick={() => handleChapterClick(chapter.order)}
                  className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors border"
                >
                  <div className="flex justify-between items-center">
                    <span>ตอนที่ {chapter.order}: {chapter.title}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {chapter.price > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {chapter.price} เหรียญ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                ยังไม่มีตอนในเรื่องนี้
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}