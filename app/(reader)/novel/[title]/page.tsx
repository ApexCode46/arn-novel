"use client";

import { useParams } from "next/navigation";
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
import { SetStateAction, useState } from "react";
import Image from "next/image";

export default function Page() {
  const params = useParams();
  const title = params?.title ? decodeURIComponent(params.title as string) : "Loading...";

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

  return (
    <>
      <Card className="w-full bg-background">
        <CardContent className="grid grid-cols-6 py-6">
          <div className="col-span-6 sm:col-span-2 md:justify-start sm:mr-4">
            <Image
              src="/novelImg/action1.png"
              alt={"superman"}
              width={500}
              height={100}
              className="object-cover rounded w-full"
            />
          </div>

          <div className="col-span-6 sm:col-span-4 space-y-3">
            <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold break-words">
              Superman: จอมพลังแห่งโลกใหม่
            </CardTitle>

            <div className="space-y-2">
              <div className="flex space-x-2">
                <span className="font-semibold">ผู้แต่ง :</span>
                <span className="text-gray-600 hyphens-auto">นักเขียนแห่งจินตนาการ</span>
              </div>

              <div className="flex space-x-2">
                <span className="font-semibold">แนว :</span>
                <span className="text-gray-600 hyphens-auto">แฟนตาซี แอคชั่น ซูเปอร์ฮีโร่ การผจญภัย</span>
              </div>

              <div className="flex space-x-2">
                <span className="font-semibold">แท็ก :</span>
                <span className="text-gray-600">#ซูเปอร์ฮีโร่ #พลังพิเศษ #ต่อสู้ #ผจญภัย #ช่วยเหลือโลก</span>
              </div>

              <div>
                <span className="font-semibold block mb-1">เรื่องย่อ :</span>
                <p className="text-gray-600 leading-relaxed hyphens-auto">
                  เมื่อโลกต้องเผชิญกับภัยคุกคามครั้งใหม่ ชายหนุ่มธรรมดาคนหนึ่งได้ค้นพบว่าตัวเองมีพลังพิเศษที่ซ่อนอยู่ภายใน เขาต้องเรียนรู้ที่จะควบคุมพลังเหล่านั้นและปกป้องผู้คนจากภัยอันตรายที่กำลังคืบคลานเข้ามา ท่ามกลางการต่อสู้กับศัตรูที่ทรงพลัง มิตรภาพที่งดงาม และการค้นพบความลับของตัวเอง เขาต้องเลือกระหว่างการใช้ชีวิตปกติหรือก้าวขึ้นมาเป็นฮีโร่ที่โลกต้องการ นี่คือการเดินทางของซูเปอร์แมน ผู้พิทักษ์คนใหม่แห่งโลกยุคใหม่ ท่ามกลางการต่อสู้ระหว่างความดีและความชั่วที่ไม่มีวันสิ้นสุด
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="my-4">
        <div className="flex justify-between my-4">
          <h3 className="text-lg font-medium">สารบัญ (ทั้งหมด {totalChapters} ตอน)</h3>
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
        </div>

        <ScrollArea className="h-165 w-full bg-background border rounded">
          <div className="p-4">
            <h3 className="mb-4 text-sm font-bold leading-none">ตอนที่ {pageOptions.find(option => option.value === currentPage)?.label.split(' ')[1]}</h3>
            <hr />
            {currentChapters.map((chapter) => (
              <div key={chapter.id} className="text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors">
                {chapter.title}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}