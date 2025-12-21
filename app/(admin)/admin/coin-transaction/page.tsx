
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, RefreshCw, Coins, TrendingUp, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

interface Transaction {
    transaction_id: string
    amount: number
    type: string
    payment_status: string
    payment_method?: string
    notes?: string
    currency: string
    created_at: string
    wallet: {
        user: {
            name: string
            email: string
        }
    }
    coinPackage?: {
        name: string
        amount: number
        price: number
    }
    story?: {
        title: string
    }
    chapter?: {
        title: string
    }
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface Stats {
    byType: Array<{
        type: string
        _sum: { amount: number }
        _count: { transaction_id: number }
    }>
    totalRevenue: number
}

export default function CoinTransactionPage() {
    const { data: session, status } = useSession()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<Stats | null>(null)
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    })
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        status: 'all',
        startDate: '',
        endDate: ''
    })

    const fetchTransactions = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                search: filters.search,
                type: filters.type === 'all' ? '' : filters.type,
                status: filters.status === 'all' ? '' : filters.status,
                startDate: filters.startDate,
                endDate: filters.endDate
            })

            const response = await fetch(`/api/admin/transactions?${params}`)
            if (response.ok) {
                const data = await response.json()
                setTransactions(data.transactions)
                setPagination(data.pagination)
                setStats(data.stats)
            } else {
                toast.error('ไม่สามารถดึงข้อมูลได้')
            }
        } catch (error) {
            console.log('Error fetching transactions:', error)
            toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ')
        } finally {
            setLoading(false)
        }
    }, [pagination.page, pagination.limit, filters.search, filters.type, filters.status, filters.startDate, filters.endDate])

    useEffect(() => {
        if (session?.user) {
            fetchTransactions()
        }
    }, [session, pagination.page, fetchTransactions])

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, page: 1 }))
        fetchTransactions()
    }

    const changePage = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            SUCCESS: { variant: 'default', className: 'bg-green-600', label: 'สำเร็จ' },
            PENDING: { variant: 'secondary', className: '', label: 'รอดำเนินการ' },
            PROCESSING: { variant: 'default', className: 'bg-blue-600', label: 'กำลังดำเนินการ' },
            FAILED: { variant: 'destructive', className: '', label: 'ล้มเหลว' },
            CANCELLED: { variant: 'outline', className: '', label: 'ยกเลิก' },
            REFUNDED: { variant: 'default', className: 'bg-orange-600', label: 'คืนเงิน' }
        }
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
        return <Badge variant={config.variant as 'default' | 'secondary' | 'destructive' | 'outline'} className={config.className}>{config.label}</Badge>
    }

    const getTypeBadge = (type: string) => {
        const typeConfig = {
            TOPUP: { variant: 'default', className: 'bg-green-600', label: 'เติมเงิน' },
            PURCHASE: { variant: 'default', className: 'bg-blue-600', label: 'ซื้อ' },
            REFUND: { variant: 'default', className: 'bg-orange-600', label: 'คืนเงิน' },
            BONUS: { variant: 'default', className: 'bg-purple-600', label: 'โบนัส' }
        }
        const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.TOPUP
        return <Badge variant={config.variant as 'default' | 'secondary' | 'destructive' | 'outline'} className={config.className}>{config.label}</Badge>
    }

    const formatAmount = (amount: number, currency: string = 'THB') => {
        if (currency === 'THB') {
            return `฿${amount.toLocaleString()}`
        }
        return `${amount.toLocaleString()} เหรียญ`
    }

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

    if (loading && transactions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="ml-2 text-lg">กำลังโหลดข้อมูลธุรกรรม...</span>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-4 lg:py-6 space-y-4 lg:space-y-6 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
                        ประวัติการเติมเงิน
                    </h1>
                    <p className="text-muted-foreground text-sm lg:text-base">
                        จัดการและติดตามการเติมเงินของผู้ใช้งาน
                    </p>
                </div>
                <Button onClick={fetchTransactions} variant="default" className="w-full sm:w-auto">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    รีเฟรช
                </Button>
            </div>

            {/* สถิติ */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className='bg-backgroundCustom'>
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">รายได้รวม</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatAmount(stats.totalRevenue)}
                                    </p>
                                </div>
                                <DollarSign className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='bg-backgroundCustom'>
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">รายการทั้งหมด</p>
                                    <p className="text-2xl font-bold">
                                        {pagination.total.toLocaleString()}
                                    </p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    {stats.byType.map((stat) => (
                        <Card key={stat.type} className='bg-backgroundCustom'>
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {getTypeBadge(stat.type).props.children}
                                        </p>
                                        <p className="text-xl font-bold">
                                            {stat._count.transaction_id.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatAmount(stat._sum.amount || 0)}
                                        </p>
                                    </div>
                                    <Coins className="w-8 h-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ฟิลเตอร์และค้นหา */}
            <Card className='bg-backgroundCustom'>
                <CardContent className="py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
                        <div className="lg:col-span-2">
                            <Label htmlFor="search">ค้นหา</Label>
                            <Input
                                id="search"
                                placeholder="ชื่อผู้ใช้ อีเมล หรือหมายเหตุ"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="type">ประเภท</Label>
                            <Select
                                value={filters.type}
                                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทั้งหมด</SelectItem>
                                    <SelectItem value="TOPUP">เติมเงิน</SelectItem>
                                    <SelectItem value="PURCHASE">ซื้อ</SelectItem>
                                    <SelectItem value="REFUND">คืนเงิน</SelectItem>
                                    <SelectItem value="BONUS">โบนัส</SelectItem>
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
                                    <SelectItem value="SUCCESS">สำเร็จ</SelectItem>
                                    <SelectItem value="PENDING">รอดำเนินการ</SelectItem>
                                    <SelectItem value="PROCESSING">กำลังดำเนินการ</SelectItem>
                                    <SelectItem value="FAILED">ล้มเหลว</SelectItem>
                                    <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
                                    <SelectItem value="REFUNDED">คืนเงิน</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="startDate">วันที่เริ่ม</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="endDate">วันที่สิ้นสุด</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>

                        <Button onClick={handleSearch} className="w-full">
                            <Search className="w-4 h-4 mr-2" />
                            ค้นหา
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ตารางรายการ */}
            <Card className='bg-backgroundCustom'>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                        <TrendingUp className="w-5 h-5" />
                        รายการธุรกรรม ({pagination.total} รายการ)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[150px]">ผู้ใช้</TableHead>
                                    <TableHead className="min-w-[100px]">ประเภท</TableHead>
                                    <TableHead className="min-w-[120px]">จำนวน</TableHead>
                                    <TableHead className="min-w-[100px]">สถานะ</TableHead>
                                    <TableHead className="min-w-[120px]">วิธีชำระ</TableHead>
                                    <TableHead className="min-w-[200px]">รายละเอียด</TableHead>
                                    <TableHead className="min-w-[120px]">วันที่</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((transaction) => (
                                    <TableRow key={transaction.transaction_id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{transaction.wallet.user.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {transaction.wallet.user.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                                        <TableCell className="font-medium">
                                            {formatAmount(transaction.amount, transaction.currency)}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(transaction.payment_status)}</TableCell>
                                        <TableCell>
                                            {transaction.payment_method || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {transaction.coinPackage && (
                                                    <div className="text-sm">
                                                        แพ็คเกจ: {transaction.coinPackage.name}
                                                    </div>
                                                )}
                                                {transaction.story && (
                                                    <div className="text-sm">
                                                        เรื่อง: {transaction.story.title}
                                                    </div>
                                                )}
                                                {transaction.chapter && (
                                                    <div className="text-sm">
                                                        ตอน: {transaction.chapter.title}
                                                    </div>
                                                )}
                                                {transaction.notes && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {transaction.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {new Date(transaction.created_at).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
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

            {transactions.length === 0 && !loading && (
                <Card className='bg-backgroundCustom'>
                    <CardContent className="py-8 text-center">
                        <Coins className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">ไม่พบข้อมูลธุรกรรม</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}