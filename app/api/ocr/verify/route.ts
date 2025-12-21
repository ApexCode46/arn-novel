import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { verifyIDCard } from '@/lib/ocr-utils'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบ' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const inputData = {
      idNumber: formData.get('idNumber') as string,
      name: formData.get('name') as string
    }

    if (!imageFile || !inputData.idNumber || !inputData.name) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      )
    }

    // ทำการตรวจสอบ OCR
    const result = await verifyIDCard(imageFile, inputData)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('OCR verification error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจสอบ OCR' },
      { status: 500 }
    )
  }
}