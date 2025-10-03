import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// GET - ดึงข้อมูลโฆษณาทั้งหมด
export async function GET() {
  try {
    const ads = await prisma.ads.findMany({
      orderBy: { ad_id: 'asc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })
    
    return NextResponse.json(ads)
  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    )
  }
}

// POST - สร้างโฆษณาใหม่ หรือ อัปเดตโฆษณาที่มีอยู่
export async function POST(request) {
  try {
    const formData = await request.formData()
    
    const ad_id = formData.get('ad_id')
    const name_as = formData.get('name_as') 
    const user_input = formData.get('user_id')
    const link = formData.get('link')
    const status = formData.get('status') === 'true'
    const image = formData.get('image')

    if (!name_as || !user_input) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // ค้นหา user_id จาก email หรือใช้ user_id โดยตรง
    let user_id = user_input
    if (user_input.includes('@')) {
      const user = await prisma.user.findUnique({
        where: { email: user_input },
        select: { id: true }
      })
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      user_id = user.id
    }

    let path_img = formData.get('path_img') || ''

    // จัดการการอัปโหลดรูปภาพ
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // สร้างชื่อไฟล์ที่ไม่ซ้ำ
      const timestamp = Date.now()
      const fileName = `ad_${timestamp}_${image.name}`

      // เปลี่ยนไปเก็บที่ uploads/adsImg
      const uploadDir = path.join(process.cwd(), 'uploads', 'adsImg')
      const uploadPath = path.join(uploadDir, fileName)

      // สร้างโฟลเดอร์ถ้ายังไม่มี
      await mkdir(uploadDir, { recursive: true })
      
      // เขียนไฟล์
      await writeFile(uploadPath, buffer)

      // เก็บ path เป็น URL ที่เข้าถึงผ่าน API (เช่น /uploads/adsImg/xxxx.png)
      path_img = `/uploads/adsImg/${fileName}`
    }

    const adData = {
      name_as,
      user_id,
      path_img,
      link,
      status,
    }

    let result
    if (ad_id) {
      // อัปเดตโฆษณาที่มีอยู่
      result = await prisma.ads.update({
        where: { ad_id: parseInt(ad_id) },
        data: adData,
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })
    } else {
      // สร้างโฆษณาใหม่
      result = await prisma.ads.create({
        data: adData,
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error saving ad:', error)
    return NextResponse.json(
      { error: 'Failed to save ad' },
      { status: 500 }
    )
  }
}
