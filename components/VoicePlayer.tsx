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
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [voiceData]);

    // Play/pause toggle
    const togglePlayback = async () => {
        if (!audioRef.current || !voiceData) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            try {
                await audioRef.current.play();
            } catch (error) {
                console.error('Error playing audio:', error);
                toast.error("เกิดข้อผิดพลาดในการเล่นเสียง");
            }
        }
        setIsPlaying(!isPlaying);
    };

    // Handle progress click
    const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !progressRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * duration;

        audioRef.current.currentTime = newTime;
    };

    // Volume control
    const handleVolumeChange = (newVolume: number[]) => {
        const vol = newVolume[0];
        setVolume(vol);
        if (audioRef.current) {
            audioRef.current.volume = vol;
        }
        setIsMuted(vol === 0);
    };

    // Mute toggle
    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.volume = volume;
                setIsMuted(false);
            } else {
                audioRef.current.volume = 0;
                setIsMuted(true);
            }
        }
    };

    // Format time
    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <Card className="w-full">
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
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    เสียงพากย์: {chapterTitle}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Audio element */}
                <audio
                    ref={audioRef}
                    src={voiceData.file_path}
                    preload="metadata"
                />

                {/* Control buttons */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={togglePlayback}
                        className="flex-shrink-0"
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
                                className="h-full bg-blue-500 rounded-full transition-all"
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
