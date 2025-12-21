import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const { storyId, chapter } = await params;
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
        status: true,
        scheduled_date: true,
        is_hidden: true,
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
    const { storyId, chapter } = await params;
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
      },
      select: {
        chapter_id: true,
        admin_hidden: true,
        admin_hide_reason: true
      }
    });

    if (!existingChapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // ตรวจสอบว่าถูก admin ซ่อนไว้หรือไม่
    if (existingChapter.admin_hidden) {
      return NextResponse.json(
        { 
          error: "ไม่สามารถแก้ไขตอนนี้ได้ เนื่องจากถูกระงับโดยผู้ดูแลระบบ",
          reason: existingChapter.admin_hide_reason 
        },
        { status: 403 }
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

// API สำหรับอัปเดตการตั้งค่าตอน (สถานะการเผยแพร่, การซ่อน, ราคา)
export async function PATCH(req, { params }) {
  try {
    const { storyId, chapter } = await params;
    const chapterOrder = parseInt(chapter);
    const body = await req.json();
    const { status, scheduled_date, is_hidden, price } = body;

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

    // Validate status
    if (status && !['draft', 'published', 'scheduled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be draft, published, or scheduled' },
        { status: 400 }
      );
    }

    // Validate scheduled_date if status is scheduled
    if (status === 'scheduled' && !scheduled_date) {
      return NextResponse.json(
        { error: 'scheduled_date is required when status is scheduled' },
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

    // เตรียม data สำหรับอัปเดต
    const updateData = {};
    
    if (status !== undefined) {
      updateData.status = status;
      
      // ถ้า status เป็น scheduled และมี scheduled_date
      if (status === 'scheduled' && scheduled_date) {
        updateData.scheduled_date = new Date(scheduled_date);
      } else if (status !== 'scheduled') {
        // ถ้า status ไม่ใช่ scheduled ให้ลบ scheduled_date
        updateData.scheduled_date = null;
      }
    }
    
    if (is_hidden !== undefined) {
      updateData.is_hidden = is_hidden;
    }
    
    if (price !== undefined) {
      updateData.price = price;
    }

    // อัปเดต chapter settings
    const updatedChapter = await prisma.chapters.update({
      where: {
        chapter_id: existingChapter.chapter_id
      },
      data: updateData,
      select: {
        chapter_id: true,
        order: true,
        title: true,
        status: true,
        scheduled_date: true,
        is_hidden: true,
        price: true,
        created_at: true,
        updated_at: true,
      }
    });

    return NextResponse.json(
      {
        message: 'Chapter settings updated successfully',
        chapter: updatedChapter,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating chapter settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}