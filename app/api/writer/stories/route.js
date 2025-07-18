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
        created_at: true,
        type: true,
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
      created_at: story.created_at,
      type: story.type,
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
      userId,
    } = body;

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
      });

      if (!existingStory) {
        return NextResponse.json(
          { error: "Story not found or you don't have permission to edit" },
          { status: 404 }
        );
      }

      // อัปเดตนิยาย
      story = await prisma.stories.update({
        where: {
          story_id: storyId,
        },
        data: {
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
        },
      });

      message = "Story updated successfully";
      statusCode = 200;
    } else {
      // สร้างนิยายใหม่
      story = await prisma.stories.create({
        data: {
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
          user_id: userId,
        },
      });

      message = "Story created successfully";
      statusCode = 201;
    }

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

