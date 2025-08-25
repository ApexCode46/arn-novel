
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChevronLeft,
    ChevronRight,
    List,
    Home,
    Type,
    Minus,
    Plus,
    Sidebar,
    MessageCircle,
    EyeOff
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SidebarChapter from "@/components/SidebarChapter";
import { CommentsChapter } from "@/components/commentsChapter";
import { VoicePlayer } from "@/components/VoicePlayer";
import TextAlign from '@tiptap/extension-text-align'

interface Chapter {
    chapter_id: string;
    order: number;
    title: string;
    content: string;
    price: number;
    is_hidden?: boolean;
    views?: number;
    created_at: string;
    updated_at: string;
    commentsCount: number;
}

interface Story {
    penName: string;
    story_id: string;
    title: string;
    views?: number;
    author: {
        id: string;
        name: string;
    };
}

interface NavigationChapter {
    chapter_id: string;
    order: number;
    title: string;
    status?: string; // เพิ่ม status
}

interface ChapterData {
    chapter: Chapter;
    story: Story;
    navigation: {
        previous: NavigationChapter | null;
        next: NavigationChapter | null;
        allChapters: NavigationChapter[];
        currentIndex: number;
        totalChapters: number;
    };
}

// Component สำหรับแสดงเนื้อหา chapter ด้วย Tiptap
function ChapterContentDisplay({ content, fontSize, fontFamily }: { content: string; fontSize: number; fontFamily: string }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: content || '<p>ไม่มีเนื้อหาในตอนนี้</p>',
        editable: false,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
                style: `font-size: ${fontSize}px; line-height: 1.7; font-family: ${fontFamily};`,
            },
        },
    });

    // เพิ่มการป้องกันการคัดลอกด้วย JavaScript
    useEffect(() => {
        const preventCopy = (e: Event) => {
            e.preventDefault();
            return false;
        };

        const preventKeyboardShortcuts = (e: KeyboardEvent) => {
            // ป้องกัน Ctrl+A, Ctrl+C, Ctrl+S, Ctrl+P, F12
            if (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 's' || e.key === 'p')) {
                e.preventDefault();
                return false;
            }
            // ป้องกัน F12 (Developer Tools)
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
        };

        const preventRightClick = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // เพิ่ม event listeners
        document.addEventListener('copy', preventCopy);
        document.addEventListener('selectstart', preventCopy);
        document.addEventListener('dragstart', preventCopy);
        document.addEventListener('keydown', preventKeyboardShortcuts);
        document.addEventListener('contextmenu', preventRightClick);

        // ทำความสะอาดเมื่อ component unmount
        return () => {
            document.removeEventListener('copy', preventCopy);
            document.removeEventListener('selectstart', preventCopy);
            document.removeEventListener('dragstart', preventCopy);
            document.removeEventListener('keydown', preventKeyboardShortcuts);
            document.removeEventListener('contextmenu', preventRightClick);
        };
    }, []);

    return (
        <div 
            className="w-full min-h-[70rem] my-5 bg-backgroundCustom shadow-2xl story-content-protected"
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="p-6">
                <EditorContent
                    editor={editor}
                    className="text-foreground leading-relaxed [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror]:min-h-[65rem]"
                    style={{ 
                        fontSize: `${fontSize}px`,
                        fontFamily: fontFamily
                    }}
                />
            </div>
        </div>
    );
}

// Component สำหรับแสดงเมื่อเนื้อหาถูกซ่อน
function HiddenContentDisplay() {
    return (
        <Card className="w-full max-w-md mx-auto bg-backgroundCustom backdrop-blur-sm shadow-xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <EyeOff className="w-8 h-8 text-gray-500" />
                        </div>
                        <CardTitle className="text-xl font-bold">
                            เนื้อหาถูกปิดการมองเห็น
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-gray-600 mb-4">
                            เนื้อหาตอนนี้ถูกซ่อนโดยผู้เขียน
                        </p>
                        <p className="text-sm text-gray-500">
                            กรุณาติดต่อผู้เขียนหรือรอการเปิดเผยเนื้อหา
                        </p>
                    </CardContent>
                </Card>
    );
}

