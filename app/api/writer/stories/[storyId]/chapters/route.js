import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const { storyId } = params;

    if (!storyId) {
      return NextResponse.json(
        { error: 'storyId is required' },
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

    // ดึงข้อมูล chapters ทั้งหมดของ story นี้
    const chapters = await prisma.chapters.findMany({
      where: {
        story_id: storyId
      },
      select: {
        chapter_id: true,
        order: true,
        title: true,
        content: true,
        price: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json(chapters);
    
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    const { storyId } = params;
    const body = await req.json();
    const { title, content, price } = body;

    if (!storyId) {
      return NextResponse.json(
        { error: 'storyId is required' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
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

    // หาหมายเลข order สูงสุดของ chapters ใน story นี้
    const maxOrderChapter = await prisma.chapters.findFirst({
      where: {
        story_id: storyId
      },
      orderBy: {
        order: 'desc'
      },
      select: {
        order: true
      }
    });

    // กำหนด order ใหม่: หากไม่มี chapter เลยให้เป็น 1, หากมีแล้วให้ +1
    const newOrder = maxOrderChapter ? maxOrderChapter.order + 1 : 1;

    // สร้าง chapter ใหม่
    const newChapter = await prisma.chapters.create({
      data: {
        story_id: storyId,
        order: newOrder,
        title,
        content: content || "",
        price: price || 0,
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

    return NextResponse.json(
      {
        message: 'Chapter created successfully',
        chapter: newChapter,
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

