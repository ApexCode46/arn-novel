import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const stories = await prisma.stories.findMany({
      where: {
        user_id: userId,
      },
      select: {
        story_id: true,
        title: true,
        blurb: true,
        verticalImage: true,
        category: true,
        status: true,
        is_end: true,
        created_at: true,
        type: true,
        views: true,
        _count: {
          select: {
            chapter: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // แปลงข้อมูลให้มี chapters เป็น count
    const formattedStories = stories.map((story) => ({
      story_id: story.story_id,
      title: story.title,
      blurb: story.blurb,
      verticalImage: story.verticalImage,
      chapters: story._count.chapter,
      category: story.category,
      status: story.status,
      is_end: story.is_end,
      created_at: story.created_at,
      type: story.type,
      views: story.views,
    }));

    return NextResponse.json(formattedStories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Received body:', body); // Debug log
    
    const {
      storyId,
      title,
      penName,
      blurb,
      type,
      contentLevel,
      category,
      tags,
      verticalImage,
      horizontalImage,
      hideComments,
      allowComments,
      commentPermission,
      publishStatus,
      is_end,
      userId,
    } = body;

    console.log('is_end value:', is_end); // Debug log

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!title || !penName || !category || !userId) {
      return NextResponse.json(
        { error: "title, penName, category, and userId are required" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า user มีอยู่จริง
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let story;
    let message;
    let statusCode;

    if (storyId) {
      // ตรวจสอบว่า story มีอยู่จริงและเป็นของ user นี้
      const existingStory = await prisma.stories.findFirst({
        where: {
          story_id: storyId,
          user_id: userId,
        },
        select: {
          admin_hidden: true,
          admin_hide_reason: true,
          status: true
        }
      });

      if (!existingStory) {
        return NextResponse.json(
          { error: "Story not found or you don't have permission to edit" },
          { status: 404 }
        );
      }

      // ถ้า admin ซ่อนไว้ และ writer พยายามเปลี่ยนเป็น published
      if (existingStory.admin_hidden && publishStatus === 'published') {
        return NextResponse.json(
          { 
            error: "ไม่สามารถเผยแพร่เรื่องนี้ได้ เนื่องจากถูกระงับโดยผู้ดูแลระบบ",
            reason: existingStory.admin_hide_reason 
          },
          { status: 403 }
        );
      }

      // อัปเดตนิยาย
      const updateData = {
        title,
        penName,
        blurb,
        type,
        contentLevel,
        category,
        tags,
        verticalImage,
        horizontalImage,
        hideComments: hideComments,
        allowComments: allowComments,
        commentPermission: commentPermission,
        status: existingStory.admin_hidden ? existingStory.status : (publishStatus || "draft"),
        is_end: is_end !== undefined ? is_end : false, // เพิ่มฟิลด์ is_end
      };
      
      console.log('Update data:', updateData); // Debug log
      
      story = await prisma.stories.update({
        where: {
          story_id: storyId,
        },
        data: updateData,
      });

      message = "Story updated successfully";
      statusCode = 200;
    } else {
      // สร้างนิยายใหม่
      const createData = {
        title,
        penName,
        blurb,
        type,
        contentLevel,
        category,
        tags,
        verticalImage,
        horizontalImage,
        hideComments: hideComments,
        allowComments: allowComments,
        commentPermission: commentPermission,
        status: publishStatus || "draft", // ใช้ publishStatus หรือ draft เป็นค่าเริ่มต้น
        is_end: is_end !== undefined ? is_end : false, // เพิ่มฟิลด์ is_end
        user_id: userId,
      };
      
      console.log('Create data:', createData); // Debug log
      
      story = await prisma.stories.create({
        data: createData,
      });

      message = "Story created successfully";
      statusCode = 201;
    }

    console.log('Story saved with is_end:', story.is_end); // Debug log

    return NextResponse.json(
      {
        message,
        story,
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error("Error creating/updating story:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

