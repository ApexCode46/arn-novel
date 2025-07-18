"use client";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SetStateAction, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

type SidebarChapterProps = {
    trigger?: React.ReactNode;
    mode?: 'reader' | 'writer';
};

type Chapter = {
    chapter_id: string;
    order: number;
    title: string;
    content: string;
    price: number;
    created_at: string;
    updated_at: string;
};

export default function SidebarChapter({ trigger, mode }: SidebarChapterProps) {
    const params = useParams();
    const storyId = params.story as string;
    const router = useRouter();
    
    // State สำหรับเก็บข้อมูล chapters และ story
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [storyTitle, setStoryTitle] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [currentPage, setCurrentPage] = useState("page-1");

    // ดึงข้อมูล story และ chapters จาก API
    const fetchData = async () => {
        if (!storyId) return;
        
        try {
            setIsLoading(true);
            
            // ดึงข้อมูล story เพื่อเอาชื่อเรื่อง
            const storyResponse = await fetch(`/api/writer/stories/${storyId}`);
            if (storyResponse.ok) {
                const storyData = await storyResponse.json();
                setStoryTitle(storyData.title || "ไม่มีชื่อเรื่อง");
            }
            
            // ดึงข้อมูล chapters
            const chaptersResponse = await fetch(`/api/writer/stories/${storyId}/chapters`);
            if (chaptersResponse.ok) {
                const chaptersData = await chaptersResponse.json();
                setChapters(chaptersData);
            } else {
                console.error('Failed to fetch chapters');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ดึงข้อมูลเมื่อ component mount หรือเมื่อ storyId เปลี่ยน
    useEffect(() => {
        fetchData();
    }, [storyId]);

    // คำนวณจำนวนหน้าสำหรับ pagination (20 ตอนต่อหน้า)
    const chaptersPerPage = 20;
    const totalChapters = chapters.length;
    const totalPages = Math.ceil(totalChapters / chaptersPerPage);

    // สร้างตัวเลือกสำหรับ dropdown
    const generatePageOptions = () => {
        const options = [];
        for (let i = 0; i < totalPages; i++) {
            const startChapter = i * chaptersPerPage + 1;
            const endChapter = Math.min((i + 1) * chaptersPerPage, totalChapters);
            options.push({
                value: `page-${i + 1}`,
                label: `ตอนที่ ${startChapter}-${endChapter}`
            });
        }
        return options.length > 0 ? options : [{ value: "page-1", label: "ไม่มีตอน" }];
    };

    const pageOptions = generatePageOptions();

    // ฟังก์ชันสำหรับการเปลี่ยนหน้า
    const handlePageChange = (value: SetStateAction<string>) => {
        setCurrentPage(value);
    };

    // คำนวณตอนที่จะแสดงในหน้าปัจจุบัน
    const getCurrentPageChapters = () => {
        const pageIndex = parseInt(currentPage.split('-')[1]) - 1;
        const startIndex = pageIndex * chaptersPerPage;
        const endIndex = Math.min(startIndex + chaptersPerPage, totalChapters);
        return chapters.slice(startIndex, endIndex);
    };

    const currentChapters = getCurrentPageChapters();
    

    const handleCreateChapter = async () => {
        if (!storyId || isCreating) return;
        
        setIsCreating(true);
        try {
            const response = await fetch(`/api/writer/stories/${storyId}/chapters`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: `ไม่มีชื่อ`,
                    content: "",
                    price: 0,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Chapter created successfully:", data);
                // รีเฟรชรายการ chapters
                await fetchData();
            } else {
                throw new Error("Failed to create chapter");
            }
        } catch (error) {
            console.error("Error creating chapter:", error);
            alert("เกิดข้อผิดพลาดในการสร้างบทใหม่");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Sheet>
            <SheetTrigger >
                {trigger}
            </SheetTrigger>
            <SheetContent className="bg-backgroundCustom ">
                <SheetHeader>
                    <SheetTitle className="text-left">
                        {isLoading ? "กำลังโหลด..." : storyTitle}
                    </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col-2 gap-2 mx-2">
                    <div
                        className="flex text-sm p-4 bg-backgroundCustom rounded hover:bg-backgroundCustom cursor-pointer transition-colors border"
                    >
                        ข้อมูลเบื้องต้นของเรื่องนี้
                    </div>

                    {mode === 'writer' && (
                        <div>
                            <button
                                onClick={handleCreateChapter}
                                disabled={isCreating}
                                type="button"
                                className={`text-sm p-4 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer transition-colors border ${
                                    isCreating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isCreating ? 'กำลังสร้าง...' : '+ เพิ่มตอนใหม่'}
                            </button>
                        </div>
                    )}
                </div>

                <Select value={currentPage} onValueChange={handlePageChange} >
                    <SelectTrigger className="w-auto mx-2 bg-backgroundCustom border">
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
                <ScrollArea className="h-165 w-full bg-backgroundCustom border rounded">
                    <div className="p-4">
                        {isLoading ? (
                            <div className="text-center text-sm text-muted-foreground p-4">
                                กำลังโหลด...
                            </div>
                        ) : currentChapters.length === 0 ? (
                            <div className="text-center text-sm text-muted-foreground p-4">
                                ยังไม่มีตอน
                            </div>
                        ) : (
                            currentChapters.map((chapter: Chapter) => (
                                <div 
                                    key={chapter.chapter_id} 
                                    onClick={() => {
                                        if (mode === 'writer') {
                                            // นำไปหน้าแก้ไข chapter
                                            router.push(`/editor/${storyId}/${chapter.order}`);
                                        } else {
                                            // นำไปหน้าอ่าน chapter
                                            router.push(`/novel/${storyId}/${chapter.order}`);
                                        }
                                    }}
                                    className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors"
                                >
                                    <div className=" text-bold mt-1">
                                        ตอนที่ {chapter.order} : {chapter.title} {chapter.price > 0 && `• ${chapter.price} เหรียญ`}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}