import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - ดึงข้อมูลคำขอสมัครนักเขียนทั้งหมด (สำหรับ Admin)
export async function GET(request) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const status = url.searchParams.get('status') || ''
    const search = url.searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // สร้าง where clause
    const where = {}
    
    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { realName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    // ดึงข้อมูล
    const [applications, total] = await Promise.all([
      prisma.registerWriter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.registerWriter.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching writer applications:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลคำขอสมัครได้' },
      { status: 500 }
    )
  }
}

// PUT - อัปเดตสถานะคำขอสมัคร
export async function PUT(request) {
  try {
    const { applicationId, status } = await request.json()

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'กรุณาระบุข้อมูลที่จำเป็น' },
        { status: 400 }
      )
    }

    // อัปเดตสถานะ
    const updatedApplication = await prisma.registerWriter.update({
      where: { registerWriter_id: applicationId },
      data: { 
        status,
        updated_at: new Date()
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })

    // ถ้าอนุมัติแล้ว อัปเดต role ของ user เป็น writer
    if (status === 'approved') {
      await prisma.user.update({
        where: { id: updatedApplication.user_id },
        data: { role: 'writer' }
      })
    }

    return NextResponse.json({
      message: 'อัปเดตสถานะเรียบร้อย',
      application: updatedApplication
    })
  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถอัปเดตสถานะได้' },
      { status: 500 }
    )
  }
}
