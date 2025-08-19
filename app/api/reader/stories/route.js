import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const userId = searchParams.get('userId'); // เพิ่มการรับ userId
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    let whereClause = {
      status: "published"
    };
    
    if (category) {
      if (category === 'weekly') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // กรองจากตอนของนิยายที่อัปเดตในช่วง 7 วันที่ผ่านมา  
        const recentChapterIds = await prisma.chapters.findMany({
          where: {
            updated_at: {
              gte: oneWeekAgo
            }
          },
          select: {
            story_id: true
          }
        });

        const storyIds = recentChapterIds.map(chapter => chapter.story_id);
        whereClause.story_id = {
          in: storyIds
        };

      } else if (category === 'new') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // กรองจากนิยายที่สร้างในช่วง 30 วันที่ผ่านมา
        whereClause.created_at = {
          gte: thirtyDaysAgo
        };

      } else if (category === 'following') {
        // ตรวจสอบว่ามี userId หรือไม่
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required for following category' },
            { status: 400 }
          );
        }

        // ค้นหานิยายที่ user กำลังติดตามอยู่
        const followedStories = await prisma.follow.findMany({
          where: {
            user_id: userId
          },
          select: {
            story_id: true
          }
        });

        const followedStoryIds = followedStories.map(follow => follow.story_id);
        
        if (followedStoryIds.length === 0) {
          // หากไม่มีนิยายที่ติดตาม ให้ return ข้อมูลว่าง
          return NextResponse.json({
            stories: [],
            pagination: {
              currentPage: page,
              totalPages: 0,
              totalCount: 0,
              hasNext: false,
              hasPrev: false
            }
          });
        }

        whereClause.story_id = {
          in: followedStoryIds
        };
      } else {
        whereClause.category = {
          contains: category
        };
      }
    }

    // ตรวจสอบการเชื่อมต่อฐานข้อมูลก่อน
    await prisma.$connect();

    // ดึงข้อมูลนิยายพร้อมนับจำนวน chapter และจำนวนทั้งหมดพร้อมกัน
    const [stories, totalCount] = await Promise.all([
      prisma.stories.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              chapter: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip: skip,
        take: limit
      }),
      prisma.stories.count({
        where: whereClause
      })
    ]);

    // แปลงข้อมูลให้ตรงกับ format ที่ component ต้องการ
    const formattedStories = stories.map(story => ({
      id: story.story_id,
      title: story.title,
      imageUrl: story.verticalImage,
      categories: story.category,
      chapter: story._count.chapter,
      views: story.views || 0,
      description: story.blurb,
      type: story.type,
      created_at: story.created_at
    }));

    return NextResponse.json({
      stories: formattedStories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching reader stories:', error);
    
    // เพิ่มการจัดการข้อผิดพลาดที่ละเอียดขึ้น
    if (error.code === 'P2028') {
      return NextResponse.json(
        { error: 'Database connection timeout' },
        { status: 503 }
      );
    }
    
    if (error.code === 'P1001') {
      return NextResponse.json(
        { error: 'Cannot reach database server' },
        { status: 503 }
      );
    }
    
    if (error.message?.includes('Response from the Engine was empty')) {
      return NextResponse.json(
        { error: 'Database engine error - please try again' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}