import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const { storyId, chapter } = params;
    const chapterOrder = parseInt(chapter);

    if (!storyId) {
      return NextResponse.json(
        { error: 'storyId is required' },
        { status: 400 }
      );
    }

    if (isNaN(chapterOrder)) {
      return NextResponse.json(
        { error: 'chapter order must be a valid number' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า story มีอยู่จริง
    const story = await prisma.stories.findUnique({
      where: {
        story_id: storyId
      }
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // ดึงข้อมูล chapter ตาม order
    const chapterData = await prisma.chapters.findFirst({
      where: {
        story_id: storyId,
        order: chapterOrder
      },
      select: {
        chapter_id: true,
        order: true,
        title: true,
        content: true,
        price: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!chapterData) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(chapterData);
    
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { storyId, chapter } = params;
    const chapterOrder = parseInt(chapter);
    const body = await req.json();
    const { title, content, price } = body;

    if (!storyId) {
      return NextResponse.json(
        { error: 'storyId is required' },
        { status: 400 }
      );
    }

    if (isNaN(chapterOrder)) {
      return NextResponse.json(
        { error: 'chapter order must be a valid number' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า story มีอยู่จริง
    const story = await prisma.stories.findUnique({
      where: {
        story_id: storyId
      }
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่า chapter มีอยู่จริง
    const existingChapter = await prisma.chapters.findFirst({
      where: {
        story_id: storyId,
        order: chapterOrder
      }
    });

    if (!existingChapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // อัปเดต chapter
    const updatedChapter = await prisma.chapters.update({
      where: {
        chapter_id: existingChapter.chapter_id
      },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(price !== undefined && { price }),
      },
    });

    return NextResponse.json(
      {
        message: 'Chapter updated successfully',
        chapter: updatedChapter,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}