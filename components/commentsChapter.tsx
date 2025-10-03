"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { MessageCircleMore, Send, Edit2, Trash2, MoreHorizontal } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    updated_at?: string;
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
    updated_at?: string;
    replies: Reply[];
    repliesCount: number;
    likes: number;
    isLiked: boolean;
}

interface CommentSettings {
    allowComments: boolean;
    hideComments: boolean;
    commentPermission: string;
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
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [commentSettings, setCommentSettings] = useState<CommentSettings>({
        allowComments: true,
        hideComments: false,
        commentPermission: 'comfortable'
    });
    const { data: session } = useSession();

    // ฟังก์ชันสำหรับดึงข้อมูล comments
    const fetchComments = useCallback(async () => {
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
                    // อัปเดตการตั้งค่าคอมเมนต์
                    if (data.data.commentSettings) {
                        setCommentSettings(data.data.commentSettings);
                    }
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
    }, [storyId, chapterOrder]);

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

    // ฟังก์ชันสำหรับเริ่มแก้ไข comment
    const handleEditClick = (commentId: string, currentContent: string) => {
        setEditingComment(commentId);
        setEditContent(currentContent);
    };

    // ฟังก์ชันสำหรับยกเลิกการแก้ไข
    const handleCancelEdit = () => {
        setEditingComment(null);
        setEditContent("");
    };

