"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CardNovel from '@/components/CardNovel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// Tabs removed
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Grid3X3, List } from 'lucide-react'
import { toast } from 'sonner'

// Type definitions
interface NovelData {
  id: string;
  title: string;
  verticalImage?: string;
  category: string;
  type: string;
  contentLevel: string;
  views: number;
  blurb?: string;
  tags?: string[];
  status: string;
  is_end?: boolean;
  author: {
    penName: string;
  };
  likes?: number;
  rating?: number;
  publishedDate?: string;
}

// Custom hook สำหรับดึงข้อมูลนิยาย
function useNovels() {
  const [novels, setNovels] = useState<NovelData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const fetchNovels = async (params: {
    page?: number
    limit?: number
    q?: string
    searchType?: 'title' | 'penName' | 'tag'
    category?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}) => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString())
      })

      const response = await fetch(`/api/search?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch novels')
      }

      const data = await response.json()

      if (data.success) {
        setNovels(data.data || [])
        setPagination(data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        })
      } else {
        throw new Error(data.message || 'Failed to fetch novels')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      toast.error(`เกิดข้อผิดพลาด: ${errorMessage}`)

      // Set empty data on error
      setNovels([])
      setPagination({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    novels,
    loading,
    error,
    pagination,
    fetchNovels,
    setNovels
  }
}

// Hook สำหรับจัดการ Like
function useNovelActions() {
  const [likedNovels, setLikedNovels] = useState<Set<string>>(new Set())

  const handleLike = async (novelId: string) => {
    try {
      const isCurrentlyLiked = likedNovels.has(novelId)
      const action = isCurrentlyLiked ? 'unlike' : 'like'

      const response = await fetch(`/api/novels/${novelId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // ในการใช้งานจริงควรได้มาจาก Authentication
          action
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to like novel')
      }

      const data = await response.json()

      if (data.success) {
        setLikedNovels(prev => {
          const newSet = new Set(prev)
          if (data.data.isLiked) {
            newSet.add(novelId)
          } else {
            newSet.delete(novelId)
          }
          return newSet
        })

        toast.success(
          data.data.isLiked ? 'เพิ่มในรายการโปรดแล้ว' : 'ลบออกจากรายการโปรดแล้ว'
        )
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการไลค์')
      console.log('Like error:', error)
    }
  }

  return {
    likedNovels,
    handleLike
  }
}

