import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ใช้ Map เพื่อเก็บข้อมูล rate limiting (ในโปรดักชั่นควรใช้ Redis)
const viewTracker = new Map();

// ฟังก์ชันสำหรับตรวจสอบ rate limiting
function shouldIncrementView(identifier, chapterId) {
  const key = `${identifier}-${chapterId}`;
  const now = Date.now();
  const lastView = viewTracker.get(key);

  // หากไม่เคยดู หรือดูเมื่อนานกว่า 5 นาทีที่แล้ว ให้เพิ่ม view
  if (!lastView || now - lastView > 5 * 60 * 1000) {
    viewTracker.set(key, now);
    return true;
  }

  return false;
}

// ฟังก์ชันสำหรับตรวจสอบ bot/crawler
function isBot(userAgent) {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /whatsapp/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http-client/i,
  ];

  return botPatterns.some((pattern) => pattern.test(userAgent));
}

// ทำความสะอาด cache เก่า ๆ (เรียกทุกๆ 1 ชั่วโมง)
setInterval(() => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  for (const [key, timestamp] of viewTracker.entries()) {
    if (timestamp < oneHourAgo) {
      viewTracker.delete(key);
    }
  }
}, 60 * 60 * 1000);

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

    // ตรวจสอบว่า story มีอยู่จริงหรือไม่ และไม่ถูก admin ซ่อน
    const story = await prisma.stories.findUnique({
      where: {
        story_id: storyId,
        status: "published",
        admin_hidden: false,
      },
      select: {
        story_id: true,
        title: true,
        penName: true,
        views: true,
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

    // ดึงข้อมูล chapter ตาม order (เฉพาะที่เผยแพร่แล้วและไม่ถูก admin ซ่อน)
    const chapterData = await prisma.chapters.findFirst({
      where: {
        story_id: storyId,
        order: chapterOrder,
        status: "published",
        admin_hidden: false,
      },
      select: {
        chapter_id: true,
        order: true,
        title: true,
        content: true,
        price: true,
        is_hidden: true,
        views: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            chapterComments: true,
          },
        },
      },
    });

    if (!chapterData) {
      return NextResponse.json(
        { error: "Chapter not found or not published" },
        { status: 404 }
      );
    }

    // ตรวจสอบ rate limiting ก่อนเพิ่ม views
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // ตรวจสอบว่าเป็น bot/crawler หรือไม่
    if (isBot(userAgent)) {
      console.log(
        `Bot detected for chapter ${chapterData.chapter_id}: ${userAgent.slice(
          0,
          100
        )}`
      );
      // ไม่เพิ่ม view สำหรับ bot แต่ยังคงส่ง response ปกติ
    } else {
      // สร้าง identifier ที่เฉพาะเจาะจงกว่า
      const identifier = `${clientIP}-${userAgent.slice(0, 50)}`;

      const shouldIncrement = shouldIncrementView(
        identifier,
        chapterData.chapter_id
      );

      // เพิ่มการนับ views สำหรับ chapter และ story (หากผ่าน rate limiting)
      if (shouldIncrement) {
        await Promise.all([
          // เพิ่ม views ของ chapter
          prisma.chapters.update({
            where: {
              chapter_id: chapterData.chapter_id,
            },
            data: {
              views: {
                increment: 1,
              },
            },
          }),
          // เพิ่ม views ของ story
          prisma.stories.update({
            where: {
              story_id: storyId,
            },
            data: {
              views: {
                increment: 1,
              },
            },
          }),
        ]);

        // อัพเดท views ใน chapterData สำหรับ response
        chapterData.views = (chapterData.views || 0) + 1;
        // อัพเดท views ใน story สำหรับ response
        story.views = (story.views || 0) + 1;
        console.log(
          `Chapter view incremented for ${chapterData.chapter_id} (order: ${chapterOrder}) from IP ${clientIP}`
        );
      } else {
        console.log(
          `Chapter view blocked for ${chapterData.chapter_id} (order: ${chapterOrder}) from IP ${clientIP} (rate limited)`
        );
      }
    }

    // ดึง chapter ก่อนหน้าและถัดไป (เฉพาะที่เผยแพร่แล้วและไม่ถูก admin ซ่อน)
    const previousChapter = await prisma.chapters.findFirst({
      where: {
        story_id: storyId,
        order: chapterOrder - 1,
        status: "published", // เพิ่มเงื่อนไข status
        admin_hidden: false, // เพิ่มเงื่อนไขไม่ถูก admin ซ่อน
      },
      select: {
        chapter_id: true,
        order: true,
        title: true,
        status: true, // เพิ่ม status
        admin_hidden: true, // เพิ่ม admin_hidden
      },
    });

    const nextChapter = await prisma.chapters.findFirst({
      where: {
        story_id: storyId,
        order: chapterOrder + 1,
        status: "published", // เพิ่มเงื่อนไข status
        admin_hidden: false, // เพิ่มเงื่อนไขไม่ถูก admin ซ่อน
      },
      select: {
        chapter_id: true,
        order: true,
        title: true,
        status: true, // เพิ่ม status
        admin_hidden: true, // เพิ่ม admin_hidden
      },
    });

    // ดึงรายการ chapter ทั้งหมดของเรื่องนี้ (เฉพาะที่เผยแพร่แล้วและไม่ถูก admin ซ่อน)
    const allChapters = await prisma.chapters.findMany({
      where: {
        story_id: storyId,
        status: "published",
        admin_hidden: false, // เพิ่มเงื่อนไขไม่ถูก admin ซ่อน
      },
      orderBy: {
        order: "asc",
      },
      select: {
        chapter_id: true,
        order: true,
        title: true,
        price: true,
        admin_hidden: true, // เพิ่ม admin_hidden
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
        is_hidden: chapterData.is_hidden,
        views: chapterData.views,
        created_at: chapterData.created_at,
        updated_at: chapterData.updated_at,
        commentsCount: chapterData._count.chapterComments,
      },
      story: {
        story_id: story.story_id,
        title: story.title,
        penName: story.penName,
        views: story.views,
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