    // ฟังก์ชันสำหรับบันทึกการแก้ไข
    const handleSaveEdit = async (commentId: string) => {
        if (!editContent.trim()) {
            toast.error('กรุณาใส่เนื้อหาความคิดเห็น');
            return;
        }

        const loadingToast = toast.loading('กำลังบันทึกการแก้ไข...');

        try {
            const response = await fetch(`/api/reader/stories/${storyId}/chapters/${chapterOrder}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: editContent.trim(),
                    userId: session?.user?.email,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setComments(prev => prev.map(comment => {
                        if (comment.id === commentId) {
                            return {
                                ...comment,
                                content: data.data.content,
                                updated_at: data.data.updated_at,
                                timestamp: data.data.timestamp
                            };
                        }
                        // อัพเดท replies ด้วย
                        return {
                            ...comment,
                            replies: comment.replies.map(reply =>
                                reply.id === commentId
                                    ? {
                                        ...reply,
                                        content: data.data.content,
                                        updated_at: data.data.updated_at,
                                        timestamp: data.data.timestamp
                                    }
                                    : reply
                            )
                        };
                    }));
                    setEditingComment(null);
                    setEditContent("");
                    toast.dismiss(loadingToast);
                    toast.success('แก้ไขความคิดเห็นเรียบร้อยแล้ว');
                } else {
                    toast.dismiss(loadingToast);
                    toast.error('เกิดข้อผิดพลาดในการแก้ไข: ' + (data.error || 'ไม่ทราบสาเหตุ'));
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.dismiss(loadingToast);
                toast.error('เกิดข้อผิดพลาดในการแก้ไข: ' + (errorData.error || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์'));
            }
        } catch (error) {
            console.error('Error editing comment:', error);
            toast.dismiss(loadingToast);
            toast.error('เกิดข้อผิดพลาดในการแก้ไข: ' + (error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ'));
        }
    };

    // ฟังก์ชันสำหรับลบ comment
    const handleDeleteComment = async (commentId: string) => {
        const loadingToast = toast.loading('กำลังลบความคิดเห็น...');

        try {
            const response = await fetch(`/api/reader/stories/${storyId}/chapters/${chapterOrder}/comments/${commentId}?userId=${encodeURIComponent(session?.user?.email || '')}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setComments(prev => prev.filter(comment => comment.id !== commentId).map(comment => ({
                        ...comment,
                        replies: comment.replies.filter(reply => reply.id !== commentId)
                    })));
                    setTotalComments(prev => prev - 1);
                    toast.dismiss(loadingToast);
                    toast.success('ลบความคิดเห็นเรียบร้อยแล้ว');
                } else {
                    toast.dismiss(loadingToast);
                    toast.error('เกิดข้อผิดพลาดในการลบ: ' + (data.error || 'ไม่ทราบสาเหตุ'));
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.dismiss(loadingToast);
                toast.error('เกิดข้อผิดพลาดในการลบ: ' + (errorData.error || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์'));
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.dismiss(loadingToast);
            toast.error('เกิดข้อผิดพลาดในการลบ: ' + (error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ'));
        }
    };

    // ฟังก์ชันตรวจสอบว่าเป็นเจ้าของ comment หรือไม่
    const isCommentOwner = (commentUserId: string) => {
        return session?.user?.email && commentUserId === session.user.email;
    };

    function getUserImage(image?: string | null): string {
        if (!image || image.trim() === "") return "/profile_user/ARN_profile.png"
        if (image.startsWith("http")) return image
        if (image.startsWith("/uploads")) return `/api${image}`
        return `/api/uploads/${image.replace(/^\/+/, "")}`
    }

    // ดึงข้อมูล comments เมื่อ drawer เปิด
    useEffect(() => {
        if (isOpen) {
            fetchComments();
        }
    }, [isOpen, storyId, chapterOrder, fetchComments]);

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger className={customTrigger ? "" : "fixed right-2 top-32 w-10 h-10 hidden sm:flex items-center justify-center p-2 rounded-md bg-backgroundCustom transition-colors hover:bg-gray-200 hover:text-black shadow-sm"}>
                {customTrigger || <MessageCircleMore size={18} />}
            </DrawerTrigger>
            <DrawerContent className="md:w-2xl md:mx-auto">
                <div className="mx-auto w-full">
                    <DrawerHeader>
                        <DrawerTitle className="text-base font-semibold">
                            {commentSettings.hideComments ? "ความคิดเห็น" : loading ? "กำลังโหลด..." : `${totalComments} ความคิดเห็น`}
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className="px-5 mt-3 h-[30rem]">
                        {commentSettings.hideComments ? (
                            <div className="flex flex-col justify-center items-center h-40">
                                <div className="text-gray-500 text-center">
                                    <div className="mb-2">🔒</div>
                                    <div>ผู้เขียนได้ปิดการแสดงความคิดเห็นสำหรับเรื่องนี้</div>
                                </div>
                            </div>
                        ) : (
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
                                            <div key={comment.id} className="bg-backgroundCustom rounded-lg p-4 hover:bg-backgroundCustom/80 mb-4 shadow-sm border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full ${comment.user.color} flex items-center justify-center`}>
                                                            {comment.user.image ? (
                                                                <Image
                                                                    src={getUserImage(comment.user.image)}
                                                                    alt={comment.user.name}
                                                                    width={32}
                                                                    height={32}
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-xs">{comment.user.avatar}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm">{comment.user.name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {comment.timestamp}
                                                                {comment.updated_at && comment.updated_at !== comment.created_at && (
                                                                    <span className="ml-1 text-gray-400">(แก้ไขแล้ว)</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Edit/Delete Menu */}
                                                    {isCommentOwner(comment.user.id) && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600">
                                                                    <MoreHorizontal size={16} />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleEditClick(comment.id, comment.content)}>
                                                                    <Edit2 className="mr-2 h-4 w-4" />
                                                                    แก้ไข
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    className="text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    ลบ
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>

                                                {/* Comment Content - Edit Mode or Display Mode */}
                                                {editingComment === comment.id ? (
                                                    <div className="mb-3">
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                                                            rows={3}
                                                            placeholder="แก้ไขความคิดเห็น..."
                                                        />
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                onClick={() => handleSaveEdit(comment.id)}
                                                                disabled={!editContent.trim()}
                                                                className="px-3 py-1 bg-green-500 text-white rounded text-xs disabled:opacity-50 hover:bg-green-600"
                                                            >
                                                                บันทึก
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                            >
                                                                ยกเลิก
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className=" text-sm mb-3 leading-relaxed">
                                                        {comment.content}
                                                    </p>
                                                )}
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
                                                    <div className="mt-3 p-3 bg-backgroundCustom rounded-lg">
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
                                                                className="flex-1 px-3 py-2 bg-backgroundCustom border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                                            />
                                                            <button
                                                                onClick={() => handleSubmitComment(comment.id)}
                                                                disabled={isSubmitting || !replyContent.trim()}
                                                                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                                                            >
                                                                ส่ง
                                                            </button>
                                                            <button
                                                                onClick={handleCancelReply}
                                                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
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
                                                            <div key={reply.id} className="bg-background rounded-lg p-3 border">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-6 h-6 rounded-full ${reply.user.color} flex items-center justify-center`}>
                                                                            {reply.user.image ? (
                                                                                <Image
                                                                                    src={getUserImage(reply.user.image)}
                                                                                    alt={reply.user.name}
                                                                                    width={24}
                                                                                    height={24}
                                                                                    className="w-6 h-6 rounded-full object-cover"
                                                                                />
                                                                            ) : (
                                                                                <span className="text-xs">{reply.user.avatar}</span>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium text-sm">{reply.user.name}</div>
                                                                            <div className="text-xs text-gray-500">
                                                                                {reply.timestamp}
                                                                                {reply.updated_at && reply.updated_at !== reply.created_at && (
                                                                                    <span className="ml-1 text-gray-400">(แก้ไขแล้ว)</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* Edit/Delete Menu for Replies */}
                                                                    {isCommentOwner(reply.user.id) && (
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <button className="p-1 rounded-full hover:bg-gray-200 hover:text-gray-600">
                                                                                    <MoreHorizontal size={14} />
                                                                                </button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end">
                                                                                <DropdownMenuItem onClick={() => handleEditClick(reply.id, reply.content)}>
                                                                                    <Edit2 className="mr-2 h-3 w-3" />
                                                                                    แก้ไข
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem
                                                                                    onClick={() => handleDeleteComment(reply.id)}
                                                                                    className="text-red-600 focus:text-red-600"
                                                                                >
                                                                                    <Trash2 className="mr-2 h-3 w-3" />
                                                                                    ลบ
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    )}
                                                                </div>

                                                                {/* Reply Content - Edit Mode or Display Mode */}
                                                                {editingComment === reply.id ? (
                                                                    <div className="mb-2">
                                                                        <textarea
                                                                            value={editContent}
                                                                            onChange={(e) => setEditContent(e.target.value)}
                                                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
                                                                            rows={2}
                                                                            placeholder="แก้ไขการตอบกลับ..."
                                                                        />
                                                                        <div className="flex gap-2 mt-2">
                                                                            <button
                                                                                onClick={() => handleSaveEdit(reply.id)}
                                                                                disabled={!editContent.trim()}
                                                                                className="px-2 py-1 bg-green-500 text-white rounded text-xs disabled:opacity-50 hover:bg-green-600"
                                                                            >
                                                                                บันทึก
                                                                            </button>
                                                                            <button
                                                                                onClick={handleCancelEdit}
                                                                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                                            >
                                                                                ยกเลิก
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm mb-2 leading-relaxed">
                                                                        {reply.content}
                                                                    </p>
                                                                )}
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
                        )}
                    </div>

                    <DrawerFooter className="">
                        {!commentSettings.hideComments && (
                            <div className="fixed bottom-0 left-0 right-0 bg-backgroundCustom p-4 z-50">
                                {session?.user ? (
                                    commentSettings.allowComments ? (
                                        <div className="flex gap-2 w-full max-w-2xl mx-auto">
                                            <input
                                                type="text"
                                                placeholder={
                                                    commentSettings.commentPermission === 'followers'
                                                        ? "เฉพาะผู้ติดตามเรื่องนี้เท่านั้นที่แสดงความคิดเห็นได้..."
                                                        : "แสดงความคิดเห็น..."
                                                }
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSubmitComment();
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                                className="flex-1 w-full min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
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
                                        <div className="text-center text-gray-500 py-3 max-w-2xl mx-auto">
                                            <p className="text-sm">ผู้เขียนได้ปิดการแสดงความคิดเห็นสำหรับเรื่องนี้</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center text-gray-500 py-3 max-w-2xl mx-auto">
                                        <p className="text-sm">กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </DrawerFooter>

                </div>

            </DrawerContent>
        </Drawer>
    )
}