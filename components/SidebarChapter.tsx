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
import { SetStateAction, useState } from "react";
import { TableOfContents } from "lucide-react";
export default function SidebarChapter() {
    // สร้างข้อมูล dummy สำหรับตอนนิยาย
    const generateDummyChapters = () => {
        const chapters = [];
        const totalChapters = 123; // จำนวนตอนทั้งหมด

        for (let i = 1; i <= totalChapters; i++) {
            chapters.push({
                id: i,
                title: `ตอนที่ ${i}: ${getRandomChapterTitle()}`
            });
        }

        return chapters;
    };

    // สร้างชื่อตอนแบบสุ่ม
    const getRandomChapterTitle = () => {
        const titles = [
            "การเริ่มต้นของพลัง",
            "ศัตรูที่ไม่คาดฝัน",
            "การฝึกฝนครั้งใหม่",
            "ความลับที่ถูกซ่อน",
            "การต่อสู้ครั้งยิ่งใหญ่",
            "มิตรภาพอันแข็งแกร่ง",
            "การเดินทางสู่ดินแดนต้องห้าม",
            "พลังที่สาบสูญ",
            "การกลับมาของจอมมาร",
            "บททดสอบแห่งความกล้า"
        ];

        return titles[Math.floor(Math.random() * titles.length)];
    };

    // สร้างข้อมูลตอนทั้งหมด
    const allChapters = generateDummyChapters();
    const totalChapters = allChapters.length;

    // คำนวณจำนวนหน้าสำหรับ pagination (20 ตอนต่อหน้า)
    const chaptersPerPage = 20;
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
        return options;
    };

    const pageOptions = generatePageOptions();

    // State สำหรับเก็บหน้าปัจจุบัน
    const [currentPage, setCurrentPage] = useState(pageOptions[0].value);

    // ฟังก์ชันสำหรับการเปลี่ยนหน้า
    const handlePageChange = (value: SetStateAction<string>) => {
        setCurrentPage(value);
    };

    // คำนวณตอนที่จะแสดงในหน้าปัจจุบัน
    const getCurrentPageChapters = () => {
        const pageIndex = parseInt(currentPage.split('-')[1]) - 1;
        const startIndex = pageIndex * chaptersPerPage;
        const endIndex = Math.min(startIndex + chaptersPerPage, totalChapters);
        return allChapters.slice(startIndex, endIndex);
    };

    const currentChapters = getCurrentPageChapters();
        const test1 = () => {
        console.log("test 1");
    }
  return (
    <Sheet>
                    <SheetTrigger className="fixed right-2 top-20 p-2 rounded-md bg-backgroundCustom transition-colors hover:bg-gray-200 hover:text-black">
                        <TableOfContents size={18} />
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>test</SheetTitle>
                        </SheetHeader>
                        <div
                            className="text-sm  p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors border"
                        >
                            ข้อมูลเบื้องต้นของเรื่องนี้
                        </div>
                        <Select value={currentPage} onValueChange={handlePageChange}>
                            <SelectTrigger className="w-auto">
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
                        <ScrollArea className="h-165 w-full bg-background border rounded">
                            <div className="p-4">                             
                                {currentChapters.map((chapter) => (
                                    <div key={chapter.id} onClick={() => test1()} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                                        {chapter.title}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
  )
}