"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { MessageCircleMore, Send } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

interface Reply {
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
    likes: number;
    isLiked: boolean;
}

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
    replies: Reply[];
    repliesCount: number;
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
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({});
    const { data: session } = useSession();

    // ฟังก์ชันสำหรับดึงข้อมูล comments
    const fetchComments = async () => {
        console.log('fetchComments called with:', { storyId, chapterOrder });
        
        if (!storyId || !chapterOrder) {
            console.log('Missing storyId or chapterOrder:', { storyId, chapterOrder });
            // ถ้าไม่มี storyId หรือ chapterOrder ให้แสดงข้อมูลว่าง
            setComments([]);
            setTotalComments(0);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/reader/stories/${storyId}/chapters/${chapterOrder}/comments`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setComments(data.data.comments || []);
                    setTotalComments(data.data.totalComments || 0);
                } else {
                    console.log('Failed to fetch comments:', data.error);
                    setComments([]);
                    setTotalComments(0);
                }
            } else {
                console.log('Failed to fetch comments');
                // แสดงข้อมูลว่าง แทนการใช้ mock data
                setComments([]);
                setTotalComments(0);
            }
        } catch (error) {
            console.log('Error fetching comments:', error);
            // แสดงข้อมูลว่าง แทนการใช้ mock data
            setComments([]);
            setTotalComments(0);
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันสำหรับส่ง comment ใหม่
    const handleSubmitComment = async (parentId?: string) => {
        console.log('handleSubmitComment called with:', { storyId, chapterOrder, parentId });
        
        const content = parentId ? replyContent : newComment;
        if (!content.trim() || isSubmitting) return;
        if (!storyId || !chapterOrder) {
            console.log('Missing storyId or chapterOrder in submit:', { storyId, chapterOrder });
            toast.error('ไม่สามารถส่งความคิดเห็นได้ในขณะนี้');
            return;
        }

        if (!session?.user?.email) {
            toast.warning('กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น');
            return;
        }

        // แสดง loading toast
        let loadingToast: string | number | undefined;
        
        try {
            setIsSubmitting(true);
            loadingToast = toast.loading('กำลังส่งความคิดเห็น...');
            
            const response = await fetch(`/api/reader/stories/${storyId}/chapters/${chapterOrder}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: content.trim(),
                    userId: session.user.email,
                    parentId: parentId || null,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    if (parentId) {
                        // เป็น reply - อัพเดท comment ที่มี reply ใหม่
                        setComments(prev => prev.map(comment => {
                            if (comment.id === parentId) {
                                return {
                                    ...comment,
                                    replies: [data.data, ...comment.replies],
                                    repliesCount: comment.repliesCount + 1
                                };
                            }
                            return comment;
                        }));
                        setReplyContent('');
                        setReplyingTo(null);
                    } else {
                        // เป็น main comment
                        setComments(prev => [data.data, ...prev]);
                        setTotalComments(prev => prev + 1);
                        setNewComment('');
                    }
                    // ปิด loading toast และแสดง success
                    toast.dismiss(loadingToast);
                    toast.success('ส่งความคิดเห็นเรียบร้อยแล้ว');
                } else {
                    // ปิด loading toast และแสดง error
                    toast.dismiss(loadingToast);
                    toast.error('เกิดข้อผิดพลาดในการส่งความคิดเห็น: ' + (data.error || 'ไม่ทราบสาเหตุ'));
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.dismiss(loadingToast);
                toast.error('เกิดข้อผิดพลาดในการส่งความคิดเห็น: ' + (errorData.error || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์'));
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            // ปิด loading toast ในกรณี error
            if (loadingToast) {
                toast.dismiss(loadingToast);
            }
            toast.error('เกิดข้อผิดพลาดในการส่งความคิดเห็น: ' + (error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // ฟังก์ชันสำหรับเริ่มการตอบกลับ
    const handleReplyClick = (commentId: string) => {
        setReplyingTo(commentId);
        setReplyContent('');
    };

    // ฟังก์ชันสำหรับยกเลิกการตอบกลับ
    const handleCancelReply = () => {
        setReplyingTo(null);
        setReplyContent('');
    };

    // ฟังก์ชันสำหรับ toggle การแสดง replies
    const toggleReplies = (commentId: string) => {
        setShowReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };

    // ฟังก์ชันสำหรับ like/unlike comment
    const handleLikeClick = async (commentId: string) => {
        if (!session?.user?.email) {
            toast.warning('กรุณาเข้าสู่ระบบก่อนกดไลค์');
            return;
        }

        try {
            const response = await fetch(`/api/reader/stories/${storyId}/chapters/${chapterOrder}/comments/${commentId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.email,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setComments(prev => prev.map(comment => {
                        if (comment.id === commentId) {
                            return {
                                ...comment,
                                isLiked: data.data.isLiked,
                                likes: data.data.likesCount
                            };
                        }
                        // อัพเดท replies ด้วย
                        return {
                            ...comment,
                            replies: comment.replies.map(reply => 
                                reply.id === commentId 
                                    ? { ...reply, isLiked: data.data.isLiked, likes: data.data.likesCount }
                                    : reply
                            )
                        };
                    }));
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
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
            <DrawerTrigger className={customTrigger ? "" : "fixed right-2 top-32 w-10 h-10 hidden sm:flex items-center justify-center p-2 rounded-md bg-backgroundCustom transition-colors hover:bg-gray-200 hover:text-black shadow-sm"}>
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
                                                <button 
                                                    className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
                                                    onClick={() => handleReplyClick(comment.id)}
                                                >
                                                    <span>↩</span>
                                                    <span>ตอบกลับ ({comment.repliesCount})</span>
                                                </button>
                                                <button 
                                                    className={`flex items-center gap-1 hover:text-red-500 ${comment.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                                                    onClick={() => handleLikeClick(comment.id)}
                                                >
                                                    <span>♥</span>
                                                    <span>{comment.likes}</span>
                                                </button>
                                                {comment.repliesCount > 0 && (
                                                    <button 
                                                        className="text-blue-500 hover:text-blue-700 text-xs"
                                                        onClick={() => toggleReplies(comment.id)}
                                                    >
                                                        {showReplies[comment.id] ? 'ซ่อนการตอบกลับ' : `ดูการตอบกลับ (${comment.repliesCount})`}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Reply Form */}
                                            {replyingTo === comment.id && (
                                                <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                                                    <div className="flex gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            placeholder={`ตอบกลับ ${comment.user.name}...`}
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleSubmitComment(comment.id);
                                                                }
                                                            }}
                                                            disabled={isSubmitting}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                        />
                                                        <button
                                                            onClick={() => handleSubmitComment(comment.id)}
                                                            disabled={isSubmitting || !replyContent.trim()}
                                                            className="px-3 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 text-sm"
                                                        >
                                                            ส่ง
                                                        </button>
                                                        <button
                                                            onClick={handleCancelReply}
                                                            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                                                        >
                                                            ยกเลิก
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Replies Section */}
                                            {showReplies[comment.id] && comment.replies.length > 0 && (
                                                <div className="mt-3 ml-6 space-y-3">
                                                    {comment.replies.map((reply) => (
                                                        <div key={reply.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className={`w-6 h-6 rounded-full ${reply.user.color} flex items-center justify-center`}>
                                                                    {reply.user.image ? (
                                                                        <img
                                                                            src={reply.user.image}
                                                                            alt={reply.user.name}
                                                                            className="w-6 h-6 rounded-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-white text-xs">{reply.user.avatar}</span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-gray-800 text-sm">{reply.user.name}</div>
                                                                    <div className="text-xs text-gray-500">{reply.timestamp}</div>
                                                                </div>
                                                            </div>
                                                            <p className="text-gray-700 text-sm mb-2 leading-relaxed">
                                                                {reply.content}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-sm">
                                                                <button 
                                                                    className={`flex items-center gap-1 hover:text-red-500 ${reply.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                                                                    onClick={() => handleLikeClick(reply.id)}
                                                                >
                                                                    <span>♥</span>
                                                                    <span>{reply.likes}</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    <DrawerFooter className="">
                        <div className="p-4 bg-background sticky bottom-0 shadow-xl">
                            {session?.user ? (
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
                                        onClick={() => handleSubmitComment()}
                                        disabled={isSubmitting || !newComment.trim()}
                                        className="p-2 bg-backgroundCustom rounded-md disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:bg-gray-200"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-3">
                                    <p className="text-sm">กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น</p>
                                </div>
                            )}
                        </div>
                    </DrawerFooter>

                </div>

            </DrawerContent>
        </Drawer>
    )
}