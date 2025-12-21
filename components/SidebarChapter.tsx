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
import SortableChapterItem from "@/components/SortableChapterItem";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SetStateAction, useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import ModalSettingChapter from "@/components/ModalSettingChapter";
import { ModalConfirm } from "@/components/ModalConfirm";
import { useSession } from "next-auth/react";

// Interface สำหรับ purchased chapter item
interface PurchasedChapterItem {
    transaction_id: string;
    chapter_id: string;
    amount: number;
    created_at: string;
    chapter: {
        chapter_id: string;
        title: string;
        order: number;
        price: number;
    };
}

// Interface สำหรับ Session ที่มี user id
interface ExtendedSession {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    }
}

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
    admin_hidden?: boolean; // เพิ่มสำหรับ admin hidden
    admin_hide_reason?: string; // เพิ่มสำหรับเหตุผลการซ่อน
};

export interface ChapterItem {
    chapter_id: string;
    order: number;
    title: string;
}

export default function SidebarChapter({ trigger, mode }: SidebarChapterProps) {
    const params = useParams();
    const storyId = params.story as string;
    const router = useRouter();
    const { data: session } = useSession() as { data: ExtendedSession | null };

    // State สำหรับเก็บข้อมูล chapters และ story
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [storyTitle, setStoryTitle] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [currentPage, setCurrentPage] = useState("page-1");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [chapterToConfirm, setChapterToConfirm] = useState<Chapter | null>(null);
    const [purchasedChapters, setPurchasedChapters] = useState<Set<string>>(new Set());
    const [userCoins, setUserCoins] = useState<number>(0);
    const sensors = useSensors(useSensor(PointerSensor));

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

    // ดึงข้อมูล purchased chapters เมื่ออยู่ใน reader mode
    useEffect(() => {
        const fetchPurchasedChapters = async () => {
            if (mode === 'reader' && storyId && session?.user?.id) {
                try {
                    const response = await fetch(`/api/reader/purchased-chapters?user_id=${session.user.id}&story_id=${storyId}`);
                    if (response.ok) {
                        const data = await response.json();
                        // สมมติว่า API ส่งกลับ array ของ chapter_id ที่ซื้อแล้ว
                        const purchasedIds = new Set<string>();
                        data.purchasedChapters.forEach((item: PurchasedChapterItem) => {
                            if (item.chapter_id) {
                                purchasedIds.add(item.chapter_id);
                            }
                        });
                        setPurchasedChapters(purchasedIds);
                    }
                } catch (error) {
                    console.log('Error fetching purchased chapters:', error);
                }
            }
        };

        fetchPurchasedChapters();
    }, [mode, storyId, session?.user?.id]);

    // ดึงข้อมูล wallet balance
    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (session?.user?.id) {
                try {
                    const response = await fetch('/api/wallet');
                    if (response.ok) {
                        const walletData = await response.json();
                        setUserCoins(walletData.balance || 0);
                    }
                } catch (error) {
                    console.log('Error fetching wallet balance:', error);
                    setUserCoins(0);
                }
            }
        };

        fetchWalletBalance();
    }, [session?.user?.id]);

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

    const handleOpenSettings = (chapter: ChapterItem) => {
        // Find the full chapter data from chapters array
        const fullChapter = chapters.find(c => c.chapter_id === chapter.chapter_id);
        if (fullChapter) {
            setSelectedChapter(fullChapter);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedChapter(null);
    };

    const handleConfirmPurchase = async () => {
        if (!chapterToConfirm) return;

        // อัพเดท purchased chapters
        setPurchasedChapters(prev => new Set([...prev, chapterToConfirm.chapter_id]));

        // อัพเดท user coins (หักราคาตอน)
        setUserCoins(prev => Math.max(0, prev - chapterToConfirm.price));

        // นำไปหน้าอ่าน chapter
        router.push(`/novel/${storyId}/${chapterToConfirm.order}`);
    };

    const handleCloseConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setChapterToConfirm(null);
    };

    const updateChapterOrder = async (reordered: Chapter[]) => {
        try {
            const response = await fetch(`/api/writer/stories/${storyId}/reorder`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chapters: reordered.map((ch) => ({
                        chapter_id: ch.chapter_id,
                        order: ch.order,
                    })),
                }),
            });

            if (!response.ok) throw new Error("อัปเดตลำดับไม่สำเร็จ");

            toast.success("✅ บันทึกลำดับตอนใหม่เรียบร้อยแล้ว");
        } catch (err) {
            console.error("Error updating chapter order:", err);
            toast.error("❌ ไม่สามารถอัปเดตลำดับตอนได้");
        }
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
                        ) : mode === "writer" ? (
                            // 👇 วางไว้ด้านบนของ SidebarChapter component

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={async ({ active, over }) => {
                                    if (!over || active.id === over.id) return;

                                    setChapters((prev) => {
                                        const oldIndex = prev.findIndex((c) => c.chapter_id === active.id);
                                        const newIndex = prev.findIndex((c) => c.chapter_id === over.id);
                                        const reordered = arrayMove(prev, oldIndex, newIndex);
                                        const updated = reordered.map((c, i) => ({ ...c, order: i + 1 }));

                                        // 🔥 เรียก API เพื่ออัปเดตฐานข้อมูล
                                        updateChapterOrder(updated);

                                        return updated;
                                    });
                                }}
                            >

                                <SortableContext
                                    items={currentChapters.map((c) => c.chapter_id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {currentChapters.map((chapter) => (
                                        <SortableChapterItem
                                            key={chapter.chapter_id}
                                            chapter={chapter}
                                            storyId={storyId}
                                            router={router}
                                            onOpenSettings={handleOpenSettings}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>

                        ) : (
                            currentChapters.map((chapter) => (
                                <div
                                    key={chapter.chapter_id}
                                    onClick={() => router.push(`/novel/${storyId}/${chapter.order}`)}
                                    className="text-sm my-2 p-4 bg-background border rounded hover:bg-backgroundCustom cursor-pointer"
                                >
                                    ตอนที่ {chapter.order}: {chapter.title}
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
                            price: selectedChapter.price,
                            adminHidden: selectedChapter.admin_hidden || false,
                            adminHideReason: selectedChapter.admin_hide_reason || undefined
                        }}
                        previousChapterStatus={
                            selectedChapter.order > 1
                                ? chapters.find(ch => ch.order === selectedChapter.order - 1)?.status || null
                                : null
                        }
                    />
                )}

                {/* Modal Confirm Purchase */}
                {chapterToConfirm && (
                    <ModalConfirm
                        isOpen={isConfirmModalOpen}
                        onClose={handleCloseConfirmModal}
                        onConfirm={handleConfirmPurchase}
                        item={{
                            storyId: storyId,
                            chapterId: chapterToConfirm.chapter_id,
                            title: `ตอนที่ ${chapterToConfirm.order}: ${chapterToConfirm.title}`,
                            price: chapterToConfirm.price,
                            description: `ตอนที่ ${chapterToConfirm.order} ของเรื่อง ${storyTitle}`
                        }}
                        paymentMethod="coins"
                        userCoins={userCoins}
                    />
                )}
            </SheetContent>
        </Sheet>
    )
}