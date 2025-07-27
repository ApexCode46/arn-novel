import * as React from "react";
import { useState, useEffect } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";

// Interface สำหรับข้อมูลนิยาย
interface Story {
  id: string;
  title: string;
  imageUrl: string | null;
  categories: string;
  chapters: number;
  views: number;
  description: string;
  type: string;
}

interface ListItemProp {
  category?: string;
  limit?: number;
}

export function ListItem({ category = "all", limit = 20 }: ListItemProp) {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchStories = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        category: category,
        limit: limit.toString(),
        page: '1'
      });
      
      const response = await fetch(`/api/reader/stories?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setStories(data.stories);
      } else {
        console.log('Failed to fetch stories');
      }
    } catch (error) {
      console.log('Error fetching stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ดึงข้อมูลเมื่อ component mount หรือ category เปลี่ยน
  useEffect(() => {
    fetchStories();
  }, [category, limit]);
  
  const handleReadClick = (storyId: string) => {
    router.push(`/novel/${storyId}`);
  };

  // ฟังก์ชันตรวจสอบ URL รูปภาพ
  const getValidImageSrc = (imageUrl: string | null): string => {
    if (!imageUrl || imageUrl.trim() === '') {
      return "/novelImg/Test-novel.png";
    }
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    return "/novelImg/Test-novel.png";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-muted-foreground">กำลังโหลด...</div>
      </div>
    );
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
        {stories.map((story) => (
          <CarouselItem
            key={story.id}
            className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 p-2 py-6"
          >
            <div className="group relative flex flex-col bg-backgroundCustom hover:bg-card/80 rounded-lg border border-border/50 hover:border-border hover:shadow-lg hover:scale-110 transition-all duration-300 overflow-hidden shadow-sm">
              {/* Image Container */}
              <div className="relative w-full aspect-[3/4] overflow-hidden">
                <Image
                  src={getValidImageSrc(story.imageUrl)}
                  alt={story.title || "Novel"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Overlay with buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-black backdrop-blur-sm"
                    onClick={() => handleReadClick(story.id)}
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    อ่าน
                  </Button>
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-black/70 text-white text-xs border-none">
                    {story.categories}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                  {story.title || "not found!"}
                </h3>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{story.chapters} ตอน</span>
                  <span>{story.views.toLocaleString()} อ่าน</span>
                </div>

              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      {/* Navigation Buttons */}
      <div className="hidden sm:block">
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-red-500/80 hover:bg-red-500 border-border/50 hover:border-border" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500/80 hover:bg-red-500 border-border/50 hover:border-border" />
      </div>
    </Carousel>
  );
}
