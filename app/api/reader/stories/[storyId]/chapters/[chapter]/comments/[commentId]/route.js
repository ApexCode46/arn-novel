import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - แก้ไข comment
export async function PUT(request, { params }) {
  try {
    const { commentId } = await params;
    const { content, userId } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // หา user จาก email
    const user = await prisma.user.findUnique({
      where: { email: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // ตรวจสอบว่า comment มีอยู่จริงและเป็นของ user นี้
    const existingComment = await prisma.chapterComments.findUnique({
      where: { chapterComment_id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!existingComment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "You can only edit your own comments" },
        { status: 403 }
      );
    }

    // อัพเดท comment
    const updatedComment = await prisma.chapterComments.update({
      where: { chapterComment_id: commentId },
      data: {
        content: content.trim(),
        updated_at: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
        likes: {
          where: {
            user_id: user.id,
          },
          select: {
            id: true,
          },
        },
      },
    });

    // จัดรูปแบบข้อมูลสำหรับส่งกลับ
    const formattedComment = {
      id: updatedComment.chapterComment_id,
      content: updatedComment.content,
      created_at: updatedComment.created_at,
      updated_at: updatedComment.updated_at,
      timestamp: new Date(updatedComment.updated_at).toLocaleString('th-TH'),
      user: {
        id: updatedComment.user.email, // ใช้ email สำหรับการเปรียบเทียบ ownership
        name: updatedComment.user.name || 'ผู้ใช้ไม่ระบุชื่อ',
        image: updatedComment.user.image,
        avatar: (updatedComment.user.name || 'A').charAt(0).toUpperCase(),
        color: `bg-blue-500`,
      },
      likes: updatedComment._count.likes,
      isLiked: updatedComment.likes.length > 0,
    };

    return NextResponse.json({
      success: true,
      data: formattedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - ลบ comment
export async function DELETE(request, { params }) {
  try {
    const { commentId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // หา user จาก email
    const user = await prisma.user.findUnique({
      where: { email: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // ตรวจสอบว่า comment มีอยู่จริงและเป็นของ user นี้
    const existingComment = await prisma.chapterComments.findUnique({
      where: { chapterComment_id: commentId },
    });

    if (!existingComment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own comments" },
        { status: 403 }
      );
    }

    // ลบ comment และ related data (likes, replies)
    await prisma.$transaction(async (tx) => {
      // ลบ likes ของ comment นี้
      await tx.commentLikes.deleteMany({
        where: { chapterComment_id: commentId },
      });

      // ลบ replies ของ comment นี้ (รวมถึง likes ของ replies)
      const replies = await tx.chapterComments.findMany({
        where: { parent_id: commentId },
        select: { chapterComment_id: true },
      });

      for (const reply of replies) {
        await tx.commentLikes.deleteMany({
          where: { chapterComment_id: reply.chapterComment_id },
        });
      }

      await tx.chapterComments.deleteMany({
        where: { parent_id: commentId },
      });

      // ลบ comment หลัก
      await tx.chapterComments.delete({
        where: { chapterComment_id: commentId },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
