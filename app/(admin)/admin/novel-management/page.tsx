
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
    Search,
    RefreshCw,
    Eye,
    EyeOff,
    BookOpen,
    Heart,
    Users,
    FileText,
    AlertTriangle,
    Ban,
    CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Story {
    story_id: string
    title: string
    category: string
    status: string
    views: number
    created_at: string
    penName: string
    admin_hidden: boolean
    admin_hide_reason: string | null
    user: {
        name: string
        email: string
    }
    chapter: Array<{
        chapter_id: string
        title: string
        is_hidden: boolean
        admin_hidden: boolean
        status: string
        views: number
    }>
    _count: {
        chapter: number
        favorite: number
        follow: number
    }
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export default function NovelManagementPage() {
    const { data: session } = useSession()
    const [stories, setStories] = useState<Story[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [selectedStory, setSelectedStory] = useState<Story | null>(null)
    const [selectedChapter, setSelectedChapter] = useState<{ chapter_id: string; title: string; is_hidden: boolean; admin_hidden: boolean; status: string; views: number } | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [actionType, setActionType] = useState<'hide' | 'show'>('hide')
    const [reason, setReason] = useState('')
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })
    const [filters, setFilters] = useState({
        search: '',
        category: 'all',
        status: 'all'
    })

    const fetchStories = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                search: filters.search,
                category: filters.category === 'all' ? '' : filters.category,
                status: filters.status === 'all' ? '' : filters.status
            })

            const response = await fetch(`/api/admin/novel-management?${params}`)
            if (response.ok) {
                const data = await response.json()
                setStories(data.stories)
                setPagination(data.pagination)
            } else {
                toast.error('ไม่สามารถดึงข้อมูลได้')
            }
        } catch {
            toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ')
        } finally {
            setLoading(false)
        }
    }, [pagination.page, pagination.limit, filters.search, filters.category, filters.status])

    useEffect(() => {
        if (session?.user) {
            fetchStories()
        }
    }, [session, pagination.page, fetchStories])

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }))
        fetchStories()
    }

    const changePage = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }

    const openActionDialog = (story: Story, chapter: { chapter_id: string; title: string; is_hidden: boolean; admin_hidden: boolean; status: string; views: number } | null = null, action: 'hide' | 'show') => {
        setSelectedStory(story)
        setSelectedChapter(chapter)
        setActionType(action)
        setReason('')
        setIsDialogOpen(true)
    }

    const handleAction = async () => {
        if (!reason.trim()) {
            toast.error('กรุณาระบุเหตุผล')
            return
        }

        setActionLoading(true)
        try {
            const response = await fetch('/api/admin/novel-management', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: selectedChapter ? 'chapter' : 'story',
                    id: selectedChapter ? selectedChapter.chapter_id : selectedStory?.story_id,
                    action: actionType,
                    reason: reason.trim()
                })
            })

            if (response.ok) {
                const data = await response.json()
                toast.success(data.message)
                setIsDialogOpen(false)
                fetchStories()
            } else {
                const errorData = await response.json()
                toast.error(errorData.error || 'เกิดข้อผิดพลาด')
            }
        } catch (error) {
            console.log('Error performing action:', error)
            toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ')
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusBadge = (status: string, adminHidden?: boolean) => {
        if (adminHidden) {
            return (
                <Badge variant="destructive" className="bg-red-600">
                    <EyeOff className="w-3 h-3 mr-1" />
                    ระงับโดย Admin
                </Badge>
            )
        }

        const statusConfig = {
            published: { variant: 'default', className: 'bg-green-600', label: 'เผยแพร่', icon: CheckCircle },
            draft: { variant: 'secondary', className: '', label: 'ร่าง', icon: FileText },
            hidden: { variant: 'destructive', className: '', label: 'ซ่อน', icon: EyeOff }
        }
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
        const Icon = config.icon
        return (
            <Badge variant={config.variant as 'default' | 'secondary' | 'destructive' | 'outline'} className={config.className}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </Badge>
        )
    }

    const categories = [
        'แฟนตาซี', 'โรแมนติก', 'สยองขวัญ', 'ระทึกขวัญ',
        'ดราม่า', 'ตลก', 'ไซไฟ', 'แอคชั่น', 'ผจญภัย', 'อื่นๆ'
    ]

    if (!session?.user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card>
                    <CardContent className="py-8 px-6 text-center">
                        <p className="text-lg mb-4">กรุณาเข้าสู่ระบบ</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (loading && stories.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-4 lg:py-6 space-y-4 lg:space-y-6 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
                        จัดการนิยาย
                    </h1>
                    <p className="text-muted-foreground text-sm lg:text-base">
                        จัดการ ซ่อน และควบคุมนิยายในระบบ
                    </p>
                </div>
                <Button onClick={fetchStories} variant="default" className="w-full  sm:w-auto">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    รีเฟรช
                </Button>
            </div>

            {/* ฟิลเตอร์และค้นหา */}
            <Card className='bg-backgroundCustom shadow-sm'>
                <CardContent className="py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
                        <div className="lg:col-span-2">
                            <Label htmlFor="search">ค้นหา</Label>
                            <Input
                                id="search"
                                placeholder="ชื่อเรื่อง นักเขียน หรือนามปากกา"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="category">หมวดหมู่</Label>
                            <Select
                                value={filters.category}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทั้งหมด</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="status">สถานะ</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทั้งหมด</SelectItem>
                                    <SelectItem value="published">เผยแพร่</SelectItem>
                                    <SelectItem value="draft">ร่าง</SelectItem>
                                    <SelectItem value="hidden">ซ่อน</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={handleSearch} className="w-full border">
                            <Search className="w-4 h-4 mr-2" />
                            ค้นหา
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ตารางนิยาย */}
            <Card className='bg-backgroundCustom shadow-sm'>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                        <FileText className="w-5 h-5" />
                        รายการนิยาย ({pagination.total} เรื่อง)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[250px]">ชื่อเรื่อง</TableHead>
                                    <TableHead className="min-w-[150px]">นักเขียน</TableHead>
                                    <TableHead className="min-w-[100px]">หมวดหมู่</TableHead>
                                    <TableHead className="min-w-[100px]">สถานะ</TableHead>
                                    <TableHead className="min-w-[80px]">ตอน</TableHead>
                                    <TableHead className="min-w-[80px]">ยอดชม</TableHead>
                                    <TableHead className="min-w-[100px]">วันที่สร้าง</TableHead>
                                    <TableHead className="min-w-[150px] text-center">การจัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stories.map((story) => (
                                    <TableRow key={story.story_id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{story.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    นามปากกา: {story.penName}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Heart className="w-3 h-3" />
                                                    {story._count.favorite}
                                                    <Users className="w-3 h-3 ml-2" />
                                                    {story._count.follow}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{story.user.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {story.user.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{story.category}</Badge>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(story.status, story.admin_hidden)}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="space-y-1">
                                                <div className="font-medium">{story._count.chapter}</div>
                                                {story.chapter.some(ch => ch.is_hidden || ch.admin_hidden) && (
                                                    <div className="text-xs text-red-600">
                                                        {story.chapter.filter(ch => ch.is_hidden || ch.admin_hidden).length} ซ่อน
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-medium">
                                            {story.views.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {new Date(story.created_at).toLocaleDateString('th-TH')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 justify-center">
                                                {!story.admin_hidden ? (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => openActionDialog(story, null, 'hide')}
                                                    >
                                                        <EyeOff className="w-3 h-3 mr-1" />
                                                        ซ่อน
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => openActionDialog(story, null, 'show')}
                                                    >
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        แสดง
                                                    </Button>
                                                )}

                                                {story.chapter.length > 0 && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button size="sm" variant="outline">
                                                                <FileText className="w-3 h-3 mr-1" />
                                                                ตอน
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle>จัดการตอน - {story.title}</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-3">
                                                                {story.chapter.map((chapter) => (
                                                                    <div key={chapter.chapter_id} className="flex items-center justify-between p-3 border rounded">
                                                                        <div className="flex-1">
                                                                            <div className="font-medium">{chapter.title}</div>
                                                                            <div className="text-sm text-muted-foreground">
                                                                                ยอดชม: {chapter.views.toLocaleString()}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            {chapter.admin_hidden ? (
                                                                                <Badge variant="destructive" className="bg-red-600">ระงับโดย Admin</Badge>
                                                                            ) : chapter.is_hidden ? (
                                                                                <Badge variant="destructive">ซ่อน</Badge>
                                                                            ) : (
                                                                                <Badge variant="default" className="bg-green-600">แสดง</Badge>
                                                                            )}

                                                                            {!chapter.admin_hidden ? (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="destructive"
                                                                                    onClick={() => openActionDialog(story, chapter, 'hide')}
                                                                                >
                                                                                    <EyeOff className="w-3 h-3" />
                                                                                </Button>
                                                                            ) : (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="default"
                                                                                    className="bg-green-600 hover:bg-green-700"
                                                                                    onClick={() => openActionDialog(story, chapter, 'show')}
                                                                                >
                                                                                    <Eye className="w-3 h-3" />
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => changePage(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="w-full sm:w-auto"
                            >
                                ก่อนหน้า
                            </Button>
                            <span className="flex items-center px-4 text-sm lg:text-base">
                                หน้า {pagination.page} จาก {pagination.totalPages}
                            </span>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => changePage(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="w-full sm:w-auto"
                            >
                                ถัดไป
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog สำหรับการดำเนินการ */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            ยืนยันการดำเนินการ
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm">
                                <strong>
                                    {actionType === 'hide' ? 'ซ่อน' : 'แสดง'}
                                    {selectedChapter ? 'ตอน' : 'นิยาย'}:
                                </strong>{' '}
                                {selectedChapter
                                    ? `${selectedStory?.title} - ${selectedChapter?.title}`
                                    : selectedStory?.title
                                }
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                                การดำเนินการนี้จะส่งการแจ้งเตือนไปยังนักเขียน และนักเขียนไม่สามารถเปลี่ยนแปลงได้เอง
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">เหตุผลในการดำเนินการ *</Label>
                            <Textarea
                                id="reason"
                                placeholder="กรุณาระบุเหตุผลที่ชัดเจน เช่น เนื้อหาไม่เหมาะสม, ละเมิดกฎข้อบังคับ, ฯลฯ"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="default"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={actionLoading}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                variant={actionType === 'hide' ? 'destructive' : 'default'}
                                onClick={handleAction}
                                disabled={actionLoading || !reason.trim()}
                                className={actionType === 'show' ? 'bg-green-600 hover:bg-green-700' : ''}
                            >
                                {actionLoading ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : actionType === 'hide' ? (
                                    <Ban className="w-4 h-4 mr-2" />
                                ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                )}
                                {actionType === 'hide' ? 'ซ่อน' : 'แสดง'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {stories.length === 0 && !loading && (
                <Card className='bg-backgroundCustom shadow-sm'>
                    <CardContent className="py-8 text-center">
                        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">ไม่พบนิยายในระบบ</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}