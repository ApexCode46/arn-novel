import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// API สำหรับ toggle like comment
export async function POST(request, { params }) {
  try {
    const { storyId, chapter, commentId } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // หา user จาก email
    const user = await prisma.user.findUnique({
      where: {
        email: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ตรวจสอบว่า comment มีอยู่จริงหรือไม่
    const comment = await prisma.chapterComments.findUnique({
      where: {
        chapterComment_id: commentId,
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // ตรวจสอบว่า user ได้ like comment นี้แล้วหรือยัง
    const existingLike = await prisma.commentLikes.findUnique({
      where: {
        user_id_chapterComment_id: {
          user_id: user.id,
          chapterComment_id: commentId,
        },
      },
    });

    let isLiked;
    let likesCount;

    if (existingLike) {
      // ถ้ามี like อยู่แล้ว ให้ลบออก (unlike)
      await prisma.commentLikes.delete({
        where: {
          id: existingLike.id,
        },
      });
      isLiked = false;
    } else {
      // ถ้ายังไม่มี like ให้เพิ่ม
      await prisma.commentLikes.create({
        data: {
          user_id: user.id,
          chapterComment_id: commentId,
        },
      });
      isLiked = true;
    }

    // นับจำนวน likes ทั้งหมดของ comment นี้
    likesCount = await prisma.commentLikes.count({
      where: {
        chapterComment_id: commentId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        isLiked,
        likesCount,
      },
    });
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
