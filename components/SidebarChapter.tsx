"use client";
import { toast } from "sonner";
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
import { SetStateAction, useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Settings, Coins, EyeOff, Clock, Pen } from "lucide-react";
import ModalSettingChapter from "@/components/ModalSettingChapter";

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
    status?: "draft" | "published" | "scheduled";
    scheduledDate?: Date;
    scheduled_date?: string; // เพิ่มเพื่อรองรับข้อมูลจาก API
    isHidden?: boolean;
    is_hidden?: boolean; // เพิ่มเพื่อรองรับข้อมูลจาก API
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

    const handlePageChange = (value: SetStateAction<string>) => {
        setCurrentPage(value);
    };

    // ดึงข้อมูล story และ chapters จาก API
    const fetchData = useCallback(async () => {
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
                console.log('Failed to fetch chapters');
            }
        } catch (error) {
            console.log('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [storyId]);

    // ดึงข้อมูลเมื่อ component mount หรือเมื่อ storyId เปลี่ยน
    useEffect(() => {
        fetchData();
    }, [storyId, fetchData]);

    // คำนวณจำนวนหน้าสำหรับ pagination (20 ตอนต่อหน้า)
    const chaptersPerPage = 20;
    // กรองตอนตาม mode ก่อนคำนวณ pagination
    const visibleChapters = mode === 'reader' 
        ? chapters.filter(chapter => chapter.status === 'published')
        : chapters;
    const totalChapters = visibleChapters.length;
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
    const handlePageChangeInfoEditor = () => {
        router.push(`/editor/${storyId}`);
    };

    const handlePageChangeInfo = () => {
        router.push(`/novel/${storyId}`);
    };

    // คำนวณตอนที่จะแสดงในหน้าปัจจุบัน
    const getCurrentPageChapters = () => {
        // กรองตอนตาม mode
        let filteredChapters = chapters;
        if (mode === 'reader') {
            // แสดงเฉพาะตอนที่เผยแพร่แล้วสำหรับ reader
            filteredChapters = chapters.filter(chapter => chapter.status === 'published');
        }
        
        const pageIndex = parseInt(currentPage.split('-')[1]) - 1;
        const startIndex = pageIndex * chaptersPerPage;
        const endIndex = Math.min(startIndex + chaptersPerPage, filteredChapters.length);
        return filteredChapters.slice(startIndex, endIndex);
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
                toast.success("สร้างบทใหม่สำเร็จ");
                // รีเฟรชรายการ chapters
                await fetchData();
            } else {
                throw new Error("Failed to create chapter");
            }
        } catch (error) {
            console.log("Error creating chapter:", error);
            toast.error("เกิดข้อผิดพลาดในการสร้างบทใหม่");
        } finally {
            setIsCreating(false);
        }
    };

    const handleOpenSettings = (chapter: Chapter) => {
        setSelectedChapter(chapter);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedChapter(null);
    };

    return (
        <Sheet>
            <SheetTrigger >
                {trigger}
            </SheetTrigger>
            <SheetContent className="bg-backgroundCustom ">
                <SheetHeader>
                    <SheetTitle className="text-foreground text-lg font-bold break-words hyphens-auto">
                        {isLoading ? "กำลังโหลด..." : storyTitle}
                    </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col-2 gap-2 mx-2">
                    <div
                        className="flex text-sm p-4 bg-backgroundCustom rounded hover:bg-backgroundCustom cursor-pointer transition-colors border"
                        onClick={mode === 'writer' ? handlePageChangeInfoEditor : handlePageChangeInfo}
                    >
                        ข้อมูลเบื้องต้นของเรื่องนี้
                    </div>

                    {mode === 'writer' && (
                        <div>
                            <button
                                onClick={handleCreateChapter}
                                disabled={isCreating}
                                type="button"
                                className={`text-sm p-4 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer transition-colors border ${isCreating ? 'opacity-50 cursor-not-allowed' : ''
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
                                    className="text-sm my-2 p-4 bg-background border rounded hover:bg-backgroundCustom transition-colors relative group"
                                >
                                    <div
                                        onClick={() => {
                                            if (mode === 'writer') {
                                                // นำไปหน้าแก้ไข chapter
                                                router.push(`/editor/${storyId}/${chapter.order}`);
                                            } else {
                                                // นำไปหน้าอ่าน chapter
                                                router.push(`/novel/${storyId}/${chapter.order}`);
                                            }
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <div className="text-bold mt-1 pr-10">
                                            <div className="flex items-center gap-2">
                                                <span>ตอนที่ {chapter.order} : {chapter.title}</span>
                                                {chapter.price > 0 && (
                                                    <span className="flex justify-center items-center text-xs bg-yellow-900 text-yellow-200 px-2 py-0.5 rounded">
                                                        {chapter.price} <Coins className="inline-block w-3 h-3" />
                                                    </span>
                                                )}
                                                {(chapter.isHidden || chapter.is_hidden) && (
                                                    <span className="flex justify-center items-center text-xs bg-red-900 text-white px-2 py-0.5 rounded">
                                                        <EyeOff className="inline-block w-3 h-3" />
                                                    </span>
                                                )}
                                                {chapter.status === "draft" && (
                                                    <span className="flex justify-center items-center text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                                                        <Pen className="inline-block w-3 h-3" />
                                                    </span>
                                                )}
                                                {chapter.status === "scheduled" && (
                                                    <span className="flex justify-center items-center text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded">
                                                        <Clock className="inline-block w-3 h-3" />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {mode === 'writer' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenSettings(chapter);
                                            }}
                                            className="absolute top-2 right-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 opacity-60 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                                            title="ตั้งค่าตอน"
                                        >
                                            <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                {/* Modal Setting Chapter */}
                {selectedChapter && (
                    <ModalSettingChapter
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSave={fetchData} // รีเฟรชข้อมูลหลังจากบันทึก
                        chapterData={{
                            id: selectedChapter.chapter_id,
                            title: selectedChapter.title,
                            order: selectedChapter.order,
                            storyId: storyId,
                            status: selectedChapter.status || "draft",
                            scheduledDate: selectedChapter.scheduledDate ? new Date(selectedChapter.scheduledDate) :
                                selectedChapter.scheduled_date ? new Date(selectedChapter.scheduled_date) : undefined,
                            isHidden: selectedChapter.isHidden || selectedChapter.is_hidden || false,
                            price: selectedChapter.price
                        }}
                        previousChapterStatus={
                            selectedChapter.order > 1
                                ? chapters.find(ch => ch.order === selectedChapter.order - 1)?.status || null
                                : null
                        }
                    />
                )}
            </SheetContent>
        </Sheet>
    )
}