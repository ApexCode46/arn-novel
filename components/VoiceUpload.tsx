"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { Upload, Play, Pause, Volume2, X, Loader2, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"


interface VoiceUploadProps {
    storyId: string;
    chapterId: string;
    chapterOrder: number;
    existingVoice?: {
        voice_id: string;
        file_name: string;
        duration?: number;
    };
    onVoiceUploaded?: () => void;
}

export function VoiceUpload({
    storyId,
    chapterId,
    chapterOrder,
    existingVoice,
    onVoiceUploaded
}: VoiceUploadProps) {
    const { data: session } = useSession();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState<number | null>(existingVoice?.duration || null);
    const [showUploadArea, setShowUploadArea] = useState(!existingVoice);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentVoice, setCurrentVoice] = useState<{
        voice_id: string;
        file_name: string;
        duration?: number;
    } | null>(existingVoice || null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Update currentVoice when existingVoice prop changes
    React.useEffect(() => {
        setCurrentVoice(existingVoice || null);
        setShowUploadArea(!existingVoice);
    }, [existingVoice]);

    // Handle file selection
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('audio/')) {
            toast.error("กรุณาเลือกไฟล์เสียงเท่านั้น");
            return;
        }

        // Check file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            toast.error("ไฟล์ใหญ่เกินไป (สูงสุด 50MB)");
            return;
        }

        setSelectedFile(file);

        // Get audio duration
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
            URL.revokeObjectURL(audio.src);
        });
    };

    // Handle file upload
    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("กรุณาเลือกไฟล์เสียงก่อน");
            return;
        }

        if (!session?.user?.email) {
            toast.error("กรุณาเข้าสู่ระบบก่อน");
            return;
        }

        try {
            setIsUploading(true);

            const formData = new FormData();
            formData.append('audio', selectedFile);
            formData.append('storyId', storyId);
            formData.append('chapterId', chapterId);
            formData.append('chapterOrder', chapterOrder.toString());
            formData.append('duration', (duration || 0).toString());

            const response = await fetch('/api/voice/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                toast.success("อัพโหลดเสียงสำเร็จ!");
                setCurrentVoice(result.data); // Update local state with new voice data
                setSelectedFile(null);
                setShowUploadArea(false);
                onVoiceUploaded?.();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                const error = await response.json();
                throw new Error(error.message || "เกิดข้อผิดพลาดในการอัพโหลด");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("เกิดข้อผิดพลาดในการอัพโหลดเสียง");
        } finally {
            setIsUploading(false);
        }
    };

    // Handle voice deletion
    const handleDelete = async () => {
        if (!currentVoice || !session?.user?.email) {
            toast.error("ไม่สามารถลบเสียงได้");
            return;
        }

        try {
            setIsDeleting(true);

            const response = await fetch(`/api/voice/upload?storyId=${storyId}&chapterId=${chapterId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success("ลบเสียงพากย์สำเร็จ!");
                setCurrentVoice(null); // Update local state
                setShowUploadArea(true); // Show upload area
                onVoiceUploaded?.(); // Refresh to update the UI
            } else {
                const error = await response.json();
                throw new Error(error.message || "เกิดข้อผิดพลาดในการลบ");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("เกิดข้อผิดพลาดในการลบเสียง");
        } finally {
            setIsDeleting(false);
        }
    };

    // Format duration
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Play/pause preview
    const togglePlayback = () => {
        if (!selectedFile || !audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            if (!audioRef.current.src) {
                audioRef.current.src = URL.createObjectURL(selectedFile);
            }
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Remove selected file
    const removeFile = () => {
        setSelectedFile(null);
        setDuration(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            setIsPlaying(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    เสียงพากย์ - ตอนที่ {chapterOrder}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Existing voice info */}
                {currentVoice && !showUploadArea && (
                    <div className="p-4 bg-backgroundCustom rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-green-800">มีเสียงพากย์แล้ว</p>
                                <p className="text-sm text-green-600">
                                    {currentVoice.file_name}
                                    {currentVoice.duration && ` (${formatDuration(currentVoice.duration)})`}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowUploadArea(true)}
                                    disabled={isDeleting}
                                >
                                    เปลี่ยนไฟล์
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* File upload area */}
                {showUploadArea && (
                    <div className="space-y-4">
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-600">คลิกเพื่อเลือกไฟล์เสียง</p>
                            <p className="text-sm text-gray-400">รองรับ MP3, WAV, M4A (สูงสุด 50MB)</p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {/* Cancel button when changing file */}
                        {currentVoice && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowUploadArea(false);
                                    setSelectedFile(null);
                                    setDuration(currentVoice.duration || null);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                                className="w-full"
                            >
                                ยกเลิก
                            </Button>
                        )}
                    </div>
                )}

                {/* Selected file preview */}
                {selectedFile && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                                <p className="font-medium text-blue-800">{selectedFile.name}</p>
                                <p className="text-sm text-blue-600">
                                    {formatFileSize(selectedFile.size)}
                                    {duration && ` • ${formatDuration(duration)}`}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={togglePlayback}
                                    disabled={!duration}
                                >
                                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={removeFile}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Audio element for preview */}
                        <audio
                            ref={audioRef}
                            onEnded={() => setIsPlaying(false)}
                            onPause={() => setIsPlaying(false)}
                        />

                        {/* Info text */}
                        <div className="pt-3 border-t border-blue-200">
                            <p className="text-sm text-blue-600">
                                💡 เสียงพากย์เป็นฟีเจอร์ฟรี ผู้อ่านจ่ายแค่ค่าตอนเท่านั้น
                            </p>
                        </div>
                    </div>
                )}

                {/* Upload button */}
                {selectedFile && (
                    <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="w-full"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                กำลังอัพโหลด...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                อัพโหลดเสียงพากย์
                            </>
                        )}
                    </Button>
                )}

            </CardContent>
        </Card>
    );
}
