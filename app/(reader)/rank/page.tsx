
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Eye, BookOpen, Trophy, Crown, Award } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface RankedStory {
  rank: number;
  id: string;
  title: string;
  imageUrl?: string;
  category: string;
  author: string;
  penName: string;
  totalFavorites: number;
  totalChapters: number;
  views: number;
  blurb: string;
  tags: string[];
  type: string;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const CATEGORIES = [
  { value: "all", label: "ทุกหมวดหมู่" },
  { value: "romance", label: "โรแมนซ์" },
  { value: "fantasy", label: "แฟนตาซี" },
  { value: "horror", label: "สยองขวัญ" },
  { value: "action", label: "แอ็คชั่น" },
  { value: "comedy", label: "ตลก" },
  { value: "drama", label: "ดราม่า" },
  { value: "mystery", label: "ลึกลับ" },
  { value: "sci-fi", label: "ไซไฟ" },
  { value: "thriller", label: "ระทึกขวัญ" }
];

export default function RankingPage() {
  const [stories, setStories] = useState<RankedStory[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const router = useRouter();

  const fetchRanking = async (category: string, page: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`/api/reader/ranking?category=${category}&page=${page}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ranking');
      }

      const data = await response.json();
      
      if (append) {
        setStories(prev => [...prev, ...data.stories]);
      } else {
        setStories(data.stories);
      }
      
      setPagination(data.pagination);
      
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchRanking(selectedCategory, 1, false);
  }, [selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setStories([]);
  };

  const handleLoadMore = () => {
    if (pagination.hasNext && !loadingMore) {
      fetchRanking(selectedCategory, pagination.currentPage + 1, true);
    }
  };

  const handleStoryClick = (storyId: string) => {
    router.push(`/novel/${storyId}`);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-white"/>;
    if (rank === 2) return <Trophy className="w-6 h-6 text-white"/>;
    if (rank === 3) return <Award className="w-6 h-6 text-white"/>;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 3) return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
    if (rank <= 10) return "bg-gradient-to-r from-purple-400 to-pink-500 text-white";
    return "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">อันดับนิยาย</h1>
            <p className="text-muted-foreground">จัดอันดับตามจำนวน Favorites</p>
          </div>
          
          <div className="flex justify-center">
            <Skeleton className="h-10 w-48" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="w-16 h-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">อันดับนิยาย</h1>
          <p className="text-muted-foreground">จัดอันดับตามจำนวนคนที่ถูกใจ</p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-between">
          <Button onClick={handleGoHome}>หน้าหลัก</Button>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48 bg-backgroundCustom shadow-sm">
              <SelectValue placeholder="เลือกหมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        {stories.length > 0 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              แสดง {stories.length} จาก {pagination.totalCount} เรื่อง
            </p>
          </div>
        )}

        {/* Stories List */}
        <div className="space-y-4">
          {stories.map((story) => (
            <Card 
              key={story.id} 
              className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleStoryClick(story.id)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Rank */}
                  <div className="flex flex-col items-center justify-center w-full sm:w-auto sm:min-w-[80px]">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${getRankBadgeColor(story.rank)}`}>
                      {story.rank <= 3 ? getRankIcon(story.rank) : story.rank}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      อันดับ {story.rank}
                    </div>
                  </div>

                  {/* Story Image */}
                  <div className="relative w-25 h-35 sm:w-25 sm:h-38 rounded overflow-hidden flex-shrink-0 mx-auto self-center">
                    {story.imageUrl ? (
                      <Image
                        src={story.imageUrl}
                        alt={story.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Story Info */}
                  <div className="flex-1 min-w-0">
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                          {story.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          โดย {story.penName}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="font-medium text-red-500">{story.totalFavorites.toLocaleString()}</span>
                          <span>ถูกใจ</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{story.totalChapters} ตอน</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{story.views.toLocaleString()} อ่าน</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1">
                        <Badge variant="secondary" className="text-xs flex-shrink-0 inline-flex">
                          {story.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs flex-shrink-0 inline-flex">
                          {story.type}
                        </Badge>
                        {story.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs flex-shrink-0 inline-flex">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {story.blurb && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {story.blurb}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {pagination.hasNext && (
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outline"
              size="lg"
              className="min-w-[200px]"
            >
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  กำลังโหลด...
                </div>
              ) : (
                `ดูเพิ่มเติม (${Math.min(20, pagination.totalCount - stories.length)} เรื่อง)`
              )}
            </Button>
          </div>
        )}

        {/* No Stories */}
        {stories.length === 0 && !loading && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">ไม่พบนิยายในหมวดหมู่นี้</h3>
            <p className="text-muted-foreground">
              ลองเลือกหมวดหมู่อื่นหรือกลับมาใหม่ในภายหลัง
            </p>
          </div>
        )}
      </div>
    </div>
  );
}