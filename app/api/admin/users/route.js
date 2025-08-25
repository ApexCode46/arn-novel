import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - ดึงข้อมูลผู้ใช้ทั้งหมด
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    const skip = (page - 1) * limit

    // สร้าง where condition
    const where = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role) {
      where.role = role
    }

    // ดึงข้อมูลผู้ใช้
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          wallet: {
            select: { balance: true }
          },
          stories: {
            select: { story_id: true }
          },
          _count: {
            select: {
              stories: true,
              storyComments: true,
              chapterComments: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST - สร้างผู้ใช้ใหม่ หรือ อัปเดตผู้ใช้
export async function POST(request) {
  try {
    const body = await request.json()
    const { id, name, email, role, image } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    let result
    if (id) {
      // อัปเดตผู้ใช้ที่มีอยู่
      result = await prisma.user.update({
        where: { id },
        data: {
          name: name || '',
          email,
          role: role || 'user',
          image: image || null,
        },
        include: {
          wallet: {
            select: { balance: true }
          },
          _count: {
            select: {
              stories: true,
              storyComments: true,
              chapterComments: true
            }
          }
        }
      })
    } else {
      // สร้างผู้ใช้ใหม่
      result = await prisma.user.create({
        data: {
          name: name || '',
          email,
          role: role || 'user',
          image: image || null,
        },
        include: {
          wallet: {
            select: { balance: true }
          },
          _count: {
            select: {
              stories: true,
              storyComments: true,
              chapterComments: true
            }
          }
        }
      })

      // สร้าง wallet สำหรับผู้ใช้ใหม่
      await prisma.wallet.create({
        data: {
          user_id: result.id,
          balance: 0
        }
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error saving user:', error)
    return NextResponse.json(
      { error: 'Failed to save user' },
      { status: 500 }
    )
  }
}
