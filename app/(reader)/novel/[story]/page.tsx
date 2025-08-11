"use client";

import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area"
import { EyeOff, Coins } from "lucide-react";
import { SetStateAction, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { ModalConfirm } from "@/components/ModalConfirm";
import { useSession } from "next-auth/react";
import { CommentsStory } from "@/components/commentsStory";
import { Button } from '@/components/ui/button';
import { Heart, Bell } from 'lucide-react';
import { toast } from 'sonner';

// Interface สำหรับ Session
interface ExtendedUser {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  wallet?: {
    balance: number;
  };
}

interface ExtendedSession {
  user?: ExtendedUser;
  expires?: string;
}

interface Chapter {
  chapter_id: string;
  title: string;
  order: number;
  price: number;
  is_hidden?: boolean;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  transaction_id: string;
  chapter_id: string;
  amount: number;
  created_at: string;
  chapter?: {
    chapter_id: string;
    title: string;
    order: number;
    price: number;
  };
}

interface Author {
  id: string;
  name: string;
  penName: string;
  image?: string;
}

interface Story {
  story_id: string;
  title: string;
  blurb: string;
  category: string;
  type: string;
  contentLevel: string;
  tags: string[];
  storyInfo?: string;
  verticalImage: string;
  horizontalImage?: string;
  views: number;
  created_at: string;
  updated_at: string;
  author: Author;
  chapters: Chapter[];
  stats: {
    totalChapters: number;
    totalComments: number;
    totalFavorites: number;
    totalFollows: number;
  };
}

// Component สำหรับแสดงข้อมูลเรื่องด้วย Tiptap
function StoryInfoDisplay({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content || '<p>ไม่มีข้อมูลเพิ่มเติมเกี่ยวกับเรื่องนี้</p>',
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none',
      },
    },
  });

  return (
    <div className="w-full min-h-[70rem] my-5 bg-backgroundCustom shadow-xl">
      <div className="p-6">
        <EditorContent
          editor={editor}
          className="text-foreground leading-relaxed [&_.ProseMirror]:outline-none [&_.ProseMirror]:border-none [&_.ProseMirror]:min-h-[65rem]"
        />
      </div>
    </div>
  );
}

