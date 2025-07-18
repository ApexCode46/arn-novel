'use client'

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import Modalsettingstory from "@/components/ModalSettingStory"

import { Calendar, BookOpen } from "lucide-react"

// Extend the session user type to include id
interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

type Story = {
  story_id: string;
  title: string;
  blurb: string;
  verticalImage: string | null;
  chapters: number;
  category: string;
  created_at: string;
  type: string;
};

export default function Stories() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");

  // ดึงข้อมูล stories จาก API
  const fetchStories = async () => {
    const userId = (session?.user as ExtendedUser)?.id;
    if (!userId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/writer/stories?userId=${userId}`);
      
      if (response.ok) {
        const storiesData = await response.json();
        setStories(storiesData);
      } else {
        console.error('Failed to fetch stories');
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ดึงข้อมูลเมื่อ session พร้อม
  useEffect(() => {
    if (session?.user) {
      fetchStories();
    }
  }, [session]);

  // ฟังก์ชันกรองและเรียงลำดับ
  useEffect(() => {
    let filtered = [...stories];

    // กรองตามประเภท
    if (typeFilter !== "all") {
      filtered = filtered.filter(story => {
        if (typeFilter === "long") return story.type === "เรื่องยาว";
        if (typeFilter === "short") return story.type === "เรื่องสั้น";
        return true;
      });
    }

    // เรียงลำดับ
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "latest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "alphabetical":
          return a.title.localeCompare(b.title, 'th');
        case "chapters":
          return b.chapters - a.chapters;
        default:
          return 0;
      }
    });

    setFilteredStories(filtered);
  }, [stories, typeFilter, sortOrder]);

  // ฟังก์ชันตรวจสอบและแก้ไข image URL
  const getValidImageSrc = (imageUrl: string | null): string => {
    if (!imageUrl || imageUrl.trim() === '') {
      return "/novelImg/Test-novel.png";
    }
    
    // ตรวจสอบว่าเป็น absolute URL (http/https)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // ตรวจสอบว่าเป็น relative path ที่ถูกต้อง (เริ่มต้นด้วย /)
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    // ถ้าไม่ใช่ URL หรือ path ที่ถูกต้อง ให้ใช้ default image
    return "/novelImg/Test-novel.png";
  };

  // ฟังก์ชันจัดการเมื่อสร้างนิยายใหม่สำเร็จ
  const handleStoryCreated = (newStory: any) => {
    console.log('Creating story:', newStory);
    // รีเฟรชข้อมูล
    fetchStories();
  };

  return (
    <>
      <h3 className="my-2 text-3xl md:text-4xl font-bold">นิยายของฉัน</h3>
      <hr className="py-2" />


      <div className="w-full h-auto mb-3 border rounded bg-backgroundCustom ">
        <div className="flex justify-between p-6 border-b ">
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-auto">
                <SelectValue placeholder="เลือกเรื่อง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="long">เรื่องยาว</SelectItem>
                <SelectItem value="short">เรื่องสั้น</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-auto">
                <SelectValue placeholder="เรียงตาม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">ล่าสุด</SelectItem>
                <SelectItem value="oldest">เก่าสุด</SelectItem>
                <SelectItem value="alphabetical">ตามตัวอักษร</SelectItem>
                <SelectItem value="chapters">จำนวนตอน</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Modalsettingstory 
              trigger={
                <div className="flex items-center justify-center gap-2 cursor-pointer bg-background hover:bg-secondary border-1 p-2 rounded ">
                  เขียนใหม่
                </div>
              }
              mode="create"
              onSubmit={handleStoryCreated}
            />
          </div>
        </div>
        <div>
          <ScrollArea className="h-[600px] w-full">
            <div className="p-3 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-muted-foreground">กำลังโหลด...</div>
                </div>
              ) : filteredStories.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-muted-foreground text-center">
                    {stories.length === 0 ? "ยังไม่มีนิยาย" : "ไม่พบนิยายที่ตรงกับเงื่อนไข"}
                  </div>
                </div>
              ) : (
                filteredStories.map((story) => (
                <div
                  key={story.story_id}
                  className="relative group bg-card hover:bg-card/90 rounded-lg border border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/editor/${story.story_id}`)}
                >
                  <div className="flex gap-3 p-3">
                    {/* Story Image */}
                    <div className="flex-shrink-0 relative">
                      <div className="relative w-16 h-20 rounded-md overflow-hidden shadow-sm">
                        <Image
                          src={getValidImageSrc(story.verticalImage)}
                          alt={story.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {/* Type Badge */}
                      <div className="absolute -top-1 -left-1 bg-primary text-primary-foreground rounded-full px-1.5 h-4 flex items-center justify-center text-xs font-medium">
                        {story.type}
                      </div>
                    </div>

                    {/* Story Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Title */}
                      <h3 className="text-sm font-medium text-foreground line-clamp-1">
                        {story.title}
                      </h3>

                      {/* Blurb */}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {story.blurb}
                      </p>
                      
                      {/* Category & Stats Row */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className="bg-primary/10 text-primary border-primary/20 text-xs"
                        >
                          {story.category}
                        </Badge>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{story.chapters}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(story.created_at).toLocaleDateString('th-TH', { 
                              month: 'short', 
                              day: 'numeric',
                              year: '2-digit'
                            })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  )
}