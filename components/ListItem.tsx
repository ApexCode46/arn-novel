"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useRouter } from "next/navigation";


// Interface สำหรับข้อมูลนิยาย
interface Story {
  id: string;
  title: string;
  imageUrl: string | null;
  categories: string;
  chapter: number; // แก้จาก chapters เป็น chapter
  views: number;
  description: string;
  type: string;
  is_hidden?: boolean; // สถานะซ่อน/แสดง
}

interface ListItemProp {
  category?: string;
  limit?: number;
  showHidden?: boolean; // แสดงนิยายที่ซ่อนหรือไม่
  userId?: string; // เพิ่ม userId สำหรับ category following
}

export function ListItem({ category = "all", limit = 20, showHidden = false, userId }: ListItemProp) {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  
  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchStories = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        category: category,
        limit: limit.toString(),
        page: '1',
        showHidden: showHidden.toString()
      });

      // เพิ่ม userId ถ้า category เป็น following
      if (category === 'following' && userId) {
        params.append('userId', userId);
      }
      
      const response = await fetch(`/api/reader/stories?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories);

        console.log('Fetched stories:', data.stories);
      } else {
        console.log('Failed to fetch stories');
      }
    } catch (error) {
      console.log('Error fetching stories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [category, limit, showHidden, userId]);

  // ดึงข้อมูลเมื่อ component เข้าสู่หน้าจอ หรือเมื่อพารามิเตอร์เปลี่ยนขณะมองเห็น
  useEffect(() => {
    if (!isInView) return;
    fetchStories();
  }, [isInView, category, limit, showHidden, userId, fetchStories]);

  // ตั้ง IntersectionObserver เพื่อตรวจสอบเมื่อคอมโพเนนต์เข้ามาใน viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);
  
  const handleReadClick = (story: Story) => {
    if (story.is_hidden && !showHidden) return;
    router.push(`/novel/${story.id}`);
  };

  // ถ้ายังไม่เข้า viewport ให้แสดง skeleton loading แทน (ยังไม่ดึงข้อมูล)
  if (!isInView) {
    return (
      <div ref={containerRef} className="w-full">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="w-full">
            {Array.from({ length: 6 }).map((_, index) => (
              <CarouselItem
                key={index}
                className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 p-2 py-6"
              >
                <div className="group relative flex flex-col bg-backgroundCustom rounded-lg border overflow-hidden shadow-sm">
                  {/* Image Skeleton */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <Skeleton className="w-full h-full bg-background" />
                    
                    {/* Category Badge Skeleton */}
                    <div className="absolute top-2 left-2">
                      <Skeleton className="h-5 w-16 rounded-full bg-backgroundCustom" />
                    </div>
                  </div>

                  {/* Content Skeleton */}
                  <div className="p-3 space-y-2">
                    {/* Title Skeleton */}
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-full bg-background" />
                      <Skeleton className="h-4 w-3/4 bg-background" />
                    </div>
                    
                    {/* Stats Skeleton */}
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-12 bg-background" />
                      <Skeleton className="h-3 w-16 bg-background" />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation Buttons */}
          <div className="hidden sm:block">
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-border/50 hover:border-border" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-border/50 hover:border-border" />
          </div>
        </Carousel>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="w-full">
          {Array.from({ length: 6 }).map((_, index) => (
            <CarouselItem
              key={index}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 p-2 py-6"
            >
              <div className="group relative flex flex-col bg-backgroundCustom rounded-lg border overflow-hidden shadow-sm">
                {/* Image Skeleton */}
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  <Skeleton className="w-full h-full bg-background" />
                  
                  {/* Category Badge Skeleton */}
                  <div className="absolute top-2 left-2">
                    <Skeleton className="h-5 w-16 rounded-full bg-backgroundCustom" />
                  </div>
                </div>

                {/* Content Skeleton */}
                <div className="p-3 space-y-2">
                  {/* Title Skeleton */}
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-full bg-background" />
                    <Skeleton className="h-4 w-3/4 bg-background" />
                  </div>
                  
                  {/* Stats Skeleton */}
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-12 bg-background" />
                    <Skeleton className="h-3 w-16 bg-background" />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Buttons */}
        <div className="hidden sm:block">
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-border/50 hover:border-border" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-border/50 hover:border-border" />
        </div>
      </Carousel>
    );
  }
  function getStoryImage(src?: string | null): string {
        if (!src || src.trim() === "") return "/novelImg/Test-novel.png"; // fallback
        if (src.startsWith("http")) return src      // external
        if (src.startsWith("/uploads")) return `/api${src}` // local uploads
        return `/api/uploads/${src.replace(/^\/+/, "")}`
    }

  if (stories.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-muted-foreground">ไม่พบนิยาย</div>
      </div>
    );
  }
  
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent className="w-full">
        {stories.map((story) => {
          // กรองนิยายที่ถูกซ่อนหากไม่อนุญาตให้แสดง
          if (story.is_hidden && !showHidden) {
            return null;
          }

          return (
            <CarouselItem
              key={story.id}
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 p-2 py-6"
            >
              <div onClick={() => handleReadClick(story)} className="group relative flex flex-col bg-backgroundCustom hover:bg-card/80 rounded-lg border border-border/50 hover:border-border hover:shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden shadow-sm h-full">
                {/* Image Container */}
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  <Image
                    src={getStoryImage(story.imageUrl)}
                    alt={story.title || "Novel"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.67vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-black/70 text-white text-xs border-none">
                      {story.categories}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2 flex flex-col justify-between flex-1">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                    {story.title || "not found!"}
                  </h3>

                  <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                    <span>{story.chapter} ตอน</span>
                    <span>{story.views.toLocaleString()} อ่าน</span>
                  </div>
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      
      <div className="hidden sm:block">
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-border/50 hover:border-border" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-border/50 hover:border-border" />
      </div>
    </Carousel>
  );
}
