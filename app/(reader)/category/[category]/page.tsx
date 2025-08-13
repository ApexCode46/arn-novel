"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

interface Story {
    story_id: string;
    category: string;
    verticalImage: string;
    views: number;
    chapterCount: number;
    title: string;
    is_hidden: boolean;
}

interface ExtendedSession extends Session {
    user?: {
        id?: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default function Page({ params }: { params: Promise<{ category: string }> }) {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
    });
    const itemsPerPage = 30;
    
    const router = useRouter();

    useEffect(() => {
        async function unwrapParams() {
            const resolvedParams = await params;
            setCategory(resolvedParams.category);
        }

        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (!category) return;

        async function fetchStories() {
            try {
                setLoading(true);
                const res = await fetch(`/api/category/${category}?page=${currentPage}&limit=${itemsPerPage}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(category === 'following' && session?.user?.id ? { 'X-User-Id': session.user.id } : {}),
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setStories(data.stories);
                    setPagination({
                        totalPages: data.pagination.totalPages,
                        hasNext: data.pagination.hasNext,
                        hasPrev: data.pagination.hasPrev,
                    });
                }
            } catch (error) {
                console.log('Error fetching stories:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStories();
    }, [category, currentPage, session?.user?.id]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNext = () => {
        if (pagination.hasNext) {
            setCurrentPage((prev) => prev + 1);
            scrollToTop();
        }
    };

    const handlePrevious = () => {
        if (pagination.hasPrev) {
            setCurrentPage((prev) => prev - 1);
            scrollToTop();
        }
    };

    const handleReadClick = (storyId: string) => {
        router.push(`/novel/${storyId}`);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Array.from({ length: itemsPerPage }).map((_, index) => (
                    <div key={index} className="space-y-3">
                        <Skeleton className="h-64 w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        );
    }

    if (stories.length === 0) {
        return <div>No stories found for this category.</div>;
    }

    return (
        <>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{category}</h3>
            <p className="text-muted-foreground text-sm">แสดง {category} ทั้งหมด</p>
            <hr className="my-2" />

            {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pb-8">
                    <Button
                        variant="default"
                        disabled={!pagination.hasPrev}
                        onClick={handlePrevious}
                    >
                        หน้าก่อน
                    </Button>
                    <div className="flex items-center gap-2">
                        <span>หน้า</span>
                        <span className="font-semibold">{currentPage}</span>
                        <span>จาก</span>
                        <span className="font-semibold">{pagination.totalPages}</span>
                    </div>
                    <Button
                        variant="default"
                        disabled={!pagination.hasNext}
                        onClick={handleNext}
                    >
                        หน้าถัดไป
                    </Button>
                </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {stories.map((story) => (
                    <div
                        key={story.story_id}
                        className={"group relative flex flex-col bg-backgroundCustom hover:bg-card/80 rounded-md border border-border/50 hover:border-border hover:shadow-md hover:scale-105 transition-all duration-200 overflow-hidden shadow-sm h-full"}
                        onClick={() => handleReadClick(story.story_id)}
                    >
                        {/* Image Container */}
                        <div className="relative w-full aspect-[3/4] overflow-hidden">
                            <Image
                                src={story.verticalImage || "/novelImg/Test-novel.png"}
                                alt={story.title || "Novel"}
                                fill
                                sizes="(max-width: 640px) 30vw, (max-width: 768px) 20vw, (max-width: 1024px) 15vw, (max-width: 1280px) 10vw, 8vw"
                                className="object-cover transition-transform duration-200 group-hover:scale-105"
                            />

                            {/* Category Badge */}
                            <div className="absolute top-1 left-1">
                                <Badge variant="secondary" className="bg-black/70 text-white border-none">
                                    {story.category}
                                </Badge>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-1.5 space-y-1 flex flex-col justify-between flex-1">
                            <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                                {story.title || "not found!"}
                            </h3>

                            <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                                <span>{story.chapterCount} ตอน</span>
                                <span>{story.views.toLocaleString()} อ่าน</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-8">
                    <Button
                        variant="default"
                        disabled={!pagination.hasPrev}
                        onClick={handlePrevious}
                    >
                        หน้าก่อน
                    </Button>
                    <div className="flex items-center gap-2">
                        <span>หน้า</span>
                        <span className="font-semibold">{currentPage}</span>
                        <span>จาก</span>
                        <span className="font-semibold">{pagination.totalPages}</span>
                    </div>
                    <Button
                        variant="default"
                        disabled={!pagination.hasNext}
                        onClick={handleNext}
                    >
                        หน้าถัดไป
                    </Button>
                </div>
            )}
        </>
    );
}