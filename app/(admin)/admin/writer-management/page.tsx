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
import { Eye, Check, X, Search, RefreshCw, FileText, User, Phone, Mail, CreditCard, Building2 } from 'lucide-react'
import { toast } from 'sonner'

interface WriterApplication {
    registerWriter_id: string
    realName: string
    numIdCard: string
    email: string
    phoneNumber: string
    numBank: string
    status: string
    IdCard: string
    SelfieWithIdCard: string
    BankAccount: string
    created_at: string
    user: {
        name: string
        email: string
    }
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export default function WriterApplicationsPage() {
    const { data: session, status } = useSession()
    const [applications, setApplications] = useState<WriterApplication[]>([])
    const [loading, setLoading] = useState(true)
    const [viewingApplication, setViewingApplication] = useState<WriterApplication | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })
    const [filters, setFilters] = useState({
        search: '',
        status: 'all'
    })

    const fetchApplications = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                search: filters.search,
                status: filters.status === 'all' ? '' : filters.status
            })

            const response = await fetch(`/api/admin/writer-applications?${params}`)
            if (response.ok) {
                const data = await response.json()
                setApplications(data.applications)
                setPagination(data.pagination)
            }
        } catch (error) {
            console.error('Error fetching applications:', error)
            toast.error('ไม่สามารถดึงข้อมูลคำขอสมัครได้')
        } finally {
            setLoading(false)
        }
    }, [pagination.page, pagination.limit, filters.search, filters.status])

    useEffect(() => {
        fetchApplications()
    }, [pagination.page, fetchApplications])

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="ml-2 text-lg">กำลังตรวจสอบการเข้าสู่ระบบ...</span>
            </div>
        )
    }

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="ml-2 text-lg">กำลังโหลดข้อมูลคำขอสมัครนักเขียน...</span>
            </div>
        )
    }

    const viewApplication = (application: WriterApplication) => {
        setViewingApplication(application)
        setIsDialogOpen(true)
    }

    const updateStatus = async (applicationId: string, status: string) => {
        try {
            const response = await fetch('/api/admin/writer-applications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId, status })
            })

            if (response.ok) {
                toast.success('อัปเดตสถานะเรียบร้อย')
                setIsDialogOpen(false)
                fetchApplications()
            } else {
                toast.error('ไม่สามารถอัปเดตสถานะได้')
            }
        } catch (error) {
            toast.error('เกิดข้อผิดพลาด')
            console.error('Error updating status:', error)
        }
    }

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }))
        fetchApplications()
    }

    const changePage = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary">รอการตรวจสอบ</Badge>
            case 'approved':
                return <Badge variant="default" className="bg-green-600">อนุมัติแล้ว</Badge>
            case 'rejected':
                return <Badge variant="destructive">ปฏิเสธ</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    function getStoryImage(src?: string | null): string {
        if (!src || src.trim() === "") return "/novelImg/Test-novel.png"; // fallback
        if (src.startsWith("http")) return src      // external
        if (src.startsWith("/uploads")) return `/api${src}` // local uploads
        return `/api/uploads/${src.replace(/^\/+/, "")}`
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
                    <h1 className="text-2xl lg:text-3xl font-bold">คำขอสมัครนักเขียน</h1>
                    <p className="text-muted-foreground text-sm lg:text-base">
                        จัดการคำขอสมัครเป็นนักเขียนในระบบ
                    </p>
                </div>
                <Button onClick={fetchApplications} variant="default" className="w-full sm:w-auto">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    รีเฟรช
                </Button>
            </div>

            {/* ฟิลเตอร์และค้นหา */}
            <Card className='bg-backgroundCustom shadow-sm'>
                <CardContent className="py-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <Label htmlFor="search">ค้นหา</Label>
                            <Input
                                id="search"
                                placeholder="ชื่อ อีเมล หรือเบอร์โทร"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                        <div className="w-full lg:w-48">
                            <Label htmlFor="status">สถานะ</Label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกสถานะ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทั้งหมด</SelectItem>
                                    <SelectItem value="pending">รอการตรวจสอบ</SelectItem>
                                    <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                                    <SelectItem value="rejected">ปฏิเสธ</SelectItem>
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

            {/* ตารางคำขอสมัคร */}
            <Card className='bg-backgroundCustom shadow-sm'>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                        <FileText className="w-5 h-5" />
                        รายการคำขอสมัคร ({pagination.total} รายการ)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[150px]">ชื่อ-นามสกุล</TableHead>
                                    <TableHead className="min-w-[200px]">อีเมล</TableHead>
                                    <TableHead className="min-w-[120px]">เบอร์โทร</TableHead>
                                    <TableHead className="min-w-[120px]">สถานะ</TableHead>
                                    <TableHead className="min-w-[120px]">วันที่สมัคร</TableHead>
                                    <TableHead className="min-w-[100px] text-center">การจัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app.registerWriter_id}>
                                        <TableCell className="font-medium">
                                            <span className="truncate block max-w-[140px]">{app.realName}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="truncate block max-w-[180px]">{app.email}</span>
                                        </TableCell>
                                        <TableCell>{app.phoneNumber}</TableCell>
                                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {new Date(app.created_at).toLocaleDateString('th-TH')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" onClick={() => viewApplication(app)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
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

            {/* Dialog สำหรับดูรายละเอียด */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>รายละเอียดคำขอสมัครนักเขียน</DialogTitle>
                    </DialogHeader>

                    {viewingApplication && (
                        <div className="space-y-6 py-4">
                            {/* ข้อมูลส่วนตัว */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        ชื่อ-นามสกุลจริง
                                    </Label>
                                    <p className="text-sm font-medium">{viewingApplication.realName}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        เลขบัตรประชาชน
                                    </Label>
                                    <p className="text-sm font-medium">{viewingApplication.numIdCard}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        อีเมล
                                    </Label>
                                    <p className="text-sm font-medium">{viewingApplication.email}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        เบอร์โทรศัพท์
                                    </Label>
                                    <p className="text-sm font-medium">{viewingApplication.phoneNumber}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        เลขบัญชีธนาคาร
                                    </Label>
                                    <p className="text-sm font-medium">{viewingApplication.numBank}</p>
                                </div>

                                <div className="space-y-2">
                                    <Label>สถานะปัจจุบัน</Label>
                                    <div>{getStatusBadge(viewingApplication.status)}</div>
                                </div>
                            </div>

                            {/* รูปภาพเอกสาร */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">เอกสารประกอบ</h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>รูปบัตรประชาชน</Label>
                                        <Image
                                            src={getStoryImage(viewingApplication.IdCard)}
                                            alt="บัตรประชาชน"
                                            width={400}
                                            height={250}
                                            className="w-full max-w-md h-auto object-contain border rounded cursor-pointer hover:shadow-lg transition-shadow"
                                            onClick={() => window.open(viewingApplication.IdCard, '_blank')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>รูปเซลฟี่กับบัตรประชาชน</Label>
                                        <Image
                                            src={getStoryImage(viewingApplication.SelfieWithIdCard)}
                                            alt="เซลฟี่กับบัตรประชาชน"
                                            width={400}
                                            height={250}
                                            className="w-full max-w-md h-auto object-contain border rounded cursor-pointer hover:shadow-lg transition-shadow"
                                            onClick={() => window.open(viewingApplication.SelfieWithIdCard, '_blank')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>รูปหน้าแรกสมุดบัญชี</Label>
                                        <Image
                                            src={getStoryImage(viewingApplication.BankAccount)}
                                            alt="สมุดบัญชีธนาคาร"
                                            width={400}
                                            height={250}
                                            className="w-full max-w-md h-auto object-contain border rounded cursor-pointer hover:shadow-lg transition-shadow"
                                            onClick={() => window.open(viewingApplication.BankAccount, '_blank')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ปุ่มอนุมัติ/ปฏิเสธ */}
                            {viewingApplication.status === 'pending' && (
                                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                                    <Button
                                        onClick={() => updateStatus(viewingApplication.registerWriter_id, 'approved')}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        อนุมัติ
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => updateStatus(viewingApplication.registerWriter_id, 'rejected')}
                                        className="flex-1"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        ปฏิเสธ
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {applications.length === 0 && (
                <Card>
                    <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">ไม่พบคำขอสมัคร</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