// Component หลัก
export default function NovelBrowsePage() {
  const router = useRouter()
  const { novels, loading, error, pagination, fetchNovels } = useNovels()
  const { likedNovels } = useNovelActions()

  // States สำหรับ Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchType, setSearchType] = useState<'title' | 'penName' | 'tag'>('title')
  const [sortBy, setSortBy] = useState('chapters')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  // Removed tabs

  // Load initial data
  useEffect(() => {
    fetchNovels({
      page: 1,
      limit: 12,
      searchType,
      sortBy,
      sortOrder
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchType, sortBy, sortOrder])

  // รีเฟรชผลลัพธ์อัตโนมัติเมื่อเปลี่ยนสถานะหรือหมวดหมู่
  useEffect(() => {
    fetchNovels({
      page: 1,
      limit: pagination.limit,
      q: searchTerm || undefined,
      searchType,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      sortBy,
      sortOrder,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, selectedCategory])

  // Handle search and filters
  const handleSearch = () => {
    fetchNovels({
      page: 1,
      limit: pagination.limit,
      q: searchTerm || undefined,
      searchType,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      sortBy,
      sortOrder
    })
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchNovels({
      page: newPage,
      limit: pagination.limit,
      q: searchTerm || undefined,
      searchType,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      sortBy,
      sortOrder
    })
  }

  // Handle novel click
  const handleNovelClick = (novel: NovelData) => {
    router.push(`/novel/${novel.id}`)
  }

  // Filter novels by tab
  const getFilteredNovels = () => {
    let list = novels
    if (selectedStatus === 'completed') {
      list = list.filter(n => n.is_end === true)
    } else if (selectedStatus === 'not_completed') {
      list = list.filter(n => n.is_end === false || n.is_end === undefined)
    }
    return list
  }

  const filteredNovels = getFilteredNovels()

  // Render loading state
  const renderLoadingState = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )

  // Render error state
  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="text-red-500 text-lg font-medium mb-2">
        เกิดข้อผิดพลาด
      </div>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button onClick={() => fetchNovels()} variant="outline">
        ลองใหม่อีกครั้ง
      </Button>
    </div>
  )

  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xl font-semibold">∞</div>
      <div className="text-lg font-medium mb-2">
        ไม่พบนิยายที่ค้นหา
      </div>
      <p className="text-muted-foreground mb-4">
        ลองเปลี่ยนคำค้นหาหรือเงื่อนไขการกรอง
      </p>
      <Button
        onClick={() => {
          setSearchTerm('')
          setSelectedCategory('all')
          setSelectedStatus('all')
          setSearchType('title')
          fetchNovels({ page: 1, limit: 12, searchType: 'title' })
        }}
        variant="outline"
      >
        ดูนิยายทั้งหมด
      </Button>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">ค้นหาและเรียกดูนิยาย</h1>
        <p className="text-muted-foreground">
          ค้นพบนิยายที่คุณชื่นชอบจากคลังนิยายมากมาย
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-backgroundCustom rounded-lg border p-6 space-y-4 shadow-sm">
        {/* Search Row */}
        <div className="flex  md:flex-row md:items-stretch gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  searchType === 'title'
                    ? 'ค้นหาชื่อเรื่อง...'
                    : searchType === 'penName'
                      ? 'ค้นหานามปากกา...'
                      : 'ค้นหาแท็ก...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
              
            </div>
            
          </div>
          <Button onClick={handleSearch} className="whitespace-nowrap self-start md:self-auto border">
            <Search className="h-4 w-4 mr-2" />
            ค้นหา
          </Button>
        </div>
        {/* Filters Row (wrap + scroll safe) */}
        <div className="-mx-2 md:mx-0">
          <div className="flex flex-row flex-wrap gap-3 px-2 overflow-x-auto no-scrollbar md:overflow-visible" style={{WebkitOverflowScrolling:'touch'}}>
            {/* Search Type */}
            <div className="flex-grow basis-[140px] sm:flex-none min-w-[140px]">
              <Select value={searchType} onValueChange={(value) => setSearchType(value as 'title' | 'penName' | 'tag')}>
                <SelectTrigger className="w-full bg-backgroundCustom shadow-sm">
                  <SelectValue placeholder="ค้นหาแบบ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">ค้นหาชื่อเรื่อง</SelectItem>
                  <SelectItem value="penName">ค้นหานามปากกา</SelectItem>
                  <SelectItem value="tag">ค้นหาแท็ก</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Category */}
            <div className="flex-grow basis-[150px] sm:flex-none min-w-[150px]">
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
                <SelectTrigger className="w-full bg-backgroundCustom shadow-sm">
                  <SelectValue placeholder="หมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                  <SelectItem value="romantic">โรแมนส์</SelectItem>
                  <SelectItem value="fantasy">แฟนตาซี</SelectItem>
                  <SelectItem value="action">แอคชั่น</SelectItem>
                  <SelectItem value="horror">สยองขวัญ</SelectItem>
                  <SelectItem value="drama">ดราม่า</SelectItem>
                  <SelectItem value="sci-fi">ไซไฟ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Status */}
            <div className="flex-grow basis-[140px] sm:flex-none min-w-[140px]">
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
                <SelectTrigger className="w-full bg-backgroundCustom shadow-sm">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกสถานะ</SelectItem>
                  <SelectItem value="completed">จบ</SelectItem>
                  <SelectItem value="not_completed">ยังไม่จบ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Sort By */}
            <div className="flex-grow basis-[150px] sm:flex-none min-w-[150px]">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full bg-backgroundCustom shadow-sm">
                  <SelectValue placeholder="เรียงตาม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chapters">จำนวนตอน</SelectItem>
                  <SelectItem value="title">ชื่อเรื่อง</SelectItem>
                  <SelectItem value="views">ยอดดู</SelectItem>
                  <SelectItem value="likes">ยอดไลค์</SelectItem>
                  <SelectItem value="rating">คะแนน</SelectItem>
                  <SelectItem value="publishedDate">วันที่อัพเดท</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Sort Order - แสดงเฉพาะเมื่อเลือกเรียงตามจำนวนตอน */}
            {sortBy === 'chapters' && (
              <div className="flex-grow basis-[160px] sm:flex-none min-w-[160px]">
                <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                  <SelectTrigger className="w-full bg-backgroundCustom shadow-sm">
                    <SelectValue placeholder="ลำดับ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">มาก → น้อย</SelectItem>
                    <SelectItem value="asc">น้อย → มาก</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Mode and Novel List */}
      <div className="space-y-6">
        <div className="hidden md:flex md:justify-end md:items-center">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading && renderLoadingState()}
        {error && !loading && renderErrorState()}
        {!loading && !error && filteredNovels.length === 0 && renderEmptyState()}
        {!loading && !error && filteredNovels.length > 0 && (
          <>
          <div>
            
          </div>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'space-y-4'}>
              {filteredNovels.map(novel => (
                <div
                  key={novel.id}
                  onClick={() => handleNovelClick(novel)}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${likedNovels.has(novel.id) ? 'ring-2 ring-red-200' : ''
                    }`}
                >
                  <CardNovel
                    story={novel}
                    size={viewMode === 'list' ? 'small' : 'large'}
                  />
                </div>
              ))}
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center ิbg- gap-4 pt-8">
                <Button
                  variant="default"
                  disabled={!pagination.hasPrev}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  หน้าก่อน
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={pagination.page === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="default"
                  disabled={!pagination.hasNext}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  
                >
                  หน้าถัดไป
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
