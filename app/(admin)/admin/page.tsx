
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Trash2, Save, RefreshCw, Plus, Edit } from 'lucide-react'
import { toast } from 'sonner'

interface Ad {
  ad_id: number
  name_as: string
  user_id: string
  path_img: string
  link: string
  status: boolean
  created_at: string
  updated_at: string
  user: {
    name: string
    email: string
  }
}

export default function AdsManagementPage() {
  const { data: session, status } = useSession()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAd, setEditingAd] = useState<Partial<Ad> | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [adToDelete, setAdToDelete] = useState<number | null>(null)

  // ดึงข้อมูลโฆษณา
  const fetchAds = async () => {
    try {
      const response = await fetch('/api/admin/ads')
      if (response.ok) {
        const data = await response.json()
        setAds(data)
      }
    } catch (error) {
      toast.error('ไม่สามารถดึงข้อมูลโฆษณาได้')
      console.error('Error fetching ads:', error)
    } finally {
      setLoading(false)
    }
  }

  // เริ่มแก้ไขโฆษณา
  const startEdit = (ad: Ad) => {
    setEditingAd(ad)
    setPreviewUrl(ad.path_img)
    setImageFile(null)
    setIsDialogOpen(true)
  }

  // เริ่มสร้างโฆษณาใหม่
  const startCreate = () => {
    setEditingAd({
      name_as: '',
      user_id: session?.user?.email || '', // ใช้ email แทน user_id ชั่วคราว
      link: '',
      status: false,
      path_img: ''
    })
    setPreviewUrl('')
    setImageFile(null)
    setIsDialogOpen(true)
  }

  // จัดการการเลือกไฟล์รูปภาพ
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  // บันทึกโฆษณา
  const saveAd = async () => {
    if (!editingAd) return

    const formData = new FormData()
    if (editingAd.ad_id) formData.append('ad_id', editingAd.ad_id.toString())
    formData.append('name_as', editingAd.name_as || '')
    formData.append('user_id', editingAd.user_id || session?.user?.email || '')
    formData.append('link', editingAd.link || '')
    formData.append('status', editingAd.status ? 'true' : 'false')
    formData.append('path_img', editingAd.path_img || '')
    
    if (imageFile) {
      formData.append('image', imageFile)
    }

    try {
      const response = await fetch('/api/admin/ads', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        toast.success('บันทึกโฆษณาเรียบร้อย')
        setEditingAd(null)
        setIsDialogOpen(false)
        fetchAds()
      } else {
        toast.error('ไม่สามารถบันทึกโฆษณาได้')
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด')
      console.error('Error saving ad:', error)
    }
  }

  // ลบโฆษณา
  const deleteAd = async (ad_id: number) => {
    setAdToDelete(ad_id)
    setDeleteDialogOpen(true)
  }

  // ยืนยันการลบโฆษณา
  const confirmDelete = async () => {
    if (!adToDelete) return

    try {
      const response = await fetch(`/api/admin/ads/${adToDelete}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('ลบโฆษณาเรียบร้อย')
        fetchAds()
      } else {
        toast.error('ไม่สามารถลบโฆษณาได้')
      }
    } catch (error) {
      console.error('Error deleting ad:', error)
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setDeleteDialogOpen(false)
      setAdToDelete(null)
    }
  }

  // เปลี่ยนสถานะโฆษณา
  const toggleAdStatus = async (ad_id: number, status: boolean) => {
    try {
      const response = await fetch(`/api/admin/ads/${ad_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success('อัปเดตสถานะเรียบร้อย')
        fetchAds()
      } else {
        toast.error('ไม่สามารถอัปเดตสถานะได้')
      }
    } catch (error) {
      console.error('Error updating ad status:', error)
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  // ตรวจสอบการ login และสิทธิ์ admin
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
        <span className="ml-2 text-lg">กำลังโหลดข้อมูลโฆษณา...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">จัดการโฆษณา</h1>
          <p className="text-muted-foreground">
            จัดการโฆษณา 10 slot สำหรับแสดงในเว็บไซต์
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAds} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            รีเฟรช
          </Button>
          <Button onClick={startCreate}>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มโฆษณาใหม่
          </Button>
        </div>
      </div>

      {/* Dialog สำหรับแก้ไข/สร้างโฆษณา */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAd?.ad_id ? 'แก้ไขโฆษณา' : 'เพิ่มโฆษณาใหม่'}
            </DialogTitle>
          </DialogHeader>
          
          {editingAd && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name_as">ชื่อโฆษณา</Label>
                  <Input
                    id="name_as"
                    value={editingAd.name_as || ''}
                    onChange={(e) => setEditingAd({ ...editingAd, name_as: e.target.value })}
                    placeholder="ใส่ชื่อโฆษณา"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link">ลิงก์</Label>
                  <Input
                    id="link"
                    value={editingAd.link || ''}
                    onChange={(e) => setEditingAd({ ...editingAd, link: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">รูปภาพโฆษณา</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {previewUrl && (
                  <div className="mt-2 flex justify-center">
                    <Image 
                      src={previewUrl} 
                      alt="Preview" 
                      width={384}
                      height={192}
                      className="max-w-sm h-48 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={editingAd.status || false}
                  onCheckedChange={(checked) => setEditingAd({ ...editingAd, status: checked })}
                />
                <Label htmlFor="status">เปิดใช้งานโฆษณา</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={saveAd} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  บันทึก
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  ยกเลิก
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Dialog สำหรับยืนยันการลบ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบโฆษณา</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจว่าต้องการลบโฆษณานี้? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
              ลบโฆษณา
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* รายการโฆษณา */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <Card key={ad.ad_id} className='bg-backgroundCustom'>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{ad.name_as}</CardTitle>
                <Badge variant={ad.status ? "default" : "secondary"}>
                  {ad.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {ad.path_img && (
                <div className="aspect-video relative rounded-md overflow-hidden bg-muted">
                  <Image 
                    src={ad.path_img} 
                    alt={ad.name_as}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>ลิงก์:</strong> {ad.link || 'ไม่มี'}</p>
                <p><strong>ผู้สร้าง:</strong> {ad.user.name}</p>
                <p><strong>อัปเดต:</strong> {new Date(ad.updated_at).toLocaleDateString('th-TH')}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => startEdit(ad)} className='border shadow-sm'>
                  <Edit className="w-4 h-4 mr-1" />
                  แก้ไข
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => toggleAdStatus(ad.ad_id, !ad.status)}
                >
                  {ad.status ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => deleteAd(ad.ad_id)}
                >
                  <Trash2 className="text-white w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ads.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">ยังไม่มีโฆษณาในระบบ</p>
            <Button className="mt-4" onClick={startCreate}>
              เพิ่มโฆษณาแรก
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}