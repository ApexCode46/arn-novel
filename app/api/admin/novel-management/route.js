import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - ดึงข้อมูลนิยายทั้งหมดสำหรับ admin
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const hideStatus = searchParams.get('hideStatus') || ''

    const skip = (page - 1) * limit

      // สร้าง where condition
      const whereCondition = {
        ...(search && {
          OR: [
            {
              title: {
                contains: search,
                mode: 'insensitive'
              }
            },
            {
              user: {
                name: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            },
            {
              penName: {
                contains: search,
                mode: 'insensitive'
              }
            }
          ]
        }),
        ...(category && { category }),
        ...(status && { status }),
        ...(hideStatus === 'hidden' && { admin_hidden: true }),
        ...(hideStatus === 'visible' && { admin_hidden: false })
      }

    // ดึงข้อมูลนิยาย
    const stories = await prisma.stories.findMany({
      where: whereCondition,
      select: {
        story_id: true,
        title: true,
        category: true,
        status: true,
        views: true,
        created_at: true,
        penName: true,
        admin_hidden: true,
        admin_hide_reason: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        chapter: {
          select: {
            chapter_id: true,
            title: true,
            is_hidden: true,
            admin_hidden: true,
            status: true,
            views: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            chapter: true,
            favorite: true,
            follow: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limit
    })

    // นับจำนวนทั้งหมด
    const total = await prisma.stories.count({
      where: whereCondition
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      stories,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })

  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}

// PUT - อัปเดตสถานะนิยายหรือตอน (ซ่อน/แสดง)
export async function PUT(request) {
  try {
    const body = await request.json()
    const { type, id, action, reason } = body

    if (!type || !id || !action || !reason) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ครบถ้วน' },
        { status: 400 }
      )
    }    let result
    let notificationData = {}

    if (type === 'story') {
      // จัดการนิยาย
      const story = await prisma.stories.findUnique({
        where: { story_id: id },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      if (!story) {
        return NextResponse.json(
          { error: 'ไม่พบนิยายที่ระบุ' },
          { status: 404 }
        )
      }

      // อัปเดตสถานะนิยาย
      result = await prisma.stories.update({
        where: { story_id: id },
        data: {
          admin_hidden: action === 'hide',
          admin_hide_reason: action === 'hide' ? reason : null
        }
      })

      notificationData = {
        type: 'story',
        title: story.title,
        action: action === 'hide' ? 'ซ่อน' : 'แสดง',
        reason,
        userEmail: story.user.email,
        userName: story.user.name
      }

    } else if (type === 'chapter') {
      // จัดการตอน
      const chapter = await prisma.chapters.findUnique({
        where: { chapter_id: id },
        include: {
          story: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })

      if (!chapter) {
        return NextResponse.json(
          { error: 'ไม่พบตอนที่ระบุ' },
          { status: 404 }
        )
      }

      result = await prisma.chapters.update({
        where: { chapter_id: id },
        data: {
          admin_hidden: action === 'hide',
          admin_hide_reason: action === 'hide' ? reason : null
        }
      })

      notificationData = {
        type: 'chapter',
        title: `${chapter.story.title} - ${chapter.title}`,
        action: action === 'hide' ? 'ซ่อน' : 'แสดง',
        reason,
        userEmail: chapter.story.user.email,
        userName: chapter.story.user.name
      }
    }

    // สร้างการแจ้งเตือน (บันทึกลงระบบ log หรือส่งอีเมล)
    console.log('Admin Action:', {
      action: `${notificationData.action}${notificationData.type === 'story' ? 'นิยาย' : 'ตอน'}`,
      target: notificationData.title,
      reason: notificationData.reason,
      targetUser: notificationData.userEmail,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      message: `${notificationData.action}${notificationData.type === 'story' ? 'นิยาย' : 'ตอน'}เรียบร้อยแล้ว`,
      data: result,
      notification: {
        message: `เรื่อง "${notificationData.title}" ถูก${notificationData.action}โดยผู้ดูแลระบบ\nเหตุผล: ${notificationData.reason}`,
        sentTo: notificationData.userEmail
      }
    })

  } catch (error) {
    console.error('Error updating story/chapter:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดต' },
      { status: 500 }
    )
  }
}
