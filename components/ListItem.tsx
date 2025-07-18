import * as React from "react";

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
import { Advertisement } from "@/dummy/dummyNovel";
import { BookOpen } from "lucide-react";

interface ListItemProp {
  data: Advertisement[];
}

export function ListItem({ data }: ListItemProp) {
  const router = useRouter();
  const listNovel = data;
  
  const handleReadClick = (novelId: number) => {
    router.push(`/novel/${novelId}`);
  };
  
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent className="w-full">
        {listNovel.map((novelItem) => (
          <CarouselItem
            key={novelItem.id}
            className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 p-2 py-6"
          >
            <div className="group relative flex flex-col bg-backgroundCustom hover:bg-card/80 rounded-lg border border-border/50 hover:border-border hover:shadow-lg hover:scale-110 transition-all duration-300 overflow-hidden shadow-sm">
              {/* Image Container */}
              <div className="relative w-full aspect-[3/4] overflow-hidden">
                <Image
                  src={novelItem.imageUrl || "/novelImg/Test-novel.png"}
                  alt={novelItem.title || "Novel"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Overlay with buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-black backdrop-blur-sm"
                    onClick={() => handleReadClick(novelItem.id)}
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    อ่าน
                  </Button>
                </div>

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-black/70 text-white text-xs border-none">
                    {novelItem.categories}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                  {novelItem.title || "not found!"}
                </h3>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>12 ตอน</span>
                  <span>1.2K อ่าน</span>
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