// Component สำหรับ Footer Menu
function FooterMenu({
    storyId,
    chapterOrder,
    isVisible,
    fontSize,
    onFontSizeChange,
    fontFamily,
    onFontFamilyChange
}: {
    storyId: string;
    chapterOrder: string;
    isVisible: boolean;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    fontFamily: string;
    onFontFamilyChange: (font: string) => void;
}) {
    const fonts = [
        { name: 'Sarabun', value: '"Sarabun", sans-serif' },
        { name: 'Kanit', value: '"Kanit", sans-serif' },
        { name: 'Sans Serif', value: 'system-ui, -apple-system, sans-serif' },
        { name: 'Serif', value: 'Georgia, "Times New Roman", serif' },
    ];

    const handleFontChange = (fontValue: string) => {
        onFontFamilyChange(fontValue);
    };

    const increaseFontSize = () => {
        if (fontSize < 24) {
            onFontSizeChange(fontSize + 2);
        }
    };

    const decreaseFontSize = () => {
        if (fontSize > 12) {
            onFontSizeChange(fontSize - 2);
        }
    };

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'
            } md:hidden`}>
            <div className="bg-background border-t border-border shadow-lg">
                <div className="grid grid-cols-6 gap-1 py-3 px-2">
                    {/* 1. ปุ่มกลับหน้าหลัก */}
                    <Link href="/" className="flex justify-center">
                        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
                            <Home className="w-4 h-4" />
                            <span className="text-xs">หน้าหลัก</span>
                        </Button>
                    </Link>

                    {/* 2. ปุ่มกลับไปหน้าสารบัญ */}
                    <Link href={`/novel/${storyId}`} className="flex justify-center">
                        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
                            <List className="w-4 h-4" />
                            <span className="text-xs">สารบัญ</span>
                        </Button>
                    </Link>

                    {/* 3. ปุ่มเปลี่ยน font ตัวอักษร */}
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
                                    <Type className="w-4 h-4" />
                                    <span className="text-xs">ฟอนต์</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="mb-2">
                                {fonts.map((font) => (
                                    <DropdownMenuItem
                                        key={font.value}
                                        onClick={() => handleFontChange(font.value)}
                                        className={fontFamily === font.value ? 'bg-accent' : ''}
                                    >
                                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* 4. ปุ่มเพิ่ม/ลด ขนาดตัวอักษร */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={decreaseFontSize}
                                disabled={fontSize <= 12}
                                className="h-6 w-6 p-0"
                            >
                                <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-xs min-w-[16px] text-center">{fontSize}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={increaseFontSize}
                                disabled={fontSize >= 24}
                                className="h-6 w-6 p-0"
                            >
                                <Plus className="w-3 h-3" />
                            </Button>
                        </div>
                        <span className="text-xs">ขนาด</span>
                    </div>

                    {/* 5. ปุ่มความคิดเห็น */}
                    <div className="flex justify-center">
                        <CommentsChapter
                            storyId={storyId}
                            chapterOrder={chapterOrder}
                            customTrigger={
                                <div className="flex flex-col items-center gap-1 h-auto py-2">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-xs">ความคิดเห็น</span>
                                </div>
                            }
                        />
                    </div>

                    {/* 6. ปุ่มเรียก sidebarChapter */}
                    <div className="flex justify-center">
                        <SidebarChapter
                            trigger={
                                <div
                                    
                                    className="flex flex-col items-center gap-1 h-auto py-2"
                                >
                                    <Sidebar className="w-4 h-4" />
                                    <span className="text-xs">ตอน</span>
                                </div>
                            }
                            mode="reader"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Page() {
    const params = useParams();
    const storyId = params.story as string;
    const chapterOrder = params.chapter as string;

    const [chapterData, setChapterData] = useState<ChapterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFooterVisible, setIsFooterVisible] = useState(true);
    const [fontSize, setFontSize] = useState(16);
    const [fontFamily, setFontFamily] = useState('"Sarabun", sans-serif');

    // ฟังก์ชันสำหรับรับการเปลี่ยนแปลงจาก FontControls ใน layout
    useEffect(() => {
        const handleFontSettingsChange = (event: CustomEvent) => {
            const { fontSize: newFontSize, fontFamily: newFontFamily } = event.detail;
            setFontSize(newFontSize);
            setFontFamily(newFontFamily);
        };

        window.addEventListener('fontSettingsChange', handleFontSettingsChange as EventListener);

        return () => {
            window.removeEventListener('fontSettingsChange', handleFontSettingsChange as EventListener);
        };
    }, []);

    // ฟังก์ชันสำหรับจัดการการคลิกหน้าจอ (mobile)
    const handleContentClick = () => {
        // ถ้าเป็นมือถือ ให้ซ่อน/แสดง footer
        if (window.innerWidth < 768) {
            setIsFooterVisible(prev => !prev);
        }
    };

    // ดึงข้อมูล chapter จาก API
    useEffect(() => {
        const fetchChapter = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/reader/stories/${storyId}/chapters/${chapterOrder}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch chapter');
                }

                const data = await response.json();

                
                setChapterData(data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (storyId && chapterOrder) {
            fetchChapter();
        }
    }, [storyId, chapterOrder]);

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">กำลังโหลด...</div>
            </div>
        );
    }

    // Error state
    if (error || !chapterData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg text-red-500">เกิดข้อผิดพลาด: {error || 'ไม่พบข้อมูลตอน'}</div>
            </div>
        );
    }

    const { chapter, story, navigation } = chapterData;
    
    const isHidden = chapter.is_hidden === true;

    return (
        <div className="relative">
            {/* Navigation Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <Link href={`/novel/${storyId}`}>
                        <Button variant="default" size="sm">
                            <List className="w-4 h-4 mr-2" />
                            กลับสู่สารบัญ
                        </Button>
                    </Link>

                    <div className="text-sm text-muted-foreground">
                        ตอนที่ {chapter.order} / {navigation.totalChapters}
                    </div>
                </div>

                {/* Story Title */}
                <div className="text-center mb-2 story-content-protected" onContextMenu={(e) => e.preventDefault()}>
                    <h1 className="text-lg font-semibold text-muted-foreground break-words hyphens-auto">
                        {story.title}
                    </h1>
                    <h1 className="text-lg font-semibold text-muted-foreground break-words hyphens-auto">ตอนที่ {chapter.order} : {chapter.title}</h1>
                    <p className="text-sm text-muted-foreground">โดย {story.penName}</p>
                    </div>
                
                {!isHidden && (
                    <div className="mb-6">
                        <VoicePlayer
                            storyId={storyId}
                            chapterId={chapter.chapter_id}
                            chapterTitle={chapter.title}
                            chapterOrder={chapter.order}
                        />
                    </div>
                )}
            </div>

            {/* Content area with click handler */}
            <div onClick={handleContentClick} className="cursor-pointer md:cursor-default">
                {isHidden ? (
                    <HiddenContentDisplay />
                ) : (
                    <ChapterContentDisplay content={chapter.content} fontSize={fontSize} fontFamily={fontFamily} />
                )}
            </div>

            {/* Navigation Footer - แสดงเสมอไม่ว่าเนื้อหาจะถูกซ่อนหรือไม่ */}
            <div className="mt-8">
                <div className="flex justify-between items-center">
                    {/* Previous Chapter */}
                    <div className="flex-1">
                        {navigation.previous && navigation.previous.status === "published" ? (
                            <Link href={`/novel/${storyId}/${navigation.previous.order}`}>
                                <Button variant="default" className="w-auto max-w-xs">
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    <div className="text-left hidden sm:block">
                                        <div className="text-xs text-muted-foreground">ตอนก่อนหน้า</div>
                                        <div className="truncate">ตอนที่ {navigation.previous.order}: {navigation.previous.title}</div>
                                    </div>
                                </Button>
                            </Link>
                        ) : (
                            <div></div>
                        )}
                    </div>

                    {/* Next Chapter */}
                    <div className="flex-1 flex justify-end">
                        {navigation.next && navigation.next.status === "published" ? (
                            <Link href={`/novel/${storyId}/${navigation.next.order}`}>
                                <Button variant="default" className="w-auto max-w-xs">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-xs text-muted-foreground">ตอนถัดไป</div>
                                        <div className="truncate">ตอนที่ {navigation.next.order}: {navigation.next.title}</div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        ) : (
                            <div></div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Menu for mobile */}
            <FooterMenu
                storyId={storyId}
                chapterOrder={chapterOrder}
                isVisible={isFooterVisible}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                fontFamily={fontFamily}
                onFontFamilyChange={setFontFamily}
            />

            {/* Hidden SidebarChapter Component */}
            <div className="hidden">
                <SidebarChapter
                    trigger={<div></div>}
                    mode="reader"
                />
            </div>

            {/* Desktop Comments Component */}
            <div className="hidden sm:block">
                <CommentsChapter 
                    storyId={storyId}
                    chapterOrder={chapterOrder}
                />
            </div>
        </div>
    );
}

