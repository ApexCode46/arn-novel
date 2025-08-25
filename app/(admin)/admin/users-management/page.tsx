
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trash2, Edit, Search, RefreshCw, Plus, Users } from 'lucide-react'
import { toast } from 'sonner'

interface User {
    id: string
    name: string
    email: string
    role: string
    image?: string
    created_at: string
    wallet?: {
        balance: number
    }
    _count?: {
        stories: number
        storyComments: number
        chapterComments: number
    }
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface Filters {
    search: string
    role: string
}

export default function ManageUsersPage() {
    const { data: session } = useSession()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })
    const [filters, setFilters] = useState<Filters>({
        search: '',
        role: 'all'
    })

    // ดึงข้อมูลผู้ใช้
    const fetchUsers = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                search: filters.search,
                role: filters.role === 'all' ? '' : filters.role
            })

            const response = await fetch(`/api/admin/users?${params}`)
            if (response.ok) {
                const data = await response.json()
                setUsers(data.users)
                setPagination(data.pagination)
            }
        } catch {
            toast.error('ไม่สามารถดึงข้อมูลผู้ใช้ได้')
        } finally {
            setLoading(false)
        }
    }, [pagination.page, pagination.limit, filters.search, filters.role])

    useEffect(() => {
        fetchUsers()
    }, [pagination.page, fetchUsers])

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

    // เริ่มแก้ไขผู้ใช้
    const startEdit = (user: User) => {
        setEditingUser(user)
        setIsDialogOpen(true)
    }

    // เริ่มสร้างผู้ใช้ใหม่
    const startCreate = () => {
        setEditingUser({
            name: '',
            email: '',
            role: 'user',
            image: ''
        })
        setIsDialogOpen(true)
    }

    // บันทึกผู้ใช้
    const saveUser = async () => {
        if (!editingUser) return

        if (!editingUser.email) {
            toast.error('กรุณาใส่อีเมล')
            return
        }

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingUser)
            })

            if (response.ok) {
                toast.success('บันทึกผู้ใช้เรียบร้อย')
                setEditingUser(null)
                setIsDialogOpen(false)
                fetchUsers()
            } else {
                const errorData = await response.json()
                toast.error(errorData.error || 'ไม่สามารถบันทึกผู้ใช้ได้')
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด')
            console.error('Error saving user:', error)
        }
    }

    // ลบผู้ใช้
    const deleteUser = async (userId: string) => {
        if (!confirm('คุณแน่ใจว่าต้องการลบผู้ใช้นี้?')) return

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                toast.success('ลบผู้ใช้เรียบร้อย')
                fetchUsers()
            } else {
                toast.error('ไม่สามารถลบผู้ใช้ได้')
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด')
            console.error('Error deleting user:', error)
        }
    }

    // ค้นหา
    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }))
        fetchUsers()
    }

    // เปลี่ยนหน้า
    const changePage = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }

    if (loading) {
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
                    <h1 className="text-2xl lg:text-3xl font-bold">จัดการผู้ใช้</h1>
                    <p className="text-muted-foreground text-sm lg:text-base">
                        จัดการข้อมูลผู้ใช้ในระบบ
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button onClick={fetchUsers} variant="default" className="w-full sm:w-auto">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        รีเฟรช
                    </Button>
                    <Button onClick={startCreate} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        เพิ่มผู้ใช้ใหม่
                    </Button>
                </div>
            </div>

            {/* ฟิลเตอร์และค้นหา */}
            <Card className='bg-backgroundCustom shadow-sm'>
                <CardContent className="py-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <Label htmlFor="search">ค้นหา</Label>
                            <Input
                                id="search"
                                placeholder="ชื่อหรืออีเมล"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <div className="w-full lg:w-48">
                            <Label htmlFor="role">บทบาท</Label>
                            <Select
                                value={filters.role}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, role: value === 'all' ? '' : value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกบทบาท" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทั้งหมด</SelectItem>
                                    <SelectItem value="user">ผู้ใช้ทั่วไป</SelectItem>
                                    <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleSearch} className="w-full lg:w-auto border">
                            <Search className="w-4 h-4 mr-2" />
                            ค้นหา
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog สำหรับแก้ไข/สร้างผู้ใช้ */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md mx-4 sm:mx-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser?.id ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
                        </DialogTitle>
                    </DialogHeader>

                    {editingUser && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">ชื่อ</Label>
                                <Input
                                    id="name"
                                    value={editingUser.name || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    placeholder="ชื่อผู้ใช้"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">อีเมล</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={editingUser.email || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    placeholder="user@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">บทบาท</Label>
                                <Select
                                    value={editingUser.role || 'user'}
                                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">ผู้ใช้ทั่วไป</SelectItem>
                                        <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 pt-4">
                                <Button onClick={saveUser} className="flex-1">
                                    บันทึก
                                </Button>
                                <Button variant="default" onClick={() => setIsDialogOpen(false)} className="flex-1">
                                    ยกเลิก
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ตารางผู้ใช้ */}
            <Card className='bg-backgroundCustom shadow-sm'>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                        <Users className="w-5 h-5" />
                        รายการผู้ใช้ ({pagination.total} คน)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[150px]">ชื่อ</TableHead>
                                    <TableHead className="min-w-[200px]">อีเมล</TableHead>
                                    <TableHead className="min-w-[120px]">บทบาท</TableHead>
                                    <TableHead className="min-w-[80px] text-right">เหรียญ</TableHead>
                                    <TableHead className="min-w-[60px] text-center">นิยาย</TableHead>
                                    <TableHead className="min-w-[120px]">วันที่สมัคร</TableHead>
                                    <TableHead className="min-w-[120px] text-center">การจัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {user.image && (
                                                    <Image
                                                        src={user.image}
                                                        alt={user.name}
                                                        width={32}
                                                        height={32}
                                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                    />
                                                )}
                                                <span className="truncate">{user.name || 'ไม่มีชื่อ'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="truncate block max-w-[180px]">{user.email}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                                                {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{user.wallet?.balance?.toLocaleString() || 0}</TableCell>
                                        <TableCell className="text-center">{user._count?.stories || 0}</TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {new Date(user.created_at).toLocaleDateString('th-TH')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 justify-center">
                                                <Button size="sm" onClick={() => startEdit(user)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => deleteUser(user.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
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
                                variant="outline"
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
                                variant="outline"
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

            {users.length === 0 && (
                <Card>
                    <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">ไม่พบผู้ใช้</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}