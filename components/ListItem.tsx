import * as React from "react";
import { useState, useEffect, useCallback } from "react";

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
import { Lock, EyeOff } from "lucide-react";
import { ModalConfirm } from "@/components/ModalConfirm";

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
  price?: number; // ราคาของนิยาย
  is_hidden?: boolean; // สถานะซ่อน/แสดง
  isPurchased?: boolean; // สถานะการซื้อแล้ว
}

interface ListItemProp {
  category?: string;
  limit?: number;
  showHidden?: boolean; // แสดงนิยายที่ซ่อนหรือไม่
}

export function ListItem({ category = "all", limit = 20, showHidden = false }: ListItemProp) {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [userCoins, setUserCoins] = useState(0);
  
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
  }, [category, limit, showHidden]);

  // ฟังก์ชันดึงข้อมูลเหรียญของผู้ใช้
  const fetchUserCoins = useCallback(async () => {
    try {
      const response = await fetch('/api/wallet');
      if (response.ok) {
        const data = await response.json();
        setUserCoins(data.coins || 0);
      }
    } catch (error) {
      console.log('Error fetching user coins:', error);
    }
  }, []);

  // ดึงข้อมูลเมื่อ component mount หรือ category เปลี่ยน
  useEffect(() => {
    fetchStories();
    fetchUserCoins();
  }, [category, limit, showHidden, fetchStories, fetchUserCoins]);
  
  const handleReadClick = (story: Story) => {
    // ตรวจสอบว่านิยายถูกซ่อนหรือไม่
    if (story.is_hidden && !showHidden) {
      return; // ไม่ให้คลิกได้หากถูกซ่อนและไม่อนุญาตให้แสดง
    }

    // ตรวจสอบว่าต้องซื้อหรือไม่
    if (story.price && story.price > 0 && !story.isPurchased) {
      setSelectedStory(story);
      setModalOpen(true);
      return;
    }

    // ไปยังหน้าอ่านนิยาย
    router.push(`/novel/${story.id}`);
  };

  // ฟังก์ชันจัดการการซื้อ
  const handlePurchase = async () => {
    if (!selectedStory) return;

    try {
      const response = await fetch('/api/payment/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId: selectedStory.id,
          price: selectedStory.price,
          type: 'novel'
        }),
      });

      if (response.ok) {
        // อัพเดทสถานะการซื้อ
        setStories(prev => prev.map(story => 
          story.id === selectedStory.id 
            ? { ...story, isPurchased: true }
            : story
        ));
        
        // ไปยังหน้าอ่านนิยาย
        router.push(`/novel/${selectedStory.id}`);
      } else {
        console.error('Purchase failed');
      }
    } catch (error) {
      console.error('Error during purchase:', error);
    }
  };

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
              <div onClick={() => handleReadClick(story)} className={`group relative flex flex-col bg-backgroundCustom hover:bg-card/80 rounded-lg border border-border/50 hover:border-border hover:shadow-lg hover:scale-110 transition-all duration-300 overflow-hidden shadow-sm ${story.is_hidden ? 'opacity-60' : ''}`}>
                {/* Image Container */}
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  <Image
                    src={story.imageUrl || "/novelImg/Test-novel.png"}
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

                  {/* Status Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {story.is_hidden && (
                      <Badge variant="destructive" className="text-xs flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        ซ่อน
                      </Badge>
                    )}
                    
                    {story.price && story.price > 0 && !story.isPurchased && (
                      <Badge variant="default" className="bg-amber-500 text-white text-xs flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {story.price} เหรียญ
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                    {story.title || "not found!"}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{story.chapter} ตอน</span>
                    <span>{story.views.toLocaleString()} อ่าน</span>
                  </div>

                  {/* แสดงราคาเฉพาะเมื่อต้องซื้อ */}
                  {story.price && story.price > 0 && !story.isPurchased && (
                    <div className="flex items-center justify-center mt-2">
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-200 bg-amber-50">
                        ราคา {story.price} เหรียญ
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      
      {/* Navigation Buttons */}
      <div className="hidden sm:block">
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-border/50 hover:border-border" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-border/50 hover:border-border" />
      </div>

      {/* Modal Confirm สำหรับการซื้อ */}
      {selectedStory && (
        <ModalConfirm
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedStory(null);
          }}
          onConfirm={handlePurchase}
          item={{
            storyId: selectedStory.id,
            chapterId: selectedStory.id,
            title: selectedStory.title,
            price: selectedStory.price || 0,
            imageUrl: selectedStory.imageUrl || "/novelImg/Test-novel.png",
            description: selectedStory.description,
            quantity: 1
          }}
          userCoins={userCoins}
          paymentMethod="coins"
        />
      )}
    </Carousel>
  );
}