export default function Page() {
  const params = useParams();
  const storyId = params.story as string;
  const router = useRouter();
  const { data: session, status } = useSession() as { 
    data: ExtendedSession | null; 
    status: "loading" | "authenticated" | "unauthenticated" 
  };

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State สำหรับ Modal Confirm
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [userCoins, setUserCoins] = useState(0);
  const [purchasedChapters, setPurchasedChapters] = useState<Set<string>>(new Set());
  // follow & favorite state
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [ffLoading, setFfLoading] = useState(false);

  // ดึงข้อมูลนิยายจาก API
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reader/stories/${storyId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch story');
        }

        const data = await response.json();
        setStory(data.data); // เปลี่ยนจาก data.story เป็น data.data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (storyId) {
      fetchStory();
    }
  }, [storyId]);

  // ดึงข้อมูล transaction ที่ผู้ใช้ซื้อบทในเรื่องนี้
  useEffect(() => {
    const fetchPurchasedChapters = async () => {
      if (status === "authenticated" && session?.user && storyId) {
        try {
          const userId = session.user.id || session.user.email;
          if (!userId) return;

          const response = await fetch(`/api/reader/purchased-chapters?user_id=${encodeURIComponent(userId)}&story_id=${storyId}`);
          if (response.ok) {
            const data = await response.json();
            // สร้าง Set ของ chapter_id ที่ซื้อแล้ว
            const purchasedSet = new Set<string>(
              data.purchasedChapters?.map((transaction: Transaction) => transaction.chapter_id)
                .filter((id: string | null | undefined) => id) || []
            );
            setPurchasedChapters(purchasedSet);
          }
        } catch (error) {
          console.log('Error fetching purchased chapters:', error);
        }
      }
    };

    fetchPurchasedChapters();
  }, [status, session, storyId]);

  // ดึงข้อมูลเหรียญของผู้ใช้
  useEffect(() => {
    const fetchUserCoins = async () => {
      if (status === "authenticated" && session?.user) {
        try {
          // ใช้ user.id เป็นหลัก แต่ถ้าไม่มีให้ใช้ email
          const userId = session.user.id || session.user.email;
          if (!userId) {
            console.log('No user ID or email found');
            return;
          }

          // ส่ง user ID ไปใน query parameter
          const response = await fetch(`/api/wallet/balance?user_id=${encodeURIComponent(userId)}`);
          if (response.ok) {
            const data = await response.json();
            setUserCoins(data.balance || 0);
          } else {
            console.log('Failed to fetch user balance:', response.status);
          }
        } catch (error) {
          console.log('Error fetching user coins:', error);
        }
      }
    };

    fetchUserCoins();
  }, [status, session]);

  // ตัวแปรสำหรับ pagination
  const chaptersPerPage = 20;
  const totalChapters = story?.chapters.length || 0;
  const totalPages = Math.ceil(totalChapters / chaptersPerPage);

  // สร้างตัวเลือกสำหรับ dropdown ด้วย useMemo
  const pageOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < totalPages; i++) {
      const startChapter = i * chaptersPerPage + 1;
      const endChapter = Math.min((i + 1) * chaptersPerPage, totalChapters);
      options.push({
        value: `page-${i + 1}`,
        label: `ตอนที่ ${startChapter}-${endChapter}`
      });
    }
    return options;
  }, [totalPages, totalChapters]);

  // State สำหรับเก็บหน้าปัจจุบัน
  const [currentPage, setCurrentPage] = useState('page-1');

  // Reset currentPage เมื่อได้ข้อมูลใหม่
  useEffect(() => {
    if (story && pageOptions.length > 0) {
      setCurrentPage(pageOptions[0].value);
    }
  }, [story, pageOptions]);

  // Fetch follow & favorite status
  useEffect(() => {
    const run = async () => {
      if (!storyId) return;
      try {
        const [favRes, folRes] = await Promise.all([
          fetch(`/api/reader/stories/${storyId}/favorite`, { cache: 'no-store' }),
          fetch(`/api/reader/stories/${storyId}/follow`, { cache: 'no-store' })
        ]);
        if (favRes.ok) {
          const j = await favRes.json();
            setFavoriteCount(j.data.count);
            setIsFavorited(j.data.isFavorited);
        }
        if (folRes.ok) {
          const j2 = await folRes.json();
            setFollowCount(j2.data.count);
            setIsFollowing(j2.data.isFollowing);
        }
      } catch (e) {
        console.log('FF status error', e);
      }
    };
    run();
  }, [storyId]);

  const toggleFavorite = async () => {
    if (ffLoading) return;
    if (status !== 'authenticated') {
      toast.warning('กรุณาเข้าสู่ระบบเพื่อเพิ่มถูกใจ');
      return;
    }
    try {
      setFfLoading(true);
      const res = await fetch(`/api/reader/stories/${storyId}/favorite`, { method: 'POST' });
      if (!res.ok) throw new Error('ไม่สามารถอัปเดตถูกใจ');
      const j = await res.json();
      setIsFavorited(j.data.isFavorited);
      setFavoriteCount(j.data.count);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setFfLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (ffLoading) return;
    if (status !== 'authenticated') {
      toast.warning('กรุณาเข้าสู่ระบบเพื่อติดตาม');
      return;
    }
    try {
      setFfLoading(true);
      const res = await fetch(`/api/reader/stories/${storyId}/follow`, { method: 'POST' });
      if (!res.ok) throw new Error('ไม่สามารถอัปเดตการติดตาม');
      const j = await res.json();
      setIsFollowing(j.data.isFollowing);
      setFollowCount(j.data.count);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setFfLoading(false);
    }
  };

  // ฟังก์ชันสำหรับการเปลี่ยนหน้า
  const handlePageChange = (value: SetStateAction<string>) => {
    setCurrentPage(value);
  };

  // คำนวณตอนที่จะแสดงในหน้าปัจจุบัน
  const getCurrentPageChapters = () => {
    if (!story) return [];
    const pageIndex = parseInt(currentPage.split('-')[1]) - 1;
    const startIndex = pageIndex * chaptersPerPage;
    const endIndex = Math.min(startIndex + chaptersPerPage, totalChapters);
    return story.chapters.slice(startIndex, endIndex);
  };

  const currentChapters = getCurrentPageChapters();

  const handleChapterClick = (chapter: Chapter) => {
    // ตรวจสอบว่าบทนี้ซื้อแล้วหรือไม่
    const isPurchased = purchasedChapters.has(chapter.chapter_id);
    
    // ถ้าซื้อแล้วหรือฟรี ไปยังบทโดยตรง
    if (chapter.price === 0 || isPurchased) {
      router.push(`/novel/${storyId}/${chapter.order}`);
    } else {
      // ถ้ายังไม่ซื้อและมีราคา แสดง modal confirm
      setSelectedChapter(chapter);
      setIsModalOpen(true);
    }
  };

  // ฟังก์ชันสำหรับยืนยันการซื้อบท
  const handleConfirmPurchase = async () => {
    if (selectedChapter) {
      // หลังจากซื้อสำเร็จ อัปเดต purchasedChapters และไปยังบทนั้น
      const newPurchasedChapters = new Set(purchasedChapters);
      newPurchasedChapters.add(selectedChapter.chapter_id);
      setPurchasedChapters(newPurchasedChapters);
      
      router.push(`/novel/${storyId}/${selectedChapter.order}`);
    }
  };

  // ฟังก์ชันสำหรับปิด modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedChapter(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">กำลังโหลด...</div>
      </div>
    );
  }

  // Error state
  if (error || !story) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-500">เกิดข้อผิดพลาด: {error || 'ไม่พบข้อมูลนิยาย'}</div>
      </div>
    );
  }

  return (
    <>
      <Card className="w-full bg-backgroundCustom border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image Section */}
            <div className="lg:col-span-1">
              <div className="relative aspect-[3/4] w-full max-w-sm mx-auto lg:mx-0">
                <Image
                  src={story.verticalImage ||  "/novelImg/Test-novel.png"}
                  alt={story.title}
                  fill
                  priority
                  className="object-cover rounded-lg shadow-md"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <CardTitle className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight break-words hyphens-auto">
                {story.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant={isFavorited ? 'default' : 'outline'} size="sm" disabled={ffLoading} onClick={toggleFavorite} className={isFavorited ? 'bg-pink-600 hover:bg-pink-700 text-white' : ''}>
                  <Heart className={`w-4 h-4 mr-1 ${isFavorited ? 'fill-current' : ''}`} /> {favoriteCount}
                </Button>
                <Button variant={isFollowing ? 'default' : 'outline'} size="sm" disabled={ffLoading} onClick={toggleFollow} className={isFollowing ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}>
                  <Bell className="w-4 h-4 mr-1" />ติดตาม {followCount}
                </Button>
              </div>

              <div className="space-y-3 text-sm md:text-base">
                <div className="flex flex-wrap items-start gap-2">
                  <span className="font-semibold text-muted-foreground min-w-0">ผู้แต่ง:</span>
                  <span className="text-foreground">{story.author.penName}</span>
                </div>

                <div className="flex flex-wrap items-start gap-2">
                  <span className="font-semibold text-muted-foreground min-w-0">แนว:</span>
                  <span className="text-foreground">{story.category}</span>
                </div>

                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap items-start gap-2">
                    <span className="font-semibold text-muted-foreground min-w-0">แท็ก:</span>
                    <div className="flex flex-wrap gap-1">
                      {story.tags.map((tag) => (
                        <span key={tag} className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-start gap-2">
                  <span className="font-semibold text-muted-foreground min-w-0">ประเภท:</span>
                  <span className="text-foreground">{story.type}</span>
                </div>

                <div className="flex flex-wrap items-start gap-2">
                  <span className="font-semibold text-muted-foreground min-w-0">เรต:</span>
                  <span className="text-foreground">{story.contentLevel}</span>
                </div>

                <div className="flex flex-wrap items-start gap-2">
                  <span className="font-semibold text-muted-foreground min-w-0">จำนวนการดู:</span>
                  <span className="text-foreground">{story.views.toLocaleString()} ครั้ง</span>
                </div>

                {story.blurb && (
                  <div className="space-y-2">
                    <span className="font-semibold text-muted-foreground">เรื่องย่อ:</span>
                    <p className="text-foreground leading-relaxed text-justify hyphens-auto">
                      {story.blurb}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h4 className="font-bold">ข้อมูลเรื่องนี้</h4>
      <StoryInfoDisplay content={story.storyInfo || ''} />

      <div className="my-4">
        <div className="flex justify-between my-4">
          <h3 className="text-lg font-medium">สารบัญ (ทั้งหมด {totalChapters} ตอน)</h3>
          {pageOptions.length > 1 && (
            <Select value={currentPage} onValueChange={handlePageChange}>
              <SelectTrigger className="w-auto bg-backgroundCustom border shadow-xl">
                <SelectValue placeholder="เลือกตอน" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>เลือกช่วงตอน</SelectLabel>
                  {pageOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>

        <ScrollArea className="h-165 w-full bg-backgroundCustom border shadow-xl rounded">
          <div className="p-4">
            {pageOptions.length > 1 && (
              <>
                <h3 className="mb-4 text-sm font-bold leading-none">
                  {pageOptions.find(option => option.value === currentPage)?.label}
                </h3>
                <hr />
              </>
            )}
            {currentChapters.length > 0 ? (
              currentChapters.map((chapter) => {
                const isPurchased = purchasedChapters.has(chapter.chapter_id);
                return (
                <div
                  key={chapter.chapter_id}
                  onClick={() => handleChapterClick(chapter)}
                  className={`text-sm my-2 p-4 bg-background rounded hover:bg-backgroundCustom cursor-pointer transition-colors border ${
                    chapter.is_hidden ? 'opacity-60 border-dashed' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span>ตอนที่ {chapter.order}: {chapter.title}</span>
                      <div className="flex items-center gap-2">
                        {/* Test hidden icon */}
                        {chapter.is_hidden && (
                          <div className="flex items-center bg-gray-100 text-gray-600 px-2 py-1 rounded" title="บทนี้ถูกซ่อน">
                            <EyeOff className="w-3 h-3" />
                            <span className="ml-1 text-xs">ซ่อน</span>
                          </div>
                        )}
                        {/* Test price icon - แสดงเฉพาะเมื่อยังไม่ซื้อและมีราคา */}
                        {chapter.price > 0 && !isPurchased && (
                          <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded" title="บทนี้ต้องใช้เหรียญ">
                            <Coins className="w-3 h-3" />
                            <span className="ml-1 text-xs">{chapter.price}</span>
                          </div>
                        )}
                        {/* แสดงสถานะซื้อแล้ว */}
                        {chapter.price > 0 && isPurchased && (
                          <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded" title="บทนี้ซื้อแล้ว">
                            <span className="ml-1 text-xs">ซื้อแล้ว</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                )
              })
            ) : (
              <div className="text-center text-muted-foreground py-8">
                ยังไม่มีตอนในเรื่องนี้
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Modal Confirm สำหรับการซื้อบท */}
      {selectedChapter && (
        <ModalConfirm
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmPurchase}
          item={{
            storyId: story.story_id,
            chapterId: selectedChapter.chapter_id,
            title: `ตอนที่ ${selectedChapter.order}: ${selectedChapter.title}`,
            price: selectedChapter.price,
            description: `ตอนที่ ${selectedChapter.order} ของเรื่อง "${story?.title || 'ไม่ระบุ'}"`,
            imageUrl: story?.verticalImage || "/novelImg/Test-novel.png"
          }}
          userCoins={userCoins}
          paymentMethod="coins"
        />
      )}
  <CommentsStory storyId={story.story_id} />
    </>
  );
}