import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const { storyId } = await params;

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    // ดึงข้อมูลนิยายพร้อมข้อมูลผู้เขียนและตอนต่างๆ
    const story = await prisma.stories.findUnique({
      where: {
        story_id: storyId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        chapter: {
          orderBy: {
            order: 'asc'
          },
          select: {
            chapter_id: true,
            order: true,
            title: true,
            price: true,
            created_at: true,
            updated_at: true
          }
        },
        _count: {
          select: {
            chapter: true,
            favorite: true,
            follow: true,
            storyComments: true
          }
        }
      }
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // เพิ่มจำนวนการดู (views) ขึ้น 1
    await prisma.stories.update({
      where: {
        story_id: storyId
      },
      data: {
        views: {
          increment: 1
        }
      }
    });

    // จัดรูปแบบข้อมูลที่จะส่งกลับ
    const responseData = {
      story_id: story.story_id,
      title: story.title,
      blurb: story.blurb,
      category: story.category,
      type: story.type,
      contentLevel: story.contentLevel,
      tags: story.tags,
      storyInfo: story.storyInfo,
      verticalImage: story.verticalImage,
      horizontalImage: story.horizontalImage,
      views: story.views + 1, // แสดงจำนวน views ที่เพิ่มแล้ว
      created_at: story.created_at,
      updated_at: story.updated_at,
      author: {
        id: story.user.id,
        name: story.user.name,
        penName: story.penName,
        image: story.user.image
      },
      chapters: story.chapter,
      stats: {
        totalChapters: story._count.chapter,
        totalFavorites: story._count.favorite,
        totalFollows: story._count.follow,
        totalComments: story._count.storyComments
      }
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}