"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { MessageCircleMore, Send } from "lucide-react"
import { useSession } from "next-auth/react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

interface Comment {
    id: string;
    user: {
        id: string;
        name: string;
        avatar: string;
        image?: string;
        color: string;
    };
    content: string;
    timestamp: string;
    created_at: string;
    replies: number;
    likes: number;
    isLiked: boolean;
}

export function CommentsChapter({ 
    customTrigger, 
    storyId, 
    chapterOrder 
}: { 
    customTrigger?: React.ReactNode;
    storyId?: string;
    chapterOrder?: string;
}) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [totalComments, setTotalComments] = useState(0);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();


    // Mock comments เป็น fallback ถ้าไม่มี storyId หรือ chapterOrder
    const mockComments: Comment[] = [
        {
            id: "mock-1",
            user: { id: "1", name: "นางฟ้าน้อย", avatar: "น", color: "bg-pink-500" },
            content: "ตอนนี้เขียนได้เก่งมากเลย! ตัวละครพัฒนาได้น่าติดตาม ชอบความสัมพันธ์ระหว่างพระเอกกับนางเอกมาก 💕",
            timestamp: "2 นาทีที่แล้ว",
            created_at: new Date().toISOString(),
            replies: 12,
            likes: 5,
            isLiked: false
        },
        {
            id: "mock-2",
            user: { id: "2", name: "รักการอ่าน", avatar: "ร", color: "bg-blue-500" },
            content: "โครงเรื่องน่าสนใจมาก รอติดตามต่อไปเลยค่ะ ✨",
            timestamp: "5 นาทีที่แล้ว",
            created_at: new Date().toISOString(),
            replies: 3,
            likes: 8,
            isLiked: true
        },
        {
            id: "mock-3",
            user: { id: "3", name: "หนุ่มหล่อ", avatar: "ห", color: "bg-green-500" },
            content: "เขียนได้ดีมาก มีอารมณ์ขันแฝงอยู่ด้วย 😄",
            timestamp: "10 นาทีที่แล้ว",
            created_at: new Date().toISOString(),
            replies: 1,
            likes: 2,
            isLiked: false
        },
        {
            id: "mock-4",
            user: { id: "4", name: "สาวใสใส", avatar: "ส", color: "bg-purple-500" },
            content: "ชอบการเขียนบรรยายฉากมากค่ะ รู้สึกเหมือนได้เห็นภาพจริงๆ",
            timestamp: "15 นาทีที่แล้ว",
            created_at: new Date().toISOString(),
            replies: 7,
            likes: 12,
            isLiked: false
        },
        {
            id: "mock-5",
            user: { id: "5", name: "คนรักหนังสือ", avatar: "ค", color: "bg-orange-500" },
            content: "รอตอนต่อไปแล้วค่ะ! ตื่นเต้นมาก 🎉",
            timestamp: "20 นาทีที่แล้ว",
            created_at: new Date().toISOString(),
            replies: 0,
            likes: 4,
            isLiked: true
        }
    ];

    // ฟังก์ชันสำหรับดึงข้อมูล comments
    const fetchComments = async () => {
        if (!storyId || !chapterOrder) {
            // ใช้ mock data ถ้าไม่มี storyId หรือ chapterOrder
            setComments(mockComments);
            setTotalComments(mockComments.length);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/reader/stories/${storyId}/chapters/${chapterOrder}/comments`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setComments(data.data.comments);
                    setTotalComments(data.data.totalComments);
                } else {
                    console.error('Failed to fetch comments:', data.error);
                    // ใช้ mock data เป็น fallback
                    setComments(mockComments);
                    setTotalComments(mockComments.length);
                }
            } else {
                console.error('Failed to fetch comments');
                // ใช้ mock data เป็น fallback
                setComments(mockComments);
                setTotalComments(mockComments.length);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            // ใช้ mock data เป็น fallback
            setComments(mockComments);
            setTotalComments(mockComments.length);
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันสำหรับส่ง comment ใหม่
    const handleSubmitComment = async () => {
        if (!newComment.trim() || isSubmitting) return;
        if (!storyId || !chapterOrder) {
            alert('ไม่สามารถส่งความคิดเห็นได้ในขณะนี้');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/reader/stories/${storyId}/chapters/${chapterOrder}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: newComment.trim(),
                    userId: 'user-demo', // TODO: ใช้ user ID จริงจาก session
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // เพิ่ม comment ใหม่ที่ด้านบน
                    setComments(prev => [data.data, ...prev]);
                    setTotalComments(prev => prev + 1);
                    setNewComment('');
                } else {
                    alert('เกิดข้อผิดพลาดในการส่งความคิดเห็น');
                }
            } else {
                alert('เกิดข้อผิดพลาดในการส่งความคิดเห็น');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('เกิดข้อผิดพลาดในการส่งความคิดเห็น');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ดึงข้อมูล comments เมื่อ drawer เปิด
    useEffect(() => {
        if (isOpen) {
            fetchComments();
        }
    }, [isOpen, storyId, chapterOrder]);

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger className={customTrigger ? "" : "fixed right-2 top-30 p-2 rounded-md bg-backgroundCustom transition-colors hover:bg-gray-200 hover:text-black"}>
                {customTrigger || <MessageCircleMore size={18} />}
            </DrawerTrigger>
            <DrawerContent className="md:w-2xl md:mx-auto">
                <div className="mx-auto w-full">
                    <DrawerHeader>
                        <DrawerTitle className="text-base font-semibold">
                            {loading ? "กำลังโหลด..." : `${totalComments} ความคิดเห็น`}
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className="px-5 mt-3 h-[30rem]">
                        <ScrollArea className="h-165 w-full">
                            <div className="mb-[15rem]">
                                {loading ? (
                                    <div className="flex justify-center items-center h-40">
                                        <div className="text-gray-500">กำลังโหลดความคิดเห็น...</div>
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="flex justify-center items-center h-40">
                                        <div className="text-gray-500">ยังไม่มีความคิดเห็น</div>
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full ${comment.user.color} flex items-center justify-center`}>
                                                        {comment.user.image ? (
                                                            <img
                                                                src={comment.user.image}
                                                                alt={comment.user.name}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-white text-xs">{comment.user.avatar}</span>
                                                        )}
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
                                                    <span>ตอบกลับ ({comment.replies})</span>
                                                </button>
                                                <button className={`flex items-center gap-1 hover:text-red-500 ${comment.isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                                                    <span>♥</span>
                                                    <span>{comment.likes}</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    <DrawerFooter className="">
                        <div className="p-4 bg-background sticky bottom-0 shadow-xl">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="แสดงความคิดเห็น..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmitComment();
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
                                />
                                <button
                                    onClick={handleSubmitComment}
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="p-2 bg-backgroundCustom rounded-md disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:bg-gray-200"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </DrawerFooter>

                </div>

            </DrawerContent>
        </Drawer>
    )
}