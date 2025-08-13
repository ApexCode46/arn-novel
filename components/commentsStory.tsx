"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Edit2, Trash2 } from 'lucide-react';

interface Comment {
    id: string;
    user: {
        id: string; // email for ownership comparisons
        name: string;
        avatar: string;
        image?: string;
        color: string;
    };
    content: string;
    timestamp: string;
    created_at: string;
    updated_at?: string;
}

export function CommentsStory({ storyId }: { storyId: string }) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [totalComments, setTotalComments] = useState(0);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchComments = useCallback(async () => {
        if (!storyId) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/reader/stories/${storyId}/comments?limit=5`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setComments(data.data.comments || []);
                    setTotalComments(data.data.totalComments || 0);
                    setNextCursor(data.data.nextCursor || null);
                }
            }
        } catch (e) {
            console.error('Error fetching story comments', e);
        } finally {
            setLoading(false);
        }
    }, [storyId]);

    const fetchMore = async () => {
        if (!nextCursor || loadingMore) return;
        try {
            setLoadingMore(true);
            const res = await fetch(`/api/reader/stories/${storyId}/comments?limit=5&cursor=${nextCursor}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setComments(prev => [...prev, ...(data.data.comments || [])]);
                    setNextCursor(data.data.nextCursor || null);
                }
            }
        } catch (e) {
            console.error('Error loading more comments', e);
            toast.error('โหลดความคิดเห็นเพิ่มเติมไม่สำเร็จ');
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handleSubmit = async () => {
        if (!newComment.trim() || isSubmitting) return;
        if (!session?.user?.email) { toast.warning('กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น'); return; }
        let loadingToast;
        try {
            setIsSubmitting(true);
            loadingToast = toast.loading('กำลังส่งความคิดเห็น...');
            const res = await fetch(`/api/reader/stories/${storyId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment.trim(), userId: session.user.email })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setComments(prev => [data.data, ...prev]); // new one appears on top
                setTotalComments(prev => prev + 1);
                setNewComment('');
                // If we previously loaded all (no nextCursor) we keep as is; else count increases automatically
                toast.dismiss(loadingToast);
                toast.success('ส่งความคิดเห็นแล้ว');
            } else {
                toast.dismiss(loadingToast);
                toast.error(data.error || 'ส่งความคิดเห็นไม่สำเร็จ');
            }
        } catch (e) {
            toast.error('เกิดข้อผิดพลาดในการส่งความคิดเห็น');
            console.error('Error submitting comment', e);
        } finally { setIsSubmitting(false); }
    };

    const startEdit = (id: string, content: string) => { setEditingComment(id); setEditContent(content); };
    const cancelEdit = () => { setEditingComment(null); setEditContent(''); };
    const saveEdit = async (id: string) => {
        if (!editContent.trim()) { toast.error('กรุณาใส่ข้อความ'); return; }
        const loadingToast = toast.loading('กำลังบันทึก...');
        try {
            const res = await fetch(`/api/reader/stories/${storyId}/comments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent.trim(), userId: session?.user?.email })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setComments(prev => prev.map(c => c.id === id ? { ...c, content: data.data.content, updated_at: data.data.updated_at, timestamp: data.data.timestamp } : c));
                setEditingComment(null); setEditContent('');
                toast.dismiss(loadingToast); toast.success('แก้ไขสำเร็จ');
            } else { toast.dismiss(loadingToast); toast.error(data.error || 'แก้ไขไม่สำเร็จ'); }
        } catch (e) {
            toast.dismiss(loadingToast); toast.error('เกิดข้อผิดพลาดในการแก้ไข');
            console.error('Error saving edit', e);
        }
    };

    const deleteComment = async (id: string) => {
        const loadingToast = toast.loading('กำลังลบ...');
        try {
            const res = await fetch(`/api/reader/stories/${storyId}/comments/${id}?userId=${encodeURIComponent(session?.user?.email || '')}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok && data.success) {
                setComments(prev => prev.filter(c => c.id !== id));
                setTotalComments(prev => Math.max(0, prev - 1));
                toast.dismiss(loadingToast); toast.success('ลบสำเร็จ');
            } else { toast.dismiss(loadingToast); toast.error(data.error || 'ลบไม่สำเร็จ'); }
        } catch (e) {
            toast.dismiss(loadingToast); toast.error('เกิดข้อผิดพลาดในการลบ');
            console.error('Error deleting comment', e);
        }
        finally { setPendingDeleteId(null); }
    };

    const isOwner = (commentUserId: string) => session?.user?.email && commentUserId === session.user.email;

    return (
        <div className="mt-10 w-full bg-backgroundCustom border shadow-xl rounded-lg p-6" id="story-comments">
            <h3 className="text-lg font-semibold mb-4">ความคิดเห็น ({totalComments})</h3>
            {session?.user ? (
                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        placeholder="แสดงความคิดเห็นเกี่ยวกับเรื่องนี้..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                        disabled={isSubmitting}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !newComment.trim()}
                        className="px-4 py-2 bg-backgroundCustom rounded-md disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:bg-gray-200"
                    >ส่ง</button>
                </div>
            ) : (
                <div className="text-center text-gray-500 py-3 mb-6 text-sm">กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น</div>
            )}
            {loading ? (
                <div className="text-center text-gray-500 py-10">กำลังโหลดความคิดเห็น...</div>
            ) : comments.length === 0 ? (
                <div className="text-center text-gray-500 py-10">ยังไม่มีความคิดเห็น</div>
            ) : (
                <div className="space-y-4">
                    {comments.map(comment => (
                        <div key={comment.id} className="bg-background rounded-lg p-4 hover:bg-background/80">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full ${comment.user.color} flex items-center justify-center overflow-hidden`}>
                                        {comment.user.image ? (
                                            <Image src={comment.user.image} alt={comment.user.name} width={32} height={32} className="w-8 h-8 object-cover" />
                                        ) : (
                                            <span className="text-xs text-white font-medium">{comment.user.avatar}</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{comment.user.name}</div>
                                        <div className="text-xs text-gray-500">{comment.timestamp}{comment.updated_at && comment.updated_at !== comment.created_at && <span className="ml-1 text-gray-400">(แก้ไขแล้ว)</span>}</div>
                                    </div>
                                </div>
                                {isOwner(comment.user.id) && (
                                    <div className="flex gap-2 text-gray-400">
                                        <button onClick={() => startEdit(comment.id, comment.content)} className="p-1 rounded hover:bg-gray-200 hover:text-gray-600"><Edit2 size={14} /></button>
                                        {pendingDeleteId === comment.id ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => deleteComment(comment.id)}
                                                    className="px-2 py-1 bg-red-500 text-white rounded text-[10px] hover:bg-red-600"
                                                >ยืนยัน</button>
                                                <button
                                                    onClick={() => { setPendingDeleteId(null); toast.info('ยกเลิกการลบ'); }}
                                                    className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-[10px] hover:bg-gray-400"
                                                >ยกเลิก</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setPendingDeleteId(comment.id)} className="p-1 rounded hover:bg-red-200 hover:text-red-600"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                )}
                            </div>
                            {editingComment === comment.id ? (
                                <div>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                                        rows={3}
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => saveEdit(comment.id)} disabled={!editContent.trim()} className="px-3 py-1 bg-blue-500 text-white rounded text-xs disabled:opacity-50 hover:bg-blue-600">บันทึก</button>
                                        <button onClick={cancelEdit} className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600">ยกเลิก</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm leading-relaxed">{comment.content}</p>
                            )}
                        </div>
                    ))}
                    {nextCursor && (
                        <div className="pt-2">
                            <button
                                onClick={fetchMore}
                                disabled={loadingMore}
                                className="w-full py-2 text-sm bg-backgroundCustom hover:bg-gray-200 rounded-md shadow-sm border disabled:opacity-50"
                            >{loadingMore ? 'กำลังโหลด...' : 'แสดงเพิ่มเติม'}</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
