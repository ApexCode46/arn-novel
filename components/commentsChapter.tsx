"use client"

import * as React from "react"
import { MessageCircleMore, Send } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

export function CommentsChapter() {


    const mockComments = [
        {
            id: 1,
            user: { name: "นางฟ้าน้อย", avatar: "น", color: "bg-pink-500" },
            content: "ตอนนี้เขียนได้เก่งมากเลย! ตัวละครพัฒนาได้น่าติดตาม ชอบความสัมพันธ์ระหว่างพระเอกกับนางเอกมาก 💕",
            timestamp: "2 นาทีที่แล้ว",
            replies: 12,
            likes: 5,
            isLiked: false
        },
        {
            id: 2,
            user: { name: "รักการอ่าน", avatar: "ร", color: "bg-blue-500" },
            content: "โครงเรื่องน่าสนใจมาก รอติดตามต่อไปเลยค่ะ ✨",
            timestamp: "5 นาทีที่แล้ว",
            replies: 3,
            likes: 8,
            isLiked: true
        },
        {
            id: 3,
            user: { name: "หนุ่มหล่อ", avatar: "ห", color: "bg-green-500" },
            content: "เขียนได้ดีมาก มีอารมณ์ขันแฝงอยู่ด้วย 😄",
            timestamp: "10 นาทีที่แล้ว",
            replies: 1,
            likes: 2,
            isLiked: false
        },
        {
            id: 4,
            user: { name: "สาวใสใส", avatar: "ส", color: "bg-purple-500" },
            content: "ชอบการเขียนบรรยายฉากมากค่ะ รู้สึกเหมือนได้เห็นภาพจริงๆ",
            timestamp: "15 นาทีที่แล้ว",
            replies: 7,
            likes: 12,
            isLiked: false
        },
        {
            id: 5,
            user: { name: "คนรักหนังสือ", avatar: "ค", color: "bg-orange-500" },
            content: "รอตอนต่อไปแล้วค่ะ! ตื่นเต้นมาก 🎉",
            timestamp: "20 นาทีที่แล้ว",
            replies: 0,
            likes: 4,
            isLiked: true
        }
    ]

    return (
        <Drawer >
            <DrawerTrigger className="fixed right-2 top-30 p-2 rounded-md bg-backgroundCustom transition-colors hover:bg-gray-200 hover:text-black">
                <MessageCircleMore size={18} />
            </DrawerTrigger>
            <DrawerContent className="md:w-2xl md:mx-auto">
                <div className="mx-auto w-full">
                    <DrawerHeader>
                        <DrawerTitle className="text-base font-semibold">634 ความคิดเห็น</DrawerTitle>
                    </DrawerHeader>
                    <div className="px-5 mt-3 h-[30rem] ">
                        <ScrollArea className="h-165 w-full">
                            <div className="mb-[15rem]">
                                {mockComments.map((comment) => (

                                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${comment.user.color} flex items-center justify-center`}>
                                                    <span className="text-white text-xs">{comment.user.avatar}</span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800 text-sm">{comment.user.name}</div>
                                                    <div className="text-xs text-gray-500">{comment.timestamp}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                                            {comment.content}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500">
                                                <span>↩</span>
                                                <span>ตอบกลับ (12)</span>
                                            </button>
                                        </div>
                                    </div>


                                ))}

                            </div>
                        </ScrollArea>
                    </div>

                    <DrawerFooter className="">
                        <div className="p-4 bg-background sticky bottom-0 shadow-xl">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="แสดงความคิดเห็น..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                                <button
                                    className="p-2 bg-backgroundCustom rounded-md isabled:cursor-not-allowed transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </DrawerFooter>

                </div>

            </DrawerContent>
        </Drawer >
    )
}