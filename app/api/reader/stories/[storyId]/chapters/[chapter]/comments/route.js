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
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // หา chapter ที่ต้องการ
    const chapterData = await prisma.chapters.findFirst({
      where: {
        story_id: storyId,
        order: chapterOrder,
      },
      select: {
        chapter_id: true,
        order: true,
        title: true,
      },
    });

    if (!chapterData) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // ดึงข้อมูล comments ของ chapter (เฉพาะ parent comments)
    const comments = await prisma.chapterComments.findMany({
      where: {
        chapter_id: chapterData.chapter_id,
        parent_id: null, // เฉพาะ main comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
              },
            },
          },
          orderBy: {
            created_at: "asc",
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy: {
        created_at: "desc", // เรียงตามเวลาล่าสุดก่อน
      },
    });

    // นับจำนวน comments
    const totalComments = comments.length;

    // จัดรูปแบบข้อมูลที่จะส่งกลับ
    const formattedComments = comments.map((comment) => ({
      id: comment.chapterComment_id,
      user: {
        id: comment.user.id,
        name: comment.user.name || "ผู้ใช้ไม่ระบุชื่อ",
        avatar: comment.user.name ? comment.user.name.charAt(0).toUpperCase() : "?",
        image: comment.user.image,
        color: generateUserColor(comment.user.id), // สร้างสีจาก user id
      },
      content: comment.content,
      timestamp: formatTimestamp(comment.created_at),
      created_at: comment.created_at,
      replies: comment.replies?.map((reply) => ({
        id: reply.chapterComment_id,
        user: {
          id: reply.user.id,
          name: reply.user.name || "ผู้ใช้ไม่ระบุชื่อ",
          avatar: reply.user.name ? reply.user.name.charAt(0).toUpperCase() : "?",
          image: reply.user.image,
          color: generateUserColor(reply.user.id),
        },
        content: reply.content,
        timestamp: formatTimestamp(reply.created_at),
        created_at: reply.created_at,
        likes: reply._count?.likes || 0,
        isLiked: false, // TODO: implement user-specific likes
      })) || [],
      repliesCount: comment._count?.replies || 0,
      likes: comment._count?.likes || 0,
      isLiked: false, // TODO: implement user-specific likes
    }));

    return NextResponse.json({
      success: true,
      data: {
        story: {
          story_id: story.story_id,
          title: story.title,
        },
        chapter: {
          chapter_id: chapterData.chapter_id,
          order: chapterData.order,
          title: chapterData.title,
        },
        comments: formattedComments,
        totalComments: totalComments,
      },
    });
  } catch (error) {
    console.error("Error fetching chapter comments:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ฟังก์ชันสำหรับสร้างสีจาก user id
function generateUserColor(userId) {
  const colors = [
    "bg-pink-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-cyan-500",
  ];
  
  // ใช้ character code ของ userId เพื่อเลือกสี
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

// ฟังก์ชันสำหรับแปลงเวลาเป็นรูปแบบที่อ่านง่าย
function formatTimestamp(date) {
  const now = new Date();
  const commentDate = new Date(date);
  const diffInSeconds = Math.floor((now - commentDate) / 1000);

  if (diffInSeconds < 60) {
    return "เมื่อสักครู่";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} นาทีที่แล้ว`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ชั่วโมงที่แล้ว`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} วันที่แล้ว`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} เดือนที่แล้ว`;
  }
}

// API สำหรับเพิ่ม comment ใหม่
export async function POST(request, { params }) {
  try {
    const { storyId, chapter } = await params;
    const body = await request.json();
    const { content, userId, parentId } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
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

    // หา user จาก email (เนื่องจาก session ส่ง email มา)
    const user = await prisma.user.findUnique({
      where: {
        email: userId, // userId จริงๆ คือ email ที่ส่งมา
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // หา chapter ที่ต้องการ
    const chapterData = await prisma.chapters.findFirst({
      where: {
        story_id: storyId,
        order: chapterOrder,
      },
      select: {
        chapter_id: true,
      },
    });

    if (!chapterData) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // ถ้าเป็น reply ตรวจสอบว่า parent comment มีอยู่จริง
    if (parentId) {
      const parentComment = await prisma.chapterComments.findUnique({
        where: {
          chapterComment_id: parentId,
        },
      });

      if (!parentComment) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }
    }

    // สร้าง comment ใหม่
    const newComment = await prisma.chapterComments.create({
      data: {
        content: content.trim(),
        user_id: user.id, // ใช้ user id จริงจากฐานข้อมูล
        chapter_id: chapterData.chapter_id,
        parent_id: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    // จัดรูปแบบข้อมูลที่จะส่งกลับ
    const formattedComment = {
      id: newComment.chapterComment_id,
      user: {
        id: newComment.user.id,
        name: newComment.user.name || "ผู้ใช้ไม่ระบุชื่อ",
        avatar: newComment.user.name ? newComment.user.name.charAt(0).toUpperCase() : "?",
        image: newComment.user.image,
        color: generateUserColor(newComment.user.id),
      },
      content: newComment.content,
      timestamp: formatTimestamp(newComment.created_at),
      created_at: newComment.created_at,
      replies: [],
      repliesCount: newComment._count?.replies || 0,
      likes: newComment._count?.likes || 0,
      isLiked: false,
      parentId: newComment.parent_id,
    };

    return NextResponse.json({
      success: true,
      data: formattedComment,
    });
  } catch (error) {
    console.error("Error creating chapter comment:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
