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
              created_at: true
            },
            orderBy: {
              order: 'desc'
            },
            take: 1
          },
          favorite: {
            select: {
              user_id: true
            }
          },
          follow: {
            select: {
              user_id: true
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
      const totalStories = await prisma.stories.count({
        where: whereCondition
      })

      return Response.json({
        stories: stories.map(story => ({
          ...story,
          latestChapter: story.chapter[0] || null,
          favoriteCount: story._count.favorite,
          followCount: story._count.follow,
          chapterCount: story._count.chapter
        })),
        pagination: {
          current: page,
          total: Math.ceil(totalStories / limit),
          totalItems: totalStories,
          limit,
          hasNext: page < Math.ceil(totalStories / limit),
          hasPrev: page > 1
        }
      })
    } catch (error) {
      console.error('Error fetching stories for admin:', error)
      return NextResponse.json(
        { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
        { status: 500 }
      )
    }
}

// PATCH - อัพเดทสถานะการซ่อน/แสดงนิยาย
export async function PATCH(request) {
    try {
      const body = await request.json()
      const { storyId, action, reason } = body

      if (!storyId || !action) {
        return NextResponse.json(
          { error: 'กรุณาระบุ storyId และ action' },
          { status: 400 }
        )
      }

      let updateData = {}

      if (action === 'hide') {
        if (!reason) {
          return Response.json(
            { error: 'กรุณาระบุเหตุผลในการซ่อน' },
            { status: 400 }
          )
        }
        updateData = {
          admin_hidden: true,
          admin_hide_reason: reason
        }
      } else if (action === 'show') {
        updateData = {
          admin_hidden: false,
          admin_hide_reason: null
        }
      } else {
        return Response.json(
          { error: 'action ไม่ถูกต้อง' },
          { status: 400 }
        )
      }

      // อัพเดทนิยาย
      const updatedStory = await prisma.stories.update({
        where: { story_id: storyId },
        data: updateData,
        select: {
          story_id: true,
          title: true,
          admin_hidden: true,
          admin_hide_reason: true
        }
      })

      return Response.json({
        success: true,
        story: updatedStory,
        message: action === 'hide' ? 'ซ่อนนิยายเรียบร้อยแล้ว' : 'แสดงนิยายเรียบร้อยแล้ว'
      })
    } catch (error) {
      console.error('Error updating story visibility:', error)
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'ไม่พบนิยายที่ระบุ' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'เกิดข้อผิดพลาดในการอัพเดท' },
        { status: 500 }
      )
    }
}

// DELETE - ลบนิยาย (admin เท่านั้น)
export async function DELETE(request) {
    try {
      const { searchParams } = new URL(request.url)
      const storyId = searchParams.get('storyId')

      if (!storyId) {
        return Response.json(
          { error: 'กรุณาระบุ storyId' },
          { status: 400 }
        )
      }

      // ลบนิยายและข้อมูลที่เกี่ยวข้อง
      await prisma.stories.delete({
        where: { story_id: storyId }
      })

      return Response.json({
        success: true,
        message: 'ลบนิยายเรียบร้อยแล้ว'
      })
    } catch (error) {
      console.error('Error deleting story:', error)
      
      if (error.code === 'P2025') {
        return Response.json(
          { error: 'ไม่พบนิยายที่ระบุ' },
          { status: 404 }
        )
      }

      return Response.json(
        { error: 'เกิดข้อผิดพลาดในการลบ' },
        { status: 500 }
      )
    }
}
