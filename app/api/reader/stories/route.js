import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    // สร้าง where clause สำหรับการกรองตามหมวดหมู่
    let whereClause = {};
    
    if (category && category !== 'all') {
      // ใช้ contains สำหรับค้นหาคำที่อยู่ในข้อความ
      // เช่น หา "แฟนตาซี" ใน "นิยายตื่นเต้น แฟนตาซี"
      whereClause = {
        category: {
          contains: category
        }
      };
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