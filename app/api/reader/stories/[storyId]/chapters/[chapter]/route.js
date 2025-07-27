import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { storyId, chapter } = await params;

    if (!storyId) {
      return NextResponse.json(
        { error: "Story ID is required" },
        { status: 400 }
      );
    }

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter order is required" },
        { status: 400 }
      );
    }

    // แปลง chapter order เป็น number
    const chapterOrder = parseInt(chapter);
    if (isNaN(chapterOrder)) {
      return NextResponse.json(
        { error: "Chapter order must be a valid number" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า story มีอยู่จริงหรือไม่
    const story = await prisma.stories.findUnique({
      where: {
        story_id: storyId,
      },
      select: {
        story_id: true,
        title: true,
        penName: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // ดึงข้อมูล chapter ตาม order
    const chapterData = await prisma.chapters.findFirst({
      where: {
        story_id: storyId,
        order: chapterOrder,
      },
      include: {
        _count: {
          select: {
            chapterComments: true,
          },
        },
      },
    });

    if (!chapterData) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // ดึง chapter ก่อนหน้าและถัดไป
    const previousChapter = await prisma.chapters.findFirst({
      where: {
        story_id: storyId,
        order: chapterOrder - 1,
      },
      select: {
        chapter_id: true,
        order: true,
        title: true,
      },
    });

    const nextChapter = await prisma.chapters.findFirst({
      where: {
        story_id: storyId,
        order: chapterOrder + 1,
      },
      select: {
        chapter_id: true,
        order: true,
        title: true,
      },
    });

    // ดึงรายการ chapter ทั้งหมดของเรื่องนี้ (สำหรับ navigation)
    const allChapters = await prisma.chapters.findMany({
      where: {
        story_id: storyId,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        chapter_id: true,
        order: true,
        title: true,
        price: true,
      },
    });

    // จัดรูปแบบข้อมูลที่จะส่งกลับ
    const responseData = {
      chapter: {
        chapter_id: chapterData.chapter_id,
        order: chapterData.order,
        title: chapterData.title,
        content: chapterData.content,
        price: chapterData.price,
        created_at: chapterData.created_at,
        updated_at: chapterData.updated_at,
        commentsCount: chapterData._count.chapterComments,
      },
      story: {
        story_id: story.story_id,
        title: story.title,
        penName: story.penName,
        author: {
          id: story.user.id,
          name: story.user.name,
        },
      },
      navigation: {
        previous: previousChapter,
        next: nextChapter,
        allChapters: allChapters,
        currentIndex: allChapters.findIndex((ch) => ch.order === chapterOrder),
        totalChapters: allChapters.length,
      },
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
