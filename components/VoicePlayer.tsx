"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

interface VoicePlayerProps {
    storyId: string;
    chapterId: string;
    chapterTitle: string;
    chapterOrder: number;
}

interface VoiceData {
    voice_id: string;
    file_name: string;
    file_path: string;
    duration?: number;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export function VoicePlayer({ storyId, chapterId, chapterTitle }: VoicePlayerProps) {
    const [voiceData, setVoiceData] = useState<VoiceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [previousVolume, setPreviousVolume] = useState(1);

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    // Load voice data
    useEffect(() => {
        const fetchVoiceData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/voice/upload?storyId=${storyId}&chapterId=${chapterId}`);

                if (response.ok) {
                    const result = await response.json();
                    if (result.data) {
                        setVoiceData(result.data);
                    } else {
                        setVoiceData(null); // ไม่มีเสียงพากย์
                    }
                }
            } catch (error) {
                console.error('Error fetching voice data:', error);
                setVoiceData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVoiceData();
    }, [storyId, chapterId]);

    // Handle audio events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => {
            if (audio.duration && !isNaN(audio.duration)) {
                setDuration(audio.duration);
            }
        };
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleError = (e: Event) => {
            console.error('Audio error:', e);
            toast.error("ไม่สามารถโหลดไฟล์เสียงได้");
            setIsPlaying(false);
        };

        // Set initial volume
        audio.volume = volume;

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('durationchange', updateDuration);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('durationchange', updateDuration);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('error', handleError);
        };
    }, [voiceData, volume]);

    // Play/pause toggle
    const togglePlayback = async () => {
        if (!audioRef.current || !voiceData) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            try {
                await audioRef.current.play();
            } catch (error) {
                console.error("Error playing audio:", error);
                toast.error("เกิดข้อผิดพลาดในการเล่นเสียง");
            }
        }
    };

    const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        const progress = progressRef.current;

        if (!audio || !progress || isNaN(audio.duration) || audio.duration === 0) return;

        const rect = progress.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;

        const newTime = percentage * audio.duration;

        audio.currentTime = newTime;
        setCurrentTime(newTime); // optional UI sync
    };

    // Volume control
    const handleVolumeChange = (newVolume: number[]) => {
        const vol = newVolume[0];
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
        if (vol === 0) {
            setIsMuted(true);
        } else {
            setIsMuted(false);
            setPreviousVolume(vol);
        }
    };

    // Mute toggle
    const toggleMute = () => {
        if (!audioRef.current) return;

        if (isMuted) {
            // Unmute: restore previous volume
            const restoreVol = previousVolume > 0 ? previousVolume : 0.5;
            audioRef.current.volume = restoreVol;
            setVolume(restoreVol);
            setIsMuted(false);
        } else {
            // Mute: save current volume then set to 0
            setPreviousVolume(volume);
            audioRef.current.volume = 0;
            setVolume(0);
            setIsMuted(true);
        }
    };

    // Format time
    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    function getStoryVoice(src?: string | null): string {
        // แปลง path เสียงให้รองรับหลายกรณี
        if (!src) return ""; // ไม่มีเสียง -> ให้เป็นค่าว่าง (audio จะไม่เล่น)
        let p = src.trim();
        if (!p) return "";
        // อนุญาต external URL
        if (p.startsWith("http://") || p.startsWith("https://")) return p;
        // ถ้าไม่มี / ด้านหน้า เติมให้
        if (!p.startsWith("/")) p = `/${p}`;
        // ไฟล์เสียงจาก API อยู่ใน uploads/voice/ แต่บันทึกเป็น /voice/
        // ต้อง map /voice/xxx.wav -> /api/uploads/voice/xxx.wav
        if (p.startsWith("/voice/")) return `/api/uploads${p}`;
        // ถ้าอยู่ใต้ /uploads => เรียกผ่าน /api
        if (p.startsWith("/uploads")) return `/api${p}`;
        // กรณีอื่นถือว่าเป็นไฟล์ใน uploads
        return `/api/uploads/${p.replace(/^\/+/, "")}`;
    }

    if (isLoading) {
        return (
            <Card className="w-full bg-backgroundCustom border-0">
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">กำลังโหลดเสียงพากย์...</span>
                </CardContent>
            </Card>
        );
    }

    if (!voiceData) {
        return null; // No voice available
    }

    return (
        <Card className="w-full border-0 bg-backgroundCustom shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    เสียงพากย์: {chapterTitle}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Audio element */}
                <audio
                    key={voiceData?.file_path}
                    ref={audioRef}
                    src={getStoryVoice(voiceData.file_path)}
                    preload="metadata"
                />

                {/* Control buttons */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={togglePlayback}
                        className="flex-shrink-0 bg-backgroundCustom"
                    >
                        {isPlaying ? (
                            <Pause className="h-6 w-6" />
                        ) : (
                            <Play className="h-6 w-6" />
                        )}
                    </Button>

                    {/* Progress bar */}
                    <div className="flex-1">
                        <div
                            ref={progressRef}
                            className="h-2 bg-gray-200 rounded-full cursor-pointer"
                            onClick={handleProgressClick}
                        >
                            <div
                                className="h-full bg-orange-500 rounded-full transition-all"
                                style={{
                                    width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%'
                                }}
                            />
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Volume control */}
                    <div className="flex items-center gap-2 w-24">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMute}
                        >
                            {isMuted ? (
                                <VolumeX className="h-4 w-4" />
                            ) : (
                                <Volume2 className="h-4 w-4" />
                            )}
                        </Button>
                        <Slider
                            value={[isMuted ? 0 : volume]}
                            onValueChange={handleVolumeChange}
                            max={1}
                            step={0.1}
                            className="flex-1"
                        />
                    </div>
                </div>

                {/* Voice info */}
                <div className="text-sm text-gray-600">
                    <p>ไฟล์: {voiceData.file_name}</p>
                </div>

            </CardContent>
        </Card>
    );
}
