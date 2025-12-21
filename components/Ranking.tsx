"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Heart, BookOpen, Eye, Tag } from "lucide-react";
import { useRouter } from "next/navigation";

interface Story {
  id: string;
  title: string;
  imageUrl: string;
  categories: string;
  author: string;
  totalFavorites: number;
  totalChapters: number;
  views: number;
  blurb: string;
}

export default function Ranking() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);



  const getRankBadgeColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 1:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 2:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-gradient-to-r from-blue-400 to-blue-600 text-white";
    }
  };

  useEffect(() => {
    const fetchTopFavorites = async () => {
      try {
        const response = await fetch('/api/reader/top-favorites');
        const data = await response.json();
        setStories(data.stories || []);
      } catch (error) {
        console.error('Error fetching top favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopFavorites();
  }, []);

  const router = useRouter();
  const handleStoryClick = (storyId: string) => {
    router.push(`/novel/${storyId}`);
  };

  function getStoryImage(src?: string | null): string {
        if (!src || src.trim() === "") return "/novelImg/Test-novel.png"; 
        if (src.startsWith("http")) return src      // external
        if (src.startsWith("/uploads")) return `/api${src}` // local uploads
        return `/api/uploads/${src.replace(/^\/+/, "")}`
    }

  if (loading) {
    return (
      <div className="w-full space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full drop-shadow-lg bg-backgroundCustom border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex gap-6 animate-pulse">
                <div className="flex-shrink-0">
                  <div className="w-32 h-48 bg-background from-gray-200 to-gray-300 rounded-xl"></div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="h-6 bg-background from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-background from-gray-200 to-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-background from-gray-200 to-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-background from-gray-200 to-gray-300 rounded w-5/6"></div>
                    <div className="h-4 bg-background from-gray-200 to-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {stories.map((story, index) => (
        <Card 
          key={story.id}
          onClick={() => handleStoryClick(story.id)}
          className="w-full drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 bg-backgroundCustom from-white to-gray-50 border-0 overflow-hidden group hover:scale-[1.02]"
        >
          <CardContent className="p-6">
            <div className="flex gap-6">
              {/* Rank Badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg ${getRankBadgeColor(index)}`}>
                  <span className="font-bold text-sm">#{index + 1}</span>
                </div>
              </div>

              {/* Book Cover */}
              <div className="flex-shrink-0 relative">
                <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src={getStoryImage(story.imageUrl)}
                    alt={story.title}
                    width={128}
                    height={192}
                    className="object-cover w-32 h-48 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-4 pt-8">
                {/* Title and Author */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                    {story.title}
                  </h3>
                  <p className="text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    โดย: <span className="font-medium">{story.author}</span>
                  </p>
                </div>

                {/* Category Tags */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium">หมวดหมู่:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {story.categories.split(',').map((category, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary" 
                        className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 hover:from-blue-200 hover:to-indigo-200 transition-all duration-200 border border-blue-200 shadow-sm"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {category.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed line-clamp-3">
                  {story.blurb || "ไม่มีคำอธิบาย"}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 pt-2">
                  <div className="flex items-center gap-2 text-red-500">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{story.totalFavorites.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-semibold">{story.totalChapters}</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-600">
                    <Eye className="w-4 h-4" />
                    <span className="font-semibold">{story.views.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {stories.length === 0 && !loading && (
        <Card className="w-full bg-backgroundCustom border-0">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">ไม่พบนิยายยอดนิยม</p>
            <p className="text-gray-400 text-sm">ลองใหม่อีกครั้งในภายหลัง</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
