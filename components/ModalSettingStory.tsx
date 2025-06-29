'use client'
import { use, useState } from 'react';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"

import { Settings, BookPlus, Check } from "lucide-react"
import React from "react";
import clsx from "clsx";

export default function Modalsettingstory() {
    //ชื่อเรื่อง
    const [storyName, setStoryName] = useState<string>("");

    // นามปากา
    const [penName, setPenName] = useState<string>("");

    // หมวดหมู่
    const [category, setCategory] = useState<string>("");

    // คำโปรย
    const [blurb, setBlurb] = useState<string>("");
    const maxChars = 200;
    const [value, setValue] = useState("");

    // แท็ก
    const [tags, setTags] = useState<string[]>([]);
    const [inputTag, setInputTag] = useState("");

    // upload preview
    const [verticalImage, setVerticalImage] = useState<string | null>(null);
    const [horizontalImage, setHorizontalImage] = useState<string | null>(null);

    // สิทธิ์การเข้าถึงนิยาย
    const [isChecked1, setIsChecked1] = useState(false);
    const [isChecked2, setIsChecked2] = useState(true);
    const [selectedOption, setSelectedOption] = useState("comfortable");

    // จัดการ image
    const handleVerticalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setVerticalImage(imageUrl);
        }
    };

    const handleHorizontalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setHorizontalImage(imageUrl);
        }
    };

    // จัดการ สิทธิ์การเข้าถึง
    const handleCheck1 = (checked: boolean) => {
        if (!checked && !isChecked2) return;
        setIsChecked1(checked);
        if (checked) setIsChecked2(false);
    };

    const handleCheck2 = (checked: boolean) => {
        if (!checked && !isChecked1) return;
        setIsChecked2(checked);
        if (checked) setIsChecked1(false);
    };

    const suggestedTags = [
        "แข่งขัน", "ไซไฟ", "พระเอกฉลาด", "ทหารอวกาศ", "KamenRider",
        "ความสัมพันธ์ซับซ้อน", "สัตว์เลี้ยง", "วิทยาศาสตร์", "แฟนตาซี", "blue lock",
        "Hogwarts", "omegaverse", "จีน", "นักศึกษา", "กีฬา"
    ];

    const addTag = (tag: string) => {
        if (tag && !tags.includes(tag) && tags.length < 15) {
            setTags([...tags, tag]);
            setInputTag("");
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            addTag(inputTag.trim());
        }
    };
    return (
        <div className="flex">
            <Dialog>
                <DialogTrigger className="flex justify-center item-center bg-green-500 p-2 my-2 hover:bg-green-500/80 rounded">
                    <BookPlus /> เขียน
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-ceter"><Settings size={18} className="mr-1" />ตั้งค่านิยาย</DialogTitle>

                        <ScrollArea className="h-[40rem] ">

                            <h4 className='font-bold'>ข้อมูลหลัก</h4>
                            <div className="grid w-full max-w-sm items-center gap-3 py-3">
                                <Label htmlFor="nameStory">ชื่อเรื่อง</Label>
                                <Input type="text" id="nameStory" placeholder="พิมพ์ชื่อเรื่อง" />
                            </div>

                            <div className="grid w-full max-w-sm items-center gap-3 py-3">
                                <Label htmlFor="penName">นามปากกา</Label>
                                <Input type="text" id="penName" placeholder="พิมพ์นามปากกา" />
                            </div>

                            <div className="grid w-full max-w-sm items-center gap-3 py-3">
                                <Label htmlFor="typeNovel">หมวดหมู่</Label>
                                <Select>
                                    <SelectTrigger className="w-auto">
                                        <SelectValue placeholder="หมวดหมู่" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup className="text-pink-400 rounded ">
                                            <SelectLabel className="text-pink-500 bg-pink-300 text-xl font-bold rounded">นิยายรัก</SelectLabel>
                                            <SelectItem className="hover:bg-pink-300 hover:font-bold text-pink-500" value="นิยายรัก รักหวานแหวว">รักหวานแหวว</SelectItem>
                                            <SelectItem className="hover:bg-pink-300 hover:font-bold text-pink-500" value="นิยายรัก ซึ้งกินใจ">ซึ้งกินใจ</SelectItem>
                                            <SelectItem className="hover:bg-pink-300 hover:font-bold text-pink-500" value="นิยายรัก รักดราม่า">รักดราม่า</SelectItem>
                                            <SelectItem className="hover:bg-pink-300 hover:font-bold text-pink-500" value="นิยายรัก รักคอมเมดี้st">รักคอมเมดี้</SelectItem>
                                            <SelectItem className="hover:bg-pink-300 hover:font-bold text-pink-500" value="นิยายรัก รักแฟนตาซี">รักแฟนตาซี</SelectItem>
                                            <SelectItem className="hover:bg-pink-300 hover:font-bold text-pink-500" value="นิยายรัก วาย">วาย</SelectItem>
                                            <SelectItem className="hover:bg-pink-300 hover:font-bold text-pink-500" value="นิยายรัก ยูริ">ยูริ</SelectItem>
                                            <SelectItem className="hover:bg-pink-300 hover:font-bold text-pink-500" value="นิยายรัก รักสีเทา">รักสีเทา</SelectItem>
                                            <SelectItem className="hover:bg-pink-300 hover:font-bold text-pink-500" value="นิยายรัก รักอื่นๆ">รักอื่นๆ</SelectItem>
                                        </SelectGroup>

                                        <SelectGroup className="text-red-400 rounded">
                                            <SelectLabel className="text-red-500 bg-red-300 text-xl font-bold rounded">นิยายตื่นเต้น</SelectLabel>
                                            <SelectItem className="hover:bg-red-300 hover:font-bold text-red-500" value="นิยายตื่นเต้น แฟนตาซี">แฟนตาซี</SelectItem>
                                            <SelectItem className="hover:bg-red-300 hover:font-bold text-red-500" value="นิยายตื่นเต้น เกมออนไลน์">เกมออนไลน์</SelectItem>
                                            <SelectItem className="hover:bg-red-300 hover:font-bold text-red-500" value="นิยายตื่นเต้น วิทยาศาสตร์">วิทยาศาสตร์</SelectItem>
                                            <SelectItem className="hover:bg-red-300 hover:font-bold text-red-500" value="นิยายตื่นเต้น ระทึกขวัญ">ระทึกขวัญ</SelectItem>
                                            <SelectItem className="hover:bg-red-300 hover:font-bold text-red-500" value="นิยายตื่นเต้น สืบสวน">สืบสวน</SelectItem>
                                            <SelectItem className="hover:bg-red-300 hover:font-bold text-red-500" value="นิยายตื่นเต้น กำลังภายใน">กำลังภายใน</SelectItem>
                                            <SelectItem className="hover:bg-red-300 hover:font-bold text-red-500" value="นิยายตื่นเต้น สงคราม">สงคราม</SelectItem>
                                            <SelectItem className="hover:bg-red-300 hover:font-bold text-red-500" value="นิยายตื่นเต้น ผจญภัย">ผจญภัย</SelectItem>
                                            <SelectItem className="hover:bg-red-300 hover:font-bold text-red-500" value="นิยายตื่นเต้น อดีต ปัจจุบัน อนาคต">อดีต ปัจจุบัน อนาคต</SelectItem>
                                            <SelectItem className="hover:bg-red-300 hover:font-bold text-red-500" value="นิยายตื่นเต้น พีเรียดไทย">พีเรียดไทย</SelectItem>
                                            <SelectItem className="hover:bg-red-300 hover:font-bold text-red-500" value="นิยายตื่นเต้น พีเรียดตะวันตก">พีเรียดตะวันตก</SelectItem>
                                            <SelectItem className="hover:bg-red-300 hover:font-bold text-red-500" value="นิยายตื่นเต้น บู๊_แอ๊คชั่น">บู๊ แอ๊คชั่น</SelectItem>
                                            <SelectItem className="hover:bg-red-300 hover:font-bold text-red-500" value="นิยายตื่นเต้น จีนย้อนยุค">จีนย้อนยุค</SelectItem>
                                        </SelectGroup>

                                        <SelectGroup className="text-blue-400 rounded">
                                            <SelectLabel className="text-blue-500 bg-blue-300 text-xl font-bold rounded">แฟนฟิค</SelectLabel>
                                            <SelectItem className="hover:bg-blue-300 hover:font-bold text-blue-500" value="แฟนฟิค แฟนฟิคเกาหลี">แฟนฟิคเกาหลี</SelectItem>
                                            <SelectItem className="hover:bg-blue-300 hover:font-bold text-blue-500" value="แฟนฟิค แฟนฟิคไทย">แฟนฟิคไทย</SelectItem>
                                            <SelectItem className="hover:bg-blue-300 hover:font-bold text-blue-500" value="แฟนฟิค แฟนฟิคเอเชีย">แฟนฟิคเอเชีย</SelectItem>
                                            <SelectItem className="hover:bg-blue-300 hover:font-bold text-blue-500" value="แฟนฟิค แฟนฟิคฝรั่ง">แฟนฟิคฝรั่ง</SelectItem>
                                            <SelectItem className="hover:bg-blue-300 hover:font-bold text-blue-500" value="แฟนฟิค แฟนฟิคนิยาย">แฟนฟิคนิยาย การ์ตูน เกม</SelectItem>
                                            <SelectItem className="hover:bg-blue-300 hover:font-bold text-blue-500" value="แฟนฟิค แฟนฟิคอื่นๆ">แฟนฟิคอื่นๆ</SelectItem>
                                        </SelectGroup>

                                        <SelectGroup className="text-orange-400 rounded">
                                            <SelectLabel className="text-orange-500 bg-orange-300 text-xl font-bold rounded">นิยายอื่นๆ</SelectLabel>
                                            <SelectItem className="hover:bg-orange-300 hover:font-bold text-orange-500" value="นิยายอื่นๆ นิทาน_วรรณกรรม">นิทาน วรรณกรรม</SelectItem>
                                            <SelectItem className="hover:bg-orange-300 hover:font-bold text-orange-500" value="นิยายอื่นๆ กลอน">กลอน</SelectItem>
                                            <SelectItem className="hover:bg-orange-300 hover:font-bold text-orange-500" value="นิยายอื่นๆ สังคม">สังคม</SelectItem>
                                            <SelectItem className="hover:bg-orange-300 hover:font-bold text-orange-500" value="นิยายอื่นๆ จิตวิทยา">จิตวิทยา</SelectItem>
                                            <SelectItem className="hover:bg-orange-300 hover:font-bold text-orange-500" value="นิยายอื่นๆ ตลก_ขบขัน">ตลก-ขบขัน</SelectItem>
                                            <SelectItem className="hover:bg-orange-300 hover:font-bold text-orange-500" value="นิยายอื่นๆ หักมุม">หักมุม</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid w-full max-w-sm items-center gap-3 py-3">
                                <Label htmlFor="contentLevel">ระดับเนื้อหา</Label>
                                <Select>
                                    <SelectTrigger className="w-auto">
                                        <SelectValue placeholder="เลือกระดับ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Fruits</SelectLabel>
                                            <SelectItem value="PG">ระดับเนื้อหาทั่วไป (PG)</SelectItem>
                                            <SelectItem value="NC">ระดับเนื้อหาอายุ 18 ปีขึ้นไป (NC)</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid w-full max-w-sm items-center gap-1 py-3">
                                <Label htmlFor="Blurb">คำโปรย</Label>
                                <Textarea
                                    id="Blurb"
                                    placeholder="พิมพ์คำโปรย"
                                    maxLength={maxChars}
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                />
                                <p className="text-sm text-muted-foreground">
                                    {value.length} / {maxChars} ตัวอักษร
                                </p>
                            </div>
                            <hr className='py-2' />

                            <h4 className='font-bold'>รูปภาพปก</h4>
                            <div className="grid gap-4 max-w-sm">
                                <Label className="font-medium">อัปโหลดรูปภาพ (900x1200 รูปแนวตั้ง)</Label>
                                <Input type="file" accept="image/*" onChange={handleVerticalImageChange} />

                                <div className='flex justify-center w-full '>
                                    {verticalImage && (
                                        <img
                                            src={verticalImage}
                                            alt="preview"
                                            className="w-60 h-80 rounded shadow-md mb-4"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 max-w-sm">
                                <Label className="font-medium">อัปโหลดรูปภาพ (1200x640 รูปแนวนอน)</Label>
                                <Input type="file" accept="image/*" onChange={handleHorizontalImageChange} />

                                <div className='flex justify-center w-full '>
                                    {horizontalImage && (
                                        <img
                                            src={horizontalImage}
                                            alt="preview"
                                            className="w-80 h-42 rounded shadow-md mb-4"
                                        />
                                    )}
                                </div>
                            </div>
                            <hr className='py-2' />

                            <h4 className='pt-2 font-bold'>ช่วยให้เข้าถึงได้ง่าย</h4>
                            <div className="grid w-full max-w-sm items-center gap-3 py-3">
                                <Label htmlFor="tag">แท็ก (เพิ่มแท็กสูงสุด 15 แท็ก)</Label>
                                <div className="space-y-3">
                                    <div
                                        className={clsx(
                                            "flex flex-wrap items-center gap-2 p-2 border rounded-md min-h-[3rem]",
                                            "focus-within:ring-2 focus-within:ring-ring focus-within:border-ring"
                                        )}
                                    >
                                        {tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="flex items-center gap-1 px-2 py-1 text-sm bg-muted hover:bg-red-500 hover:text-white cursor-pointer transition rounded-full "
                                                onClick={() => removeTag(tag)}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        <Input
                                            value={inputTag}
                                            onChange={(e) => setInputTag(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className="flex-grow border-none outline-none bg-transparent min-w-[100px]"
                                            placeholder="พิมพ์แท็กแล้วกด Space หรือ Enter"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedTags.map((tag) => {
                                        const isSelected = tags.includes(tag);
                                        return (
                                            <Badge
                                                key={tag}
                                                onClick={() => isSelected ? null : addTag(tag)}
                                                className={clsx(
                                                    "cursor-pointer transition",
                                                    isSelected
                                                        ? "bg-green-400 font-bold"
                                                        : "hover:bg-primary/20"
                                                )}
                                            >
                                                {tag} {isSelected && <Check />}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                            <hr className='py-2' />
                            <div>
                                <h4 className='pt-2 font-bold'>สิทธิ์การเข้าถึงนิยาย</h4>
                                <div className="grid w-full max-w-sm items-center gap-3 py-3">

                                    <Label
                                        htmlFor="check1"
                                        className={`hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 ${isChecked1
                                            ? "border-green-500 bg-green-50 dark:border-green-900 dark:bg-green-950"
                                            : ""
                                            }`}
                                    >
                                        <Checkbox
                                            id="check1"
                                            checked={isChecked1}
                                            onCheckedChange={handleCheck1}
                                            className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-500 data-[state=checked]:text-white dark:data-[state=checked]:border-green-700 dark:data-[state=checked]:bg-green-700"
                                        />
                                        <div className="grid gap-1.5 font-normal">
                                            <p className="text-sm leading-none font-medium">ซ่อนรายการความคิดเห็นนิยาย</p>
                                            <p className="text-muted-foreground text-sm">
                                                ซ่อนรายการความคิดเห็นนิยาย คือการปิดการแสดงผลคอมเมนต์ทั้งหมดของผู้อื่น ผู้อ่านไม่สามารถเห็นคอมเมนต์ผู้อื่นได้
                                            </p>
                                        </div>
                                    </Label>

                                    <Label
                                        htmlFor="check2"
                                        className={`hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 ${isChecked2
                                            ? "border-green-500 bg-green-50 dark:border-green-900 dark:bg-green-950"
                                            : ""
                                            }`}
                                    >
                                        <Checkbox
                                            id="check2"
                                            checked={isChecked2}
                                            onCheckedChange={handleCheck2}
                                            className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-500 data-[state=checked]:text-white dark:data-[state=checked]:border-green-700 dark:data-[state=checked]:bg-green-700"
                                        />
                                        <div className="grid gap-1.5 font-normal flex-1">
                                            <p className="text-sm leading-none font-medium">เปิดให้ผู้อ่านแสดงความคิดเห็น</p>
                                            <p className="text-muted-foreground text-sm">
                                                เปิดให้ผู้อ่านแสดงความคิดเห็นคือการอนุญาตให้ผู้อ่านส่งข้อความตอบกลับ
                                                หรือติชมในนิยายได้
                                            </p>

                                            {isChecked2 && (
                                                <div className="mt-4">
                                                    <RadioGroup
                                                        defaultValue={selectedOption}
                                                        onValueChange={(value) => setSelectedOption(value)}
                                                        className="mt-2"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <RadioGroupItem value="default" id="r1" />
                                                            <Label htmlFor="r1">ทุกคน</Label>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <RadioGroupItem value="comfortable" id="r2" />
                                                            <Label htmlFor="r2">เฉพาะคนที่ติดตามนิยายเรื่องนี้</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            )}
                                        </div>
                                    </Label>
                                </div>
                            </div>

                        </ScrollArea>
                        <div className='flex justify-center w-full pt-2'>
                            <Button className='mx-2 bg-green-500 text-white hover:bg-green-500/80'>สร้าง</Button>

                            <DialogClose asChild>
                                <Button className='mx-2 bg-red-500 text-white hover:bg-red-500/80'>ยกเลิก</Button>
                            </DialogClose>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}