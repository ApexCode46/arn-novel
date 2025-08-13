"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MessageSquare, Heart, UserPlus, RefreshCw } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

interface WriterStoryStat {
  id: string
  title: string
  views: number
  comments: number
  likes: number
  followers: number
  updatedAt: string
  chapters?: WriterChapterStat[]
}

interface WriterChapterStat {
  id: string
  storyId: string
  chapter: number
  title: string
  reads: number
  comments: number
  coinsMonth: number
  coinsTotal: number
}

interface DashboardData {
  stories: WriterStoryStat[]
  monthlyRevenue: { month: string; coins: number }[]
  currentMonthEarnings: number
}

export default function Page() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [stories, setStories] = useState<WriterStoryStat[]>([])
  const [selectedStory, setSelectedStory] = useState<string>("all")
  // Fixed timeframe (formerly selectable) -- default 30d
  const timeframe = "30d"
  const [loading, setLoading] = useState<boolean>(false)
  const [refreshTs, setRefreshTs] = useState<number>(Date.now())
  const [chapters, setChapters] = useState<WriterChapterStat[]>([])
  const [chapterQuery, setChapterQuery] = useState<string>("")
  const [chapterPage, setChapterPage] = useState<number>(1)
  const [chapterPageSize, setChapterPageSize] = useState<number>(10)

  // ดึงข้อมูลจาก API (memoized เพื่อลด warning dependency และป้องกัน re-render loop)
  const fetchDashboardData = useCallback(async () => {
    if (!session?.user?.email) return

    setLoading(true)
    try {
      // Get user ID from email first
      const userResponse = await fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`)
      if (!userResponse.ok) throw new Error("Failed to fetch user data")
      const userData = await userResponse.json()

      const params = new URLSearchParams({
        userId: userData.user_id || userData.id,
        timeframe, // fixed value
        ...(selectedStory !== "all" ? { storyId: selectedStory } : {})
      })

      const response = await fetch(`/api/writer/dashboard?${params}`)
      if (!response.ok) throw new Error("Failed to fetch dashboard data")

      const data: DashboardData = await response.json()
      setDashboardData(data)
      if (selectedStory === "all") {
        setStories(data.stories)
      } else {
        setStories(prev => {
          if (!prev.length) return data.stories // กรณีโหลดครั้งแรก safety
          const map = new Map(prev.map(s => [s.id, s]))
          ;(data.stories || []).forEach(s => map.set(s.id, s))
          return Array.from(map.values())
        })
      }

      // Flatten all chapters from all stories
      const allChapters = data.stories.flatMap(story => story.chapters || [])
      setChapters(allChapters)

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setDashboardData({ stories: [], monthlyRevenue: [], currentMonthEarnings: 0 })
      setStories([])
      setChapters([])
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email, selectedStory])

  useEffect(() => {
    if (session?.user?.email) {
      fetchDashboardData()
    }
  }, [session?.user?.email, refreshTs, fetchDashboardData])

  // รีเซ็ตหน้าปัจจุบันเมื่อเปลี่ยนเรื่องหรือ query
  useEffect(() => {
    setChapterPage(1)
  }, [selectedStory, chapterQuery])

  // รวมสถิติทั้งหมดหรือของเรื่องเดียว
  type AggregateStats = { views: number; comments: number; likes: number; followers: number }
  const aggregate = useMemo<AggregateStats>(() => {
    const list = selectedStory === "all" ? stories : stories.filter(s => s.id === selectedStory)
    return list.reduce<AggregateStats>((acc, cur) => ({
      views: acc.views + cur.views,
      comments: acc.comments + cur.comments,
      likes: acc.likes + cur.likes,
      followers: acc.followers + cur.followers,
    }), { views: 0, comments: 0, likes: 0, followers: 0 })
  }, [stories, selectedStory])

  // สร้างข้อมูลรายได้จากข้อมูล API หรือ fallback เป็น mock
  const revenueData = useMemo(() => {
    if (dashboardData?.monthlyRevenue && dashboardData.monthlyRevenue.length > 0) {
      const monthsInOrder = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
      // กรณี API ส่ง 12 เดือนย้อนหลังที่ข้ามปี ให้เรียงตามปฏิทิน 1-12
      const sorted = [...dashboardData.monthlyRevenue]
        .filter(item => monthsInOrder.includes(item.month))
        .sort((a,b) => monthsInOrder.indexOf(a.month) - monthsInOrder.indexOf(b.month))
      // หากต้องการให้แสดงครบทุกเดือนของปีปัจจุบันแม้ไม่มีข้อมูล เติม 0
      if (sorted.length < 12) {
        const existing = new Set(sorted.map(m => m.month))
        monthsInOrder.forEach(m => {
          if (!existing.has(m)) sorted.push({ month: m, coins: 0 })
        })
        // ต้องเรียงใหม่หลัง push
        sorted.sort((a,b) => monthsInOrder.indexOf(a.month) - monthsInOrder.indexOf(b.month))
      }
      return sorted
    }
    
    // Fallback mock data if no real data available - แสดงตามปีปฏิทิน
    const baseSeed = aggregate.views + aggregate.likes * 7 + aggregate.comments * 3 + refreshTs // เพิ่ม refreshTs
    
    // แสดง 12 เดือนของปีปัจจุบัน (ม.ค. - ธ.ค.) - force new data
    const monthsInOrder = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
    
    // pseudo-random deterministic using seed
    function prng(i: number) {
      const x = Math.sin(baseSeed + i * 97) * 10000
      return x - Math.floor(x)
    }
    
    return monthsInOrder.map((monthName: string, index: number) => {
      const factor = 0.6 + prng(index) * 0.8 // 0.6 - 1.4
      const coins = Math.round((aggregate.views || 1000) * 0.02 * factor + (aggregate.likes || 100) * 0.3 * factor)
      return { month: monthName, coins }
    })
  }, [dashboardData?.monthlyRevenue, aggregate.views, aggregate.likes, aggregate.comments, refreshTs])

  // Show loading if no session
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  // (เดิมมีฟังก์ชัน fakeGrowth แต่ไม่ถูกใช้งานจริง ลบออกเพื่อลด warning)

  const statsConfig = [
    { key: "views", label: "การรับชม", icon: Eye, color: "text-emerald-500" },
    { key: "comments", label: "ความคิดเห็น", icon: MessageSquare, color: "text-sky-500" },
    { key: "likes", label: "ถูกใจ", icon: Heart, color: "text-rose-500" },
    { key: "followers", label: "ติดตาม", icon: UserPlus, color: "text-indigo-500" },
  ] as const

  const revenueChartConfig = {
    coins: { label: "รายได้ (Coins)", color: "hsl(var(--primary))" },
  }

  return (
    <div className="space-y-6 mb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">สรุปภาพรวม</h3>
          <p className="text-muted-foreground text-sm">แดชบอร์ดข้อมูลสถิตินักเขียน</p>
        </div>
  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select value={selectedStory} onValueChange={setSelectedStory}>
            <SelectTrigger className="w-full min-w-[180px] bg-backgroundCustom shadow-sm">
              <SelectValue placeholder="เลือกเรื่อง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกเรื่อง</SelectItem>
              {stories.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => setRefreshTs(Date.now())}
            className="inline-flex items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm font-medium bg-backgroundCustom hover:bg-accent transition-colors shadow-sm"
          >
            <RefreshCw className="h-4 w-4" /> รีเฟรช
          </button>
        </div>
      </div>

      {/* แถวการ์ดสถิติ */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsConfig.map(stat => {
          const value = aggregate[stat.key as keyof AggregateStats]
          return (
            <Card key={stat.key} className="relative overflow-hidden bg-backgroundCustom shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} /> {stat.label}
                </CardTitle>
                {/* timeframe label removed */}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold tabular-nums">{loading ? <span className="animate-pulse text-muted-foreground">•••</span> : value.toLocaleString()}</div>
              </CardContent>
              <div className="pointer-events-none absolute inset-x-0 -bottom-6 h-20 bg-gradient-to-t from-primary/5 to-transparent" />
            </Card>
          )
        })}
      </div>

      {/* พื้นที่กราฟ (Placeholder) */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 h-[320px] flex flex-col bg-backgroundCustom shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out overflow-hidden relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">รายได้ 12 เดือนล่าสุด</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm animate-pulse">กำลังโหลดกราฟ...</div>
            ) : (
              <div className="w-full h-full overflow-x-auto pb-2 scrollbar-thin">
                {/* กว้างคำนวณตามจำนวนเดือน (barSize 34 + gap ~18) เพื่อเลื่อนภายใน ไม่ให้ทะลุการ์ดบนจอเล็ก */}
                <div className="h-full md:w-full" style={{ width: `calc(${/* months */revenueData.length} * 52px + 32px)` }}>
                  <ChartContainer config={revenueChartConfig} className="h-full w-full aspect-auto">
                    <BarChart data={revenueData} margin={{ left: 8, right: 8, top: 8, bottom: 4 }} barCategoryGap={10}>
                      <defs>
                        <linearGradient id="coinsBar" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.95} />
                          <stop offset="70%" stopColor="#38bdf8" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis width={56} tickFormatter={(v: number) => v.toLocaleString()} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
                      <Bar dataKey="coins" fill="url(#coinsBar)" stroke="#0ea5e9" strokeWidth={1.5} radius={[6, 6, 0, 0]} barSize={34} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="h-[320px] flex flex-col bg-backgroundCustom shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">สถิติของแต่ละเรื่อง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 overflow-auto text-sm pr-1">
            {stories.map(s => (
              <div key={s.id} className="p-3 rounded-md border bg-background/40 flex flex-col gap-1">
                <div className="font-medium truncate">{s.title}</div>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1"><Eye size={16} className="text-emerald-500" /> {s.views.toLocaleString()}</span>
                  <span className="inline-flex items-center gap-1"><MessageSquare size={16} className="text-sky-500" /> {s.comments.toLocaleString()}</span>
                  <span className="inline-flex items-center gap-1"><Heart size={16} className="text-rose-500" /> {s.likes.toLocaleString()}</span>
                  <span className="inline-flex items-center gap-1"><UserPlus size={16} className="text-indigo-500" /> {s.followers.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {!stories.length && !loading && (
              <div className="text-muted-foreground text-center py-8 text-xs">ไม่มีข้อมูล</div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between items-center text-center bg-backgroundCustom mt-2 md:mt-4 p-2 md:p-4 border rounded-xl shadow-sm">
        <span className="font-bold md:text-xl">
          รายได้ทั้งหมดของเดือนนี้:
        </span>
        <span className="font-bold md:text-xl">
          {loading ? <span className="animate-pulse text-muted-foreground">•••</span> : (dashboardData?.currentMonthEarnings || 0).toLocaleString()} coins
        </span>
      </div>

      {/* ตารางสถิติตอน: แสดงเมื่อเลือกเรื่องเดียว */}
      {selectedStory !== 'all' && (
        <Card className="shadow-sm bg-backgroundCustom hover:shadow-md transition-shadow duration-300 ease-in-out">
          <CardHeader className="pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 m-0">สถิติของแต่ละตอน</CardTitle>
            <div className="w-full md:w-64">
              <Input
                value={chapterQuery}
                onChange={e => setChapterQuery(e.target.value)}
                placeholder="ค้นหาชื่อตอน / หมายเลขตอน"
                className="h-9"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {(() => {
              const base = chapters.filter(c => c.storyId === selectedStory)
              const filtered = base.filter(c => {
                if (!chapterQuery.trim()) return true
                const q = chapterQuery.toLowerCase()
                return c.title.toLowerCase().includes(q) || String(c.chapter).includes(q)
              })
              const pageSize = chapterPageSize
              const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
              const safePage = Math.min(chapterPage, totalPages)
              const start = (safePage - 1) * pageSize
              const pageItems = filtered.slice(start, start + pageSize)
              return (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">ตอนที่</TableHead>
                        <TableHead className="min-w-[140px]">ชื่อตอน</TableHead>
                        <TableHead>อ่าน</TableHead>
                        <TableHead>คอมเม้น</TableHead>
                        <TableHead>ขายได้เดือนนี้ (coins)</TableHead>
                        <TableHead>ขายได้ทั้งหมด (coins)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">กำลังโหลด...</TableCell>
                        </TableRow>
                      )}
                      {!loading && pageItems.map(ch => (
                        <TableRow key={ch.id}>
                          <TableCell>{ch.chapter}</TableCell>
                          <TableCell className="truncate max-w-[180px]">{ch.title}</TableCell>
                          <TableCell>{ch.reads.toLocaleString()}</TableCell>
                          <TableCell>{ch.comments.toLocaleString()}</TableCell>
                          <TableCell>{ch.coinsMonth.toLocaleString()}</TableCell>
                          <TableCell>{ch.coinsTotal.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      {!loading && !pageItems.length && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">ไม่พบข้อมูล</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    <TableCaption>ทั้งหมด {filtered.length} ตอน • หน้า {safePage}/{totalPages}</TableCaption>
                  </Table>
                  <div className="flex items-center justify-between gap-3 flex-wrap text-xs mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">แสดง {start + 1}-{start + pageItems.length} จาก {filtered.length}</span>
                      <select
                        className="h-7 rounded border bg-background px-1.5"
                        value={chapterPageSize}
                        onChange={(e) => { setChapterPageSize(Number(e.target.value)); setChapterPage(1) }}
                      >
                        {[10, 20, 30, 50].map(size => <option key={size} value={size}>{size}/หน้า</option>)}
                      </select>
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          disabled={safePage === 1}
                          onClick={() => setChapterPage(1)}
                          className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-accent"
                        >«</button>
                        <button
                          disabled={safePage === 1}
                          onClick={() => setChapterPage(p => Math.max(1, p - 1))}
                          className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-accent"
                        >ก่อนหน้า</button>
                        {Array.from({ length: totalPages <= 5 ? totalPages : 5 }).map((_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) pageNum = i + 1
                          else {
                            const windowStart = Math.min(Math.max(1, safePage - 2), totalPages - 4)
                            pageNum = windowStart + i
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setChapterPage(pageNum)}
                              className={`px-2 py-1 rounded border ${pageNum === safePage ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'}`}
                            >{pageNum}</button>
                          )
                        })}
                        <button
                          disabled={safePage === totalPages}
                          onClick={() => setChapterPage(p => Math.min(totalPages, p + 1))}
                          className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-accent"
                        >ถัดไป</button>
                        <button
                          disabled={safePage === totalPages}
                          onClick={() => setChapterPage(totalPages)}
                          className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-accent"
                        >»</button>
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
