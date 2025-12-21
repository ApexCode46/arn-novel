'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, User, CreditCard, Phone, Mail, Building2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useOCRVerification } from '@/hooks/useOCRVerification'
import { OCRVerificationDisplay } from '@/components/OCRVerificationDisplay'

interface FormData {
  realName: string
  numIdCard: string
  email: string
  phoneNumber: string
  numBank: string
  IdCard: File | null
  SelfieWithIdCard: File | null
  BankAccount: File | null
}

interface ApplicationStatus {
  registerWriter_id: string
  realName: string
  numIdCard: string
  email: string
  phoneNumber: string
  numBank: string
  status: string
  created_at: string
}

export default function RegisterWriterPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null)
  const { isProcessing: isOCRProcessing, result: ocrResult, processImage, clearResult } = useOCRVerification()
  const [formData, setFormData] = useState<FormData>({
    realName: '',
    numIdCard: '',
    email: '',
    phoneNumber: '',
    numBank: '',
    IdCard: null,
    SelfieWithIdCard: null,
    BankAccount: null
  })

  const [previews, setPreviews] = useState({
    IdCard: '',
    SelfieWithIdCard: '',
    BankAccount: ''
  })

  // ตรวจสอบสถานะการสมัคร
  const checkApplicationStatus = async () => {
    try {
      const response = await fetch('/api/users/register-writer')
      if (response.ok) {
        const data = await response.json()
        setApplicationStatus(data.application)

        // ถ้าถูกปฏิเสธ ให้ prefill ข้อมูลเดิม
        if (data.application && data.application.status === 'rejected') {
          setFormData(prev => ({
            ...prev,
            realName: data.application.realName || '',
            numIdCard: data.application.numIdCard || '',
            email: data.application.email || '',
            phoneNumber: data.application.phoneNumber || '',
            numBank: data.application.numBank || ''
          }))
        }
      }
    } catch (error) {
      console.error('Error checking application status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  // เรียกใช้เมื่อ component โหลด
  useEffect(() => {
    if (session?.user) {
      checkApplicationStatus()
    } else {
      setCheckingStatus(false)
    }
  }, [session])

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-600" />
        <span className="ml-2 text-lg text-orange-700">กำลังตรวจสอบการเข้าสู่ระบบ...</span>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-orange-200">
          <CardContent className="py-8 px-6 text-center">
            <p className="text-lg mb-4 text-orange-700">กรุณาเข้าสู่ระบบเพื่อสมัครเป็นนักเขียน</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-600" />
        <span className="ml-2 text-lg text-orange-700">กำลังตรวจสอบสถานะ...</span>
      </div>
    )
  }

  // แสดงสถานะการสมัครถ้าสมัครแล้ว (ยกเว้น rejected)
  if (applicationStatus && applicationStatus.status !== 'rejected') {
    const getStatusMessage = () => {
      switch (applicationStatus.status) {
        case 'pending':
          return {
            title: 'รอผลการตรวจสอบ',
            message: 'คำขอสมัครของคุณอยู่ระหว่างการตรวจสอบ กรุณารอการอนุมัติจากผู้ดูแลระบบ',
            color: 'text-orange-600',
            bgColor: 'bg-backgroundCustom border-orange-200'
          }
        case 'approved':
          return {
            title: 'อนุมัติแล้ว',
            message: 'ยินดีด้วย! คำขอสมัครของคุณได้รับการอนุมัติแล้ว คุณสามารถเริ่มเขียนนิยายได้ เผยแพร่ได้แล้ว',
            color: 'text-green-600',
            bgColor: 'bg-backgroundCustom border-green-200'
          }
        case 'rejected':
          return {
            title: 'ไม่ได้รับการอนุมัติ',
            message: 'คำขอสมัครของคุณไม่ได้รับการอนุมัติ กรุณาติดต่อผู้ดูแลระบบสำหรับข้อมูลเพิ่มเติม',
            color: 'text-red-600',
            bgColor: 'bg-backgroundCustom border-red-200'
          }
        default:
          return {
            title: 'สถานะไม่ทราบ',
            message: 'ไม่สามารถระบุสถานะได้ กรุณาติดต่อผู้ดูแลระบบ',
            color: 'text-gray-600',
            bgColor: 'bg-backgroundCustom border-gray-200'
          }
      }
    }

    const status = getStatusMessage()

    return (
      <div className="container mx-auto py-4 lg:py-6 space-y-4 lg:space-y-6 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className={`${status.bgColor} shadow-lg`}>
            <CardContent className="py-8 px-6 text-center">
              <div className={`text-6xl mb-4 ${status.color}`}>
                {applicationStatus.status === 'pending'}
                {applicationStatus.status === 'approved'}
                {applicationStatus.status === 'rejected'}
              </div>
              <h1 className={`text-2xl font-bold mb-4 ${status.color}`}>
                {status.title}
              </h1>
              <p className="text-lg mb-6 text-gray-700">
                {status.message}
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>ชื่อ:</strong> {applicationStatus.realName}</p>
                <p><strong>อีเมล:</strong> {applicationStatus.email}</p>
                <p><strong>วันที่สมัคร:</strong> {new Date(applicationStatus.created_at).toLocaleDateString('th-TH')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleFileChange = (field: 'IdCard' | 'SelfieWithIdCard' | 'BankAccount', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }))

    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews(prev => ({ ...prev, [field]: e.target?.result as string }))
      }
      reader.readAsDataURL(file)

      // หากเป็นการอัปโหลดบัตรประชาชน ให้ทำการตรวจสอบ OCR
      if (field === 'IdCard' && formData.realName && formData.numIdCard) {
        handleOCRVerification(file)
      }
    } else {
      setPreviews(prev => ({ ...prev, [field]: '' }))
      if (field === 'IdCard') {
        clearResult()
      }
    }
  }

  const handleOCRVerification = async (file: File) => {
    if (!formData.realName || !formData.numIdCard) {
      toast.info('กรุณากรอกชื่อและเลขบัตรประชาชนก่อนอัปโหลดรูปภาพ')
      return
    }

    await processImage(file, {
      idNumber: formData.numIdCard,
      name: formData.realName
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.realName || !formData.numIdCard || !formData.email || !formData.phoneNumber || !formData.numBank) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    if (!formData.IdCard || !formData.SelfieWithIdCard || !formData.BankAccount) {
      toast.error('กรุณาอัปโหลดรูปภาพให้ครบถ้วน')
      return
    }

    // ✅ ใหม่ (ให้ผ่านแม้ตรวจสอบไม่ตรง 100%)
    if (ocrResult && !ocrResult.verification.isValid) {
      toast.warning('ผลการตรวจสอบบัตรประชาชนไม่ตรง 100% แต่จะส่งคำขอต่อไป')
    }

    setLoading(true)

    try {
      const form = new FormData()
      form.append('realName', formData.realName)
      form.append('numIdCard', formData.numIdCard)
      form.append('email', formData.email)
      form.append('phoneNumber', formData.phoneNumber)
      form.append('numBank', formData.numBank)
      form.append('IdCard', formData.IdCard)
      form.append('SelfieWithIdCard', formData.SelfieWithIdCard)
      form.append('BankAccount', formData.BankAccount)

      // เพิ่มข้อมูลการตรวจสอบ OCR
      if (ocrResult) {
        form.append('ocrVerification', JSON.stringify({
          verified: ocrResult.verification.isValid,
          matchScore: ocrResult.verification.matchScore,
          confidence: ocrResult.ocrResult.confidence
        }))
      }

      const response = await fetch('/api/users/register-writer', {
        method: 'POST',
        body: form
      })

      if (response.ok) {
        toast.success('ส่งคำขอสมัครเป็นนักเขียนเรียบร้อย รอการอนุมัติจากผู้ดูแลระบบ')
        // รีเฟรชสถานะเพื่อแสดงหน้ารอผล
        await checkApplicationStatus()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'เกิดข้อผิดพลาดในการส่งคำขอ')
      }
    } catch (error) {
      console.log('Error submitting application:', error)
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  const FileUploadField = ({
    field,
    label,
    icon: Icon,
    accept = "image/*"
  }: {
    field: 'IdCard' | 'SelfieWithIdCard' | 'BankAccount'
    label: string
    icon: React.ComponentType<{ className?: string }>
    accept?: string
  }) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-orange-700">
        <Icon className="w-4 h-4 text-orange-600" />
        {label}
      </Label>
      <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 hover:border-orange-400 transition-colors">
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
          className="hidden"
          id={field}
        />
        <label htmlFor={field} className="cursor-pointer">
          {previews[field] ? (
            <div className="text-center">
              <Image
                src={previews[field]}
                alt={label}
                width={200}
                height={128}
                className="max-w-full max-h-32 mx-auto mb-2 rounded object-cover border border-orange-200"
                unoptimized
              />
              <p className="text-sm text-green-600 font-medium">รูปภาพถูกเลือกแล้ว</p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <p className="text-sm text-orange-600">คลิกเพื่อเลือกรูปภาพ</p>
            </div>
          )}
        </label>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto py-4 lg:py-6 space-y-4 lg:space-y-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-orange-700">สมัครเป็นนักเขียน</h1>
          <p className="text-orange-600">
            กรอกข้อมูลเพื่อสมัครเป็นนักเขียนในระบบ
          </p>
        </div>

        {/* แสดงการแจ้งเตือนถ้าถูกปฏิเสธ */}
        {applicationStatus && applicationStatus.status === 'rejected' && (
          <Card className="mb-6 bg-red-600 border-red-200 shadow-lg">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-semibold text-white">คำขอก่อนหน้าไม่ได้รับการอนุมัติ</h3>
                  <p className="text-sm text-white">
                    คุณสามารถแก้ไขข้อมูลและส่งคำขอใหม่ได้ กรุณาตรวจสอบข้อมูลให้ถูกต้องและครบถ้วน
                  </p>
                  <p className="text-xs text-white mt-1">
                    คำขอก่อนหน้า: {new Date(applicationStatus.created_at).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className='bg-backgroundCustom border-orange-200 shadow-lg'>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <User className="w-5 h-5 text-orange-600" />
              ข้อมูลส่วนตัว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ข้อมูลส่วนตัว */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="realName" className="flex items-center gap-2 text-orange-700">
                    <User className="w-4 h-4 text-orange-600" />
                    ชื่อ นามสกุลจริง
                  </Label>
                  <Input
                    id="realName"
                    value={formData.realName}
                    onChange={(e) => setFormData(prev => ({ ...prev, realName: e.target.value }))}
                    placeholder="กรุณากรอกชื่อ นามสกุลจริง"
                    className="border-orange-200 focus:border-orange-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numIdCard" className="flex items-center gap-2 text-orange-700">
                    <CreditCard className="w-4 h-4 text-orange-600" />
                    เลขบัตรประชาชน
                  </Label>
                  <Input
                    id="numIdCard"
                    value={formData.numIdCard}
                    onChange={(e) => setFormData(prev => ({ ...prev, numIdCard: e.target.value }))}
                    placeholder="0-0000-00000-00-0"
                    className="border-orange-200 focus:border-orange-400"
                    maxLength={17}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-orange-700">
                    <Mail className="w-4 h-4 text-orange-600" />
                    อีเมล
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="example@email.com"
                    className="border-orange-200 focus:border-orange-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="flex items-center gap-2 text-orange-700">
                    <Phone className="w-4 h-4 text-orange-600" />
                    เบอร์โทรศัพท์
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="0xx-xxx-xxxx"
                    className="border-orange-200 focus:border-orange-400"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="numBank" className="flex items-center gap-2 text-orange-700">
                    <Building2 className="w-4 h-4 text-orange-600" />
                    เลขบัญชีธนาคาร
                  </Label>
                  <Input
                    id="numBank"
                    value={formData.numBank}
                    onChange={(e) => setFormData(prev => ({ ...prev, numBank: e.target.value }))}
                    placeholder="กรุณากรอกเลขบัญชีธนาคาร"
                    className="border-orange-200 focus:border-orange-400"
                    required
                  />
                </div>
              </div>

              {/* อัปโหลดรูปภาพ */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-700">เอกสารประกอบ (หลีกเลี่ยงแสงสะท้อน) </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FileUploadField
                    field="IdCard"
                    label="รูปถ่ายบัตรประชาชน"
                    icon={CreditCard}
                  />

                  <FileUploadField
                    field="SelfieWithIdCard"
                    label="รูปเซลฟี่กับบัตรประชาชน"
                    icon={User}
                  />
                </div>

                {/* แสดงผลการตรวจสอบ OCR */}
                {(isOCRProcessing || ocrResult) && (
                  <OCRVerificationDisplay
                    isProcessing={isOCRProcessing}
                    result={ocrResult}
                  />
                )}

                <FileUploadField
                  field="BankAccount"
                  label="รูปหน้าแรกสมุดบัญชีธนาคาร"
                  icon={Building2}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading || isOCRProcessing}
                  className="flex-1 bg-orange-600 hover:bg-red-600 text-white border-orange-600 shadow-lg disabled:opacity-50"
                >
                  {loading
                    ? 'กำลังส่งคำขอ...'
                    : isOCRProcessing
                      ? 'กำลังตรวจสอบบัตรประชาชน...'
                      : applicationStatus && applicationStatus.status === 'rejected'
                        ? 'ส่งคำขอใหม่'
                        : 'ส่งคำขอสมัคร'
                  }
                </Button>

                {/* ปุ่มตรวจสอบอีกครั้งถูกนำออกตามคำขอ */}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}